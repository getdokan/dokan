import { __, sprintf } from '@wordpress/i18n';
import Section from '../../Elements/Section';
import Card from '../../Elements/Card';
import DynamicIcon from '../../components/DynamicIcon';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchVendorMetrics } from '../../utils/api';
import { VendorMetricsData } from '../../types';
import VendorMetricsSkeleton from './Skeleton';
import { sortByPosition } from '../../utils/sorting';

const VendorMetricsSection = () => {
    const { data, loading, error } =
        useDashboardApiData< VendorMetricsData >( {
        fetchFunction: fetchVendorMetrics,
    } );

    if ( loading ) {
        return <VendorMetricsSkeleton />;
    }

    if ( ! data ) {
        return null;
    }

    // Sort data by position on the frontend
    const sortedData = data ? sortByPosition( data ) : [];

    return (
        <Section title={ __( 'Vendor Metrics', 'dokan-lite' ) }>
            { ! error ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    { /* eslint-disable-next-line @typescript-eslint/no-shadow */ }
                    { sortedData.map( ( [ key, data ] ) => {
                        return (
                            <Card
                                key={ key }
                                text={ data?.title }
                                content={ data?.count }
                                tooltip={ data?.tooltip }
                                icon={ <DynamicIcon iconName={ data?.icon } /> }
                            />
                        );
                    } ) }
                </div>
            ) : (
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { sprintf(
                        /* translators: %s is the error message */
                        __( 'Error fetching vendor metrics: %s', 'dokan-lite' ),
                        error
                    ) }
                </div>
            ) }
        </Section>
    );
};

export default VendorMetricsSection;