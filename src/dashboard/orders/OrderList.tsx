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
import { useOrders } from './hooks/useOrders';
import type { OrderItem, OrderFilterState } from './types';

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
    };
};

const getStatusBadgeVariant = ( status: string ) => {
    switch ( status ) {
        case 'completed':
            return 'success';
        case 'processing':
            return 'info';
        case 'on-hold':
            return 'warning';
        case 'pending':
        case 'failed':
            return 'danger';
        case 'cancelled':
        case 'refunded':
            return 'secondary';
        default:
            return 'secondary';
    }
};

const getStatusLabel = ( status: string ) => {
    const labels: Record< string, string > = {
        pending: __( 'Pending', 'dokan-lite' ),
        processing: __( 'Processing', 'dokan-lite' ),
        'on-hold': __( 'On-hold', 'dokan-lite' ),
        completed: __( 'Completed', 'dokan-lite' ),
        cancelled: __( 'Cancelled', 'dokan-lite' ),
        refunded: __( 'Refunded', 'dokan-lite' ),
        failed: __( 'Failed', 'dokan-lite' ),
        'checkout-draft': __( 'Draft', 'dokan-lite' ),
    };
    return labels[ status ] ?? status;
};

const getShipmentBadgeVariant = ( shipment: string ) => {
    if ( ! shipment || shipment === '--' ) {
        return 'secondary';
    }

    const normalized = shipment.toLowerCase().replace( /[_-]/g, '' );

    if (
        normalized.includes( 'delivered' ) &&
        ! normalized.includes( 'not' ) &&
        ! normalized.includes( 'partial' )
    ) {
        return 'success';
    }
    if ( normalized.includes( 'partial' ) ) {
        return 'warning';
    }
    return 'danger';
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
    const [ selection, setSelection ] = useState< string[] >( [] );
    const [ exportOpen, setExportOpen ] = useState( false );
    const exportFormRef = useRef< HTMLFormElement >( null );

    // Date range filter state (picker state vs applied state)
    const [ after, setAfter ] = useState< any >( '' );
    const [ afterText, setAfterText ] = useState( '' );
    const [ before, setBefore ] = useState< any >( '' );
    const [ beforeText, setBeforeText ] = useState( '' );
    const [ focusInput, setFocusInput ] = useState< string >( 'startDate' );

    // Customer filter state
    const [ selectedCustomer, setSelectedCustomer ] = useState< any >( null );

    const [ filterArgs, setFilterArgs ] = useState< OrderFilterState >( {
        page: 1,
        per_page: 10,
        status: 'all',
        search: '',
    } );

    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table' as const,
        status: 'all',
        fields: [
            'order',
            'order_total',
            'earning',
            'status',
            'customer',
            'shipment',
        ],
    } );

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
                        href={ getOrderDetailsUrl( item.id ) }
                        className="font-medium text-blue-600 hover:text-blue-800"
                        onClick={ ( e ) => {
                            e.preventDefault();
                            window.location.href = getOrderDetailsUrl(
                                item.id
                            );
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
            render: ( { item }: { item: OrderItem } ) => (
                <PriceHtml price={ item.total } />
            ),
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
                        label={ shipment }
                    />
                );
            },
        },
    ];

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

    const handleCustomerChange = ( option: any ) => {
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
                        onUpdate={ ( update: any ) => {
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
                    const item = items[ 0 ];
                    const url = getOrderDetailsUrl( item.id );

                    if ( url && url !== '#' ) {
                        window.location.href = url;
                    }
                },
            },
            {
                id: 'mark-on-hold',
                label: __( 'Change status to on-hold', 'dokan-lite' ),
                supportsBulk: true,
                isEligible: ( item: OrderItem ) => item.status !== 'on-hold',
                callback: ( items: OrderItem[] ) => {
                    handleStatusUpdate( items, 'wc-on-hold' );
                },
            },
            {
                id: 'mark-processing',
                label: __( 'Change status to processing', 'dokan-lite' ),
                supportsBulk: true,
                isEligible: ( item: OrderItem ) => item.status !== 'processing',
                callback: ( items: OrderItem[] ) => {
                    handleStatusUpdate( items, 'wc-processing' );
                },
            },
            {
                id: 'mark-completed',
                label: __( 'Change status to completed', 'dokan-lite' ),
                supportsBulk: true,
                isEligible: ( item: OrderItem ) => item.status !== 'completed',
                callback: ( items: OrderItem[] ) => {
                    handleStatusUpdate( items, 'wc-completed' );
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
                fields={ fields }
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
                    const url = getOrderDetailsUrl( item.id );
                    if ( url && url !== '#' ) {
                        window.location.href = url;
                    }
                } }
                isItemClickable={ () => true }
                emptyIcon={
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                }
                emptyTitle={ __( 'No Order Yet', 'dokan-lite' ) }
                emptyDescription={ __(
                    'Your all orders will be listed here',
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
