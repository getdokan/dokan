import { addQueryArgs } from '@wordpress/url';
import { __, sprintf } from '@wordpress/i18n';
import { RawHTML, useEffect, useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { formatPrice, truncate } from '@dokan/utilities';
import {
    TextArea,
    Tooltip,
    SimpleRadio,
    SimpleInput,
} from '@getdokan/dokan-ui';
import * as LucideIcons from 'lucide-react';
import { dateI18n, getSettings } from '@wordpress/date';
// Import Dokan components
import {
    AdminDataViews as DataViews,
    DateTimeHtml,
    VendorAsyncSelect,
    DateRangePicker,
    AsyncSelect,
    DokanModal,
} from '@dokan/components';

import { Trash, ArrowDown, Home, Calendar, CreditCard } from 'lucide-react';

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
            enableSorting: true,
            render: ( { item } ) => (
                <div className="flex items-center space-x-2">
                    { item.user?.gravatar && (
                        <img
                            src={ item.user.gravatar }
                            alt={ item.user?.store_name || '' }
                            className="w-8 h-8 rounded-md"
                        />
                    ) }
                    <div>
                        <div className="font-medium text-[#7047EB]">
                            { item.user?.store_name ||
                                __( 'N/A', 'dokan-lite' ) }
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'amount',
            label: __( 'Amount', 'dokan-lite' ),
            enableSorting: true,
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
            enableSorting: true,
            render: ( { item } ) => (
                <div className="text-gray-900">
                    { price( item.charge || 0 ) }
                </div>
            ),
        },
        {
            id: 'payable',
            label: __( 'Payable', 'dokan-lite' ),
            enableSorting: true,
            render: ( { item } ) => (
                <div className="font-medium text-gray-900">
                    { price( item.receivable || item.amount ) }
                </div>
            ),
        },
        {
            id: 'date',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: true,
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
                return (
                    <Tooltip content={ <RawHTML>{ full }</RawHTML> }>
                        <p className="m-0 space-x-2 flex flex-wrap max-w-40 text-wrap leading-6 text-sm text-gray-600">
                            <RawHTML>
                                { truncate ? truncate( full, 120 ) : full }
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
                return (
                    <Tooltip content={ <RawHTML>{ full }</RawHTML> }>
                        <p className="m-0 space-x-2 flex flex-wrap max-w-40 text-wrap leading-6 text-sm text-gray-600">
                            <RawHTML>
                                { truncate ? truncate( full, 120 ) : full }
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

    const getActionLabel = ( iconName, label ) => {
        if ( ! ( iconName && label ) ) {
            return <></>;
        }

        const Icon = LucideIcons[ iconName ];
        return (
            <div className="dokan-layout">
                <span className="inline-flex items-center gap-2.5">
                    <Icon size={ 16 } className="!fill-none" />
                    { label }
                </span>
            </div>
        );
    };

    // Define actions for table rows
    const actions = [
        {
            id: 'view',
            label: () => getActionLabel( 'Eye', __( 'View', 'dokan-lite' ) ),
            icon: () => {
                return (
                    <span
                        className={
                            'px-3 py-2 inline-flex items-center rounded-md text-sm font-medium border border-[#E9E9E9]'
                        }
                    >
                        { __( 'View', 'dokan-lite' ) }
                    </span>
                );
            },
            isPrimary: false,
            callback: ( items ) => {
                openModal( 'view', items );
            },
        },
        {
            id: 'approved',
            label: () =>
                getActionLabel( 'Check', __( 'Approve', 'dokan-lite' ) ),
            icon: () => {
                return (
                    <span
                        className={
                            'px-2 py-1.5 inline-flex items-center rounded-md border border-[#E9E9E9]'
                        }
                    >
                        { __( 'Approve', 'dokan-lite' ) }
                    </span>
                );
            },
            isPrimary: false,
            supportsBulk: true,
            isEligible: ( item ) => item?.status === 'pending',
            callback: ( items ) => {
                openModal( 'approve', items );
            },
        },
        {
            id: 'cancelled',
            label: () =>
                getActionLabel( 'XCircle', __( 'Cancel', 'dokan-lite' ) ),
            icon: () => {
                return (
                    <span
                        className={
                            'px-2 py-1.5 inline-flex items-center rounded-md border border-[#E9E9E9]'
                        }
                    >
                        { __( 'Cancel', 'dokan-lite' ) }
                    </span>
                );
            },
            isPrimary: false,
            supportsBulk: true,
            isEligible: ( item ) => item?.status === 'pending',
            callback: ( items ) => {
                openModal( 'cancel', items );
            },
        },
        {
            id: 'add-note',
            label: () =>
                getActionLabel(
                    'MessageSquare',
                    __( 'Add Note', 'dokan-lite' )
                ),
            icon: () => {
                return (
                    <span
                        className={
                            'px-2 py-1.5 inline-flex items-center rounded-md border border-[#E9E9E9]'
                        }
                    >
                        { __( 'Add Note', 'dokan-lite' ) }
                    </span>
                );
            },
            isPrimary: false,
            isEligible: ( item ) => item?.status !== 'approved',
            callback: ( items ) => {
                openModal( 'add-note', items );
            },
        },
        {
            id: 'delete',
            label: () =>
                getActionLabel( 'Trash', __( 'Delete', 'dokan-lite' ) ),
            icon: () => {
                return (
                    <span
                        className={
                            'px-2 py-1.5 inline-flex items-center rounded-md border border-[#E9E9E9]'
                        }
                    >
                        { __( 'Delete', 'dokan-lite' ) }
                    </span>
                );
            },
            supportsBulk: true,
            isEligible: ( item ) => item?.status !== 'approved',
            callback: ( items ) => {
                openModal( 'delete', items );
            },
        },
        {
            id: 'paypal',
            label: () =>
                getActionLabel(
                    'Download',
                    __( 'Download PayPal mass payment file', 'dokan-lite' )
                ),
            icon: () => {
                return (
                    <span
                        className={
                            'px-2 py-1.5 inline-flex items-center rounded-md border border-[#E9E9E9]'
                        }
                    >
                        { __(
                            'Download PayPal mass payment file',
                            'dokan-lite'
                        ) }
                    </span>
                );
            },
            isPrimary: false,
            supportsBulk: true,
            isEligible: ( item ) => 'paypal' === item?.method,
            callback: async ( items: any[] ) => {
                await handleBulkAction(
                    'paypal',
                    items.map( ( item ) => item.id )
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
        table: {},
        grid: {},
        list: {},
        density: 'comfortable',
    };

    // Set view state for handling the table view
    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        titleField: 'vendor',
        status: 'pending',
        layout: { ...defaultLayouts },
        fields: fields.map( ( field ) =>
            field.id !== 'vendor' ? field.id : ''
        ),
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

    // Create tabs with status counts
    const tabs = WITHDRAW_STATUSES.map( ( status ) => ( {
        name: status.value,
        icon: (
            <div className="flex items-center gap-1.5 px-2">
                { status.label }
                <span className="text-xs font-light text-[#A5A5AA]">
                    ({ statusCounts[ status.value ] })
                </span>
            </div>
        ),
        title: status.label,
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
                        include: ids, // Filter to only export selected withdraws
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

        const checkStatus = async () => {
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
                        setTimeout( checkStatus, 5000 ); // Check again in 5 seconds
                    } else {
                        throw new Error( 'Export timeout - please try again' );
                    }
                }
            } catch ( error ) {
                console.error( 'Error checking export status:', error );
                alert( __( 'Export failed. Please try again.', 'dokan-lite' ) );
            }
        };

        // Start status checking
        checkStatus();
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
                    isClearable
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
                    key="payment-method-select"
                    icon={ <CreditCard size={ 16 } /> }
                    loadOptions={ loadPaymentMethods }
                    cacheOptions
                    defaultOptions
                    isClearable
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
                    popoverBodyClassName="p-4 w-auto text-sm/6"
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
            <DataViews
                data={ data }
                namespace="withdraw-data-view"
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
                    tabs,
                    onSelect: handleTabSelect,
                    initialTabName: activeStatus,
                    additionalComponents: tabsAdditionalContents,
                } }
                filter={ {
                    fields: filterFields,
                    onFilterRemove: ( filterId ) =>
                        clearSingleFilter( filterId ),
                    onReset: () => clearFilter(),
                } }
            />

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
                        <div className="flex items-center justify-center flex-shrink-0 w-14 h-14 bg-green-50 border border-green-50 rounded-full">
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

            { modalState.isOpen && modalState.type === 'cancel' && (
                <DokanModal
                    isOpen={ modalState.isOpen }
                    namespace={ `cancel-withdrawal-${ modalState.items.length }` }
                    onClose={ closeModal }
                    onConfirm={ async () => {
                        await handleBulkAction(
                            'cancelled',
                            modalState.items.map( ( item ) => item.id )
                        );
                        closeModal();
                    } }
                    dialogTitle={ __( 'Cancel Withdrawal', 'dokan-lite' ) }
                    confirmButtonText={ __(
                        'Cancel Withdrawal',
                        'dokan-lite'
                    ) }
                    confirmationTitle={ __(
                        'Confirm Cancellation',
                        'dokan-lite'
                    ) }
                    confirmationDescription={
                        modalState.items.length === 1
                            ? __(
                                  'Are you sure you want to cancel this withdrawal?',
                                  'dokan-lite'
                              )
                            : sprintf(
                                  __(
                                      'Are you sure you want to cancel these %d withdrawals?',
                                      'dokan-lite'
                                  ),
                                  modalState.items.length
                              )
                    }
                    confirmButtonVariant="primary"
                    dialogIcon={
                        <div className="flex items-center justify-center flex-shrink-0 w-14 h-14 bg-orange-50 border border-orange-50 rounded-full">
                            <svg
                                className="w-6 h-6 text-orange-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                    }
                />
            ) }

            { modalState.isOpen && modalState.type === 'delete' && (
                <DokanModal
                    isOpen={ modalState.isOpen }
                    namespace={ `delete-withdrawal-${ modalState.items.length }` }
                    onClose={ closeModal }
                    onConfirm={ async () => {
                        await handleBulkAction(
                            'delete',
                            modalState.items.map( ( item ) => item.id )
                        );
                        closeModal();
                    } }
                    dialogTitle={ __( 'Delete Withdrawal', 'dokan-lite' ) }
                    confirmButtonText={ __( 'Delete', 'dokan-lite' ) }
                    confirmationTitle={ __( 'Confirm Deletion', 'dokan-lite' ) }
                    confirmationDescription={
                        modalState.items.length === 1
                            ? __(
                                  'Are you sure you want to delete this withdrawal? This action cannot be undone.',
                                  'dokan-lite'
                              )
                            : sprintf(
                                  __(
                                      'Are you sure you want to delete these %d withdrawals? This action cannot be undone.',
                                      'dokan-lite'
                                  ),
                                  modalState.items.length
                              )
                    }
                    confirmButtonVariant="primary"
                    dialogIcon={
                        <div className="flex items-center justify-center flex-shrink-0 w-14 h-14 bg-red-50 border border-red-50 rounded-full">
                            <Trash size={ 24 } className="text-red-600" />
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
                modalState.items.length > 0 && (
                    <DokanModal
                        className={ `w-[520px] max-w-full` }
                        isOpen={ modalState.isOpen }
                        namespace={ `view-withdrawal-${ modalState.items[ 0 ]?.id }` }
                        onClose={ closeModal }
                        onConfirm={ closeModal }
                        dialogTitle={ <></> }
                        confirmButtonText={ __( 'Update', 'dokan-lite' ) }
                        hideCancelButton={ false }
                        cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                        dialogContent={
                            <div className="p-0">
                                { ( () => {
                                    const item = modalState.items[ 0 ];
                                    const statusColors = {
                                        pending: 'bg-[#FDF2F8] text-[#9D174D]',
                                        approved: 'bg-[#D4FBEF] text-[#00563F]',
                                        cancelled:
                                            'bg-[#F1F1F4] text-[#393939]',
                                    };

                                    return (
                                        <div>
                                            { /* Header with amount and store name */ }
                                            <div className="mb-4">
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    { price( item.amount ) }
                                                </div>
                                                <div className="text-sm text-gray-500 mb-3">
                                                    From:{ ' ' }
                                                    { item.user?.store_name ||
                                                        __(
                                                            'N/A',
                                                            'dokan-lite'
                                                        ) }
                                                </div>
                                            </div>

                                            { /* Withdraw details section */ }
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                    { __(
                                                        'Withdraw details:',
                                                        'dokan-lite'
                                                    ) }
                                                </h3>

                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            { __(
                                                                'Status',
                                                                'dokan-lite'
                                                            ) }
                                                        </span>
                                                        <span
                                                            className={ `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                statusColors[
                                                                    item.status
                                                                ] ||
                                                                'bg-gray-100 text-gray-800'
                                                            }` }
                                                        >
                                                            { item.status
                                                                .charAt( 0 )
                                                                .toUpperCase() +
                                                                item.status.slice(
                                                                    1
                                                                ) }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            { __(
                                                                'Date received',
                                                                'dokan-lite'
                                                            ) }
                                                        </span>
                                                        <span className="text-gray-900">
                                                            <DateTimeHtml.Date
                                                                date={
                                                                    item.created
                                                                }
                                                                format="j F Y, g.i a"
                                                            />
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            { __(
                                                                'Charge',
                                                                'dokan-lite'
                                                            ) }
                                                        </span>
                                                        <span className="text-gray-900">
                                                            { price(
                                                                item.charge || 0
                                                            ) }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            { __(
                                                                'Payable',
                                                                'dokan-lite'
                                                            ) }
                                                        </span>
                                                        <span className="text-gray-900 font-medium">
                                                            { price(
                                                                item.receivable ||
                                                                    item.amount
                                                            ) }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            { /* Payment method and Note section */ }
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                    { __(
                                                        'Payment method and Note:',
                                                        'dokan-lite'
                                                    ) }
                                                </h3>

                                                <div className="text-sm text-[#828282] mb-2">
                                                    { item.method_title ||
                                                        item.method }
                                                </div>

                                                <RawHTML>
                                                    { processDetails(
                                                        item.details,
                                                        item.method
                                                    )
                                                        .split( '\n' )
                                                        .join( '<br />' ) }
                                                </RawHTML>
                                            </div>

                                            { /* Note section */ }
                                            { item.note && (
                                                <div className="mb-6">
                                                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                        { __(
                                                            'Note',
                                                            'dokan-lite'
                                                        ) }
                                                    </h3>
                                                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                                        { item.note }
                                                    </div>
                                                </div>
                                            ) }

                                            { /* Actions section */ }
                                            { ( () => {
                                                const options: {
                                                    label: string;
                                                    value: string;
                                                }[] = [];
                                                if (
                                                    item.status === 'pending'
                                                ) {
                                                    options.push(
                                                        {
                                                            label: __(
                                                                'Cancel',
                                                                'dokan-lite'
                                                            ),
                                                            value: 'cancel',
                                                        },
                                                        {
                                                            label: __(
                                                                'Approve',
                                                                'dokan-lite'
                                                            ),
                                                            value: 'approve',
                                                        }
                                                    );
                                                }
                                                if (
                                                    item.status !== 'approved'
                                                ) {
                                                    options.push( {
                                                        label: __(
                                                            'Delete',
                                                            'dokan-lite'
                                                        ),
                                                        value: 'delete',
                                                    } );
                                                }

                                                if ( ! options.length ) {
                                                    return null;
                                                }

                                                return (
                                                    <div className="mb-4">
                                                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                            { __(
                                                                'Actions:',
                                                                'dokan-lite'
                                                            ) }
                                                        </h3>
                                                        <SimpleRadio
                                                            name="action"
                                                            options={ options }
                                                            class={ 'px-0' }
                                                            optionClass={
                                                                'px-0'
                                                            }
                                                            selectedOptionClass={
                                                                'px-0'
                                                            }
                                                        />
                                                    </div>
                                                );
                                            } )() }
                                        </div>
                                    );
                                } )() }
                            </div>
                        }
                    />
                ) }
        </div>
    );
};

export default WithdrawPage;
