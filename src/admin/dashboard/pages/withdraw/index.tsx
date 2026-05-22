import { addQueryArgs } from '@wordpress/url';
import { __, _n, sprintf } from '@wordpress/i18n';
import { RawHTML, useEffect, useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { formatPrice, truncate } from '@dokan/utilities';
import {
    TextArea,
    SimpleRadio,
    SimpleInput,
} from '@getdokan/dokan-ui';
import { DokanTooltip as Tooltip } from '@dokan/components';
import { dateI18n, getSettings } from '@wordpress/date';
// Import Dokan components
import {
    DataViews,
    DateTimeHtml,
    VendorAsyncSelect,
    DateRangePicker,
    AsyncSelect,
    DokanModal,
    getActionLabel,
} from '@dokan/components';

import {
    Trash,
    ArrowDown,
    Home,
    Calendar,
    CreditCard,
    Eye,
    Check,
    XCircle,
    MessageSquare,
    Download,
} from 'lucide-react';

// Define withdraw statuses for tab filtering
const WITHDRAW_STATUSES = [
    { value: 'pending', label: __( 'Pending', 'dokan-lite' ) },
    { value: 'approved', label: __( 'Approved', 'dokan-lite' ) },
    { value: 'cancelled', label: __( 'Cancelled', 'dokan-lite' ) },
    { value: 'all', label: __( 'All', 'dokan-lite' ) },
];

const price = ( amount ) => <RawHTML>{ formatPrice( amount ) }</RawHTML>;

const processDetails = ( data, method: string ) => {
    // get method key details from data then return the values of the key from the data
    const methodKey = Object.keys( data ).find(
        ( key ) => key.toLowerCase() === method.toLowerCase()
    );
    if ( methodKey ) {
        const methodObject = data[ methodKey ];
        let details = '';

        switch ( method ) {
            case 'dokan_custom':
                details = methodObject.value;
                break;
            case 'bank':
                details = sprintf(
                    __(
                        'Account Name: %s, \nAccount Number: %s\nBank Name: %s\nRouting Number: %s\nSwift Code: %s\nIBAN: %s',
                        'dokan-lite'
                    ),
                    methodObject.ac_name,
                    methodObject.ac_number,
                    methodObject.bank_name,
                    methodObject.routing_number,
                    methodObject.swift,
                    methodObject.iban
                );
                break;
            case 'dokan_paypal_marketplace':
            case 'skrill':
            case 'paypal':
                details = methodObject.email;
                break;
        }

        return details;
    }
    return __( '-', 'dokan-lite' );
};

type VendorSelect = {
    label: string;
    value: string;
    raw: unknown;
};

const WithdrawPage = () => {
    const [ data, setData ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ statusCounts, setStatusCounts ] = useState( {
        all: 0,
        pending: 0,
        approved: 0,
        cancelled: 0,
    } );
    const [ filterArgs, setFilterArgs ] = useState( {} );
    const [ activeStatus, setActiveStatus ] = useState( 'pending' );
    const [ vendorFilter, setVendorFilter ] = useState< VendorSelect | null >(
        null
    );
    const [ after, setAfter ] = useState( '' );
    const [ afterText, setAfterText ] = useState( '' );
    const [ before, setBefore ] = useState( '' );
    const [ beforeText, setBeforeText ] = useState( '' );
    const [ focusInput, setFocusInput ] = useState( 'startDate' );

    const [ paymentMethod, setPaymentMethod ] = useState< {
        value: string | number;
        label: string;
    } | null >( null );

    // Define fields for the table columns
    const fields = [
        {
            id: 'vendor',
            label: __( 'Vendor', 'dokan-lite' ),
            enableGlobalSearch: true,
            enableSorting: false,
            render: ( { item } ) => (
                <div className="flex items-center space-x-3">
                    { item.user?.gravatar && (
                        <div
                            className={ 'w-[44px] h-[44px] rounded object-cover' }
                        >
                            <img
                                src={ item.user.gravatar }
                                alt={ item.user?.store_name || '' }
                                className={ 'w-[44px] h-[44px] rounded-[5px] object-cover border-[1px] border-[#E9E9E9] border-solid' }
                            />
                        </div>
                    ) }
                    <div>
                        {item.user?.store_name && item.user.store_name.length > 22 ? (
                            <Tooltip content={<RawHTML>{item.user.store_name}</RawHTML>}>
                                <div className="font-medium text-[#7047EB]">
                                    <RawHTML>
                                    {truncate ? truncate(item.user.store_name, 22) : item.user.store_name}
                                    </RawHTML>
                                </div>
                            </Tooltip>
                            ) : (
                            <div className="font-medium text-[#7047EB]">
                                <RawHTML>
                                    {item.user?.store_name || __('N/A', 'dokan-lite')}
                                </RawHTML>
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            id: 'amount',
            label: __( 'Amount', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="font-medium text-gray-600">
                    { price( item.amount ) }
                </div>
            ),
        },
        {
            id: 'status',
            label: __( 'Status', 'dokan-lite' ),
            enableGlobalSearch: true,
            getValue: ( { item } ) => item.status,
            render: ( { item } ) => {
                const statusColors = {
                    pending: 'bg-[#FDF2F8] text-[#9D174D]',
                    approved: 'bg-[#D4FBEF] text-[#00563F]',
                };
                return (
                    <span
                        className={ `inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium ${
                            statusColors[ item.status ] ||
                            'bg-[#F1F1F4] text-[#393939]'
                        }` }
                    >
                        {
                            WITHDRAW_STATUSES.find(
                                ( status ) => status.value === item.status
                            )?.label
                        }
                    </span>
                );
            },
        },
        {
            id: 'method',
            label: __( 'Method', 'dokan-lite' ),
            enableGlobalSearch: true,
            render: ( { item } ) => item.method_title || item.method,
        },
        {
            id: 'charge',
            label: __( 'Charge', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="text-gray-900">
                    { price( item.charge || 0 ) }
                </div>
            ),
        },
        {
            id: 'payable',
            label: __( 'Payable', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="font-medium text-gray-900">
                    { price( item.receivable || item.amount ) }
                </div>
            ),
        },
        {
            id: 'date',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="text-gray-900">
                    <DateTimeHtml.Date date={ item.created } />
                </div>
            ),
        },
        {
            id: 'details',
            label: __( 'Details', 'dokan-lite' ),
            render: ( { item } ) => {
                const full =
                    processDetails( item.details, item.method ) ||
                    __( '-', 'dokan-lite' );
                return full?.length <= 22 ? (
                    <p className="m-0 space-x-2 flex flex-wrap text-wrap leading-6 text-sm text-gray-600">
                        <RawHTML>{ full }</RawHTML>
                    </p>
                ) : (
                    <Tooltip content={ <RawHTML>{ full }</RawHTML> }>
                        <p className="m-0 space-x-2 flex flex-wrap text-wrap leading-6 text-sm text-gray-600">
                            <RawHTML>
                                { truncate ? truncate( full, 22 ) : full }
                            </RawHTML>
                        </p>
                    </Tooltip>
                );
            },
        },
        {
            id: 'note',
            label: __( 'Note', 'dokan-lite' ),
            render: ( { item } ) => {
                const full = item.note || __( '-', 'dokan-lite' );
                return full?.length <= 22 ? (
                    <p className="m-0 space-x-2 flex flex-wrap max-w-40 text-wrap leading-6 text-sm text-gray-600">
                        <RawHTML>{ full }</RawHTML>
                    </p>
                ) : (
                    <Tooltip content={ <RawHTML>{ full }</RawHTML> }>
                        <p className="m-0 space-x-2 flex flex-wrap max-w-40 text-wrap leading-6 text-sm text-gray-600">
                            <RawHTML>
                                { truncate ? truncate( full, 22 ) : full }
                            </RawHTML>
                        </p>
                    </Tooltip>
                );
            },
        },
    ];

    const displayDateRange = ( startDate, endDate ) => {
        return sprintf(
            // translators: %s: start date, %s: end date.
            __( '%s - %s', 'dokan-lite' ),
            dateI18n( getSettings().formats.date, startDate ),
            dateI18n( getSettings().formats.date, endDate )
        );
    };

    const actions = [
        {
            id: 'view',
            label: () => getActionLabel( <Eye size={ 16 } className="!fill-none" />, __( 'View', 'dokan-lite' ) ),
            icon: <Eye size={ 16 } className="!fill-none" />,
            isPrimary: false,
            callback: ( items ) => {
                openModal( 'view', items );
            },
        },
        {
            id: 'approved',
            label: () => getActionLabel( <Check size={ 16 } className="!fill-none" />, __( 'Approve', 'dokan-lite' ) ),
            icon: <Check size={ 16 } className="!fill-none" />,
            isPrimary: false,
            supportsBulk: true,
            isEligible: ( item ) => item?.status === 'pending',
            callback: ( items ) => {
                const failedItems = items.filter( ( item ) => {
                    const requestedAmount = parseFloat( item?.amount ) || 0;
                    const currentBalance = parseFloat( item?.user?.balance ) || 0;

                    return currentBalance < requestedAmount;
                } );

                if ( failedItems.length > 0 ) {
                    const storeNames = failedItems.map(
                        ( item ) =>
                            item?.user?.store_name ||
                            __( 'Unknown Vendor', 'dokan-lite' )
                    );

                    setInsufficientVendors( storeNames );
                    setShowInsufficientBalanceModal( true );
                    return;
                }

                openModal( 'approve', items );
            },
        },
        {
            id: 'cancelled',
            label: () => getActionLabel( <XCircle size={ 16 } className="!fill-none" />, __( 'Cancel', 'dokan-lite' ) ),
            icon: <XCircle size={ 16 } className="!fill-none" />,
            isPrimary: false,
            supportsBulk: true,
            isDestructive: true,
            confirmTitle: __( 'Cancel Withdrawal', 'dokan-lite' ),
            confirmMessage: __(
                'Are you sure you want to cancel the selected withdrawal(s)?',
                'dokan-lite'
            ),
            confirmButtonLabel: __( 'Cancel Withdrawal', 'dokan-lite' ),
            isEligible: ( item ) => item?.status === 'pending',
            callback: async ( items: any[] ) => {
                await handleBulkAction(
                    'cancelled',
                    items.map( ( item ) => item.id )
                );
            },
        },
        {
            id: 'add-note',
            label: () => getActionLabel( <MessageSquare size={ 16 } className="!fill-none" />, __( 'Add Note', 'dokan-lite' ) ),
            icon: <MessageSquare size={ 16 } className="!fill-none" />,
            isPrimary: false,
            isEligible: ( item ) => item?.status !== 'approved',
            callback: ( items ) => {
                openModal( 'add-note', items );
            },
        },
        {
            id: 'delete',
            label: () => getActionLabel( <Trash size={ 16 } className="!fill-none" />, __( 'Delete', 'dokan-lite' ) ),
            icon: <Trash size={ 16 } className="!fill-none" />,
            supportsBulk: true,
            isDestructive: true,
            confirmTitle: __( 'Delete Withdrawal', 'dokan-lite' ),
            confirmMessage: __(
                'Are you sure you want to delete the selected withdrawal(s)? This action cannot be undone.',
                'dokan-lite'
            ),
            confirmButtonLabel: __( 'Delete', 'dokan-lite' ),
            isEligible: ( item ) => item?.status !== 'approved',
            callback: async ( items: any[] ) => {
                await handleBulkAction(
                    'delete',
                    items.map( ( item ) => item.id )
                );
            },
        },
        {
            id: 'paypal',
            label: () => getActionLabel( <Download size={ 16 } className="!fill-none" />, __( 'Download PayPal mass payment file', 'dokan-lite' ) ),
            icon: <Download size={ 16 } className="!fill-none" />,
            isPrimary: false,
            supportsBulk: true,
            isEligible: ( item ) => 'paypal' === item?.method,
            callback: async ( items: any[] ) => {
                await handleBulkAction(
                    'paypal',
                    items
                        .filter( ( item ) => 'paypal' === item.method )
                        .map( ( item ) => item.id )
                );
            },
        },
    ];

    // Set for handling bulk selection
    const [ selection, setSelection ] = useState( [] );

    // Modal state management
    const [ modalState, setModalState ] = useState( {
        isOpen: false,
        type: '',
        items: [],
    } );

    // Note state for add-note modal
    const [ noteState, setNoteState ] = useState( '' );
    const [ localNoteState, setLocalNoteState ] = useState( '' );

    const [ showInsufficientBalanceModal, setShowInsufficientBalanceModal ] = useState( false );
    const [ insufficientVendors, setInsufficientVendors ] = useState< string[] >( [] );

    // Selected action for the "view" modal
    const [ selectedAction, setSelectedAction ] = useState< string | number | undefined >( undefined );

    // Optimized handlers to prevent re-renders
    const handleNoteChange = useCallback( ( event ) => {
        setLocalNoteState( event.target.value );
    }, [] );

    const handleNoteBlur = useCallback( () => {
        setNoteState( localNoteState );
    }, [ localNoteState ] );

    // Modal helper functions
    const openModal = ( type, items ) => {
        setModalState( {
            isOpen: true,
            type,
            items,
        } );

        // Initialize note state for add-note modal
        if ( type === 'add-note' && items.length > 0 ) {
            const initialNote = items[ 0 ].note || '';
            setNoteState( initialNote );
            setLocalNoteState( initialNote );
        }

        // Initialize selected action for view modal
        if ( type === 'view' && items.length > 0 ) {
            const item = items[ 0 ];
            const opts: { label: string; value: string }[] = [];
            if ( item.status === 'pending' ) {
                opts.push(
                    { label: __( 'Cancel', 'dokan-lite' ), value: 'cancel' },
                    { label: __( 'Approve', 'dokan-lite' ), value: 'approve' }
                );
            }
            if ( item.status !== 'approved' ) {
                opts.push( { label: __( 'Delete', 'dokan-lite' ), value: 'delete' } );
            }
            setSelectedAction( opts.length ? opts[ 0 ].value : undefined );
        }
    };

    const closeModal = () => {
        setModalState( {
            isOpen: false,
            type: '',
            items: [],
        } );
    };

    // Set data view default layout
    const defaultLayouts = {
        table: { density: 'comfortable' },
        grid: {},
        list: {},
    };

    // Set view state for handling the table view
    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        titleField: 'vendor',
        status: 'pending',
        layout: { density: 'comfortable' },
        fields: [
            'amount',
            'status',
            'method',
            'charge',
            'payable',
            'date',
            'details',
            'note',
        ],
    } );

    // Handle tab selection for status filtering
    const handleTabSelect = ( tabName ) => {
        setActiveStatus( tabName );
        setView( ( prevView ) => ( {
            ...prevView,
            status: tabName,
            page: 1, // Reset to first page when changing status
        } ) );
    };

    const tabItems = WITHDRAW_STATUSES.map( ( status ) => ( {
        value: status.value,
        label: status.label,
        count: statusCounts[ status.value as keyof typeof statusCounts ],
    } ) );

    const tabsAdditionalContents = [
        <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#575757] hover:bg-[#7047EB] hover:text-white"
            onClick={ async () => {
                try {
                    // Minimal placeholder; backend export flow may vary.
                    // Attempt to hit export endpoint via same query params.
                    const path = addQueryArgs( 'dokan/v2/withdraw', {
                        ...view,
                        ...filterArgs,
                        is_export: true,
                    } );
                    const res = await apiFetch( { path } );
                    if ( res && res.url ) {
                        window.location.assign( res.url as string );
                    }
                } catch ( e ) {
                    // eslint-disable-next-line no-console
                    console.error( 'Export failed or not supported yet', e );
                }
            } }
        >
            <ArrowDown size={ 16 } />
            { __( 'Export', 'dokan-lite' ) }
        </button>,
    ];

    // Handle data fetching from the server
    const fetchWithdraws = async () => {
        setIsLoading( true );
        try {
            const queryArgs = {
                per_page: view?.perPage ?? 20,
                page: view?.page ?? 1,
                search: view?.search ?? '',
                status: view?.status === 'all' ? '' : view?.status,
                ...filterArgs,
            };

            // Handle sorting
            if ( view?.sort?.field ) {
                queryArgs.orderby = view.sort.field;
            }
            if ( view?.sort?.direction ) {
                queryArgs.order = view.sort.direction;
            }

            // Handle filters
            if ( view?.filters ) {
                view.filters.forEach( ( filter ) => {
                    if (
                        filter.field === 'status' &&
                        filter.operator === 'isAny'
                    ) {
                        queryArgs.status = filter.value?.join( ',' );
                    }
                } );
            }

            // Fetch data from the REST API
            const response = await apiFetch( {
                path: addQueryArgs( 'dokan/v2/withdraw', queryArgs ),
                headers: {
                    'Content-Type': 'application/json',
                },
                parse: false, // Get raw response to access headers
            } );

            const data = await response.json();
            const totalItems = parseInt(
                response.headers.get( 'X-WP-Total' ) || 0
            );

            setTotalItems( totalItems );
            setData( data );

            // Extract status counts from response headers
            const pendingCount = parseInt(
                response.headers.get( 'X-Status-Pending' ) || 0
            );
            const completedCount = parseInt(
                response.headers.get( 'X-Status-Completed' ) || 0
            );
            const cancelledCount = parseInt(
                response.headers.get( 'X-Status-Cancelled' ) || 0
            );

            const counts = {
                all: pendingCount + completedCount + cancelledCount,
                pending: pendingCount,
                approved: completedCount, // 'approved' maps to 'completed' in backend
                cancelled: cancelledCount,
            };
            setStatusCounts( counts );
        } catch ( error ) {
            console.error( 'Error fetching withdraws:', error );
        } finally {
            setIsLoading( false );
        }
    };

    // Handle export withdraws
    const handleExportWithdraws = async ( ids ) => {
        try {
            // Show loading state
            console.log( 'Starting withdraw export for IDs:', ids );

            // Step 1: Initiate the export
            const exportResponse = await apiFetch( {
                path: '/dokan/v1/reports/withdraws/export',
                method: 'POST',
                data: {
                    report_args: {
                        per_page: 50,
                        ids, // Filter to only export selected withdraws
                    },
                    email: false, // Don't send email, just download directly
                },
            } );

            if ( exportResponse.export_id ) {
                console.log(
                    'Export initiated with ID:',
                    exportResponse.export_id
                );

                // Step 2: Poll for export status
                await pollExportStatus( exportResponse.export_id );
            } else {
                throw new Error( 'Failed to initiate export' );
            }
        } catch ( error ) {
            console.error( 'Error exporting withdraws:', error );
            alert(
                __(
                    'Failed to export withdraws. Please try again.',
                    'dokan-lite'
                )
            );
        }
    };

    // Poll export status and download when ready
    const pollExportStatus = async ( exportId ) => {
        const maxAttempts = 60; // Maximum 5 minutes (60 * 5 seconds)
        let attempts = 0;

        const checkStatus = async ( resolve ) => {
            try {
                const statusResponse = await apiFetch( {
                    path: `/dokan/v1/reports/withdraws/export/${ exportId }/status`,
                    method: 'GET',
                } );

                console.log( 'Export status:', statusResponse );

                if ( statusResponse.percent_complete === 100 ) {
                    // Export is complete, download the file
                    if ( statusResponse.download_url ) {
                        // Create a temporary link to download the file
                        const link = document.createElement( 'a' );
                        link.href = statusResponse.download_url;
                        link.download = ''; // Let the browser determine the filename
                        document.body.appendChild( link );
                        link.click();
                        document.body.removeChild( link );

                        console.log( 'Export completed and downloaded' );
                    } else {
                        throw new Error( 'Download URL not available' );
                    }
                } else {
                    // Still processing, check again
                    attempts++;
                    if ( attempts < maxAttempts ) {
                        await new Promise(
                            ( res ) =>
                                setTimeout(
                                    async () => await checkStatus( res ),
                                    5000
                                ) // Check again in 5 seconds
                        );
                    } else {
                        throw new Error( 'Export timeout - please try again' );
                    }
                }
            } catch ( error ) {
                console.error( 'Error checking export status:', error );
                alert( __( 'Export failed. Please try again.', 'dokan-lite' ) );
            }

            if ( resolve ) {
                resolve();
            }
        };

        // Start status checking
        await checkStatus();
    };

    // Handle bulk actions
    const handleBulkAction = async ( action, ids ) => {
        try {
            const updateData = {};
            if ( action === 'approved' ) {
                updateData.status = action;
            } else if ( action === 'cancelled' ) {
                updateData.status = action;
            }

            if ( 'paypal' === action ) {
                await handleExportWithdraws( ids );
                return;
            }

            if ( action === 'delete' ) {
                // Handle delete action
                await apiFetch( {
                    path: '/dokan/v2/withdraw/batch',
                    method: 'POST',
                    data: {
                        delete: ids,
                    },
                } );
            } else {
                // Handle status updates
                await apiFetch( {
                    path: '/dokan/v2/withdraw/batch',
                    method: 'POST',
                    data: {
                        [ action ]: ids,
                    },
                } );
            }

            fetchWithdraws(); // Refresh data
            setSelection( [] ); // Clear selection
        } catch ( error ) {
            console.error( 'Error performing bulk action:', error );
        }
    };

    // Handle update note
    const handleUpdateNote = async ( id, note ) => {
        try {
            await apiFetch( {
                path: `/dokan/v2/withdraw/${ id }`,
                method: 'PUT',
                data: { note },
            } );
            fetchWithdraws(); // Refresh data
        } catch ( error ) {
            console.error( 'Error updating note:', error );
        }
    };

    // Handle filter
    useEffect( () => {
        setView( ( prevView ) => ( {
            ...prevView,
            page: 1, // Reset to first page when applying filters
        } ) );
    }, [ filterArgs ] );

    // Clear filters
    const clearFilter = () => {
        setVendorFilter( null );
        setAfter( '' );
        setAfterText( '' );
        setBefore( '' );
        setBeforeText( '' );
        setPaymentMethod( null );
        setFilterArgs( {} );

        setView( ( prevView ) => ( {
            ...prevView,
            page: 1, // Reset to first page when applying filters
        } ) );
    };

    const clearSingleFilter = ( filterId: string ) => {
        const args = { ...filterArgs };
        switch ( filterId ) {
            case 'vendor':
                setVendorFilter( null );
                delete args.user_id;
                break;
            case 'payment_method':
                setPaymentMethod( null );
                delete args.payment_method;
                break;
            case 'date-range':
                setAfter( '' );
                setAfterText( '' );
                setBefore( '' );
                setBeforeText( '' );
                delete args.start_date;
                delete args.end_date;
                break;
            default:
                break;
        }
        setFilterArgs( args );
        setView( ( prevView ) => ( { ...prevView, page: 1 } ) );
    };

    const loadPaymentMethods = async ( inputValue ) => {
        // return array of { value, label }
        const data = await apiFetch( {
            path: `/dokan/v2/withdraw/payment_methods`,
        } );

        return Array.isArray( data )
            ? data.map( ( method ) => ( {
                  value: method.id,
                  label: method.title,
              } ) )
            : [];
    };

    // Fetch withdraws when view changes
    useEffect( () => {
        fetchWithdraws();
    }, [ view ] );

    const filterFields = [
        {
            id: 'vendor',
            label: __( 'Vendor', 'dokan-lite' ),
            field: (
                <VendorAsyncSelect
                    icon={ <Home size={ 16 } /> }
                    key="vendor-select"
                    value={ vendorFilter }
                    onChange={ (
                        selectedVendorObj: null | {
                            value: string;
                            label: string;
                        }
                    ) => {
                        const args = { ...filterArgs };

                        delete args.user_id;

                        if ( selectedVendorObj ) {
                            args.user_id = selectedVendorObj.value;
                        }
                        setVendorFilter( selectedVendorObj );
                        setFilterArgs( args );
                    } }
                    placeholder={ __( 'Select Vendor', 'dokan-lite' ) }
                    prefetch
                    defaultOptions
                    cacheOptions
                />
            ),
        },
        {
            id: 'payment_method',
            label: __( 'Payment Method', 'dokan-lite' ),
            field: (
                <AsyncSelect
                    selectedTitle={ __( 'Payment Method', 'dokan-lite' ) }
                    key="payment-method-select"
                    icon={ <CreditCard size={ 16 } /> }
                    loadOptions={ loadPaymentMethods }
                    cacheOptions
                    defaultOptions
                    value={ paymentMethod }
                    onChange={ ( method ) => {
                        const args = { ...filterArgs };
                        delete args.payment_method;

                        if ( method ) {
                            args.payment_method = method.value;
                        }
                        setPaymentMethod( method );
                        setFilterArgs( args );
                    } }
                    placeholder="Payment Method"
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
                    onUpdate={ ( update ) => {
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

                            if ( update.focusedInput === 'endDate' && after ) {
                                setBefore( '' );
                                setBeforeText( '' );
                            }
                        }
                    } }
                    shortDateFormat="MM/DD/YYYY"
                    focusedInput={ focusInput }
                    isInvalidDate={ () => false }
                    wrapperClassName="w-full"
                    pickerToggleClassName="block"
                    wpPopoverClassName="dokan-layout"
                    onClear={ () => {
                        setAfter( '' );
                        setAfterText( '' );
                        setBefore( '' );
                        setBeforeText( '' );
                        const args = { ...filterArgs };
                        delete args.start_date;
                        delete args.end_date;
                        setFilterArgs( args );
                    } }
                    onOk={ () => {
                        setFilterArgs( {
                            ...filterArgs,
                            start_date: after,
                            end_date: before,
                        } );
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
                                    : displayDateRange( after, before ),
                            placeholder: 'Date',
                            readOnly: true,
                        } }
                    />
                </DateRangePicker>
            ),
        },
    ];

    return (
        <div className="withdraw-admin-page">
            <h2 className="text-2xl leading-3 text-gray-900 font-bold mb-6">
                { __( 'Withdraw', 'dokan-lite' ) }
            </h2>

            { /* Data Table */ }
            <div className="dokan-admin-dashboard-datatable">
                <DataViews
                    data={ data }
                    namespace="withdraw-admin-data-view"
                    defaultLayouts={ defaultLayouts }
                    fields={ fields }
                    getItemId={ ( item ) => item.id }
                    onChangeView={ setView }
                    paginationInfo={ {
                        totalItems,
                        totalPages: Math.ceil( totalItems / view.perPage ),
                    } }
                    view={ view }
                    selection={ selection }
                    onChangeSelection={ setSelection }
                    actions={ actions }
                    isLoading={ isLoading }
                    tabs={ {
                        items: tabItems,
                        onSelect: ( name ) => {
                            setSelection( [] );
                            handleTabSelect( name );
                        },
                        defaultValue: activeStatus,
                        headerContent: tabsAdditionalContents,
                    } }
                    filter={ {
                        fields: filterFields,
                        onFilterRemove: ( filterId ) =>
                            clearSingleFilter( filterId ),
                        onReset: () => clearFilter(),
                    } }
                />
            </div>

            { /* DokanModal for approve, cancel, delete actions */ }
            { modalState.isOpen && modalState.type === 'approve' && (
                <DokanModal
                    isOpen={ modalState.isOpen }
                    namespace={ `approve-withdrawal-${ modalState.items.length }` }
                    onClose={ closeModal }
                    onConfirm={ async () => {
                        await handleBulkAction(
                            'approved',
                            modalState.items.map( ( item ) => item.id )
                        );
                        closeModal();
                    } }
                    dialogTitle={ __( 'Approve Withdrawal', 'dokan-lite' ) }
                    confirmButtonText={ __( 'Approve', 'dokan-lite' ) }
                    confirmationTitle={ __( 'Confirm Approval', 'dokan-lite' ) }
                    confirmationDescription={
                        modalState.items.length === 1
                            ? __(
                                  'Are you sure you want to approve this withdrawal?',
                                  'dokan-lite'
                              )
                            : sprintf(
                                  __(
                                      'Are you sure you want to approve these %d withdrawals?',
                                      'dokan-lite'
                                  ),
                                  modalState.items.length
                              )
                    }
                    confirmButtonVariant="primary"
                    dialogIcon={
                        <div className="flex items-center justify-center shrink-0 w-14 h-14 bg-green-50 border border-green-50 rounded-full">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    }
                />
            ) }

            { modalState.isOpen &&
                modalState.type === 'add-note' &&
                modalState.items.length > 0 && (
                    <DokanModal
                        className={ `w-96 max-w-full` }
                        isOpen={ modalState.isOpen }
                        namespace={ `add-note-withdrawal-${ modalState.items[ 0 ]?.id }` }
                        onClose={ closeModal }
                        onConfirm={ async () => {
                            await handleUpdateNote(
                                modalState.items[ 0 ]?.id,
                                noteState
                            );
                            closeModal();
                        } }
                        dialogTitle={ __(
                            'Add note for this withdraw',
                            'dokan-lite'
                        ) }
                        confirmButtonText={ __( 'Add Note', 'dokan-lite' ) }
                        dialogIcon={ <></> }
                        dialogContent={
                            <div className="sm:text-left flex-1">
                                <div className="mt-2">
                                    <TextArea
                                        disabled={ isLoading }
                                        className="min-h-48"
                                        input={ {
                                            id: 'dokan-withdraw-note-modal',
                                            defaultValue: localNoteState,
                                            onChange: handleNoteChange,
                                            onBlur: handleNoteBlur,
                                            placeholder: __(
                                                'Write here',
                                                'dokan-lite'
                                            ),
                                        } }
                                    />
                                </div>
                            </div>
                        }
                    />
                ) }

            { modalState.isOpen &&
                modalState.type === 'view' &&
                modalState.items.length > 0 &&
                ( () => {
                    const item = modalState.items[ 0 ];
                    const statusColors = {
                        pending: 'bg-[#FDF2F8] text-[#9D174D]',
                        approved: 'bg-[#D4FBEF] text-[#00563F]',
                        cancelled: 'bg-[#F1F1F4] text-[#393939]',
                    } as const;

                    const options: { label: string; value: string }[] = [];
                    if ( item.status === 'pending' ) {
                        options.push(
                            { label: __( 'Cancel', 'dokan-lite' ), value: 'cancel' },
                            { label: __( 'Approve', 'dokan-lite' ), value: 'approve' }
                        );
                    }
                    if ( item.status !== 'approved' ) {
                        options.push( { label: __( 'Delete', 'dokan-lite' ), value: 'delete' } );
                    }

                    const noActions = options.length === 0;

                    const footer = noActions ? (
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={ closeModal }
                                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-[#575757] hover:bg-gray-100"
                                type="button"
                            >
                                { __( 'Close', 'dokan-lite' ) }
                            </button>
                        </div>
                    ) : undefined;

                    return (
                        <DokanModal
                            className={ `w-[520px] max-w-full` }
                            isOpen={ modalState.isOpen }
                            namespace={ `view-withdrawal-${ modalState.items[ 0 ]?.id }` }
                            onClose={ closeModal }
                            onConfirm={ async () => {
                                if ( noActions ) {
                                    return;
                                }

                                let action = ( selectedAction as string | undefined ) || undefined;
                                if ( ! action && options.length ) {
                                    action = options[ 0 ].value;
                                }
                                if ( ! action ) {
                                    return;
                                }

                                const map: Record< string, string > = {
                                    approve: 'approved',
                                    cancel: 'cancelled',
                                    delete: 'delete',
                                };
                                const finalAction = map[ action ] || '';
                                if ( finalAction ) {
                                    await handleBulkAction( finalAction, [ item.id ] );
                                }
                                closeModal();
                            } }
                            dialogTitle={
                                <>
                                    <div className="text-2xl font-bold text-gray-900 mb-1">
                                        { price( modalState.items[ 0 ]?.amount ) }
                                    </div>
                                    <div className="text-sm text-gray-500 mb-3">
                                        From:{ ' ' }
                                        { modalState.items[ 0 ]?.user?.store_name ||
                                            __( 'N/A', 'dokan-lite' ) }
                                    </div>
                                </>
                            }
                            confirmButtonText={ __( 'Proceed', 'dokan-lite' ) }
                            hideCancelButton={ false }
                            cancelButtonText={ noActions ? __( 'Close', 'dokan-lite' ) : __( 'Cancel', 'dokan-lite' ) }
                            dialogFooterContent={ footer }
                            dialogContent={
                                <div className="p-0">
                                    <div>
                                        { /* Withdraw details section */ }
                                        <div className="mb-6 pb-4 border-b border-gray-200">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                { __( 'Withdraw details:', 'dokan-lite' ) }
                                            </h3>

                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        { __( 'Status', 'dokan-lite' ) }
                                                    </span>
                                                    <span
                                                        className={ `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            statusColors[ item.status ] ||
                                                            'bg-gray-100 text-gray-800'
                                                        }` }
                                                    >
                                                        { item.status
                                                            .charAt( 0 )
                                                            .toUpperCase() +
                                                            item.status.slice( 1 ) }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        { __( 'Date received', 'dokan-lite' ) }
                                                    </span>
                                                    <span className="text-gray-900">
                                                        <DateTimeHtml.Date
                                                            date={ item.created }
                                                            format="j F Y, g.i a"
                                                        />
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        { __( 'Charge', 'dokan-lite' ) }
                                                    </span>
                                                    <span className="text-gray-900">
                                                        { price( item.charge || 0 ) }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        { __( 'Payable', 'dokan-lite' ) }
                                                    </span>
                                                    <span className="text-gray-900 font-medium">
                                                        { price( item.receivable || item.amount ) }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        { /* Payment method and Note section */ }
                                        <div className="mb-6 pb-4 border-b border-gray-200">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                { __( 'Payment method and Note:', 'dokan-lite' ) }
                                            </h3>

                                            <div className="text-sm text-[#828282] mb-2">
                                                { item.method_title || item.method }
                                            </div>

                                            <RawHTML>
                                                { processDetails( item.details, item.method )
                                                    .split( '\n' )
                                                    .join( '<br />' ) }
                                            </RawHTML>
                                        </div>

                                        { /* Note section */ }
                                        { item.note && (
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                    { __( 'Note', 'dokan-lite' ) }
                                                </h3>
                                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                                    { item.note }
                                                </div>
                                            </div>
                                        ) }

                                        { /* Actions section */ }
                                        { ( () => {
                                            if ( ! options.length ) {
                                                return null;
                                            }
                                            return (
                                                <div className="mb-4">
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                        { _n( 'Action:', 'Actions:', options.length, 'dokan-lite' ) }
                                                    </h3>
                                                    <SimpleRadio
                                                        name="action"
                                                        options={ options }
                                                        value={ selectedAction }
                                                        onChange={ ( e ) => setSelectedAction( e.target.value ) }
                                                        class={ 'px-0' }
                                                        optionClass={ 'px-0' }
                                                        selectedOptionClass={ 'px-0' }
                                                    />
                                                </div>
                                            );
                                        } )() }
                                    </div>
                                </div>
                            }
                        />
                    );
                } )() }
                { showInsufficientBalanceModal && (
                    <DokanModal
                        isOpen={ showInsufficientBalanceModal }
                        namespace="insufficient-balance-modal"
                        onClose={ () => {
                            setShowInsufficientBalanceModal( false );
                            setInsufficientVendors( [] );
                        } }
                        onConfirm={ () => {
                            setShowInsufficientBalanceModal( false );
                            setInsufficientVendors( [] );
                        } }
                        dialogTitle={ __( 'Insufficient Balance', 'dokan-lite' ) }
                        confirmButtonText={ __( 'Close', 'dokan-lite' ) }
                        hideCancelButton={ true }
                        confirmationTitle={ __( 'Insufficient Balance', 'dokan-lite' ) }
                        confirmationDescription={ sprintf(
                                _n(
                                    '%s does not have sufficient balance for this withdrawal request.',
                                    '%s do not have sufficient balance for this withdrawal request.',
                                    insufficientVendors.length,
                                    'dokan-lite'
                                ),
                            insufficientVendors.join( ', ' )
                        ) }
                        confirmButtonVariant="primary"
                        dialogIcon={
                            <div className="flex items-center justify-center flex-shrink-0 w-14 h-14 bg-orange-50 border border-orange-50 rounded-full">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            </div>
                        }
                    />
                ) }
        </div>
    );
};

export default WithdrawPage;
