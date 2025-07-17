import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import { DataViews } from '../../../components';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchTopPerformingVendors } from '../../utils/api';
import { TopPerformingVendorsData } from '../../types';
import TopPerformingVendorsSkeleton from './Skeleton';
import PriceHtml from '../../../components/PriceHtml';

const TopPerformingVendorsSection = () => {
    const { data, loading, error } =
        useDashboardApiData< TopPerformingVendorsData >( {
            fetchFunction: fetchTopPerformingVendors,
        } );

    const [ view, setView ] = useState( {
        type: 'table' as const,
        perPage: 5,
        page: 1,
        layout: {},
        fields: [
            'rank',
            'vendor_name',
            'total_earning',
            'total_orders',
            'total_commission',
        ],
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
            id: 'vendor_name',
            label: __( 'Vendor Name', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div>
                    <button
                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        onClick={ () => {
                            // Navigate to vendor profile - you'll need to implement the URL generation
                            const vendorUrl = `/store/${ item.vendor_name
                                .toLowerCase()
                                .replace( /\s+/g, '-' ) }/`;
                            window.open( vendorUrl, '_blank' );
                        } }
                    >
                        { item.vendor_name }
                    </button>
                </div>
            ),
        },
        {
            id: 'total_earning',
            label: __( 'Total Earning', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div>
                    <PriceHtml price={ `${ item.total_earning }` } />
                </div>
            ),
        },
        {
            id: 'total_orders',
            label: __( 'Total Orders', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="text-center">{ item.total_orders }</div>
            ),
        },
        {
            id: 'total_commission',
            label: __( 'Total Commission', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div>
                    <PriceHtml price={ `${ item.total_commission }` } />
                </div>
            ),
        },
    ];

    if ( loading ) {
        return <TopPerformingVendorsSkeleton />;
    }

    if ( error ) {
        return (
            <Section
                title={ __( 'Top Performing Vendors', 'dokan-lite' ) }
                tooltip="Top performing vendors of the marketplace, updates daily at 00:01"
            >
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { sprintf(
                        /* translators: %s is the error message */
                        __(
                            'Error fetching top performing vendors: %s',
                            'dokan-lite'
                        ),
                        error
                    ) }
                </div>
            </Section>
        );
    }

    return (
        <Section
            title={ __( 'Top Performing Vendors', 'dokan-lite' ) }
            tooltip="Top performing vendors of the marketplace, updates daily at 00:01"
        >
            <DataViews
                data={ data || [] }
                namespace="dokan-top-performing-vendors"
                defaultLayouts={ { table: {}, density: 'comfortable' } }
                fields={ fields }
                getItemId={ ( item ) => item.rank.toString() }
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

export default TopPerformingVendorsSection;
