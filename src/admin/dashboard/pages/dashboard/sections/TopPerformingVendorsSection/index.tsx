import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import { DataViews } from '../../../../../../components';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchTopPerformingVendors } from '../../utils/api';
import { TopPerformingVendorsData } from '../../types';
import TopPerformingVendorsSkeleton from './Skeleton';
import PriceHtml from '../../../../../../components/PriceHtml';
import { applyFilters } from '@wordpress/hooks';

const TopPerformingVendorsSection = () => {
    const { data, loading, error } =
        useDashboardApiData< TopPerformingVendorsData >( {
            fetchFunction: fetchTopPerformingVendors,
        } );

    const padDefaultData = ( originalData ) => {
        const paddedData = [ ...originalData ];

        // If the data is empty, fill with default values.
        const emptyString = applyFilters(
            'dokan_admin_dashboard_top_performing_default_table_data',
            __( '--', 'dokan-lite' ),
            originalData
        );

        // Add empty rows with -- if we have less than 5 items.
        while ( paddedData.length < 5 ) {
            paddedData.push( {
                rank: emptyString,
                vendor_name: emptyString,
                total_earning: emptyString,
                total_orders: emptyString,
                total_commission: emptyString,
            } );
        }

        return paddedData;
    };

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
                <div className="font-medium text-gray-900 text-center">
                    { item.rank }
                </div>
            ),
        },
        {
            id: 'vendor_name',
            label: __( 'Vendor Name', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="font-medium text-gray-900">
                    { item.vendor_name }
                </div>
            ),
        },
        {
            id: 'total_earning',
            label: __( 'Total Earning', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className={ `w-full text-right px-2 text-gray-900` }>
                    <PriceHtml price={ `${ item.total_earning }` } />
                </div>
            ),
        },
        {
            id: 'total_orders',
            label: __( 'Total Orders', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="w-full text-right px-2 text-gray-900">
                    { item.total_orders }
                </div>
            ),
        },
        {
            id: 'total_commission',
            label: __( 'Total Commission', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className={ `w-full text-right px-2 text-gray-900` }>
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
                tooltip={ __(
                    'Top performing vendors of the marketplace, updates daily at 00:01',
                    'dokan-lite'
                ) }
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
            <div className="top-vendors-table relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
                <DataViews
                    data={ padDefaultData( data || [] ) }
                    namespace="dokan-top-performing-vendors"
                    defaultLayouts={ { table: {}, density: 'comfortable' } }
                    fields={ fields }
                    getItemId={ ( item ) => item.rank }
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

export default TopPerformingVendorsSection;
