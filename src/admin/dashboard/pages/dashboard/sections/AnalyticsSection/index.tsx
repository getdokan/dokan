import { __, sprintf } from '@wordpress/i18n';
import Section from '../../Elements/Section';
import MiniCard from '../../Elements/MiniCard';
import DynamicIcon from '../../components/DynamicIcon';
import { DokanButton } from '../../../../../../components';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchAnalytics } from '../../utils/api';
import { AnalyticsData } from '../../types';
import AnalyticsSkeleton from './Skeleton';

const AnalyticsSection = () => {
    const { data, loading, error } = useDashboardApiData< AnalyticsData >( {
        fetchFunction: fetchAnalytics,
    } );

    if ( loading ) {
        return <AnalyticsSkeleton />;
    }

    return (
        <Section title={ __( 'Analytics', 'dokan-lite' ) }>
            { ! error ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    { data &&
                        Object.entries( data ).map( ( [ key, item ] ) => (
                            <MiniCard
                                key={ key }
                                icon={ <DynamicIcon iconName={ item.icon } /> }
                                iconType="secondary"
                                text={ item.title }
                                countType="component"
                                countComponent={
                                    <DokanButton
                                        onClick={ () => {
                                            window.location.href = item.url;
                                        } }
                                    >
                                        { __( 'View Report', 'dokan-lite' ) }
                                    </DokanButton>
                                }
                            />
                        ) ) }
                </div>
            ) : (
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { sprintf(
                        /* translators: %s is the error message */
                        __( 'Error fetching analytics data: %s', 'dokan-lite' ),
                        error
                    ) }
                </div>
            ) }
        </Section>
    );
};

export default AnalyticsSection;
