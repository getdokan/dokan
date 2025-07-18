import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import Card from '../../Elements/Card';
import MonthPicker from '../../Elements/MonthPicker';
import DynamicIcon from '../../components/DynamicIcon';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchCustomerMetrics, formatDateForApi } from '../../utils/api';
import { CustomerMetricsData, MonthPickerValue } from '../../types';
import CustomerMetricsSkeleton from './Skeleton';

const CustomerMetricsSection = () => {
    const [ monthData, setMonthData ] = useState< MonthPickerValue >( {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    } );

    const { data, loading, error, refetch } =
        useDashboardApiData< CustomerMetricsData >( {
            fetchFunction: fetchCustomerMetrics,
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
        return <CustomerMetricsSkeleton />;
    }

    if ( error ) {
        return (
            <Section
                title={ __( 'Customer Metrics', 'dokan-lite' ) }
                sectionHeader={
                    <MonthPicker
                        value={ monthData }
                        onChange={ handleMonthChange }
                    />
                }
            >
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { sprintf(
                        /* translators: %s is the error message */
                        __(
                            'Error fetching customer metrics: %s',
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
            title={ __( 'Customer Metrics', 'dokan-lite' ) }
            sectionHeader={
                <MonthPicker
                    value={ monthData }
                    comparisonPosition="left"
                    onChange={ handleMonthChange }
                />
            }
        >
            { ! error ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    { data && (
                        <Card
                            icon={ <DynamicIcon iconName={ data.icon } /> }
                            text={ data.title }
                            content={ data.count }
                            tooltip={ data.tooltip }
                        />
                    ) }
                </div>
            ) : (
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { sprintf(
                        /* translators: %s is the error message */
                        __(
                            'Error fetching customer metrics: %s',
                            'dokan-lite'
                        ),
                        error
                    ) }
                </div>
            ) }
        </Section>
    );
};

export default CustomerMetricsSection;
