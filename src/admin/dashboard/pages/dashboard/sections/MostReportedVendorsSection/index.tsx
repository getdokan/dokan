import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import { DataViews } from '../../../../../../components';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchMostReportedVendors } from '../../utils/api';
import { MostReportedVendorsData } from '../../types';
import MostReportedVendorsSkeleton from './Skeleton';
import { applyFilters } from '@wordpress/hooks';

const MostReportedVendorsSection = () => {
    const { data, loading, error } =
        useDashboardApiData< MostReportedVendorsData >( {
            fetchFunction: fetchMostReportedVendors,
        } );

    const padDefaultData = ( originalData ) => {
        const paddedData = [ ...originalData.filter( data => data.abuse_count ) ];

        // If the data is empty, fill with default values.
        const emptyString = applyFilters(
            'dokan_admin_dashboard_most_reported_default_table_data',
            __( '--', 'dokan-lite' ),
            originalData
        );

        // Add empty rows with -- if we have less than 5 items.
        while ( paddedData.length < 5 ) {
            paddedData.push( {
                rank: emptyString,
                vendor_name: emptyString,
                abuse_count: emptyString,
            } );
        }

        return paddedData;
    };

    const [ view, setView ] = useState( {
        type: 'table' as const,
        perPage: 5,
        page: 1,
        layout: {},
        fields: [ 'rank', 'vendor_name', 'abuse_count' ],
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
            id: 'abuse_count',
            label: __( 'Abuse Reports', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="w-full text-right px-2 text-gray-900">
                    { item.abuse_count }
                </div>
            ),
        },
    ];

    if ( loading ) {
        return <MostReportedVendorsSkeleton />;
    }

    return (
        <Section title={ __( 'Most Reported Vendors', 'dokan-lite' ) }>
            { ! error ? (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
                    <DataViews
                        namespace="dokan-most-reported-vendors"
                        data={ padDefaultData( data || [] ) }
                        defaultLayouts={ { table: {}, density: 'comfortable' } }
                        fields={ fields }
                        getItemId={ ( item ) => item.vendor_id }
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
            ) : (
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { sprintf(
                        /* translators: %s is the error message */
                        __(
                            'Error fetching most reported vendors: %s',
                            'dokan-lite'
                        ),
                        error
                    ) }
                </div>
            ) }
        </Section>
    );
};

export default MostReportedVendorsSection;
