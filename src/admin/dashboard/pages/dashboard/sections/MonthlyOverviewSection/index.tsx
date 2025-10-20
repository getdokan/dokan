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
import { sortByPosition } from '../../utils/sorting';
import MonthlyOverviewSkeleton from './Skeleton';

const MonthlyOverviewSection = () => {
    const [ monthData, setMonthData ] = useState< MonthPickerValue >( {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    } );

    const { data, loading, error, refetch } =
        useDashboardApiData< MonthlyOverviewData >( {
            fetchFunction: fetchMonthlyOverview,
        } );

    const handleMonthChange = ( value: {
        month: number | null;
        year: number | null;
    } ) => {
        // Handle null values when month picker is cleared
        if ( value.month === null || value.year === null ) {
            // Set to the current month /year when cleared
            const currentDate = new Date();
            const fallbackValue = {
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear(),
            };
            const newMonthData = {
                month: fallbackValue.month.toString(),
                year: fallbackValue.year.toString(),
            };
            setMonthData( newMonthData );
            const dateString = formatDateForApi(
                fallbackValue.month,
                fallbackValue.year
            );
            refetch( dateString );
        } else {
            const newMonthData = {
                month: value.month.toString(),
                year: value.year.toString(),
            };
            setMonthData( newMonthData );
            const dateString = formatDateForApi( value.month, value.year );
            refetch( dateString );
        }
    };

    const calculatePercentageChange = (
        current: number,
        previous: number | any,
        metricKey: string // Add metric key to determine direction logic
    ): { percentage: number | float; direction: TrendDirection } => {
        let prevValue = 0;
        let currValue = current;

        // Metrics where increase is considered negative (bad)
        const negativeMetrics = [
            'refund',
            'abuse_reports',
            'order_cancellation_rate',
        ];

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

        let percentageChange: number;
        let direction: TrendDirection;

        // Handle edge cases
        if ( prevValue === 0 && currValue === 0 ) {
            // Both are 0 - no change
            percentageChange = 0;
            direction = 'neutral';
        } else if ( prevValue === 0 && currValue !== 0 ) {
            // Going from 0 to any value - always 100% change
            percentageChange = 100;

            // Direction depends on metric type and whether current is positive/negative
            const isPositiveChange = currValue > 0;

            if ( negativeMetrics.includes( metricKey ) ) {
                direction = isPositiveChange ? 'down' : 'up'; // Increase in negative metrics = bad
            } else {
                direction = isPositiveChange ? 'up' : 'down'; // Increase in positive metrics = good
            }
        } else if ( currValue === 0 && prevValue !== 0 ) {
            // Going from any value to 0 - always 100% change
            percentageChange = 100;

            // Direction depends on metric type
            if ( negativeMetrics.includes( metricKey ) ) {
                direction = 'up'; // Reduction to 0 in negative metrics = good
            } else {
                direction = 'down'; // Reduction to 0 in positive metrics = bad
            }
        } else {
            // Normal case - both values are non-zero
            percentageChange =
                ( ( currValue - prevValue ) / Math.abs( prevValue ) ) * 100;

            // Determine a direction based on change and metric type
            const isIncrease = currValue > prevValue;

            if ( negativeMetrics.includes( metricKey ) ) {
                // For negative metrics: increase = bad (down), decrease = good (up)
                direction = isIncrease ? 'down' : 'up';
            } else {
                // For positive metrics: increase = good (up), decrease = bad (down)
                direction = isIncrease ? 'up' : 'down';
            }

            percentageChange = Math.abs( percentageChange );
        }

        return {
            percentage: percentageChange.toFixed(
                // @ts-ignore
                wc.wcSettings.CURRENCY.precision || 2
            ),
            direction,
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

            return `${ rate.toFixed(
                // @ts-ignore
                wc.wcSettings.CURRENCY.precision || 1
            ) }%`;
        }

        return item.current;
    };

    if ( loading ) {
        return <MonthlyOverviewSkeleton />;
    }

    // Sort data by position on the frontend
    const sortedData = data ? sortByPosition( data ) : [];

    return (
        <Section
            title={ __( 'Monthly Overview', 'dokan-lite' ) }
            sectionHeader={
                <MonthPicker
                    value={ monthData }
                    comparisonPosition="left"
                    onChange={ handleMonthChange }
                />
            }
            tooltip={ __( 'Monthly overview of key metrics', 'dokan-lite' ) }
        >
            { ! error ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    { sortedData.map( ( [ key, item ] ) => {
                        const { percentage, direction } =
                            calculatePercentageChange(
                                item.current,
                                item.previous,
                                key
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
            ) : (
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { error }
                </div>
            ) }
        </Section>
    );
};

export default MonthlyOverviewSection;
