import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useToast } from '@getdokan/dokan-ui';
import { DataViews, DokanBadge, DokanModal } from '@dokan/components';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';
import { useProducts } from './hooks/useProducts';
import type { ProductItem, ProductStatus, ProductFilterState } from './types';

const getStatusBadgeVariant = ( status: string ) => {
    switch ( status ) {
        case 'publish':
            return 'success';
        case 'draft':
            return 'secondary';
        case 'pending':
            return 'warning';
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
        default:
            return status;
    }
};

const getProductTypeLabel = ( item: ProductItem ) => {
    if ( item.type === 'grouped' ) {
        return __( 'Grouped', 'dokan-lite' );
    }
    if ( item.type === 'external' ) {
        return __( 'External/Affiliate', 'dokan-lite' );
    }
    if ( item.type === 'variable' ) {
        return __( 'Variable', 'dokan-lite' );
    }
    if ( item.type === 'simple' ) {
        if ( item.virtual ) {
            return __( 'Virtual', 'dokan-lite' );
        }
        if ( item.downloadable ) {
            return __( 'Downloadable', 'dokan-lite' );
        }
        return __( 'Simple', 'dokan-lite' );
    }
    return item.type;
};

const getStockStatusLabel = ( item: ProductItem ) => {
    if ( item.in_stock ) {
        const label = __( 'In stock', 'dokan-lite' );
        if ( item.manage_stock && item.stock_quantity !== null ) {
            return `${ label } \u00d7 ${ item.stock_quantity }`;
        }
        return label;
    }
    return __( 'Out of stock', 'dokan-lite' );
};

function ProductList() {
    const toast = useToast();
    const [ deleteItems, setDeleteItems ] = useState< ProductItem[] >( [] );
    const [ isDeleting, setIsDeleting ] = useState( false );
    const [ selection, setSelection ] = useState< string[] >( [] );

    const [ filterArgs, setFilterArgs ] = useState< ProductFilterState >( {
        page: 1,
        per_page: 10,
        status: 'all',
        search: '',
    } );

    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        status: 'all',
    } );

    const {
        data,
        isLoading,
        totalItems,
        totalPages,
        statusCounts,
        fetchProducts,
        fetchStatusCounts,
        deleteProduct,
        deleteProducts,
    } = useProducts( filterArgs );

    const fields = [
        {
            id: 'name',
            label: __( 'Product', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 shrink-0">
                        { item.images?.[ 0 ]?.src ? (
                            <img
                                src={ item.images[ 0 ].src }
                                alt={ item.images[ 0 ].alt || item.name }
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={ 1.5 } stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                </svg>
                            </div>
                        ) }
                    </div>
                    <span className="font-medium text-gray-900">
                        { item.name }
                    </span>
                </div>
            ),
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
            id: 'sku',
            label: __( 'SKU', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => (
                <span>{ item.sku || '\u2013' }</span>
            ),
        },
        {
            id: 'stock',
            label: __( 'Stock', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => (
                <span className={ item.in_stock ? 'text-green-600' : 'text-red-600' }>
                    { getStockStatusLabel( item ) }
                </span>
            ),
        },
        {
            id: 'price',
            label: __( 'Price', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => (
                <div>
                    { item.price ? (
                        <PriceHtml price={ item.price } />
                    ) : (
                        <span>{ '\u2013' }</span>
                    ) }
                </div>
            ),
        },
        {
            id: 'type',
            label: __( 'Type', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => (
                <span className="capitalize">{ getProductTypeLabel( item ) }</span>
            ),
        },
        {
            id: 'date_created',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: ProductItem } ) => (
                <DateTimeHtml.Date date={ item.date_created } />
            ),
        },
    ];

    const tabs = {
        items: statusCounts,
        onSelect: ( status: string ) => {
            setFilterArgs( ( prev ) => ( {
                ...prev,
                status: status as ProductStatus,
                page: 1,
                search: '',
            } ) );
            setView( ( prev ) => ( { ...prev, page: 1, search: '' } ) );
        },
    };

    const actions = useMemo( () => [
        {
            id: 'view',
            label: () => __( 'View', 'dokan-lite' ),
            callback: ( [ item ]: ProductItem[] ) => {
                if ( item.permalink ) {
                    window.open( item.permalink, '_blank' );
                }
            },
        },
        {
            id: 'delete',
            label: () => __( 'Delete Permanently', 'dokan-lite' ),
            isDestructive: true,
            supportsBulk: true,
            callback: ( items: ProductItem[] ) => {
                setDeleteItems( items );
            },
        },
    ], [] );

    const onViewChange = ( newView: typeof view ) => {
        setView( newView );
        setFilterArgs( ( prev ) => ( {
            ...prev,
            page: newView.page,
            per_page: newView.perPage,
            search: newView.search,
        } ) );
    };

    const handleDeleteConfirm = async () => {
        if ( deleteItems.length === 0 ) return;

        setIsDeleting( true );
        try {
            if ( deleteItems.length === 1 ) {
                await deleteProduct( deleteItems[ 0 ].id );
            } else {
                await deleteProducts( deleteItems.map( ( item ) => item.id ) );
            }
            toast( {
                type: 'success',
                title: deleteItems.length === 1
                    ? __( 'Product deleted successfully', 'dokan-lite' )
                    : __( 'Products deleted successfully', 'dokan-lite' ),
            } );
            setSelection( [] );
            fetchProducts();
            fetchStatusCounts();
        } catch ( error ) {
            toast( {
                type: 'error',
                title: __( 'Failed to delete product', 'dokan-lite' ),
            } );
        } finally {
            setIsDeleting( false );
            setDeleteItems( [] );
        }
    };

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
                paginationInfo={ {
                    totalItems,
                    totalPages,
                } }
                tabs={ tabs }
                search={ true }
                actions={ actions }
                selection={ selection }
                onChangeSelection={ ( ids: string[] ) => setSelection( ids ) }
            />
        </>
    );
}

export default ProductList;
