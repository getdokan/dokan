import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import { DataViews } from '../../../components';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchMostReviewedProducts } from '../../utils/api';
import { MostReviewedProductsData } from '../../types';
import MostReviewedProductsSkeleton from './Skeleton';

const MostReviewedProductsSection = () => {
    const { data, loading, error } =
        useDashboardApiData< MostReviewedProductsData >( {
            fetchFunction: fetchMostReviewedProducts,
        } );

    const [ view, setView ] = useState( {
        type: 'table' as const,
        perPage: 5,
        page: 1,
        layout: {},
        fields: [ 'rank', 'product_title', 'review_count' ],
    } );

    const fields = [
        {
            id: 'rank',
            label: __( 'Rank', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="font-medium text-center">#{ item.rank }</div>
            ),
        },
        {
            id: 'product_title',
            label: __( 'Product Name', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div>
                    <button
                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        onClick={ () => {
                            // Navigate to product page
                            const productUrl = `/?p=${ item.product_id }`;
                            window.open( productUrl, '_blank' );
                        } }
                    >
                        { item.product_title }
                    </button>
                </div>
            ),
        },
        {
            id: 'review_count',
            label: __( 'Review Count', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="text-center">{ item.review_count }</div>
            ),
        },
    ];

    if ( loading ) {
        return <MostReviewedProductsSkeleton />;
    }

    if ( error ) {
        return (
            <Section title={ __( 'Most Reviewed Products', 'dokan-lite' ) }>
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { sprintf(
                        /* translators: %s is the error message */
                        __(
                            'Error fetching most reviewed products: %s',
                            'dokan-lite'
                        ),
                        error
                    ) }
                </div>
            </Section>
        );
    }

    return (
        <Section title={ __( 'Most Reviewed Products', 'dokan-lite' ) }>
            <DataViews
                data={ data || [] }
                namespace="dokan-most-reviewed-products"
                defaultLayouts={ { table: {}, density: 'comfortable' } }
                fields={ fields }
                getItemId={ ( item ) => item.product_id.toString() }
                onChangeView={ setView }
                search={ false }
                paginationInfo={ {
                    totalItems: data?.length || 0,
                    totalPages: 1,
                } }
                view={ view }
                isLoading={ loading }
            />
        </Section>
    );
};

export default MostReviewedProductsSection;
