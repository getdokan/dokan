import { useState, useMemo, useEffect, useCallback } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { __, sprintf } from '@wordpress/i18n';
import { useToast } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';
import { Fill } from '@wordpress/components';
import { Boxes, Package, ExternalLink, LayoutGrid } from 'lucide-react';
import { Fill } from '@wordpress/components';
import { Boxes, Package, ExternalLink, LayoutGrid } from 'lucide-react';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { DataViews, DokanBadge, DokanModal, Select } from '@dokan/components';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';
import { useProducts } from './hooks/useProducts';
import { useProductCategories } from './hooks/useProductCategories';
import { useProductMonths } from './hooks/useProductMonths';
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
    if ( item.type === 'external' ) return __( 'External/Affiliate', 'dokan-lite' );
    if ( item.type === 'external' ) return __( 'External/Affiliate', 'dokan-lite' );
    if ( item.type === 'variable' ) return __( 'Variable', 'dokan-lite' );
    if ( item.type === 'simple' ) {
        if ( item.virtual ) return __( 'Virtual', 'dokan-lite' );
        if ( item.downloadable ) return __( 'Downloadable', 'dokan-lite' );
        return __( 'Simple', 'dokan-lite' );
    }
    // Unknown types: ucfirst the type name
    return item.type
        ? item.type.charAt( 0 ).toUpperCase() + item.type.slice( 1 )
        : __( 'Simple', 'dokan-lite' );
};

const ProductTypeIcon = ( { item }: { item: ProductItem } ) => {
    const cls = 'w-5 h-5 text-gray-500';
    if ( item.type === 'variable' ) return <Boxes className={ cls } />;
    if ( item.type === 'variable' ) return <Boxes className={ cls } />;
    if ( item.type === 'grouped' ) return <LayoutGrid className={ cls } />;
    if ( item.type === 'external' ) return <ExternalLink className={ cls } />;
    return <Package className={ cls } />;
};

// ── Status options for quick edit ─────────────────────────────────────────────
const STATUS_OPTIONS = [
    { value: 'publish', label: __( 'Published', 'dokan-lite' ) },
    { value: 'draft', label: __( 'Draft', 'dokan-lite' ) },
    { value: 'pending', label: __( 'Pending Review', 'dokan-lite' ) },
];

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

// ── Quick View Modal (read-only) ──────────────────────────────────────────────

const QuickViewModal = ( {
    product,
    onClose,
}: {
    product: ProductItem | null;
    onClose: () => void;
} ) => {
    if ( ! product ) return null;

    const stockDisplay = () => {
        if ( product.manage_stock && product.stock_quantity !== null ) {
            return product.stock_quantity;
        }
        return product.in_stock
            ? __( 'In stock', 'dokan-lite' )
            : __( 'Out of stock', 'dokan-lite' );
    };

    return (
        <DokanModal
            isOpen={ true }
            namespace="product-quick-view"
            className="max-w-2xl w-full"
            className="max-w-2xl w-full"
            onClose={ onClose }
            onConfirm={ onClose }
            confirmButtonText={ __( 'Close', 'dokan-lite' ) }
            confirmButtonVariant="primary"
            hideCancelButton={ true }
            dialogHeader={
                <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        { product.images?.[ 0 ]?.src ? (
                            <img
                                src={ product.images[ 0 ].src }
                                alt={ product.images[ 0 ].alt || product.name }
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100" />
                        ) }
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                        <h2 className="text-lg font-semibold text-dokan-link truncate">
                            { product.name }
                        </h2>
                        <p className="text-sm text-gray-500">
                            { __( 'SKU:', 'dokan-lite' ) }{ ' ' }
                            { product.sku || __( 'N/A', 'dokan-lite' ) }
                        </p>
                    </div>
                </div>
            }
            dialogContent={
                <div>
                    <p className="font-semibold text-gray-900 mb-3">
                        { __( 'Product info:', 'dokan-lite' ) }
                    </p>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Type', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { getProductTypeLabel( product ) }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Stock', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { stockDisplay() }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Status', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right">
                                    <DokanBadge
                                        variant={ getStatusBadgeVariant(
                                            product.status
                                        ) }
                                        label={ getStatusLabel(
                                            product.status
                                        ) }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Price', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { product.price ? (
                                        <PriceHtml price={ product.price } />
                                    ) : (
                                        '—'
                                    ) }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Earning', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { product.earning !== null &&
                                    product.earning !== undefined ? (
                                        <PriceHtml
                                            price={ String( product.earning ) }
                                        />
                                    ) : (
                                        '—'
                                    ) }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Date created', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    <DateTimeHtml.Date
                                        date={ product.date_created }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Last Modified', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    <DateTimeHtml.Date
                                        date={ product.date_modified }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Page View', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { product.page_view ?? 0 }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            }
        />
    );
};

// ── Product listing localized data from PHP ───────────────────────────────────

interface SubscriptionInfo {
    /** Initial page-load values from PHP. After each action, subscriptionRemaining from the hook takes over. */
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
    /** Present only when the subscription module is active */
    subscription?: SubscriptionInfo;
}

// ── Component ─────────────────────────────────────────────────────────────────

function ProductList() {
    const toast = useToast();
    const [ selection, setSelection ] = useState< string[] >( [] );
    const [ quickViewProduct, setQuickViewProduct ] =
        useState< ProductItem | null >( null );
    const [ quickEditProduct, setQuickEditProduct ] =
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
        subscriptionRemaining,
        fetchProducts,
        fetchStatusCounts,
        deleteProduct,
        deleteProducts,
        updateProductsStatus,
    } = useProducts( filterArgs );

    const { options: categoryOptions } = useProductCategories();
    const { options: monthOptions } = useProductMonths();

    // ── Subscription limits ───────────────────────────────────────────────────

    // Static PHP data: set at page load, used as initial values before the
    // first fetchStatusCounts() response arrives. Also holds subscription_url
    // which never changes.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionInfo: SubscriptionInfo | undefined = (
        window as any
    ).dokanFrontend?.product_listing?.subscription;

    // Fresh values from /dokan/v1/products/summary (PHP authoritative calculation).
    // Includes ALL product types (auction + normal) — same as PHP's get_published_product_count().
    // Updated after every action because fetchStatusCounts() calls the summary endpoint.
    // Falls back to the static PHP data until the first summary response arrives.
    const effectiveRemaining: true | number | undefined =
        subscriptionRemaining?.remaining_products ??
        subscriptionInfo?.remaining_products;
    const effectiveCanPost: boolean =
        subscriptionRemaining?.can_post_product ??
        subscriptionInfo?.can_post_product ??
        true;

    /**
     * True when the vendor's subscription pack has been exhausted.
     * Mirrors PHP: $remaining_product == 0 || ! self::can_post_product()
     */
    const subscriptionLimitReached =
        subscriptionInfo !== undefined &&
        ( effectiveRemaining === 0 || ! effectiveCanPost );

    // ── Subscription limits ───────────────────────────────────────────────────

    // Static PHP data: set at page load, used as initial values before the
    // first fetchStatusCounts() response arrives. Also holds subscription_url
    // which never changes.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionInfo: SubscriptionInfo | undefined = (
        window as any
    ).dokanFrontend?.product_listing?.subscription;

    // Fresh values from /dokan/v1/products/summary (PHP authoritative calculation).
    // Includes ALL product types (auction + normal) — same as PHP's get_published_product_count().
    // Updated after every action because fetchStatusCounts() calls the summary endpoint.
    // Falls back to the static PHP data until the first summary response arrives.
    const effectiveRemaining: true | number | undefined =
        subscriptionRemaining?.remaining_products ??
        subscriptionInfo?.remaining_products;
    const effectiveCanPost: boolean =
        subscriptionRemaining?.can_post_product ??
        subscriptionInfo?.can_post_product ??
        true;

    /**
     * True when the vendor's subscription pack has been exhausted.
     * Mirrors PHP: $remaining_product == 0 || ! self::can_post_product()
     */
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
                        <span className="font-medium text-dokan-link cursor-pointer block">
                            { item.name }
                        </span>
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
                <span
                    title={ getProductTypeLabel( item ) }
                    className="inline-flex items-center"
                >
                    <ProductTypeIcon item={ item } />
                </span>
            ),
        },
        },
        {
            id: 'stock',
            label: __( 'Stock', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => {
                // Show numeric quantity only when the product manages its own stock.
                // Otherwise show the stock status text (matches PHP template behaviour).
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
            render: ( { item }: { item: ProductItem } ) =>
                item.price ? (
                    <PriceHtml price={ item.price } />
                ) : (
                    <span className="text-gray-400">{ '—' }</span>
                ),
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
     * @since 4.2.8
     *
     * @param {Array}              fields     Default field definitions.
     * @param {ProductFilterState} filterArgs Current filter state.
     */
    const filteredFields = applyFilters(
        'dokan_product_list_table_fields',
        fields,
        filterArgs
    ) as typeof fields;
    ];

    /**
     * Filter the product list table fields (columns).
     * Allows Pro modules and third-party plugins to add, remove, or modify columns.
     *
     * @since 4.2.8
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const base: ProductListingConfig =
            ( window as any ).dokanFrontend?.product_listing ?? {};
        // Inject the live remaining count so the subscription module's notice
        // filter reflects the current state after publish/delete actions.
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ effectiveRemaining, effectiveCanPost ] );

    const headerButtons = useMemo( () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const base: ProductListingConfig =
            ( window as any ).dokanFrontend?.product_listing ?? {};
        // Inject the live remaining count so Pro filters receive up-to-date data.
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

        // Mirror PHP: when subscription limit is reached, hide ALL header
        // action buttons (matches the CSS hide on .dokan-add-product-link).
        if ( subscriptionLimitReached ) {
            return [] as JSX.Element[];
        }

        const buttons: JSX.Element[] = [];

        if ( config.can_add_product && config.new_product_url ) {
            buttons.push(
                <a
                    key="add-product"
                    href={ config.new_product_url }
                    className="dokan-btn dokan-btn-theme"
                >
                    { __( 'Add new product', 'dokan-lite' ) }
                </a>
            );
        }

        return applyFilters(
            'dokan_product_list_header_buttons',
            buttons,
            config
        ) as JSX.Element[];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ effectiveRemaining, effectiveCanPost, subscriptionLimitReached ] );

    // ── Page notices (above heading, injected by Pro modules via filter) ─────────

    const pageNotices = useMemo( () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const base: ProductListingConfig =
            ( window as any ).dokanFrontend?.product_listing ?? {};
        // Inject the live remaining count so the subscription module's notice
        // filter reflects the current state after publish/delete actions.
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ effectiveRemaining, effectiveCanPost ] );

    const headerButtons = useMemo( () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const base: ProductListingConfig =
            ( window as any ).dokanFrontend?.product_listing ?? {};
        // Inject the live remaining count so Pro filters receive up-to-date data.
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

        // Mirror PHP: when subscription limit is reached, hide ALL header
        // action buttons (matches the CSS hide on .dokan-add-product-link).
        if ( subscriptionLimitReached ) {
            return [] as JSX.Element[];
        }

        const buttons: JSX.Element[] = [];

        if ( config.can_add_product && config.new_product_url ) {
            buttons.push(
                <a
                    key="add-product"
                    href={ config.new_product_url }
                    className="dokan-btn dokan-btn-theme"
                >
                    { __( 'Add new product', 'dokan-lite' ) }
                </a>
            );
        }

        return applyFilters(
            'dokan_product_list_header_buttons',
            buttons,
            config
        ) as JSX.Element[];
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ filterFields, filterArgs ]
    );
    const allFilterFields = useMemo(
        () =>
            applyFilters(
                'dokan_product_list_filter_fields',
                filterFields,
                filterArgs,
                setFilterArgs
            ) as typeof filterFields,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ filterFields, filterArgs ]
    );

    // ── Actions ───────────────────────────────────────────────────────────────

    const actions = useMemo(
        () => [
            // Edit details — full PHP product edit page (same as PHP "Edit" row action)
            {
                id: 'edit-details',
                label: () => __( 'Edit details', 'dokan-lite' ),
                isEligible: ( item: ProductItem ) => !! item.edit_url,
                callback: ( [ item ]: ProductItem[] ) => {
                    if ( item.edit_url ) {
                        window.location.href = item.edit_url;
                    }
                },
            },
            // Quick view — read-only info modal
            {
                id: 'quick-view',
                label: () => __( 'Quick view', 'dokan-lite' ),
                callback: ( [ item ]: ProductItem[] ) => {
                    setQuickViewProduct( item );
                },
            },
            // Quick edit — editable modal (mirrors the Pro PHP inline edit form)
            {
                id: 'quick-edit',
                label: () => __( 'Quick edit', 'dokan-lite' ),
                callback: ( [ item ]: ProductItem[] ) => {
                    setQuickEditProduct( item );
                },
            },
            // View in site — opens product permalink in new tab
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
            // Delete permanently — single or bulk
            {
                id: 'delete',
                label: () => __( 'Delete Permanently', 'dokan-lite' ),
                isDestructive: true,
                supportsBulk: true,
                confirmTitle: __( 'Delete Product(s)', 'dokan-lite' ),
                confirmMessage: __(
                    'Selected product(s) will be permanently deleted. This action cannot be undone.',
                    'dokan-lite'
                ),
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
                            title: __(
                                'Failed to delete product(s).',
                                'dokan-lite'
                            ),
                        } );
                    }
                },
            },
            // Bulk: Edit — navigate to PHP products page where Pro bulk edit form is available
            {
                id: 'bulk-edit',
                label: () => __( 'Edit', 'dokan-lite' ),
                supportsBulk: true,
                hideFromActionsDropdown: true,
                callback: () => {
                    if ( productsUrl ) {
                        window.location.href = productsUrl;
                    }
                },
            },
            // Bulk: Publish — publish all selected unpublished products
            {
                id: 'bulk-publish',
                label: () => __( 'Publish products', 'dokan-lite' ),
                supportsBulk: true,
                hideFromActionsDropdown: true,
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
                confirmTitle: __( 'Publish Product(s)', 'dokan-lite' ),
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
                confirmTitle: __( 'Publish Product(s)', 'dokan-lite' ),
                confirmMessage: __(
                    'Selected product(s) will be published.',
                    'dokan-lite'
                ),
                callback: async ( items: ProductItem[] ) => {
                    // Enforce subscription limit per-product: only publish as
                    // many as the vendor's remaining allowance permits.
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

                    // Enforce subscription limit per-product: only publish as
                    // many as the vendor's remaining allowance permits.
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
                                title: __(
                                    'Product(s) published successfully.',
                                    'dokan-lite'
                                ),
                            } );
                        }


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
                                title: __(
                                    'Product(s) published successfully.',
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
                            title: __(
                                'Failed to publish product(s).',
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
            toast,
            subscriptionInfo,
            effectiveRemaining,
            subscriptionLimitReached,
        ]
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

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            { /* Inject action buttons into the page header (same row as "Products" heading) */ }
            { headerButtons.length > 0 && (
                <Fill name="dokan-header-actions">{ headerButtons }</Fill>
            ) }

            { /* Page notices — injected ABOVE the page heading via dokan-before-header slot.
                   Populated by Pro modules (e.g. subscription) via the
                   dokan_product_list_page_notices JS filter.
                   col-span-4 makes each notice span the full width of the before-header grid. */ }
            { pageNotices.length > 0 && (
                <Fill name="dokan-before-header">
                    { pageNotices.map( ( notice, i ) => (
                        <div key={ i } className="col-span-4">
                            { notice }
                        </div>
                    ) ) }
                </Fill>
            ) }

            { /* Inject action buttons into the page header (same row as "Products" heading) */ }
            { headerButtons.length > 0 && (
                <Fill name="dokan-header-actions">{ headerButtons }</Fill>
            ) }

            { /* Page notices — injected ABOVE the page heading via dokan-before-header slot.
                   Populated by Pro modules (e.g. subscription) via the
                   dokan_product_list_page_notices JS filter.
                   col-span-4 makes each notice span the full width of the before-header grid. */ }
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
                fields={ filteredFields }
                view={ view }
                onChangeView={ onViewChange }
                getItemId={ ( item: ProductItem ) => item.id }
                isLoading={ isLoading }
                paginationInfo={ { totalItems, totalPages } }
                tabs={ tabs }
                filter={ {
                    fields: allFilterFields,
                    fields: allFilterFields,
                } }
                search={ true }
                actions={ actions }
                selection={ selection }
                onChangeSelection={ ( ids: string[] ) => setSelection( ids ) }
            />

            { /* Read-only quick view */ }
            <QuickViewModal
                product={ quickViewProduct }
                onClose={ () => setQuickViewProduct( null ) }
            />
        </>
    );
}

export default ProductList;
