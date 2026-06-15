import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import {
    DataViews,
    DateTimeHtml,
    DokanButton,
    SearchInput,
    getActionLabel,
} from '@dokan/components';
import { Vendor } from '../../../definitions/dokan-vendor';
import {
    Plus,
    Pencil,
    Box,
    ShoppingBag,
    ArrowLeftRight,
    Check,
    Ban,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { applyFilters } from '@wordpress/hooks';
import UserCard from '@src/components/UserCard';
import { Slot } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';

const defaultLayouts = {
    table: { density: 'comfortable' },
    grid: {},
    list: {},
};

const VendorsPage = ( props ) => {
    const { navigate, params, location, useSearchParams } = props;
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ view, setView ] = useState< any >( {
        perPage: 10,
        page: 1,
        type: 'table',
        titleField: 'vendor',
        sort: { field: 'registered', direction: 'desc' },
        layout: { ...defaultLayouts },
        fields: [ 'phone', 'registered', 'status' ],
    } );
    const [ search, setSearch ] = useState( '' );
    const [ status, setStatus ] = useState< string >( 'all' );

    const getListFilterFields = () => {
        // returns array of React nodes
        const fields: any[] = [];
        try {
            // Use a stable filter id to let pro register fields
            // @ts-ignore
            const injected = applyFilters(
                'dokan_admin_vendors_list_filters',
                fields
            );
            if ( Array.isArray( injected ) ) {
                return injected.map( ( fieldData, index ) => {
                    const FieldComponent = fieldData.field;
                    return {
                        ...fieldData,
                        field: (
                            <FieldComponent
                                key={ index }
                                params={ params }
                                navigate={ navigate }
                                location={ location }
                                searchParams={ searchParams }
                                setSearchParams={ setSearchParams }
                            />
                        ),
                    };
                } );
            }
        } catch ( _e ) {
            // fail silently
        }
        return fields; // lite default: empty
    };

    const clearFilter = () => {
        setSearchParams( {} );
    };

    const clearSingleFilter = ( filterId: string ) => {
        setSearchParams( ( prevParams: any ) => {
            prevParams.delete( filterId );
            return prevParams;
        } );
    };

    // Build query just before request; allow PRO to mutate too
    const buildQuery = ( base: Record< string, any > ) => {
        const query: Record< string, any > = { ...base };

        if ( query?.noBuildQuery ) {
            return query;
        }

        try {
            // Let PRO mutate query via wp.hooks filter
            // @ts-ignore
            const mutated = applyFilters(
                'dokan_admin_vendors_before_request',
                query,
                searchParams,
                setSearchParams
            );
            if ( mutated && typeof mutated === 'object' ) {
                Object.assign( query, mutated );
            }
        } catch ( _e ) {
            // ignore
        }

        return query;
    };

    // Keep track of current selection in DataViews so we can clear it after bulk actions
    const [ selection, setSelection ] = useState< string[] >( [] );

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
            status: string;
            noBuildQuery?: boolean;
        } >
    ) => {
        setIsLoading( true );
        try {
            const query: Record< string, any > = {
                per_page: args?.perPage ?? view.perPage,
                page: args?.page ?? view.page,
                noBuildQuery: args?.noBuildQuery ?? false,
                ...( search && { search } ),
            };

            if ( view?.sort?.field ) {
                // Only map known/supported sortable fields
                if ( view.sort.field === 'registered' ) {
                    query.orderby = 'registered';
                    query.order =
                        view.sort.direction === 'asc' ? 'asc' : 'desc';
                }
            }

            const currentStatus = args?.status ?? status;
            if ( currentStatus && currentStatus !== 'all' ) {
                query.status = currentStatus;
            }

            // Use parse: false to read headers
            // Allow last-minute enrichment of query (badge_id, subscription, pro hooks)
            const finalQuery = buildQuery( query );

            delete finalQuery.noBuildQuery;
            const response: Response = await apiFetch( {
                path: addQueryArgs( '/dokan/v1/stores', finalQuery ),
                parse: false,
            } as any );

            const body = ( await response.json() ) as Vendor[];
            const total = parseInt(
                response.headers.get( 'X-WP-Total' ) || '0',
                10
            );
            const all = parseInt(
                response.headers.get( 'X-Status-All' ) || '0',
                10
            );
            const approved = parseInt(
                response.headers.get( 'X-Status-Approved' ) || '0',
                10
            );
            const pending = parseInt(
                response.headers.get( 'X-Status-Pending' ) || '0',
                10
            );

            setData( body );
            setTotalItems( total );
            setCounts( {
                all,
                approved,
                pending,
            } );
        } catch ( e ) {
            // eslint-disable-next-line no-console
            console.error( 'Failed to fetch vendors', e );
            setData( [] );
            setTotalItems( 0 );
        } finally {
            setIsLoading( false );
        }
    };

    useEffect( () => {
        fetchVendors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ status, view.page, view.perPage, view.sort, search, searchParams ] );

    const handleChangeView = ( newView: any ) => {
        setView( ( prev: any ) => ( { ...prev, ...newView } ) );
    };

    const tabItems = useMemo(
        () => [
            {
                value: 'all',
                label: __( 'All', 'dokan-lite' ),
                count: counts.all || 0,
            },
            {
                value: 'approved',
                label: __( 'Approved', 'dokan-lite' ),
                count: counts.approved || 0,
            },
            {
                value: 'pending',
                label: __( 'Pending', 'dokan-lite' ),
                count: counts.pending || 0,
            },
        ],
        [ counts ]
    );

    // Fields for DataViews
    const loadingClass = twMerge(
        '!bg-neutral-200 !rounded !animate-pulse !text-transparent'
    );
    const fields = applyFilters(
        'dokan-admin-vendors-list-column-fields',
        [
            {
                id: 'vendor',
                label: __( 'Vendor', 'dokan-lite' ),
                enableSorting: false,
                render: ( { item }: { item: Vendor } ) => {
                    const name = item?.store_name || '';
                    const avatar = item?.gravatar || '';
                    return (
                        <UserCard
                            name={ name }
                            avatar={ avatar }
                            isLoading={ isLoading }
                            loadingClass={ loadingClass }
                            onClick={ () => {
                                navigate( `/vendors/${ item.id }` );
                            } }
                            subTitle={ item?.email || '' }
                        />
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
                                    <span
                                        className={ twMerge(
                                            'text-[14px] font-[400] text-[#575757]',
                                            isLoading ? loadingClass : ''
                                        ) }
                                    >
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
                enableSorting: true,
                render: ( { item }: { item: Vendor } ) => {
                    const registered = item?.registered || '';
                    return (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                { registered ? (
                                    <div
                                        className={ twMerge(
                                            'text-[14px] font-[400] text-[#575757]',
                                            isLoading ? loadingClass : ''
                                        ) }
                                    >
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
                    return (
                        <span
                            className={ twMerge(
                                'inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium',
                                item?.enabled
                                    ? 'bg-[#D4FBEF] text-[#00563F]'
                                    : 'bg-[#F1F1F4] text-[#393939]',
                                isLoading ? loadingClass : ''
                            ) }
                        >
                            { item?.enabled
                                ? __( 'Enabled', 'dokan-lite' )
                                : __( 'Disabled', 'dokan-lite' ) }
                        </span>
                    );
                },
            },
        ],
        loadingClass,
        isLoading
    );

    // Helpers for confirmation
    const extractIdsFromArgs = ( args: any ): number[] => {
        if ( Array.isArray( args ) ) {
            return ( args as Vendor[] ).map( ( v ) => v.id );
        }
        if ( args?.items ) {
            return ( args.items as Vendor[] ).map( ( v ) => v.id );
        }
        if ( args?.item ) {
            return [ ( args.item as Vendor ).id ];
        }
        return [];
    };
    const runVendorStatusAction = async (
        action: 'approve' | 'disable',
        ids: number[],
        isBulk: boolean
    ) => {
        if ( ! ids.length ) {
            return;
        }
        if ( ! isBulk ) {
            await apiFetch( {
                path: `/dokan/v1/stores/${ ids[ 0 ] }/status`,
                method: 'PUT',
                data: {
                    status: action === 'approve' ? 'active' : 'inactive',
                },
            } as any );
        } else {
            await apiFetch( {
                path: `/dokan/v1/stores/batch`,
                method: 'POST',
                data:
                    action === 'approve' ? { approved: ids } : { pending: ids },
            } as any );
        }
        await fetchVendors();
        if ( isBulk ) {
            setSelection( [] );
        }
    };
    // Handle tab selection for status filtering
    const handleTabSelect = ( tabName ) => {
        setStatus( tabName );
        // also refresh current page with new status
        fetchVendors( { status: tabName, page: 1 } );
        setView( ( prev: any ) => ( { ...prev, page: 1 } ) );
    };

    return (
        <div className="dokan-layout dokan-admin-vendors">
            <div className="mb-[24px] flex items-center justify-between">
                <h2 className="text-2xl leading-3 text-gray-900 font-bold">
                    { __( 'Vendors', 'dokan-lite' ) }
                </h2>
                <div className="flex items-center gap-2">
                    <Slot
                        name="dokan-admin-vendors-list-before-add-vendor-btn"
                        fillProps={ { props } }
                    />

                    <DokanButton
                        type="button"
                        variant="primary"
                        onClick={ () => navigate( '/vendors/create' ) }
                    >
                        <Plus size={ 16 } />
                        { __( 'Add Vendor', 'dokan-lite' ) }
                    </DokanButton>

                    <Slot
                        name="dokan-admin-vendors-list-after-add-vendor-btn"
                        fillProps={ { props } }
                    />
                </div>
            </div>

            { /* Table */ }
            <div>
                <div className="dokan-admin-dashboard-datatable">
                    <DataViews
                        data={ data }
                        namespace="dokan-admin-vendors-table"
                        defaultLayouts={ { ...defaultLayouts } }
                        fields={ fields as any }
                        getItemId={ ( item: Vendor ) => item.id }
                        onChangeView={ handleChangeView }
                        selection={ selection }
                        onChangeSelection={ ( ids: string[] ) =>
                            setSelection( ids )
                        }
                        actions={
                            [
                                {
                                    id: 'edit',
                                    label: () =>
                                        getActionLabel(
                                            <Pencil size={ 16 } className="!fill-none" />,
                                            __( 'Edit', 'dokan-lite' )
                                        ),
                                    icon: (
                                        <Pencil
                                            size={ 16 }
                                            className="!fill-none"
                                        />
                                    ),
                                    isPrimary: false,
                                    supportsBulk: false,
                                    callback: ( item ) => {
                                        const vendor: Vendor =
                                            item[ 0 ] as Vendor;
                                        if ( vendor?.id ) {
                                            navigate(
                                                `/vendors/edit/${ vendor.id }`
                                            );
                                        }
                                    },
                                },
                                {
                                    id: 'see-products',
                                    label: () =>
                                        getActionLabel(
                                            <Box size={ 16 } className="!fill-none" />,
                                            __( 'See Products', 'dokan-lite' )
                                        ),
                                    icon: (
                                        <Box
                                            size={ 16 }
                                            className="!fill-none"
                                        />
                                    ),
                                    supportsBulk: false,
                                    isPrimary: false,
                                    callback: ( item ) => {
                                        const vendor: Vendor =
                                            item[ 0 ] as Vendor;
                                        window.location.href =
                                            // @ts-ignore
                                            dokanAdminDashboard.urls.adminRoot +
                                            'edit.php?post_type=product&author=' +
                                            vendor?.id;
                                    },
                                },
                                {
                                    id: 'see-orders',
                                    label: () =>
                                        getActionLabel(
                                            <ShoppingBag size={ 16 } className="!fill-none" />,
                                            __( 'See Orders', 'dokan-lite' )
                                        ),
                                    icon: (
                                        <ShoppingBag
                                            size={ 16 }
                                            className="!fill-none"
                                        />
                                    ),
                                    isPrimary: false,
                                    supportsBulk: false,
                                    callback: ( item ) => {
                                        const vendor: Vendor =
                                            item[ 0 ] as Vendor;
                                        window.location.href =
                                            // @ts-ignore
                                            dokanAdminDashboard.urls
                                                .adminOrderListUrl +
                                            '&vendor_id=' +
                                            vendor?.id;
                                    },
                                },
                                {
                                    id: 'switch-to',
                                    label: () =>
                                        getActionLabel(
                                            <ArrowLeftRight size={ 16 } className="!fill-none" />,
                                            __( 'Switch to', 'dokan-lite' )
                                        ),
                                    icon: (
                                        <ArrowLeftRight
                                            size={ 16 }
                                            className="!fill-none"
                                        />
                                    ),
                                    isPrimary: false,
                                    supportsBulk: false,
                                    isEligible: ( item: Vendor ) =>
                                        item?.switch_url &&
                                        item?.switch_url.length &&
                                        dokanAdminDashboardSettings?.vendors
                                            ?.is_vendor_switching_enabled,
                                    callback: ( item ) => {
                                        const vendor: Vendor =
                                            item[ 0 ] as Vendor;
                                        window.location.href =
                                            vendor?.switch_url;
                                    },
                                },
                                {
                                    id: 'approve-vendor',
                                    label: () =>
                                        getActionLabel(
                                            <Check size={ 16 } className="!fill-none" />,
                                            __( 'Approve Vendors', 'dokan-lite' )
                                        ),
                                    icon: (
                                        <Check
                                            size={ 16 }
                                            className="!fill-none"
                                        />
                                    ),
                                    supportsBulk: true,
                                    isPrimary: false,
                                    isDestructive: true,
                                    confirmTone: 'positive',
                                    confirmTitle: __( 'Approve Vendor', 'dokan-lite' ),
                                    confirmMessage: __(
                                        'Are you sure you want to approve the selected vendor(s)?',
                                        'dokan-lite'
                                    ),
                                    confirmButtonLabel: __( 'Yes, Approve', 'dokan-lite' ),
                                    isEligible: ( item: Vendor ) =>
                                        ! item.enabled,
                                    callback: async ( args: any ) => {
                                        const ids = extractIdsFromArgs( args );
                                        await runVendorStatusAction(
                                            'approve',
                                            ids,
                                            ids.length > 1
                                        );
                                    },
                                },
                                {
                                    id: 'disable-selling',
                                    label: () =>
                                        getActionLabel(
                                            <Ban size={ 16 } className="!fill-none" />,
                                            __( 'Disable Selling', 'dokan-lite' )
                                        ),
                                    icon: (
                                        <Ban
                                            size={ 16 }
                                            className="!fill-none"
                                        />
                                    ),
                                    supportsBulk: true,
                                    isPrimary: false,
                                    isDestructive: true,
                                    confirmTitle: __( 'Disable Vendor', 'dokan-lite' ),
                                    confirmMessage: __(
                                        'Are you sure you want to disable the selected vendor(s) from selling?',
                                        'dokan-lite'
                                    ),
                                    confirmButtonLabel: __( 'Yes, Disable', 'dokan-lite' ),
                                    isEligible: ( item: Vendor ) =>
                                        !! item.enabled,
                                    callback: async ( args: any ) => {
                                        const ids = extractIdsFromArgs( args );
                                        await runVendorStatusAction(
                                            'disable',
                                            ids,
                                            ids.length > 1
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
                        view={ applyFilters(
                            'dokan-admin-vendors-list-view',
                            view
                        ) }
                        isLoading={ isLoading }
                        tabs={ {
                            items: tabItems,
                            onSelect: ( name ) => {
                                setSelection( [] );
                                handleTabSelect( name );
                            },
                            defaultValue: status,
                            headerContent: [
                                <SearchInput
                                    key="vendors-search"
                                    value={ search }
                                    onChange={ setSearch }
                                />,
                            ],
                        } }
                        filter={ {
                            fields: getListFilterFields(),
                            onFilterRemove: clearSingleFilter,
                            onReset: () => clearFilter(),
                        } }
                    />
                </div>
            </div>

            { /* Plugin Area for Extensions */ }
            <PluginArea scope="dokan-admin-vendors-list-page" />
        </div>
    );
};

export default VendorsPage;
