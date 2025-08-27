import { addQueryArgs } from '@wordpress/url';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { Button, TextControl, SelectControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

// Import Dokan components
import { DataViews, DokanTab, Filter } from '@dokan/components';

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
                            className="w-8 h-8 rounded-xs"
                        />
                    ) }
                    <div>
                        <div className="font-medium text-gray-900">
                            { item.user?.store_name ||
                                __( 'N/A', 'dokan-lite' ) }
                        </div>
                        <div className="text-sm text-gray-500">
                            { item.user?.email || '' }
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
                <div className="font-medium text-gray-900">
                    { new Intl.NumberFormat( 'en-US', {
                        style: 'currency',
                        currency: 'USD',
                    } ).format( item.amount ) }
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
                    cancelled: 'bg-red-100 text-red-800',
                };
                return (
                    <span
                        className={ `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[ item.status ] ||
                            'bg-gray-100 text-gray-800'
                        }` }
                    >
                        { item.status.charAt( 0 ).toUpperCase() +
                            item.status.slice( 1 ) }
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
                    { new Intl.NumberFormat( 'en-US', {
                        style: 'currency',
                        currency: 'USD',
                    } ).format( item.charge || 0 ) }
                </div>
            ),
        },
        {
            id: 'payable',
            label: __( 'Payable', 'dokan-lite' ),
            enableSorting: true,
            render: ( { item } ) => (
                <div className="font-medium text-gray-900">
                    { new Intl.NumberFormat( 'en-US', {
                        style: 'currency',
                        currency: 'USD',
                    } ).format( item.receivable || item.amount ) }
                </div>
            ),
        },
        {
            id: 'date',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: true,
            render: ( { item } ) => (
                <div className="text-gray-900">
                    { new Date( item.created ).toLocaleDateString( 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    } ) }
                </div>
            ),
        },
        {
            id: 'details',
            label: __( 'Details', 'dokan-lite' ),
            render: ( { item } ) => (
                <Button
                    variant="link"
                    onClick={ () => console.log( 'View details:', item ) }
                    className="text-blue-600 hover:text-blue-800"
                >
                    { __( 'View', 'dokan-lite' ) }
                </Button>
            ),
        },
        {
            id: 'note',
            label: __( 'Note', 'dokan-lite' ),
            render: ( { item } ) => (
                <div className="text-sm text-gray-600 max-w-xs truncate">
                    { item.note || __( 'No note', 'dokan-lite' ) }
                </div>
            ),
        },
    ];

    // Define actions for table rows
    const actions = [
        {
            id: 'view',
            label: __( 'View', 'dokan-lite' ),
            icon: 'visibility',
            isPrimary: true,
            callback: ( withdraws ) => {
                const withdraw = withdraws[ 0 ];
                console.log( 'View withdraw:', withdraw );
                // Navigate to view page or show modal
            },
        },
        {
            id: 'approve',
            label: __( 'Approve', 'dokan-lite' ),
            icon: 'yes-alt',
            isPrimary: true,
            supportsBulk: true,
            RenderModal: ( { items, closeModal } ) => (
                <div className="space-y-4">
                    <div>
                        { sprintf(
                            items.length === 1
                                ? __(
                                      'Are you sure you want to approve this withdrawal?',
                                      'dokan-lite'
                                  )
                                : __(
                                      'Are you sure you want to approve these %d withdrawals?',
                                      'dokan-lite'
                                  ),
                            items.length
                        ) }
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={ closeModal }>
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                        <Button
                            variant="primary"
                            onClick={ async () => {
                                await handleBulkAction(
                                    'approve',
                                    items.map( ( item ) => item.id )
                                );
                                closeModal();
                            } }
                            className="bg-green-600 hover:bg-green-700"
                        >
                            { __( 'Approve', 'dokan-lite' ) }
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: 'cancel',
            label: __( 'Cancel', 'dokan-lite' ),
            icon: 'no-alt',
            isPrimary: true,
            supportsBulk: true,
            RenderModal: ( { items, closeModal } ) => (
                <div className="space-y-4">
                    <div>
                        { sprintf(
                            items.length === 1
                                ? __(
                                      'Are you sure you want to cancel this withdrawal?',
                                      'dokan-lite'
                                  )
                                : __(
                                      'Are you sure you want to cancel these %d withdrawals?',
                                      'dokan-lite'
                                  ),
                            items.length
                        ) }
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={ closeModal }>
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                        <Button
                            variant="primary"
                            onClick={ async () => {
                                await handleBulkAction(
                                    'cancelled',
                                    items.map( ( item ) => item.id )
                                );
                                closeModal();
                            } }
                            className="bg-red-600 hover:bg-red-700"
                        >
                            { __( 'Cancel Withdrawal', 'dokan-lite' ) }
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: 'add-note',
            label: __( 'Add Note', 'dokan-lite' ),
            icon: 'edit',
            RenderModal: ( { items: [ item ], closeModal } ) => {
                const [ note, setNote ] = useState( item.note || '' );
                return (
                    <div className="space-y-4">
                        <div>
                            { sprintf(
                                __(
                                    'Add note for withdrawal #%d',
                                    'dokan-lite'
                                ),
                                item.id
                            ) }
                        </div>
                        <TextControl
                            label={ __( 'Note', 'dokan-lite' ) }
                            value={ note }
                            onChange={ setNote }
                            help={ __(
                                'Add a note for this withdrawal',
                                'dokan-lite'
                            ) }
                        />
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={ closeModal }>
                                { __( 'Cancel', 'dokan-lite' ) }
                            </Button>
                            <Button
                                variant="primary"
                                onClick={ async () => {
                                    await handleUpdateNote( item.id, note );
                                    closeModal();
                                } }
                            >
                                { __( 'Save Note', 'dokan-lite' ) }
                            </Button>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'delete',
            label: __( 'Delete', 'dokan-lite' ),
            icon: 'trash',
            supportsBulk: true,
            RenderModal: ( { items, closeModal } ) => (
                <div className="space-y-4">
                    <div>
                        { sprintf(
                            items.length === 1
                                ? __(
                                      'Are you sure you want to delete this withdrawal? This action cannot be undone.',
                                      'dokan-lite'
                                  )
                                : __(
                                      'Are you sure you want to delete these %d withdrawals? This action cannot be undone.',
                                      'dokan-lite'
                                  ),
                            items.length
                        ) }
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={ closeModal }>
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                        <Button
                            variant="primary"
                            onClick={ async () => {
                                await handleBulkAction(
                                    'delete',
                                    items.map( ( item ) => item.id )
                                );
                                closeModal();
                            } }
                            className="bg-red-600 hover:bg-red-700"
                        >
                            { __( 'Delete', 'dokan-lite' ) }
                        </Button>
                    </div>
                </div>
            ),
        },
    ];

    // Set for handling bulk selection
    const [ selection, setSelection ] = useState( [] );

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
            if ( action === 'approve' ) {
                updateData.status = 'approved';
            } else if ( action === 'cancelled' ) {
                updateData.status = 'cancelled';
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
                        update: ids.map( ( id ) => ( {
                            id,
                            ...updateData,
                        } ) ),
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
            { /* Status Tabs */ }
            <div className="mb-6">
                <DokanTab
                    namespace="withdraw_status_tabs"
                    tabs={ tabs }
                    variant="primary"
                    onSelect={ handleTabSelect }
                    initialTabName={ activeStatus }
                />
            </div>

            { /* Filters */ }
            <div className="mb-6">
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
                className="bg-white"
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
        </div>
    );
};

export default WithdrawPage;
