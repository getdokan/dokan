import { addQueryArgs } from '@wordpress/url';
import { __, sprintf } from '@wordpress/i18n';
import { RawHTML, useEffect, useState, useCallback } from '@wordpress/element';
import { TextControl, SelectControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { formatPrice, truncate } from '@dokan/utilities';
import { TextArea, Tooltip, SimpleRadio } from '@getdokan/dokan-ui';

// Import Dokan components
import {
    DokanButton,
    DataViews,
    DateTimeHtml,
    DokanModal,
    DokanTab,
    Filter,
} from '@dokan/components';
import { Trash, MessageSquare, Funnel, ArrowDown } from 'lucide-react';

// Define withdraw statuses for tab filtering
const WITHDRAW_STATUSES = [
    { value: 'pending', label: __( 'Pending', 'dokan-lite' ) },
    { value: 'approved', label: __( 'Approved', 'dokan-lite' ) },
    { value: 'cancelled', label: __( 'Cancelled', 'dokan-lite' ) },
    { value: 'all', label: __( 'All', 'dokan-lite' ) },
];

// Define payment methods for filtering
const PAYMENT_METHODS = [
    { value: '', label: __( 'All Methods', 'dokan-lite' ) },
    { value: 'paypal', label: __( 'PayPal', 'dokan-lite' ) },
    { value: 'bank', label: __( 'Bank Transfer', 'dokan-lite' ) },
    { value: 'skrill', label: __( 'Skrill', 'dokan-lite' ) },
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
    const [ activeStatus, setActiveStatus ] = useState( 'all' );
    const [ showFilters, setShowFilters ] = useState( false );

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
                            className="w-8 h-8 rounded-sm"
                        />
                    ) }
                    <div>
                        <div className="font-medium text-gray-600">
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
            elements: WITHDRAW_STATUSES.slice( 1 ), // Exclude 'all' option
            filterBy: {
                operators: [ 'isAny', 'isNone' ],
            },
            render: ( { item } ) => {
                const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    approved: 'bg-green-100 text-green-800',
                };
                return (
                    <span
                        className={ `inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-medium ${
                            statusColors[ item.status ] ||
                            'bg-gray-100 text-gray-800'
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

    // Define actions for table rows
    const actions = [
        {
            id: 'view',
            label: __( 'View', 'dokan-lite' ),
            icon: 'visibility',
            isPrimary: false,
            callback: ( items ) => {
                openModal( 'view', items );
            },
        },
        {
            id: 'approved',
            label: __( 'Approve', 'dokan-lite' ),
            icon: 'yes-alt',
            isPrimary: false,
            supportsBulk: true,
            isEligible: ( item ) => item?.status === 'pending',
            callback: ( items ) => {
                openModal( 'approve', items );
            },
        },
        {
            id: 'cancelled',
            label: () => {
                return <Funnel size={ 18 } />;
            },
            icon: () => {
                return <span>{ __( 'Cancel', 'dokan-lite' ) }</span>;
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
            label: __( 'Add Note', 'dokan-lite' ),
            icon: 'edit',
            isPrimary: false,
            isEligible: ( item ) => item?.status !== 'approved',
            callback: ( items ) => {
                openModal( 'add-note', items );
            },
        },
        {
            id: 'delete',
            label: __( 'Delete', 'dokan-lite' ),
            icon: 'trash',
            supportsBulk: true,
            isEligible: ( item ) => item?.status !== 'approved',
            callback: ( items ) => {
                openModal( 'delete', items );
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
        status: 'all',
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
        title: `${ status.label } ${
            statusCounts[ status.value ]
                ? `(${ statusCounts[ status.value ] })`
                : ''
        }`,
    } ) );

    // Handle data fetching from the server
    const fetchWithdraws = async () => {
        setIsLoading( true );
        try {
            const queryArgs = {
                per_page: view?.perPage ?? 10,
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

    // Handle bulk actions
    const handleBulkAction = async ( action, ids ) => {
        try {
            const updateData = {};
            if ( action === 'approved' ) {
                updateData.status = action;
            } else if ( action === 'cancelled' ) {
                updateData.status = action;
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
    const handleFilter = () => {
        setView( ( prevView ) => ( {
            ...prevView,
            page: 1, // Reset to first page when applying filters
        } ) );
        fetchWithdraws();
    };

    // Clear filters
    const clearFilter = () => {
        setFilterArgs( {} );
        fetchWithdraws();
    };

    // Fetch withdraws when view changes
    useEffect( () => {
        fetchWithdraws();
    }, [ view ] );

    // Custom filter fields
    const VendorFilter = ( { filterArgs, setFilterArgs } ) => {
        return (
            <TextControl
                label={ __( 'Vendor', 'dokan-lite' ) }
                placeholder={ __(
                    'Search by vendor name or email',
                    'dokan-lite'
                ) }
                value={ filterArgs.vendor || '' }
                onChange={ ( value ) =>
                    setFilterArgs( {
                        ...filterArgs,
                        vendor: value,
                    } )
                }
                className="min-w-48"
            />
        );
    };

    const DateFilter = ( { filterArgs, setFilterArgs } ) => {
        return (
            <div className="flex space-x-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        { __( 'From Date', 'dokan-lite' ) }
                    </label>
                    <input
                        type="date"
                        value={ filterArgs.date_from || '' }
                        onChange={ ( e ) =>
                            setFilterArgs( {
                                ...filterArgs,
                                date_from: e.target.value,
                            } )
                        }
                        className="border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        { __( 'To Date', 'dokan-lite' ) }
                    </label>
                    <input
                        type="date"
                        value={ filterArgs.date_to || '' }
                        onChange={ ( e ) =>
                            setFilterArgs( {
                                ...filterArgs,
                                date_to: e.target.value,
                            } )
                        }
                        className="border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>
            </div>
        );
    };

    const MethodFilter = ( { filterArgs, setFilterArgs } ) => {
        return (
            <SelectControl
                label={ __( 'Payment Method', 'dokan-lite' ) }
                value={ filterArgs.method || '' }
                options={ PAYMENT_METHODS }
                onChange={ ( value ) =>
                    setFilterArgs( {
                        ...filterArgs,
                        method: value,
                    } )
                }
                className="min-w-48"
            />
        );
    };

    return (
        <div className="withdraw-admin-page">
            { /* Status Tabs + Actions Row */ }
            <div className="mb-6 flex items-center justify-between gap-3">
                <DokanTab
                    namespace="withdraw_status_tabs"
                    tabs={ tabs }
                    variant="primary"
                    onSelect={ handleTabSelect }
                    initialTabName={ activeStatus }
                />
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={ async () => {
                            try {
                                // Minimal placeholder; backend export flow may vary.
                                // Attempt to hit export endpoint via same query params.
                                const path = addQueryArgs(
                                    'dokan/v2/withdraw',
                                    { ...view, is_export: true }
                                );
                                const res = await apiFetch( { path } );
                                if ( res && res.url ) {
                                    window.location.assign( res.url as string );
                                }
                            } catch ( e ) {
                                // eslint-disable-next-line no-console
                                console.error(
                                    'Export failed or not supported yet',
                                    e
                                );
                            }
                        } }
                    >
                        <ArrowDown size={ 16 } />
                        { __( 'Export', 'dokan-lite' ) }
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={ () => setShowFilters( ( v ) => ! v ) }
                    >
                        <Funnel size={ 16 } />
                        { __( 'Filter', 'dokan-lite' ) }
                    </button>
                </div>
            </div>

            { /* Filters */ }
            <div
                className={ `mb-6 dokan-dashboard-filters ${
                    showFilters ? '' : 'hidden'
                }` }
            >
                <Filter
                    fields={ [
                        <VendorFilter
                            key="vendor_filter"
                            filterArgs={ filterArgs }
                            setFilterArgs={ setFilterArgs }
                        />,
                        <DateFilter
                            key="date_filter"
                            filterArgs={ filterArgs }
                            setFilterArgs={ setFilterArgs }
                        />,
                        <MethodFilter
                            key="method_filter"
                            filterArgs={ filterArgs }
                            setFilterArgs={ setFilterArgs }
                        />,
                    ] }
                    onFilter={ handleFilter }
                    onReset={ clearFilter }
                    showFilter={ true }
                    showReset={ true }
                    namespace="withdraw_filters"
                />
            </div>

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
                                        pending:
                                            'bg-yellow-100 text-yellow-800',
                                        approved: 'bg-green-100 text-green-800',
                                        cancelled: 'bg-gray-100 text-gray-800',
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
