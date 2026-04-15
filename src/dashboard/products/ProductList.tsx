import { useState, useMemo, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useToast } from '@getdokan/dokan-ui';
import {
    addAction,
    applyFilters,
    removeAction,
} from '@wordpress/hooks';
import { Fill } from '@wordpress/components';
import { useNavigate } from 'react-router-dom';
import { Boxes, Package, ExternalLink, LayoutGrid, Plus } from 'lucide-react';
import {
    DataViews,
    DokanBadge,
    DokanButton,
    // @ts-ignore
    // eslint-disable-next-line import/no-unresolved
    Select,
} from '@dokan/components';
import PriceHtml from '../../components/PriceHtml';
import { useProducts } from './hooks/useProducts';
import { useProductCategories } from './hooks/useProductCategories';
import { QuickViewModal } from './QuickViewModal';
import type { ProductItem, ProductStatus, ProductFilterState } from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStatusBadgeVariant = ( status: string ) => {
    switch ( status ) {
        case 'publish':
            return 'success';
        case 'draft':
            return 'secondary';
        case 'pending':
            return 'warning';
        case 'future':
            return 'info';
        default:
            return 'info';
    }
};

const getStatusLabel = ( status: string ) => {
    switch ( status ) {
        case 'publish':
            return __( 'Published', 'dokan-lite' );
        case 'draft':
            return __( 'Draft', 'dokan-lite' );
        case 'pending':
            return __( 'Pending Review', 'dokan-lite' );
        case 'future':
            return __( 'Scheduled', 'dokan-lite' );
        default:
            return status;
    }
};

const getProductTypeLabel = ( item: ProductItem ) => {
    if ( item.type === 'grouped' ) return __( 'Grouped', 'dokan-lite' );
    if ( item.type === 'external' )
        return __( 'External/Affiliate', 'dokan-lite' );
    if ( item.type === 'variable' ) return __( 'Variable', 'dokan-lite' );
    return __( 'Simple', 'dokan-lite' );
};

const ProductTypeIcon = ( { item }: { item: ProductItem } ) => {
    const cls = 'w-5 h-5 text-gray-500';
    if ( item.type === 'variable' ) return <Boxes className={ cls } />;
    if ( item.type === 'grouped' ) return <LayoutGrid className={ cls } />;
    if ( item.type === 'external' ) return <ExternalLink className={ cls } />;
    return <Package className={ cls } />;
};

// ── Product type options ──────────────────────────────────────────────────────

const PRODUCT_TYPE_OPTIONS = [
    {
        value: 'simple',
        label: __( 'Simple', 'dokan-lite' ),
    },
    {
        value: 'variable',
        label: __( 'Variable', 'dokan-lite' ),
    },
    {
        value: 'grouped',
        label: __( 'Grouped', 'dokan-lite' ),
    },
    {
        value: 'external',
        label: __( 'External/Affiliate', 'dokan-lite' ),
    },
];

// ── Product listing localized data from PHP ───────────────────────────────────

interface SubscriptionInfo {
    remaining_products: true | number;
    can_post_product: boolean;
    subscription_url?: string;
}

interface ProductListingConfig {
    can_add_product?: boolean;
    new_product_url?: string;
    can_import?: boolean;
    can_export?: boolean;
    import_url?: string;
    export_url?: string;
    subscription?: SubscriptionInfo;
}

// ── Component ─────────────────────────────────────────────────────────────────

function ProductList() {
    const toast = useToast();
    const navigate = useNavigate();
    const [ selection, setSelection ] = useState< string[] >( [] );
    const [ quickViewProduct, setQuickViewProduct ] =
        useState< ProductItem | null >( null );

    const [ filterArgs, setFilterArgs ] = useState< ProductFilterState >( {
        page: 1,
        per_page: 10,
        status: 'all',
        search: '',
        category: '',
        type: '',
        year_month: '',
    } );

    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        status: 'all',
        fields: [
            'name',
            'type',
            'stock',
            'status',
            'price',
            'earning',
            'advertise',
        ],
    } );

    const {
        data,
        isLoading,
        totalItems,
        totalPages,
        statusCounts,
        productsUrl,
        instockCount,
        outstockCount,
        monthOptions,
        subscriptionRemaining,
        fetchProducts,
        fetchStatusCounts,
        deleteProduct,
        deleteProducts,
        updateProductsStatus,
    } = useProducts( filterArgs );

    const { options: categoryOptions } = useProductCategories();

    const subscriptionInfo: SubscriptionInfo | undefined = ( window as any )
        .dokanFrontend?.product_listing?.subscription;

    const effectiveRemaining: true | number | undefined =
        subscriptionRemaining?.remaining_products ??
        subscriptionInfo?.remaining_products;
    const effectiveCanPost: boolean =
        subscriptionRemaining?.can_post_product ??
        subscriptionInfo?.can_post_product ??
        true;

    const subscriptionLimitReached =
        subscriptionInfo !== undefined &&
        ( effectiveRemaining === 0 || ! effectiveCanPost );

    // ── Fields (columns) ─────────────────────────────────────────────────────

    const fields = [
        {
            id: 'name',
            label: __( 'Products', 'dokan-lite' ),
            enableSorting: false,
            isPrimary: true,
            render: ( { item }: { item: ProductItem } ) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        { item.images?.[ 0 ]?.src ? (
                            <img
                                src={ item.images[ 0 ].src }
                                alt={ item.images[ 0 ].alt || item.name }
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100" />
                        ) }
                    </div>
                    <div>
                        <a
                            href={ `#` }
                            onClick={ ( e ) => {
                                e.preventDefault();
                                navigate( `/products/${ item.id }/edit` );
                            } }
                            className="font-medium text-dokan-link cursor-pointer block focus:outline-none!"
                        >
                            { item.name }
                        </a>
                        { item.sku && (
                            <span className="text-xs text-gray-500 block">
                                { __( 'SKU:', 'dokan-lite' ) } { item.sku }
                            </span>
                        ) }
                    </div>
                </div>
            ),
        },
        {
            id: 'type',
            label: __( 'Type', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => (
                <span
                    title={ getProductTypeLabel( item ) }
                    className="inline-flex items-center"
                >
                    <ProductTypeIcon item={ item } />
                </span>
            ),
        },
        {
            id: 'stock',
            label: __( 'Stock', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => {
                if ( item.manage_stock && item.stock_quantity !== null ) {
                    const qty = item.stock_quantity;
                    const isLow = qty <= 10;
                    return (
                        <span
                            className={
                                isLow
                                    ? 'text-red-600 font-medium'
                                    : 'text-green-600 font-medium'
                            }
                        >
                            { qty }
                        </span>
                    );
                }
                return (
                    <span
                        className={
                            item.in_stock ? 'text-green-600' : 'text-red-600'
                        }
                    >
                        { item.in_stock
                            ? __( 'In stock', 'dokan-lite' )
                            : __( 'Out of stock', 'dokan-lite' ) }
                    </span>
                );
            },
        },
        {
            id: 'status',
            label: __( 'Status', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => (
                <DokanBadge
                    variant={ getStatusBadgeVariant( item.status ) }
                    label={ getStatusLabel( item.status ) }
                />
            ),
        },
        {
            id: 'price',
            label: __( 'Price', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => {
                if ( ! item.price ) {
                    return <span className="text-gray-400">{ '—' }</span>;
                }
                if ( item.on_sale && item.regular_price && item.sale_price ) {
                    return (
                        <div className="flex flex-col">
                            <span className="line-through text-red-400">
                                <PriceHtml price={ item.regular_price } />
                            </span>
                            <span className="text-green-600 font-medium">
                                <PriceHtml price={ item.sale_price } />
                            </span>
                        </div>
                    );
                }
                return <PriceHtml price={ item.price } />;
            },
        },
        {
            id: 'earning',
            label: __( 'Earning', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) =>
                item.earning !== null && item.earning !== undefined ? (
                    <PriceHtml price={ String( item.earning ) } />
                ) : (
                    <span className="text-gray-400">{ '—' }</span>
                ),
        },
    ];

    /**
     * Filter the product list table fields (columns).
     * Allows Pro modules and third-party plugins to add, remove, or modify columns.
     *
     * @param {Array}              fields     Default field definitions.
     * @param {ProductFilterState} filterArgs Current filter state.
     */
    const filteredFields = applyFilters(
        'dokan_product_list_table_fields',
        fields,
        filterArgs
    ) as typeof fields;

    // ── Tabs ─────────────────────────────────────────────────────────────────

    const onTabSelect = ( value: string ) => {
        if ( value === 'instock' ) {
            setFilterArgs( ( prev ) => ( {
                ...prev,
                status: 'all',
                in_stock: true,
                page: 1,
                search: '',
            } ) );
        } else if ( value === 'outofstock' ) {
            setFilterArgs( ( prev ) => ( {
                ...prev,
                status: 'all',
                in_stock: false,
                page: 1,
                search: '',
            } ) );
        } else {
            setFilterArgs( ( prev ) => ( {
                ...prev,
                status: value as ProductStatus,
                in_stock: undefined,
                page: 1,
                search: '',
            } ) );
        }
        setView( ( prev ) => ( {
            ...prev,
            page: 1,
            status: value,
            search: '',
        } ) );
        setSelection( [] );
    };

    // ── Page notices (above heading, injected by Pro modules via filter) ─────────

    const pageNotices = useMemo( () => {
        const base: ProductListingConfig =
            ( window as any ).dokanFrontend?.product_listing ?? {};

        const config: ProductListingConfig =
            subscriptionInfo && effectiveRemaining !== undefined
                ? {
                      ...base,
                      subscription: {
                          ...subscriptionInfo,
                          remaining_products: effectiveRemaining,
                          can_post_product: effectiveCanPost,
                      },
                  }
                : base;
        return applyFilters(
            'dokan_product_list_page_notices',
            [] as JSX.Element[],
            config
        ) as JSX.Element[];
    }, [ effectiveRemaining, effectiveCanPost ] );

    const headerButtons = useMemo( () => {
        const base: ProductListingConfig =
            ( window as any ).dokanFrontend?.product_listing ?? {};
        const config: ProductListingConfig =
            subscriptionInfo && effectiveRemaining !== undefined
                ? {
                      ...base,
                      subscription: {
                          ...subscriptionInfo,
                          remaining_products: effectiveRemaining,
                          can_post_product: effectiveCanPost,
                      },
                  }
                : base;

        if ( subscriptionLimitReached ) {
            return [] as JSX.Element[];
        }

        const buttons: JSX.Element[] = [];

        if ( config.can_add_product ) {
            buttons.push(
                <DokanButton
                    key="add-product"
                    onClick={ () => navigate( '/products/create' ) }
                >
                    <Plus size={ 16 } />
                    { __( 'Add new product', 'dokan-lite' ) }
                </DokanButton>
            );
        }

        return applyFilters(
            'dokan_product_list_header_buttons',
            buttons,
            config
        ) as JSX.Element[];
    }, [ effectiveRemaining, effectiveCanPost, subscriptionLimitReached ] );

    const tabs = useMemo( () => {
        const countMap: Record< string, number > = {};
        statusCounts.forEach( ( s ) => {
            countMap[ s.value ] = s.count;
        } );

        return {
            items: [
                {
                    value: 'all',
                    label: __( 'All', 'dokan-lite' ),
                    count: countMap[ 'all' ] ?? 0,
                },
                {
                    value: 'publish',
                    label: __( 'Published', 'dokan-lite' ),
                    count: countMap[ 'publish' ] ?? 0,
                },
                {
                    value: 'pending',
                    label: __( 'Pending Review', 'dokan-lite' ),
                    count: countMap[ 'pending' ] ?? 0,
                },
                {
                    value: 'draft',
                    label: __( 'Draft', 'dokan-lite' ),
                    count: countMap[ 'draft' ] ?? 0,
                },
                {
                    value: 'instock',
                    label: __( 'In stock', 'dokan-lite' ),
                    count: instockCount,
                },
                {
                    value: 'outofstock',
                    label: __( 'Out of stock', 'dokan-lite' ),
                    count: outstockCount,
                },
            ],
            onSelect: onTabSelect,
        };
    }, [ statusCounts, instockCount, outstockCount ] );

    // ── Filter fields ─────────────────────────────────────────────────────────

    const filterFields = useMemo(
        () => [
            {
                id: 'year_month',
                label: __( 'Date', 'dokan-lite' ),
                field: (
                    <Select
                        key="month-select"
                        isClearable
                        placeholder={ __( 'All dates', 'dokan-lite' ) }
                        options={ monthOptions }
                        value={
                            monthOptions.find(
                                ( o ) => o.value === filterArgs.year_month
                            ) ?? null
                        }
                        onChange={ ( option: { value: string } | null ) => {
                            setFilterArgs( ( prev ) => ( {
                                ...prev,
                                year_month: option?.value ?? '',
                                page: 1,
                            } ) );
                        } }
                    />
                ),
            },
            {
                id: 'category',
                label: __( 'Category', 'dokan-lite' ),
                field: (
                    <Select
                        key="category-select"
                        isClearable
                        placeholder={ __( 'All categories', 'dokan-lite' ) }
                        options={ categoryOptions }
                        value={
                            categoryOptions.find(
                                ( o ) => o.value === filterArgs.category
                            ) ?? null
                        }
                        onChange={ ( option: { value: number } | null ) => {
                            setFilterArgs( ( prev ) => ( {
                                ...prev,
                                category: option?.value ?? '',
                                page: 1,
                            } ) );
                        } }
                    />
                ),
            },
            {
                id: 'type',
                label: __( 'Product Type', 'dokan-lite' ),
                field: (
                    <Select
                        key="type-select"
                        isClearable
                        placeholder={ __( 'All types', 'dokan-lite' ) }
                        options={ PRODUCT_TYPE_OPTIONS }
                        value={
                            PRODUCT_TYPE_OPTIONS.find(
                                ( o ) => o.value === filterArgs.type
                            ) ?? null
                        }
                        onChange={ ( option: { value: string } | null ) => {
                            setFilterArgs( ( prev ) => ( {
                                ...prev,
                                type: option?.value ?? '',
                                page: 1,
                            } ) );
                        } }
                    />
                ),
            },
        ],
        [
            monthOptions,
            categoryOptions,
            filterArgs.year_month,
            filterArgs.category,
            filterArgs.type,
        ]
    );

    const allFilterFields = useMemo(
        () =>
            applyFilters(
                'dokan_product_list_filter_fields',
                filterFields,
                filterArgs,
                setFilterArgs
            ) as typeof filterFields,
        [ filterFields, filterArgs ]
    );

    // ── Actions ───────────────────────────────────────────────────────────────

    const actions = useMemo(
        () => [
            {
                id: 'edit-details',
                label: () => __( 'Edit details', 'dokan-lite' ),
                callback: ( [ item ]: ProductItem[] ) => {
                    navigate( `/products/${ item.id }/edit` );
                },
            },
            {
                id: 'quick-view',
                label: () => __( 'Quick view', 'dokan-lite' ),
                callback: ( [ item ]: ProductItem[] ) => {
                    setQuickViewProduct( item );
                },
            },
            {
                id: 'view-in-site',
                label: () => __( 'View in site', 'dokan-lite' ),
                isEligible: ( item: ProductItem ) =>
                    item.status === 'publish' && !! item.permalink,
                callback: ( [ item ]: ProductItem[] ) => {
                    if ( item.permalink ) {
                        window.open( item.permalink, '_blank' );
                    }
                },
            },
            {
                id: 'delete',
                label: __( 'Delete Permanently', 'dokan-lite' ),
                isDestructive: true,
                supportsBulk: true,
                callback: async ( items: ProductItem[] ) => {
                    try {
                        if ( items.length === 1 ) {
                            await deleteProduct( items[ 0 ].id );
                        } else {
                            await deleteProducts( items.map( ( i ) => i.id ) );
                        }
                        toast( {
                            type: 'success',
                            title:
                                items.length === 1
                                    ? __(
                                          'Product deleted successfully.',
                                          'dokan-lite'
                                      )
                                    : __(
                                          'Products deleted successfully.',
                                          'dokan-lite'
                                      ),
                        } );
                        setSelection( [] );
                        fetchProducts();
                        fetchStatusCounts();
                    } catch {
                        toast( {
                            type: 'error',
                            title:
                                items.length === 1
                                    ? __(
                                          'Failed to delete product.',
                                          'dokan-lite'
                                      )
                                    : __(
                                          'Failed to delete products.',
                                          'dokan-lite'
                                      ),
                        } );
                    }
                },
            },
            {
                id: 'bulk-publish',
                label: ( items: ProductItem[] ) =>
                    items.length > 1
                        ? __( 'Publish Products', 'dokan-lite' )
                        : __( 'Publish Product', 'dokan-lite' ),
                supportsBulk: true,
                isEligible: ( item: ProductItem ) => {
                    if ( item.status === 'publish' ) return false;
                    if (
                        subscriptionLimitReached &&
                        ! [ 'publish', 'pending' ].includes( item.status )
                    ) {
                        return false;
                    }
                    return true;
                },
                callback: async ( items: ProductItem[] ) => {
                    let toPublish = items;
                    let skipped = 0;

                    if (
                        subscriptionInfo &&
                        effectiveRemaining !== undefined &&
                        effectiveRemaining !== true
                    ) {
                        const remaining = effectiveRemaining as number;
                        if ( remaining <= 0 ) {
                            toast( {
                                type: 'error',
                                title: __(
                                    'You have reached your subscription product limit.',
                                    'dokan'
                                ),
                            } );
                            return;
                        }
                        if ( items.length > remaining ) {
                            toPublish = items.slice( 0, remaining );
                            skipped = items.length - remaining;
                        }
                    }

                    try {
                        await updateProductsStatus(
                            toPublish.map( ( i ) => i.id ),
                            'publish'
                        );

                        if ( skipped > 0 ) {
                            toast( {
                                type: 'warning',
                                title: sprintf(
                                    /* translators: 1: published count, 2: skipped count */
                                    __(
                                        '%1$d product(s) published. %2$d product(s) could not be published due to your subscription limit.',
                                        'dokan'
                                    ),
                                    toPublish.length,
                                    skipped
                                ),
                            } );
                        } else {
                            toast( {
                                type: 'success',
                                title:
                                    toPublish.length === 1
                                        ? __(
                                              'Product published successfully.',
                                              'dokan-lite'
                                          )
                                        : __(
                                              'Products published successfully.',
                                              'dokan-lite'
                                          ),
                            } );
                        }

                        setSelection( [] );
                        fetchProducts();
                        fetchStatusCounts();
                    } catch {
                        toast( {
                            type: 'error',
                            title:
                                items.length === 1
                                    ? __(
                                          'Failed to publish product.',
                                          'dokan-lite'
                                      )
                                    : __(
                                          'Failed to publish products.',
                                          'dokan-lite'
                                      ),
                        } );
                    }
                },
            },
        ],
        [
            deleteProduct,
            deleteProducts,
            updateProductsStatus,
            fetchProducts,
            fetchStatusCounts,
            productsUrl,
            toast,
            subscriptionInfo,
            effectiveRemaining,
            subscriptionLimitReached,
            selection,
        ]
    );

    /**
     * Filter the product list table actions (row and bulk).
     * Allows Pro modules and third-party plugins to add, remove, or modify actions.
     *
     * @since DOKAN_SINCE
     *
     * @param {Array}  actions Default action definitions.
     * @param {Object} context Context with helpers (fetchProducts, fetchStatusCounts, selection, setSelection).
     */
    const filteredActions = useMemo(
        () =>
            applyFilters( 'dokan_product_list_table_actions', actions, {
                fetchProducts,
                fetchStatusCounts,
                selection,
                setSelection,
            } ) as typeof actions,
        [ actions, selection ]
    );

    // ── View change ───────────────────────────────────────────────────────────

    const onViewChange = ( newView: typeof view ) => {
        setView( newView );
        setFilterArgs( ( prev ) => ( {
            ...prev,
            page: newView.page,
            per_page: newView.perPage,
            search: newView.search ?? '',
        } ) );
    };

    // ── Filter callbacks ──────────────────────────────────────────────────────

    const onFilterRemove = ( filterId: string ) => {
        setFilterArgs( ( prev ) => ( {
            ...prev,
            [ filterId ]: '',
            page: 1,
        } ) );
    };

    const onFilterReset = () => {
        setFilterArgs( ( prev ) => ( {
            ...prev,
            category: '',
            type: '',
            year_month: '',
            product_brand: '',
            filter_by_other: '',
            page: 1,
        } ) );
    };

    useEffect( () => {
        addAction( 'dokan_product_list_refresh', 'dokan/product-list', () => {
            fetchProducts();
            fetchStatusCounts();
            setSelection( [] );
        } );
        return () => {
            removeAction( 'dokan_product_list_refresh', 'dokan/product-list' );
        };
    }, [] );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            { headerButtons.length > 0 && (
                <Fill name="dokan-header-actions">{ headerButtons }</Fill>
            ) }

            { pageNotices.length > 0 && (
                <Fill name="dokan-before-header">
                    { pageNotices.map( ( notice, i ) => (
                        <div key={ i } className="col-span-4">
                            { notice }
                        </div>
                    ) ) }
                </Fill>
            ) }

            <DataViews
                namespace="dokan-products-data-view"
                data={ data }
                fields={ filteredFields }
                view={ view }
                onChangeView={ onViewChange }
                getItemId={ ( item: ProductItem ) => item.id }
                isLoading={ isLoading }
                paginationInfo={ { totalItems, totalPages } }
                tabs={ tabs }
                filter={ {
                    fields: allFilterFields,
                    onFilterRemove,
                    onReset: onFilterReset,
                } }
                search={ true }
                actions={ filteredActions }
                selection={ selection }
                onChangeSelection={ ( ids: string[] ) => setSelection( ids ) }
            />

            { /* Read-only quick view */ }
            <QuickViewModal
                product={ quickViewProduct }
                onClose={ () => setQuickViewProduct( null ) }
            />

            {
                applyFilters( 'dokan_product_list_after_content', null, {
                    fetchProducts,
                    fetchStatusCounts,
                    selection,
                    setSelection,
                    data,
                } ) as React.ReactNode
            }
        </>
    );
}

export default ProductList;
