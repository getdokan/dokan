import { __, sprintf } from '@wordpress/i18n';
import { RawHTML, useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import { DataViews } from '../../../../../../components';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchMostReviewedProducts } from '../../utils/api';
import { MostReviewedProductsData } from '../../types';
import MostReviewedProductsSkeleton from './Skeleton';
import { applyFilters } from '@wordpress/hooks';
import { truncate } from '../../../../../../utilities';
import { DokanTooltip as Tooltip } from '@dokan/components';

const MostReviewedProductsSection = () => {
    const { data, loading, error } =
        useDashboardApiData< MostReviewedProductsData >( {
            fetchFunction: fetchMostReviewedProducts,
        } );

    const padDefaultData = ( originalData ) => {
        const paddedData = [
            ...originalData.filter( ( data ) => data.review_count ),
        ];

        // If the data is empty, fill with default values.
        const emptyString = applyFilters(
            'dokan_admin_dashboard_most_reviewed_default_table_data',
            __( '--', 'dokan-lite' ),
            originalData
        );

        // Add empty rows with -- if we have less than 5 items.
        while ( paddedData.length < 5 ) {
            paddedData.push( {
                rank: emptyString,
                product_title: emptyString,
                review_count: emptyString,
            } );
        }

        return paddedData;
    };

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
                <div className="font-medium text-center text-gray-900">
                    { item.rank }
                </div>
            ),
        },
        {
            id: 'product_title',
            label: __( 'Product Name', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="font-medium text-gray-900">
                    <Tooltip
                        content={ <RawHTML>{ item.product_title }</RawHTML> }
                    >
                        <div className="w-fit">
                            <RawHTML>
                                { truncate( item.product_title, 50 ) }
                            </RawHTML>
                        </div>
                    </Tooltip>
                </div>
            ),
        },
        {
            id: 'review_count',
            label: __( 'Review Count', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="w-full text-right px-2 text-gray-900">
                    { item.review_count }
                </div>
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
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
                <DataViews
                    data={ padDefaultData( data || [] ) }
                    namespace="dokan-most-reviewed-products"
                    defaultLayouts={ { table: {}, density: 'comfortable' } }
                    fields={ fields }
                    getItemId={ ( item ) => item.product_id }
                    onChangeView={ setView }
                    search={ false }
                    paginationInfo={ {
                        totalItems: data?.length || 0,
                        totalPages: 1,
                    } }
                    view={ view }
                    isLoading={ loading }
                />
            </div>
        </Section>
    );
};

export default MostReviewedProductsSection;
