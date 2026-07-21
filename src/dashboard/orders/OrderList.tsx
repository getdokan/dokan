import {
    useState,
    useMemo,
    useCallback,
    useRef,
    useEffect,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useToast, SimpleInput } from '@getdokan/dokan-ui';
import { Fill } from '@wordpress/components';
import {
    DataViews,
    DokanBadge,
    DokanButton,
    PriceHtml,
    DateTimeHtml,
    DateRangePicker,
    CustomerFilter,
} from '@dokan/components';
import { ShoppingCart, ChevronDown, Download, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrders } from './hooks/useOrders';
import { getStatusBadgeVariant, getStatusLabel } from './status';
import type { OrderItem, OrderFilterState } from './types';

interface CustomerOption {
    label: string;
    value: number;
}

interface DateRangeUpdate {
    after?: string;
    afterText?: string;
    before?: string;
    beforeText?: string;
    focusedInput?: string;
}

declare const window: Window & {
    dokan: {
        urls: {
            ordersUrl?: string;
            legacyOrdersUrl?: string;
        };
        nonces?: {
            viewOrder?: string;
            orderExport?: string;
        };
        orderStatuses?: Array< {
            value: string;
            label: string;
        } >;
        wc_shipping_enabled?: boolean;
        allow_shipment?: string;
        has_shipment_func?: boolean;
    };
    dokanFrontend?: {
        order_details?: {
            panel_route_enabled?: boolean;
        };
    };
};

/**
 * Whether order details opens inside the panel.
 *
 * Mirrors the `dokan_vendor_panel_order_details_enabled` PHP filter. While it is off —
 * the default until dokan-pro's companion change ships — the list navigates to the
 * legacy order details URL exactly as it always has.
 */
const isPanelRouteEnabled = () =>
    Boolean( window?.dokanFrontend?.order_details?.panel_route_enabled );

const getPanelOrderDetailsUrl = ( orderId: number ) => `#/orders/${ orderId }`;

interface OrderListView {
    perPage: number;
    page: number;
    search: string;
    type: 'table';
    status: string;
    fields: string[];
    layout: {
        styles: Record< string, { width: string } >;
    };
}

/**
 * State the details route hands back so returning to the list is not a reset.
 */
interface OrderListLocationState {
    restoreView?: OrderListView;
    restoreFilters?: OrderFilterState;
}

const getShipmentBadgeVariant = ( shipment: string ) => {
    if ( ! shipment || shipment === '--' ) {
        return 'secondary';
    }

    switch ( shipment ) {
        case 'received':
        case 'shipped':
            return 'success';
        case 'partially':
            return 'info';
        case 'not_shipped':
        default:
            return 'secondary';
    }
};

// Maps raw shipment status keys from the REST API to the same labels
// that the PHP function dokan_get_order_shipment_status_html() uses.
const getShipmentLabel = ( shipment: string ) => {
    switch ( shipment ) {
        case 'received':
            return __( 'Received', 'dokan-lite' );
        case 'shipped':
            return __( 'Delivered', 'dokan-lite' );
        case 'partially':
            return __( 'Partially Delivered', 'dokan-lite' );
        case 'not_shipped':
            return __( 'Not-Delivered', 'dokan-lite' );
        default:
            return shipment;
    }
};

const getOrderDetailsUrl = ( orderId: number ) => {
    const baseUrl = window?.dokan?.urls?.legacyOrdersUrl ?? '';
    const nonce = window?.dokan?.nonces?.viewOrder ?? '';

    if ( ! baseUrl ) {
        return '#';
    }

    const url = new URL( baseUrl );
    url.searchParams.set( 'order_id', String( orderId ) );

    if ( nonce ) {
        url.searchParams.set( '_wpnonce', nonce );
    }

    return url.toString();
};

const getCustomerName = ( item: OrderItem ) => {
    const { billing } = item;

    if ( billing?.first_name || billing?.last_name ) {
        return `${ billing.first_name } ${ billing.last_name }`.trim();
    }

    return item.customer_id
        ? __( 'Customer', 'dokan-lite' )
        : __( 'Guest', 'dokan-lite' );
};

function OrderList() {
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // The details route hands the list back its own state on the way out, so returning
    // from an order lands on the page, filters and sort the Vendor left behind.
    const restoredState = ( location?.state ?? {} ) as OrderListLocationState;

    const [ selection, setSelection ] = useState< string[] >( [] );
    const [ exportOpen, setExportOpen ] = useState( false );
    const exportFormRef = useRef< HTMLFormElement >( null );

    // Date range filter state (picker state vs applied state)
    const [ after, setAfter ] = useState< string >( '' );
    const [ afterText, setAfterText ] = useState( '' );
    const [ before, setBefore ] = useState< string >( '' );
    const [ beforeText, setBeforeText ] = useState( '' );
    const [ focusInput, setFocusInput ] = useState< string >( 'startDate' );

    // Customer filter state
    const [ selectedCustomer, setSelectedCustomer ] =
        useState< CustomerOption | null >( null );

    const [ filterArgs, setFilterArgs ] = useState< OrderFilterState >(
        restoredState.restoreFilters ?? {
            page: 1,
            per_page: 10,
            status: 'all',
            search: '',
        }
    );

    const allowShipment =
        window?.dokan?.allow_shipment === 'on' &&
        window?.dokan?.wc_shipping_enabled &&
        Boolean( window?.dokan?.has_shipment_func );

    const fieldsColumns = [
        'order',
        'order_total',
        'earning',
        'status',
        'customer',
    ];
    if ( allowShipment ) {
        fieldsColumns.push( 'shipment' );
    }

    const [ view, setView ] = useState< OrderListView >(
        restoredState.restoreView ?? {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table' as const,
        status: 'all',
        fields: fieldsColumns,
        layout: {
            styles: {
                order: {
                    width: '20%',
                },
                order_total: {
                    width: '15%',
                },
                earning: {
                    width: '15%',
                },
                status: {
                    width: '15%',
                },
                customer: {
                    width: '15%',
                },
                shipment: {
                    width: '20%',
                },
            },
        },
        }
    );

    const panelRouteEnabled = isPanelRouteEnabled();

    /**
     * Open an order.
     *
     * With the panel route enabled this stays inside the SPA and carries the list's
     * current view along so Back can restore it. With it disabled — the default — it
     * navigates to the legacy details page exactly as before.
     */
    const openOrderDetails = useCallback(
        ( orderId: number ) => {
            if ( panelRouteEnabled ) {
                navigate( `/orders/${ orderId }`, {
                    state: { fromView: view, fromFilters: filterArgs },
                } );
                return;
            }

            const url = getOrderDetailsUrl( orderId );

            if ( url && url !== '#' ) {
                window.location.href = url;
            }
        },
        [ panelRouteEnabled, navigate, view, filterArgs ]
    );

    const {
        data,
        isLoading,
        hasError,
        totalItems,
        totalPages,
        statusCounts,
        fetchOrders,
        fetchStatusCounts,
        updateOrderStatus,
    } = useOrders( filterArgs );

    useEffect( () => {
        if ( hasError ) {
            toast( {
                type: 'error',
                title: __( 'Failed to load orders', 'dokan-lite' ),
            } );
        }
    }, [ hasError, toast ] );

    // ── Fields ──────────────────────────────────────────────────
    const fields = [
        {
            id: 'order',
            label: __( 'Order', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: OrderItem } ) => (
                <div>
                    <a
                        href={
                            panelRouteEnabled
                                ? getPanelOrderDetailsUrl( item.id )
                                : getOrderDetailsUrl( item.id )
                        }
                        className="font-medium text-primary"
                        onClick={ ( e ) => {
                            e.preventDefault();
                            openOrderDetails( item.id );
                        } }
                    >
                        { `#${ item.number || item.id }` }
                    </a>
                    <div className="text-xs text-gray-500 mt-0.5">
                        <DateTimeHtml.Date date={ item.date_created } />
                    </div>
                </div>
            ),
        },
        {
            id: 'order_total',
            label: __( 'Order Total', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: OrderItem } ) => {
                const hasRefunds =
                    Array.isArray( item.refunds ) && item.refunds.length > 0;

                if ( ! hasRefunds ) {
                    return <PriceHtml price={ item.total } />;
                }

                let net = parseFloat( item.total ) || 0;
                for ( const r of item.refunds! ) {
                    net += parseFloat( r.total ) || 0;
                }

                return (
                    <div>
                        <span
                            style={ {
                                textDecoration: 'line-through',
                                opacity: 0.6,
                            } }
                        >
                            <PriceHtml price={ item.total } />
                        </span>
                        <div className="mt-0.5">
                            <PriceHtml price={ String( net ) } />
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'earning',
            label: __( 'Earning', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: OrderItem } ) =>
                item.earning ? (
                    <PriceHtml price={ item.earning } />
                ) : (
                    <span>{ '\u2013' }</span>
                ),
        },
        {
            id: 'status',
            label: __( 'Status', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: OrderItem } ) => (
                <DokanBadge
                    variant={ getStatusBadgeVariant( item.status ) }
                    label={ getStatusLabel( item.status ) }
                />
            ),
        },
        {
            id: 'customer',
            label: __( 'Customer', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: OrderItem } ) => (
                <span>{ getCustomerName( item ) }</span>
            ),
        },
        {
            id: 'shipment',
            label: __( 'Shipment', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: OrderItem } ) => {
                const shipment = item.order_shipment;

                if ( ! shipment || shipment === '--' ) {
                    return <span>{ '\u2013' }</span>;
                }

                return (
                    <DokanBadge
                        variant={ getShipmentBadgeVariant( shipment ) }
                        label={ getShipmentLabel( shipment ) }
                    />
                );
            },
        },
    ];

    // Filter out shipment column if feature is disabled (match old template behavior)
    const visibleFields = fields.filter( ( f ) => {
        if ( f.id === 'shipment' ) {
            return allowShipment;
        }

        return true;
    } );

    // ── Tabs ────────────────────────────────────────────────────
    const tabs = {
        items: statusCounts,
        onSelect: ( status: string ) => {
            setFilterArgs( ( prev ) => ( {
                ...prev,
                status,
                page: 1,
                search: '',
            } ) );
            setView( ( prev ) => ( { ...prev, page: 1, search: '' } ) );
        },
    };

    // ── Filter helpers ─────────────────────────────────────────
    const clearDateRange = () => {
        setAfter( '' );
        setAfterText( '' );
        setBefore( '' );
        setBeforeText( '' );
        setFocusInput( 'startDate' );
        setFilterArgs( ( prev ) => ( {
            ...prev,
            page: 1,
            after: '',
            before: '',
        } ) );
    };

    const handleCustomerChange = ( option: CustomerOption | null ) => {
        setSelectedCustomer( option );
        setFilterArgs( ( prev ) => ( {
            ...prev,
            page: 1,
            customer_id: option?.value ?? 0,
        } ) );
    };

    // ── Filters ─────────────────────────────────────────────────
    const filter = {
        fields: [
            {
                id: 'customer-filter',
                label: __( 'Customer', 'dokan-lite' ),
                field: (
                    <CustomerFilter
                        placeholder={ __( 'Filter by Customer', 'dokan-lite' ) }
                        value={ selectedCustomer }
                        onChange={ handleCustomerChange }
                        className="min-w-48 shadow-none"
                        menuPortalTarget={ document.querySelector( 'body' ) }
                    />
                ),
            },
            {
                id: 'date-range',
                label: __( 'Date Range', 'dokan-lite' ),
                field: (
                    <DateRangePicker
                        key="date-range-select"
                        after={ after }
                        afterText={ afterText }
                        before={ before }
                        beforeText={ beforeText }
                        focusedInput={ focusInput }
                        onUpdate={ ( update: DateRangeUpdate ) => {
                            if ( update.after ) {
                                setAfter( update.after );
                            }
                            if ( update.afterText ) {
                                setAfterText( update.afterText );
                            }
                            if ( update.before ) {
                                setBefore( update.before );
                            }
                            if ( update.beforeText ) {
                                setBeforeText( update.beforeText );
                            }
                            if ( update.focusedInput ) {
                                setFocusInput( update.focusedInput );
                                if (
                                    update.focusedInput === 'endDate' &&
                                    after
                                ) {
                                    setBefore( '' );
                                    setBeforeText( '' );
                                }
                            }
                        } }
                        shortDateFormat="MM/DD/YYYY"
                        isInvalidDate={ () => false }
                        onClear={ clearDateRange }
                        onOk={ () => {
                            setFilterArgs( ( prev ) => ( {
                                ...prev,
                                page: 1,
                                after,
                                before,
                            } ) );
                        } }
                    >
                        <SimpleInput
                            addOnLeft={ <Calendar size="16" /> }
                            className="border rounded px-3 py-1.5 w-full bg-white"
                            onChange={ () => {} }
                            input={ {
                                type: 'text',
                                value:
                                    ! after || ! before
                                        ? ''
                                        : `${ afterText } - ${ beforeText }`,
                                placeholder: __( 'Enter Date', 'dokan-lite' ),
                                readOnly: true,
                            } }
                        />
                    </DateRangePicker>
                ),
            },
        ],
        onReset: () => {
            setSelectedCustomer( null );
            clearDateRange();
        },
        onFilterRemove: ( filterId: string ) => {
            if ( filterId === 'customer-filter' ) {
                setSelectedCustomer( null );
                setFilterArgs( ( prev ) => ( {
                    ...prev,
                    page: 1,
                    customer_id: 0,
                } ) );
            }
            if ( filterId === 'date-range' ) {
                clearDateRange();
            }
        },
    };

    // ── Export handler (form POST to PHP) ────────────────────────
    const handleExport = useCallback(
        ( filtered: boolean ) => {
            setExportOpen( false );

            const form = exportFormRef.current;
            if ( ! form ) {
                return;
            }

            // Clear previous hidden fields
            form.innerHTML = '';

            const addField = ( name: string, value: string ) => {
                const input = document.createElement( 'input' );
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                form.appendChild( input );
            };

            addField(
                'dokan_vendor_order_export_nonce',
                window?.dokan?.nonces?.orderExport ?? ''
            );

            if ( filtered ) {
                addField( 'dokan_order_export_filtered', '1' );
                addField( 'order_status', filterArgs.status );
                addField( 'search', filterArgs.search );

                if ( filterArgs.customer_id ) {
                    addField( 'customer_id', String( filterArgs.customer_id ) );
                }
                if ( filterArgs.after ) {
                    addField( 'order_date_start', String( filterArgs.after ) );
                }
                if ( filterArgs.before ) {
                    addField( 'order_date_end', String( filterArgs.before ) );
                }
            }

            form.submit();
        },
        [ filterArgs ]
    );

    // ── Status update handler ───────────────────────────────────
    const handleStatusUpdate = useCallback(
        async ( items: OrderItem[], newStatus: string ) => {
            const results = await Promise.allSettled(
                items.map( ( item ) => updateOrderStatus( item.id, newStatus ) )
            );

            const failed = results.filter(
                ( r ) => r.status === 'rejected'
            ).length;
            const succeeded = results.length - failed;

            if ( succeeded > 0 ) {
                fetchOrders();
                fetchStatusCounts();
            }

            setSelection( [] );

            if ( failed === 0 ) {
                toast( {
                    type: 'success',
                    title:
                        items.length === 1
                            ? __( 'Order status updated', 'dokan-lite' )
                            : __( 'Orders status updated', 'dokan-lite' ),
                } );
            } else if ( succeeded === 0 ) {
                toast( {
                    type: 'error',
                    title: __( 'Failed to update order status', 'dokan-lite' ),
                } );
            } else {
                toast( {
                    type: 'warning',
                    title: `${ succeeded } updated, ${ failed } failed`,
                } );
            }
        },
        [ updateOrderStatus, fetchOrders, fetchStatusCounts, toast ]
    );

    // ── Actions ─────────────────────────────────────────────────
    const actions = useMemo(
        () => [
            {
                id: 'view',
                label: __( 'View', 'dokan-lite' ),
                callback: ( items: OrderItem[] ) => {
                    openOrderDetails( items[ 0 ].id );
                },
            },
            {
                id: 'mark-on-hold',
                label: __( 'Change status to on-hold', 'dokan-lite' ),
                supportsBulk: true,
                isDestructive: true,
                isEligible: ( item: OrderItem ) => item.status !== 'on-hold',
                callback: async ( items: OrderItem[] ) => {
                    await handleStatusUpdate( items, 'wc-on-hold' );
                },
            },
            {
                id: 'mark-processing',
                label: __( 'Change status to processing', 'dokan-lite' ),
                supportsBulk: true,
                isDestructive: true,
                isEligible: ( item: OrderItem ) => item.status !== 'processing',
                callback: async ( items: OrderItem[] ) => {
                    await handleStatusUpdate( items, 'wc-processing' );
                },
            },
            {
                id: 'mark-completed',
                label: __( 'Change status to completed', 'dokan-lite' ),
                supportsBulk: true,
                isDestructive: true,
                isEligible: ( item: OrderItem ) => item.status !== 'completed',
                callback: async ( items: OrderItem[] ) => {
                    await handleStatusUpdate( items, 'wc-completed' );
                },
            },
        ],
        [ handleStatusUpdate ]
    );

    // ── View change handler ─────────────────────────────────────
    const onViewChange = ( newView: typeof view ) => {
        setView( newView );
        setFilterArgs( ( prev ) => ( {
            ...prev,
            page: newView.page,
            per_page: newView.perPage,
            search: newView.search,
        } ) );
    };

    const urlParams = new URLSearchParams( window.location.search );
    if ( urlParams.get( 'order_id' ) ) {
        return null;
    }

    // ── Render ───────────────────────────────────────────────────
    return (
        <>
            { /* Header action buttons via Fill slot */ }
            <Fill name="dokan-header-actions">
                <ExportDropdown
                    open={ exportOpen }
                    onToggle={ () => setExportOpen( ( prev ) => ! prev ) }
                    onExportAll={ () => handleExport( false ) }
                    onExportFiltered={ () => handleExport( true ) }
                />
            </Fill>

            <DataViews
                namespace="dokan-orders-data-view"
                data={ data }
                fields={ visibleFields }
                view={ view }
                onChangeView={ onViewChange }
                getItemId={ ( item: OrderItem ) => String( item.id ) }
                isLoading={ isLoading }
                paginationInfo={ {
                    totalItems,
                    totalPages,
                } }
                tabs={ tabs }
                filter={ filter }
                search={ true }
                searchPlaceholder={ __( 'Search Orders', 'dokan-lite' ) }
                actions={ actions }
                selection={ selection }
                onChangeSelection={ ( ids: string[] ) => setSelection( ids ) }
                onClickItem={ ( item: OrderItem ) => {
                    openOrderDetails( item.id );
                } }
                isItemClickable={ () => true }
                emptyIcon={
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                }
                emptyTitle={ __( 'No Order Yet', 'dokan-lite' ) }
                emptyDescription={ __(
                    'All your orders will be listed here',
                    'dokan-lite'
                ) }
            />

            { /* Hidden form for CSV export (POST to PHP handler) */ }
            <form
                ref={ exportFormRef }
                method="POST"
                action={ window?.dokan?.urls?.ordersUrl ?? '' }
                style={ { display: 'none' } }
            />
        </>
    );
}

// ── Export Dropdown Component ────────────────────────────────────
function ExportDropdown( {
    open,
    onToggle,
    onExportAll,
    onExportFiltered,
}: {
    open: boolean;
    onToggle: () => void;
    onExportAll: () => void;
    onExportFiltered: () => void;
} ) {
    return (
        <div className="relative">
            <DokanButton
                variant="secondary"
                onClick={ onToggle }
                className="flex items-center gap-1"
            >
                <Download className="w-4 h-4" />
                { __( 'Export All', 'dokan-lite' ) }
                <ChevronDown className="w-3 h-3" />
            </DokanButton>
            { open && (
                <>
                    { /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */ }
                    <div className="fixed inset-0 z-10" onClick={ onToggle } />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]">
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={ onExportAll }
                        >
                            { __( 'Export All', 'dokan-lite' ) }
                        </button>
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={ onExportFiltered }
                        >
                            { __( 'Export Filtered', 'dokan-lite' ) }
                        </button>
                    </div>
                </>
            ) }
        </div>
    );
}

export default OrderList;
