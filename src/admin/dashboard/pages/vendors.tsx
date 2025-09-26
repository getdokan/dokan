import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import {
    DataViews,
    DokanTab,
    Filter,
    DokanLink,
    DateTimeHtml,
    DokanButton,
    SearchInput,
} from '@dokan/components';
import DokanModal from '../../../components/modals/DokanModal';
import { Vendor } from '../../../definitions/dokan-vendor';
import * as LucideIcons from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const defaultLayouts = {
    table: {},
    grid: {},
    list: {},
    density: 'comfortable' as const,
};

const VendorsPage = ( props ) => {
    const { navigate, params, location, useSearchParams } = props;
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ showFilters, setShowFilters ] = useState( false );
    const [ view, setView ] = useState< any >( {
        perPage: 10,
        page: 1,
        type: 'table',
        titleField: 'vendor',
        layout: { ...defaultLayouts },
        fields: [ 'email', 'phone', 'registered', 'status' ],
    } );
    const [ search, setSearch ] = useState( '' );
    const [ status, setStatus ] = useState< string >( 'all' );

    // Allow PRO to inject filter fields via wp.hooks.applyFilters
    const getFilterFields = () => {
        // returns array of React nodes
        const fields: any[] = [];
        try {
            // Use a stable filter id to let pro register fields
            // @ts-ignore
            const injected = wp.hooks.applyFilters(
                'dokan_admin_vendors_filters',
                fields
            );
            if ( Array.isArray( injected ) ) {
                return injected;
            }
        } catch ( _e ) {
            // fail silently
        }
        return fields; // lite default: empty
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
            const mutated = wp.hooks.applyFilters(
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

    // Confirmation modal state for single and bulk actions
    const [ confirmState, setConfirmState ] = useState<
        | null
        | {
              mode: 'single';
              action: 'approve' | 'disable';
              vendor: Vendor;
          }
        | {
              mode: 'bulk';
              action: 'approve' | 'disable';
              vendorIds: number[];
          }
    >( null );
    const [ isConfirmLoading, setIsConfirmLoading ] = useState( false );

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
    }, [ status, view.page, view.perPage, search ] );

    useEffect( () => {
        // @ts-ignore
        const shouldOpenFilter = wp.hooks.applyFilters(
            'dokan_vendors_show_filters',
            false,
            searchParams
        );
        setShowFilters( shouldOpenFilter );
    }, [] );

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
    const loadingClass = twMerge(
        '!bg-neutral-200 !rounded !animate-pulse !text-transparent'
    );
    const fields = [
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
                            <div
                                className={ twMerge(
                                    'w-10 h-10 rounded object-cover',
                                    isLoading ? `${ loadingClass }` : ''
                                ) }
                            >
                                <img
                                    src={ avatar }
                                    alt={ name || 'Store avatar' }
                                    className={ twMerge(
                                        'w-10 h-10 rounded border object-cover',
                                        isLoading ? 'opacity-0' : 'opacity-100'
                                    ) }
                                />
                            </div>
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
                                    navigate( `/vendors/edit/${ item.id }` );
                                } }
                                className="font-bold cursor-pointer"
                            >
                                <span
                                    className={ twMerge(
                                        'text-sm font-medium text-gray-900',
                                        isLoading ? loadingClass : ''
                                    ) }
                                >
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
                                    className={ twMerge(
                                        isLoading ? `${ loadingClass }` : ''
                                    ) }
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
                                <span
                                    className={ twMerge(
                                        'text-xs text-gray-500',
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
            enableSorting: false,
            render: ( { item }: { item: Vendor } ) => {
                const registered = item?.registered || '';
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            { registered ? (
                                <div
                                    className={ twMerge(
                                        'text-xs text-gray-500',
                                        isLoading ? loadingClass : ''
                                    ) }
                                >
                                    <DateTimeHtml.Date date={ registered } />
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
                            'inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-medium',
                            item?.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-neutral-100 text-neutral-800',
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
    ];

    const onFilter = () => {
        const next = { ...view };

        // Reset to first page and refresh list
        next.page = 1;
        setView( next );
        fetchVendors( {
            page: 1,
            perPage: next.perPage,
            status,
        } );
    };

    const onReset = () => {
        setView( ( prev: any ) => ( { ...prev, page: 1 } ) );
        //@ts-ignore
        wp.hooks.doAction( 'dokan_vendors_reset_filters_before_fetch' );
        fetchVendors( {
            page: 1,
            perPage: view.perPage,
            noBuildQuery: true,
        } );
    };

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
    const extractSingleFromArgs = ( args: any ): Vendor | null => {
        if ( args?.item ) {
            return args.item as Vendor;
        }
        if ( Array.isArray( args ) && args.length ) {
            return args[ 0 ] as Vendor;
        }
        return null;
    };
    const openConfirmFor = ( action: 'approve' | 'disable', args: any ) => {
        const ids = extractIdsFromArgs( args );
        if ( ids.length > 1 ) {
            setConfirmState( { mode: 'bulk', action, vendorIds: ids } );
            return;
        }
        const v = extractSingleFromArgs( args );
        if ( v ) {
            setConfirmState( { mode: 'single', action, vendor: v } );
        }
    };
    const getConfirmConfig = ( state: NonNullable< typeof confirmState > ) => {
        const isApprove = state.action === 'approve';
        const isBulk = state.mode === 'bulk';
        return {
            title: isApprove
                ? __( 'Approve Vendor', 'dokan-lite' )
                : __( 'Disable Vendor', 'dokan-lite' ),
            // @ts-ignore
            // eslint-disable-next-line no-nested-ternary
            description: isBulk
                ? isApprove
                    ? __(
                          'Are you sure you want to approve the selected vendors?',
                          'dokan-lite'
                      )
                    : __(
                          'Are you sure you want to disable the selected vendors from selling?',
                          'dokan-lite'
                      )
                : isApprove
                ? __(
                      'Are you sure you want to approve this vendor?',
                      'dokan-lite'
                  )
                : __(
                      'Are you sure you want to disable this vendor from selling?',
                      'dokan-lite'
                  ),
            confirmText: isApprove
                ? __( 'Yes, Approve', 'dokan-lite' )
                : __( 'Yes, Disable', 'dokan-lite' ),
            variant: isApprove ? 'primary' : ( 'danger' as const ),
        };
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
        <div className="dokan-layout dokan-admin-vendors">
            <div className="mb-3 flex items-center justify-between">
                <h1 className="wp-heading-inline">
                    { __( 'Vendors', 'dokan-lite' ) }
                </h1>
                <div className="flex items-center gap-2">
                    <DokanButton
                        type="button"
                        variant="primary"
                        onClick={ () => navigate( '/vendors/add' ) }
                    >
                        <LucideIcons.Plus size={ 16 } />
                        { __( 'Add New Vendor', 'dokan-lite' ) }
                    </DokanButton>
                </div>
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
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
                <div className="flex items-center gap-3">
                    <SearchInput value={ search } onChange={ setSearch } />
                    { getFilterFields().length > 0 && (
                        <DokanButton
                            type="button"
                            variant="secondary"
                            onClick={ () => setShowFilters( ( v ) => ! v ) }
                        >
                            <LucideIcons.Funnel size={ 16 } />
                            { __( 'Filter', 'dokan-lite' ) }
                        </DokanButton>
                    ) }
                </div>
            </div>

            { /* Filters */ }
            <div
                className={ `dokan-dashboard-filters ${
                    showFilters ? '' : 'hidden'
                }` }
            >
                <Filter
                    fields={ getFilterFields().map( ( Component, index ) => (
                        <Component
                            key={ index }
                            onFilter={ onFilter }
                            onReset={ onReset }
                            params={ params }
                            navigate={ navigate }
                            location={ location }
                            searchParams={ searchParams }
                            setSearchParams={ setSearchParams }
                        />
                    ) ) }
                    showFilter={ false }
                    showReset={ false }
                    namespace="dokan-admin-vendors-filter"
                />
            </div>

            { /* Table */ }
            <div>
                { /* Confirmation Modal */ }
                { confirmState &&
                    ( () => {
                        const cfg = getConfirmConfig( confirmState );
                        return (
                            <DokanModal
                                isOpen={ !! confirmState }
                                onClose={ () => setConfirmState( null ) }
                                namespace="dokan-admin-vendors-confirm"
                                dialogTitle={ __(
                                    'Confirmation',
                                    'dokan-lite'
                                ) }
                                confirmationTitle={ cfg.title }
                                confirmationDescription={ cfg.description }
                                confirmButtonText={ cfg.confirmText }
                                // @ts-ignore
                                confirmButtonVariant={ cfg.variant }
                                loading={ isConfirmLoading }
                                onConfirm={ async () => {
                                    setIsConfirmLoading( true );
                                    try {
                                        if ( confirmState.mode === 'single' ) {
                                            await apiFetch( {
                                                path: `/dokan/v1/stores/${ confirmState.vendor.id }/status`,
                                                method: 'PUT',
                                                data: {
                                                    status:
                                                        confirmState.action ===
                                                        'approve'
                                                            ? 'active'
                                                            : 'inactive',
                                                },
                                            } as any );
                                        } else {
                                            const ids = confirmState.vendorIds;
                                            if (
                                                confirmState.action ===
                                                'approve'
                                            ) {
                                                await apiFetch( {
                                                    path: `/dokan/v1/stores/batch`,
                                                    method: 'POST',
                                                    data: { approved: ids },
                                                } as any );
                                            } else {
                                                await apiFetch( {
                                                    path: `/dokan/v1/stores/batch`,
                                                    method: 'POST',
                                                    data: { pending: ids },
                                                } as any );
                                            }
                                        }
                                        await fetchVendors();
                                        // Clear selection after bulk actions
                                        if ( confirmState.mode === 'bulk' ) {
                                            setSelection( [] );
                                        }
                                    } finally {
                                        setIsConfirmLoading( false );
                                    }
                                } }
                            />
                        );
                    } )() }

                <DataViews
                    data={ data }
                    namespace="dokan-admin-vendors-table"
                    defaultLayouts={ { ...defaultLayouts } }
                    fields={ fields as any }
                    getItemId={ ( item: Vendor ) => item.id }
                    onChangeView={ handleChangeView }
                    search={ false }
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
                                callback: ( item ) => {
                                    const vendor: Vendor = item[ 0 ] as Vendor;
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
                                callback: ( item ) => {
                                    const vendor: Vendor = item[ 0 ] as Vendor;
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
                                callback: ( item ) => {
                                    const vendor: Vendor = item[ 0 ] as Vendor;
                                    window.location.href =
                                        // @ts-ignore
                                        dokanAdminDashboard.urls
                                            .adminOrderListUrl +
                                        '&vendor_id=' +
                                        vendor?.id;
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
                                callback: ( args: any ) => {
                                    openConfirmFor( 'disable', args );
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
                                callback: ( args: any ) => {
                                    openConfirmFor( 'approve', args );
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
