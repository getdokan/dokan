import { __, sprintf } from '@wordpress/i18n';
import { RawHTML, useState } from '@wordpress/element';
import Section from '../../Elements/Section';
import MonthPicker from '../../Elements/MonthPicker';
import { DataViews } from '../../../../../../components';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchTopPerformingVendors, formatDateForApi } from '../../utils/api';
import { TopPerformingVendorsData, MonthPickerValue } from '../../types';
import TopPerformingVendorsSkeleton from './Skeleton';
import { applyFilters } from '@wordpress/hooks';
import { formatPrice, truncate } from '../../../../../../utilities';
import { DokanTooltip as Tooltip } from '@dokan/components';

const TopPerformingVendorsSection = () => {
    const [ monthData, setMonthData ] = useState< MonthPickerValue >( {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    } );

    const { data, loading, error, refetch } =
        useDashboardApiData< TopPerformingVendorsData >( {
            fetchFunction: fetchTopPerformingVendors,
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

    // If the data is empty, fill with default values.
    const emptyString = applyFilters(
        'dokan_admin_dashboard_top_performing_default_table_data',
        __( '--', 'dokan-lite' ),
        data
    );

    const padDefaultData = ( originalData ) => {
        const paddedData = [ ...originalData ];

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
            render: ( { item } ) => {
                return (
                    <Tooltip
                        content={
                            <RawHTML>
                                { item.total_earning !== emptyString ? (
                                    formatPrice( item.total_earning )
                                ) : emptyString }
                            </RawHTML>
                        }
                    >
                        <div className="w-fit text-right px-2 text-gray-900">
                            <RawHTML>
                                { item.total_earning !== emptyString ? (
                                    truncate( formatPrice( item.total_earning ), 16 )
                                ) : (
                                    emptyString
                                ) }
                            </RawHTML>
                        </div>
                    </Tooltip>
                );
            },
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
            render: ( { item } ) => {
                return (
                    <Tooltip
                        content={
                            <RawHTML>
                                { item.total_commission !== emptyString ? (
                                    formatPrice( item.total_commission )
                                ) : emptyString }
                            </RawHTML>
                        }
                    >
                        <div className="w-fit text-right px-2 text-gray-900">
                            <RawHTML>
                                { item.total_commission !== emptyString ? (
                                    truncate( formatPrice( item.total_commission ), 16 )
                                ) : (
                                    emptyString
                                ) }
                            </RawHTML>
                        </div>
                    </Tooltip>
                );
            },
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
            tooltip={ __(
                'Top performing vendors of the marketplace',
                'dokan-lite'
            ) }
            sectionHeader={
                <MonthPicker
                    value={ monthData }
                    onChange={ handleMonthChange }
                />
            }
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
