import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import Card from '../../Elements/Card';
import MonthPicker from '../../Elements/MonthPicker';
import DynamicIcon from '../../components/DynamicIcon';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchMonthlyOverview, formatDateForApi } from '../../utils/api';
import {
    MonthlyOverviewData,
    MonthPickerValue,
    TrendDirection,
} from '../../types';
import MonthlyOverviewSkeleton from './Skeleton';

const MonthlyOverviewSection = () => {
    const [ monthData, setMonthData ] = useState< MonthPickerValue >( {
        month: '',
        year: '',
    } );

    const { data, loading, error, refetch } =
        useDashboardApiData< MonthlyOverviewData >( {
            fetchFunction: fetchMonthlyOverview,
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

    const calculatePercentageChange = (
        current: number,
        previous: number | any
    ): { percentage: number; direction: TrendDirection } => {
        let prevValue = 0;
        let currValue = current;

        // Handle order cancellation rate special case
        if (
            typeof previous === 'object' &&
            previous.total_orders !== undefined
        ) {
            const prevRate =
                previous.total_orders > 0
                    ? ( previous.cancelled_orders / previous.total_orders ) *
                      100
                    : 0;
            const currRate =
                typeof current === 'object' && current.total_orders
                    ? ( current.cancelled_orders / current.total_orders ) * 100
                    : 0;

            prevValue = prevRate;
            currValue = currRate;
        } else {
            prevValue = typeof previous === 'number' ? previous : 0;
        }

        const percentageChange =
            prevValue > 0 ? ( ( currValue - prevValue ) / prevValue ) * 100 : 0;
        return {
            percentage: Math.abs( percentageChange ),
            direction: percentageChange >= 0 ? 'up' : 'down',
        };
    };

    const formatDisplayValue = ( item: any ): string => {
        if (
            typeof item.current === 'object' &&
            item.current.total_orders !== undefined
        ) {
            const rate =
                item.current.total_orders > 0
                    ? ( item.current.cancelled_orders /
                          item.current.total_orders ) *
                      100
                    : 0;
            return `${ rate.toFixed( 1 ) }%`;
        }
        return item.current.toString();
    };

    if ( loading ) {
        return (
            <Section
                title={ __( 'Monthly Overview', 'dokan-lite' ) }
                sectionHeader={
                    <MonthPicker
                        value={ monthData }
                        onChange={ handleMonthChange }
                    />
                }
            >
                <MonthlyOverviewSkeleton />
            </Section>
        );
    }

    if ( error ) {
        return (
            <Section
                title={ __( 'Monthly Overview', 'dokan-lite' ) }
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
            title={ __( 'Monthly Overview', 'dokan-lite' ) }
            sectionHeader={
                <MonthPicker
                    value={ monthData }
                    onChange={ handleMonthChange }
                />
            }
            tooltip={ __( 'Monthly overview of key metrics', 'dokan-lite' ) }
        >
            <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                { data &&
                    Object.entries( data ).map( ( [ key, item ] ) => {
                        const { percentage, direction } =
                            calculatePercentageChange(
                                item.current,
                                item.previous
                            );

                        return (
                            <Card
                                key={ key }
                                icon={ <DynamicIcon iconName={ item.icon } /> }
                                text={ item.title }
                                content={ formatDisplayValue( item ) }
                                count={ percentage }
                                countDirection={ direction }
                                tooltip={ item.tooltip }
                            />
                        );
                    } ) }
            </div>
        </Section>
    );
};

export default MonthlyOverviewSection;
