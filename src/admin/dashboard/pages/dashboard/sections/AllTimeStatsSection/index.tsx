import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import Card from '../../Elements/Card';
import MonthPicker from '../../Elements/MonthPicker';
import DynamicIcon from '../../components/DynamicIcon';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchAllTimeStats, formatDateForApi } from '../../utils/api';
import { AllTimeStatsData, MonthPickerValue } from '../../types';
import AllTimeStatsSkeleton from './Skeleton';

const AllTimeStatsSection = () => {
    const { data, loading, error } =
        useDashboardApiData< AllTimeStatsData >( {
        fetchFunction: fetchAllTimeStats,
    } );

    if ( loading ) {
        return <AllTimeStatsSkeleton />;
    }

    return (
        <Section
            title={ __( 'All-Time Marketplace Stats', 'dokan-lite' ) }
            tooltip={ __(
                'Overview of your all time result in your marketplace',
                'dokan-lite'
            ) }
        >
            { ! error ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    { data &&
                        Object.entries( data ).map( ( [ key, item ] ) => {
                            return (
                                <Card
                                    key={ key }
                                    icon={
                                        <DynamicIcon iconName={ item.icon } />
                                    }
                                    text={ item.title }
                                    content={ item.count }
                                    tooltip={ item.tooltip }
                                />
                            );
                        } ) }
                </div>
            ) : (
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { error }
                </div>
            ) }
        </Section>
    );
};

export default AllTimeStatsSection;
