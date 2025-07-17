import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import { DataViews } from '../../../components';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchMostReportedVendors } from '../../utils/api';
import { MostReportedVendorsData } from '../../types';
import MostReportedVendorsSkeleton from './Skeleton';

const MostReportedVendorsSection = () => {
    const { data, loading, error } =
        useDashboardApiData< MostReportedVendorsData >( {
            fetchFunction: fetchMostReportedVendors,
        } );

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
                            // Navigate to vendor profile using the provided URL
                            window.open( item.vendor_url, '_blank' );
                        } }
                    >
                        { item.vendor_name }
                    </button>
                </div>
            ),
        },
        {
            id: 'abuse_count',
            label: __( 'Abuse Reports', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        { item.abuse_count }
                    </span>
                </div>
            ),
        },
    ];

    if ( loading ) {
        return <MostReportedVendorsSkeleton />;
    }

    if ( error ) {
        return (
            <Section title={ __( 'Most Reported Vendors', 'dokan-lite' ) }>
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
            </Section>
        );
    }

    return (
        <Section title={ __( 'Most Reported Vendors', 'dokan-lite' ) }>
            <DataViews
                data={ data || [] }
                namespace="dokan-most-reported-vendors"
                defaultLayouts={ { table: {}, density: 'comfortable' } }
                fields={ fields }
                getItemId={ ( item ) => item.vendor_id.toString() }
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

export default MostReportedVendorsSection;
