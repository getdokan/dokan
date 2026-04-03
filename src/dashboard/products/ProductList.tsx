import { useState, useMemo, useEffect, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useToast } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';
import { Slot } from '@wordpress/components';
import {
    Download,
    Layers,
    Cloud,
    Package,
    ExternalLink,
    LayoutGrid,
} from 'lucide-react';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { DataViews, DokanBadge, DokanModal, Select } from '@dokan/components';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';
import { useProducts } from './hooks/useProducts';
import { useProductCategories } from './hooks/useProductCategories';
import { useProductMonths } from './hooks/useProductMonths';
import { PRODUCT_LIST_SLOTS } from './constants';
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
    if ( item.type === 'variable' ) return <Layers className={ cls } />;
    if ( item.type === 'grouped' ) return <LayoutGrid className={ cls } />;
    if ( item.type === 'external' ) return <ExternalLink className={ cls } />;
    if ( item.virtual ) return <Cloud className={ cls } />;
    if ( item.downloadable ) return <Download className={ cls } />;
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
    { value: 'simple', label: __( 'Simple', 'dokan-lite' ) },
    { value: 'variable', label: __( 'Variable', 'dokan-lite' ) },
    { value: 'grouped', label: __( 'Grouped', 'dokan-lite' ) },
    { value: 'external', label: __( 'External/Affiliate', 'dokan-lite' ) },
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
            className="max-w-lg w-full"
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

// ── Quick Edit Modal (editable fields) ───────────────────────────────────────

const QuickEditModal = ( {
    product,
    onClose,
    onSaved,
}: {
    product: ProductItem | null;
    onClose: () => void;
    onSaved: () => void;
} ) => {
    const toast = useToast();
    const [ name, setName ] = useState( '' );
    const [ sku, setSku ] = useState( '' );
    const [ regularPrice, setRegularPrice ] = useState( '' );
    const [ salePrice, setSalePrice ] = useState( '' );
    const [ status, setStatus ] = useState( 'publish' );
    const [ isSaving, setIsSaving ] = useState( false );

    useEffect( () => {
        if ( product ) {
            setName( product.name );
            setSku( product.sku ?? '' );
            setRegularPrice( product.regular_price ?? '' );
            setSalePrice( product.sale_price ?? '' );
            setStatus( product.status );
            setIsSaving( false );
        }
    }, [ product ] );

    const handleSave = useCallback( async () => {
        if ( ! product ) return;
        setIsSaving( true );
        try {
            await apiFetch( {
                path: `/dokan/v1/products/${ product.id }`,
                method: 'PUT',
                data: {
                    name,
                    sku,
                    regular_price: regularPrice,
                    sale_price: salePrice,
                    status,
                },
            } );
            toast( {
                type: 'success',
                title: __( 'Product updated successfully.', 'dokan-lite' ),
            } );
            onSaved();
            onClose();
        } catch {
            toast( {
                type: 'error',
                title: __( 'Failed to update product.', 'dokan-lite' ),
            } );
        } finally {
            setIsSaving( false );
        }
    }, [
        product,
        name,
        sku,
        regularPrice,
        salePrice,
        status,
        toast,
        onSaved,
        onClose,
    ] );

    if ( ! product ) return null;

    const inputCls =
        'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-dokan focus:border-dokan';

    return (
        <DokanModal
            isOpen={ true }
            namespace="product-quick-edit"
            className="max-w-lg w-full"
            onClose={ onClose }
            onConfirm={ handleSave }
            confirmButtonText={ __( 'Update', 'dokan-lite' ) }
            loading={ isSaving }
            confirmButtonDisabled={ isSaving }
            dialogHeader={
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        { __( 'Quick Edit', 'dokan-lite' ) }
                    </h2>
                    <p className="text-sm text-gray-500 truncate">
                        { product.name }
                    </p>
                </div>
            }
            dialogContent={
                <div className="space-y-4">
                    { /* Title */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            { __( 'Product Title', 'dokan-lite' ) }
                        </label>
                        <input
                            type="text"
                            value={ name }
                            onChange={ ( e ) => setName( e.target.value ) }
                            className={ inputCls }
                        />
                    </div>

                    { /* Price */ }
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                { __( 'Regular Price', 'dokan-lite' ) }
                            </label>
                            <input
                                type="text"
                                value={ regularPrice }
                                onChange={ ( e ) =>
                                    setRegularPrice( e.target.value )
                                }
                                className={ inputCls }
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                { __( 'Sale Price', 'dokan-lite' ) }
                            </label>
                            <input
                                type="text"
                                value={ salePrice }
                                onChange={ ( e ) =>
                                    setSalePrice( e.target.value )
                                }
                                className={ inputCls }
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    { /* SKU + Status */ }
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                { __( 'SKU', 'dokan-lite' ) }
                            </label>
                            <input
                                type="text"
                                value={ sku }
                                onChange={ ( e ) => setSku( e.target.value ) }
                                className={ inputCls }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                { __( 'Status', 'dokan-lite' ) }
                            </label>
                            <Select
                                options={ STATUS_OPTIONS }
                                value={
                                    STATUS_OPTIONS.find(
                                        ( o ) => o.value === status
                                    ) ?? null
                                }
                                onChange={ (
                                    option: { value: string } | null
                                ) => {
                                    if ( option ) setStatus( option.value );
                                } }
                                isSearchable={ false }
                            />
                        </div>
                    </div>

                    { /* Extensibility: Pro can add extra fields */ }
                    {
                        applyFilters(
                            'dokan_product_quick_edit_extra_fields',
                            null,
                            product
                        ) as React.ReactNode
                    }
                </div>
            }
        />
    );
};

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
        fetchProducts,
        fetchStatusCounts,
        deleteProduct,
        deleteProducts,
        updateProductsStatus,
    } = useProducts( filterArgs );

    const { options: categoryOptions } = useProductCategories();
    const { options: monthOptions } = useProductMonths();

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
                // Pro registers a Fill with name 'dokan_product_listing_product_type' to inject its own type icon.
                // If no Fill is registered, the default Lucide icon with tooltip is shown.
                <Slot
                    name={ PRODUCT_LIST_SLOTS.TypeIcon }
                    fillProps={ { item } }
                >
                    { ( fills ) =>
                        Array.isArray( fills ) && fills.length > 0 ? (
                            fills
                        ) : (
                            <span
                                title={ getProductTypeLabel( item ) }
                                className="inline-flex items-center"
                            >
                                <ProductTypeIcon item={ item } />
                            </span>
                        )
                    }
                </Slot>
            ),
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
        {
            id: 'advertise',
            label: __( 'Advertise', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => {
                /**
                 * Filter the advertise column cell content.
                 * The product-adv Pro module hooks into this filter to render
                 * the advertisement icon/button using `item.advertisement` data.
                 *
                 * @since 4.2.8
                 *
                 * @param {React.ReactElement|null} content Default content (dash placeholder).
                 * @param {ProductItem}             item    Product data including `advertisement` field.
                 */
                const defaultContent = (
                    <span
                        className="text-gray-400"
                        title={ __( 'Not advertised', 'dokan-lite' ) }
                    >
                        { 'Promote' }
                    </span>
                );
                return applyFilters(
                    'dokan_product_list_advertise_column_content',
                    defaultContent,
                    item
                ) as React.ReactElement;
            },
        },
    ];

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

    const clearSingleFilter = ( filterId: string ) => {
        setFilterArgs( ( prev ) => ( { ...prev, [ filterId ]: '', page: 1 } ) );
    };

    const clearAllFilters = () => {
        setFilterArgs( ( prev ) => ( {
            ...prev,
            year_month: '',
            category: '',
            type: '',
            page: 1,
        } ) );
    };

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
                isEligible: ( item: ProductItem ) => item.status !== 'publish',
                confirmTitle: __( 'Publish Products', 'dokan-lite' ),
                confirmMessage: __(
                    'Selected product(s) will be published.',
                    'dokan-lite'
                ),
                callback: async ( items: ProductItem[] ) => {
                    try {
                        await updateProductsStatus(
                            items.map( ( i ) => i.id ),
                            'publish'
                        );
                        toast( {
                            type: 'success',
                            title: __(
                                'Product(s) published successfully.',
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
            <DataViews
                namespace="dokan-products-data-view"
                data={ data }
                fields={ fields }
                view={ view }
                onChangeView={ onViewChange }
                getItemId={ ( item: ProductItem ) => item.id }
                isLoading={ isLoading }
                paginationInfo={ { totalItems, totalPages } }
                tabs={ tabs }
                filter={ {
                    fields: filterFields,
                    onFilterRemove: clearSingleFilter,
                    onReset: clearAllFilters,
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

            { /* Editable quick edit (mirrors Pro PHP inline edit form) */ }
            <QuickEditModal
                product={ quickEditProduct }
                onClose={ () => setQuickEditProduct( null ) }
                onSaved={ () => {
                    fetchProducts();
                    fetchStatusCounts();
                } }
            />
        </>
    );
}

export default ProductList;
