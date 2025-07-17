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

const AllTimeStatsSection: React.FC = () => {
    const [ monthData, setMonthData ] = useState< MonthPickerValue >( {
        month: '',
        year: '',
    } );

    const { data, loading, error, refetch } =
        useDashboardApiData< AllTimeStatsData >( {
            fetchFunction: fetchAllTimeStats,
        } );

    const handleMonthChange = ( value: { month: number; year: number } ) => {
        const newMonthData = {
            month: value.month.toString(),
            year: value.year.toString(),
        };
        setMonthData( newMonthData );

        if ( value.month && value.year ) {
            const dateString = formatDateForApi( value.month, value.year );
            refetch( dateString );
        }
    };

    if ( loading ) {
        return (
            <Section
                title={ __( 'All Time Stats', 'dokan-lite' ) }
                sectionHeader={
                    <MonthPicker
                        value={ monthData }
                        onChange={ handleMonthChange }
                    />
                }
            >
                <AllTimeStatsSkeleton />
            </Section>
        );
    }

    if ( error ) {
        return (
            <Section
                title={ __( 'All Time Stats', 'dokan-lite' ) }
                sectionHeader={
                    <MonthPicker
                        value={ monthData }
                        onChange={ handleMonthChange }
                    />
                }
            >
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { error }
                </div>
            </Section>
        );
    }

    return (
        <Section
            title={ __( 'All-Time Marketplace Stats', 'dokan-lite' ) }
            tooltip={ __(
                'Overview of your all time result in your marketplace',
                'dokan-lite'
            ) }
            sectionHeader={
                <MonthPicker
                    value={ monthData }
                    onChange={ handleMonthChange }
                />
            }
        >
            <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                { data &&
                    Object.entries( data ).map( ( [ key, item ] ) => {
                        return (
                            <Card
                                key={ key }
                                icon={ <DynamicIcon iconName={ item.icon } /> }
                                text={ item.title }
                                content={ item.count }
                                tooltip={ item.tooltip }
                            />
                        );
                    } ) }
            </div>
        </Section>
    );
};

export default AllTimeStatsSection;
