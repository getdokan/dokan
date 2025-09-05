import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { DataViews, DokanTab, Filter, DokanLink } from '@dokan/components';
import { Vendor } from '../../../definitions/dokan-vendor';
import { DateTimeHtml, DokanBadge } from '../../../components';
import * as LucideIcons from 'lucide-react';

const defaultLayouts = {
    table: {},
    grid: {},
    list: {},
    density: 'comfortable' as const,
};

const VendorsPage = ( props ) => {
    const { navigate } = props;
    const [ view, setView ] = useState< any >( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        titleField: 'vendor',
        layout: { ...defaultLayouts },
        fields: [ 'email', 'phone', 'registered', 'status' ],
    } );

    const [ status, setStatus ] = useState< string >( 'all' );

    const [ data, setData ] = useState< Vendor[] >( [] );
    const [ isLoading, setIsLoading ] = useState< boolean >( false );
    const [ totalItems, setTotalItems ] = useState< number >( 0 );
    const [ counts, setCounts ] = useState< Record< string, number > >( {
        all: 0,
        approved: 0,
        pending: 0,
    } );

    const fetchVendors = async (
        args?: Partial< {
            page: number;
            perPage: number;
            search: string;
            status: string;
        } >
    ) => {
        setIsLoading( true );
        try {
            const query: Record< string, any > = {
                per_page: args?.perPage ?? view.perPage,
                page: args?.page ?? view.page,
            };

            const currentStatus = args?.status ?? status;
            if ( currentStatus && currentStatus !== 'all' ) {
                query.status = currentStatus;
            }
            if ( args?.search ?? view.search ) {
                query.search = args?.search ?? view.search;
            }

            // Use parse: false to read headers
            const response: Response = await apiFetch( {
                path: addQueryArgs( '/dokan/v1/stores', query ),
                parse: false,
            } as any );

            const body = ( await response.json() ) as Vendor[];
            const total = parseInt(
                response.headers.get( 'X-WP-Total' ) || '0',
                10
            );

            setData( body );
            setTotalItems( total );
        } catch ( e ) {
            // eslint-disable-next-line no-console
            console.error( 'Failed to fetch vendors', e );
            setData( [] );
            setTotalItems( 0 );
        } finally {
            setIsLoading( false );
        }
    };

    const refreshCounts = async () => {
        try {
            // fetch counts for each status quickly (1 per status, we only need header total)
            const statuses = [ 'all', 'approved', 'pending' ];
            const promises = statuses.map( async ( s ) => {
                const response: Response = await apiFetch( {
                    path: addQueryArgs( '/dokan/v1/stores', {
                        per_page: 1,
                        page: 1,
                        ...( s !== 'all' ? { status: s } : {} ),
                    } ),
                    parse: false,
                } as any );
                return {
                    s,
                    total: parseInt(
                        response.headers.get( 'X-WP-Total' ) || '0',
                        10
                    ),
                };
            } );
            const results = await Promise.all( promises );
            const map: Record< string, number > = {};
            results.forEach( ( r ) => ( map[ r.s ] = r.total ) );
            if ( map.all == null ) {
                map.all = 0;
            }
            setCounts( map );
        } catch ( e ) {
            // eslint-disable-next-line no-console
            console.error( 'Failed to load counts', e );
        }
    };

    useEffect( () => {
        fetchVendors();
        refreshCounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ status, view.page, view.perPage, view.search ] );

    const handleChangeView = ( newView: any ) => {
        setView( ( prev: any ) => ( { ...prev, ...newView } ) );
    };

    const tabs = useMemo(
        () => [
            {
                name: 'all',
                title: `${ __( 'All', 'dokan-lite' ) } (${ counts.all || 0 })`,
            },
            {
                name: 'approved',
                title: `${ __( 'Approved', 'dokan-lite' ) } (${
                    counts.approved || 0
                })`,
            },
            {
                name: 'pending',
                title: `${ __( 'Pending', 'dokan-lite' ) } (${
                    counts.pending || 0
                })`,
            },
        ],
        [ counts ]
    );

    // Fields for DataViews
    const fields = useMemo(
        () => [
            {
                id: 'vendor',
                label: __( 'Store', 'dokan-lite' ),
                enableSorting: false,
                render: ( { item }: { item: Vendor } ) => {
                    const name = item?.store_name || '';
                    const avatar = item?.gravatar || '';
                    return (
                        <div className="flex items-center gap-3">
                            { avatar ? (
                                <img
                                    src={ avatar }
                                    alt={ name || 'Store avatar' }
                                    className="w-10 h-10 rounded border object-cover"
                                />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded bg-gray-100"
                                    aria-hidden="true"
                                ></div>
                            ) }
                            <span className="flex flex-col">
                                <DokanLink
                                    as="div"
                                    onClick={ () => {
                                        navigate(
                                            `/vendors/edit/${ item.id }`
                                        );
                                    } }
                                    className="font-bold cursor-pointer"
                                >
                                    <span className="text-sm font-medium text-gray-900">
                                        { name }
                                    </span>
                                </DokanLink>
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'email',
                label: __( 'Email', 'dokan-lite' ),
                enableSorting: false,
                render: ( { item }: { item: Vendor } ) => {
                    const email = item?.email || '';
                    return (
                        <div className="flex items-center gap-3">
                            <span className="flex flex-col">
                                { email ? (
                                    <DokanLink
                                        href={ `mailto:${ email }` }
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        { email }
                                    </DokanLink>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                ) }
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'phone',
                label: __( 'Phone', 'dokan-lite' ),
                enableSorting: false,
                render: ( { item }: { item: Vendor } ) => {
                    const phone = item?.phone || '';
                    return (
                        <div className="flex items-center gap-3">
                            <span className="flex flex-col">
                                { phone ? (
                                    <span className="text-xs text-gray-500">
                                        { phone }
                                    </span>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                ) }
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'registered',
                label: __( 'Registered', 'dokan-lite' ),
                enableSorting: false,
                render: ( { item }: { item: Vendor } ) => {
                    const registered = item?.registered || '';
                    return (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                { registered ? (
                                    <div className="text-xs text-gray-500">
                                        <DateTimeHtml.Date
                                            date={ registered }
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                ) }
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'status',
                label: __( 'Status', 'dokan-lite' ),
                enableSorting: false,
                render: ( { item }: { item: Vendor } ) => {
                    const enabled = item?.enabled || false;
                    return (
                        <DokanBadge
                            variant={ enabled ? 'success' : 'secondary' }
                            label={
                                enabled
                                    ? __( 'Enabled', 'dokan-lite' )
                                    : __( 'Disabled', 'dokan-lite' )
                            }
                            className="!text-gray-900"
                        />
                    );
                },
            },
        ],
        []
    );

    // Filters: Vendor search and date range
    const [ filterArgs, setFilterArgs ] = useState< Record< string, any > >(
        {}
    );

    const onFilter = () => {
        const next = { ...view };
        if ( filterArgs.vendor ) {
            next.search = filterArgs.vendor;
        }
        // Date filter is UI only; StoreController doesn't support date query by default
        next.page = 1;
        setView( next );
    };

    const onReset = () => {
        setFilterArgs( {} );
        setView( ( prev: any ) => ( { ...prev, search: '', page: 1 } ) );
    };

    const VendorFilterField = () => {
        return (
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">
                    { __( 'Vendor', 'dokan-lite' ) }
                </label>
                <input
                    type="text"
                    className="dokan-input px-3 py-1.5 border rounded w-60"
                    placeholder={ __( 'Search vendor…', 'dokan-lite' ) }
                    value={ filterArgs.vendor || '' }
                    onChange={ ( e ) =>
                        setFilterArgs( ( p ) => ( {
                            ...p,
                            vendor: e.target.value,
                        } ) )
                    }
                />
            </div>
        );
    };

    const DateFilterField = () => {
        return (
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">
                    { __( 'Date', 'dokan-lite' ) }
                </label>
                <input
                    type="date"
                    className="dokan-input px-3 py-1.5 border rounded"
                    value={ filterArgs.date_from || '' }
                    onChange={ ( e ) =>
                        setFilterArgs( ( p ) => ( {
                            ...p,
                            date_from: e.target.value,
                        } ) )
                    }
                />
                <span className="text-gray-500">—</span>
                <input
                    type="date"
                    className="dokan-input px-3 py-1.5 border rounded"
                    value={ filterArgs.date_to || '' }
                    onChange={ ( e ) =>
                        setFilterArgs( ( p ) => ( {
                            ...p,
                            date_to: e.target.value,
                        } ) )
                    }
                />
            </div>
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

    return (
        <div className="dokan-layout dokan-admin-vendors p-6">
            { /* Status Tabs (filter only) */ }
            <DokanTab
                namespace="dokan-admin-vendors-status"
                tabs={ tabs }
                variant="primary"
                onSelect={ ( tabName: string ) => {
                    setStatus( tabName );
                    // also refresh current page with new status
                    fetchVendors( { status: tabName, page: 1 } );
                    setView( ( prev: any ) => ( { ...prev, page: 1 } ) );
                } }
            />

            { /* Filters */ }
            <div className="mt-4">
                <Filter
                    fields={ [
                        <VendorFilterField key="vendor_filter" />,
                        <DateFilterField key="date_filter" />,
                    ] }
                    onFilter={ onFilter }
                    onReset={ onReset }
                    showFilter={ true }
                    showReset={ true }
                    namespace="dokan-admin-vendors-filter"
                />
            </div>

            { /* Table */ }
            <div className="mt-4">
                <DataViews
                    data={ data }
                    namespace="dokan-admin-vendors-table"
                    defaultLayouts={ { ...defaultLayouts } }
                    fields={ fields as any }
                    getItemId={ ( item: Vendor ) => item.id }
                    onChangeView={ handleChangeView }
                    search={ false }
                    actions={
                        [
                            {
                                id: 'edit',
                                label: () =>
                                    getActionLabel(
                                        'Pencil',
                                        __( 'Edit', 'dokan-lite' )
                                    ),
                                icon: () => {
                                    return (
                                        <span
                                            className={
                                                'px-3 py-2 inline-flex items-center rounded-md text-sm font-medium border border-[#E9E9E9]'
                                            }
                                        >
                                            { __( 'Edit', 'dokan-lite' ) }
                                        </span>
                                    );
                                },
                                isPrimary: false,
                                supportsBulk: false,
                                callback: ( { item }: { item: Vendor } ) => {
                                    window.location.href = addQueryArgs(
                                        'admin.php',
                                        {
                                            page: 'dokan',
                                            module: 'vendors',
                                            action: 'edit',
                                            vendor_id: item.id,
                                        }
                                    );
                                },
                            },
                            {
                                id: 'see-products',
                                label: () =>
                                    getActionLabel(
                                        'Box',
                                        __( 'See Products', 'dokan-lite' )
                                    ),
                                icon: () => {
                                    return (
                                        <span
                                            className={
                                                'px-3 py-2 inline-flex items-center rounded-md text-sm font-medium border border-[#E9E9E9]'
                                            }
                                        >
                                            { __(
                                                'See Products',
                                                'dokan-lite'
                                            ) }
                                        </span>
                                    );
                                },
                                supportsBulk: false,
                                isPrimary: false,
                                callback: ( { item }: { item: Vendor } ) => {
                                    window.location.href = addQueryArgs(
                                        'edit.php',
                                        {
                                            post_type: 'product',
                                            dokan_vendor_id: item.id,
                                        }
                                    );
                                },
                            },
                            {
                                id: 'see-orders',
                                label: () =>
                                    getActionLabel(
                                        'ShoppingBag',
                                        __( 'See Orders', 'dokan-lite' )
                                    ),
                                icon: () => {
                                    return (
                                        <span
                                            className={
                                                'px-3 py-2 inline-flex items-center rounded-md text-sm font-medium border border-[#E9E9E9]'
                                            }
                                        >
                                            { __( 'See Orders', 'dokan-lite' ) }
                                        </span>
                                    );
                                },
                                isPrimary: false,
                                supportsBulk: false,
                                callback: ( { item }: { item: Vendor } ) => {
                                    window.location.href = addQueryArgs(
                                        'edit.php',
                                        {
                                            post_type: 'shop_order',
                                            dokan_vendor_id: item.id,
                                        }
                                    );
                                },
                            },
                            // Show Disable Selling when enabled is true
                            {
                                id: 'disable-selling',
                                label: () =>
                                    getActionLabel(
                                        'Ban',
                                        __( 'Disable Selling', 'dokan-lite' )
                                    ),
                                icon: () => {
                                    return (
                                        <span
                                            className={
                                                'px-3 py-2 inline-flex items-center rounded-md text-sm font-medium border border-[#E9E9E9]'
                                            }
                                        >
                                            { __(
                                                'Disable Selling',
                                                'dokan-lite'
                                            ) }
                                        </span>
                                    );
                                },
                                isDestructive: true,
                                supportsBulk: true,
                                isPrimary: false,
                                isEligible: ( item: Vendor ) => !! item.enabled,
                                callback: ( { item }: { item: Vendor } ) => {
                                    window.location.href = addQueryArgs(
                                        'admin.php',
                                        {
                                            page: 'dokan',
                                            module: 'vendors',
                                            action: 'disable-selling',
                                            vendor_id: item.id,
                                        }
                                    );
                                },
                            },
                            // Show Approve Vendor when enabled is false
                            {
                                id: 'approve-vendor',
                                label: () =>
                                    getActionLabel(
                                        'Check',
                                        __( 'Approve Vendor', 'dokan-lite' )
                                    ),
                                icon: () => {
                                    return (
                                        <span
                                            className={
                                                'px-3 py-2 inline-flex items-center rounded-md text-sm font-medium border border-[#E9E9E9]'
                                            }
                                        >
                                            { __(
                                                'Approve Vendor',
                                                'dokan-lite'
                                            ) }
                                        </span>
                                    );
                                },
                                supportsBulk: true,
                                isPrimary: false,
                                isEligible: ( item: Vendor ) => ! item.enabled,
                                callback: ( { item }: { item: Vendor } ) => {
                                    window.location.href = addQueryArgs(
                                        'admin.php',
                                        {
                                            page: 'dokan',
                                            module: 'vendors',
                                            action: 'approve-vendor',
                                            vendor_id: item.id,
                                        }
                                    );
                                },
                            },
                        ] as any
                    }
                    paginationInfo={ {
                        totalItems,
                        totalPages: Math.max(
                            1,
                            Math.ceil( totalItems / ( view.perPage || 10 ) )
                        ),
                    } }
                    view={ view }
                    isLoading={ isLoading }
                />
            </div>
        </div>
    );
};

export default VendorsPage;
