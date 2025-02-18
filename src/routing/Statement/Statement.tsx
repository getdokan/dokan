import { addQueryArgs } from '@wordpress/url';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from "@wordpress/element";
import { DataViews, DokanModal } from '@dokan/components';
import { Button, useToast } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import StatementSkeleton from './StatementSkeleton';
import './style.scss';

const Statement = ({ navigate }) => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({
        end_date: '',
        start_date: '',
        formatted_entries: [],
        summary: {
            total_debit: 0,
            total_credit: 0,
            balance: 0
        }
    });
    const [totalItems, setTotalItems] = useState(0);
    const [selection, setSelection] = useState([]);
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: ''
    });
    const [view, setView] = useState({
        page: 1,
        perPage: 10,
        type: 'table',
        titleField: 'balance_date',
        fields: ['trn_date', 'trn_id', 'trn_type', 'debit', 'credit', 'balance']
    });

    const fetchStatementData = async ( args ) => {
        setIsLoading(true);
        try {
            const response = await apiFetch({
                path: addQueryArgs( '/dokan/v1/vendor/reports/statement', args ),
                method: 'GET'
            });

            // const total = parseInt(response.headers.get('X-WP-Total') || '0');

            setData(response);
            setTotalItems(response?.total_items || 0);
        } catch (error) {
            toast({
                type: 'error',
                title: error.message || __('Failed to fetch statement data', 'dokan')
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatementData({
            page       : view.page,
            perPage    : view.perPage,
            end_date   : dateRange.end_date,
            start_date : dateRange.start_date,
        });
    }, [dateRange, view.page, view.perPage]);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch({
                path: `/dokan/v1/vendor/reports/statement/export?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`,
                method: 'GET'
            });

            // Create and trigger download
            const blob = new Blob([response.content], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${response.file_name}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                type: 'success',
                title: __('Statement exported successfully', 'dokan')
            });
        } catch (error) {
            toast({
                type: 'error',
                title: error.message || __('Failed to export statement', 'dokan')
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fields = [
        {
            id: 'balance_date',
            label: __('Balance Date', 'dokan'),
            render: ({ item }) => {
                return (
                    isLoading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : item.balance_date
                );
            },
            enableSorting: false,
        },
        {
            id: 'trn_date',
            label: __('Transaction Date', 'dokan'),
            render: ({ item }) => {
                return (
                    isLoading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : item.trn_date || __( '--', 'dokan' )
                );
            },
            enableSorting: false,
        },
        {
            id: 'trn_id',
            label: __('ID', 'dokan'),
            render: ({ item }) => {
                return(
                    isLoading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : item.trn_id ? sprintf( __( `#%s`, 'dokan' ), item.trn_id ) : __( '--', 'dokan' )
                )
            },
            enableSorting: false,
        },
        {
            id: 'trn_type',
            label: __('Type', 'dokan'),
            render: ({ item }) => {
                return(
                    isLoading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : item.trn_title
                );
            },
            enableSorting: false,
        },
        {
            id: 'debit',
            label: __('Debit', 'dokan'),
            render: ({ item }) => {
                return(
                    isLoading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        item?.trn_type !== 'opening_balance' ? sprintf(
                            __( `%1$s%2$s`, 'dokan' ),
                            item.debit.toFixed(2),
                            '$'
                        ) || __( '--', 'dokan' )
                        : __( '--', 'dokan' )
                    )
                );
            },
            enableSorting: false,
        },
        {
            id: 'credit',
            label: __('Credit', 'dokan'),
            render: ({ item }) => {
                return(
                    isLoading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        item?.trn_type !== 'opening_balance' ? sprintf(
                            __( `%1$s%2$s`, 'dokan' ),
                            item.credit.toFixed(2),
                            '$'
                        ) || __( '--', 'dokan' )
                        : __( '--', 'dokan' )
                    )
                );
            },
            enableSorting: false,
        },
        {
            id: 'balance',
            label: __('Balance', 'dokan'),
            render: ({ item }) => {
                return (
                    isLoading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : sprintf(
                        __( `%1$s%2$s`, 'dokan' ),
                        item.balance.toFixed(2),
                        '$'
                    ) || __( '--', 'dokan' )
                );
            },
            enableSorting: false,
        }
    ];

    if ( isLoading ) {
        return <StatementSkeleton />;
    }

    return (
        <div className="dokan-report-statement-wrapper pr-4 pb-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <input
                        type="date"
                        className="px-4 py-2 border rounded"
                        value={dateRange.start_date || data.start_date}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                    <input
                        type="date"
                        className="px-4 py-2 border rounded"
                        value={dateRange.end_date || data.end_date}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                </div>
                <Button
                    onClick={handleExport}
                    disabled={isLoading}
                    className="px-4 py-2 bg-dokan-primary text-white rounded hover:bg-dokan-primary-hover"
                >
                    {__('Export Statement', 'dokan')}
                </Button>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded shadow border">
                    <h3 className="text-lg font-medium mb-2">{__('Total Debit', 'dokan')}</h3>
                    <p className="text-2xl font-bold text-dokan-primary">
                        ${data.summary.total_debit.toFixed(2)}
                    </p>
                </div>
                <div className="p-4 bg-white rounded shadow border">
                    <h3 className="text-lg font-medium mb-2">{__('Total Credit', 'dokan')}</h3>
                    <p className="text-2xl font-bold text-dokan-primary">
                        ${data.summary.total_credit.toFixed(2)}
                    </p>
                </div>
                <div className="p-4 bg-white rounded shadow border">
                    <h3 className="text-lg font-medium mb-2">{__('Balance', 'dokan')}</h3>
                    <p className="text-2xl font-bold text-dokan-primary">
                        ${data.summary.balance.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <DataViews
                    view={view}
                    fields={fields}
                    selection={selection}
                    data={data.formatted_entries}
                    onChangeView={setView}
                    onChangeSelection={setSelection}
                    getItemId={(item) => item.trn_id || item.balance_date}
                    namespace="report-statement"
                    defaultLayouts={{ density: 'comfortable' }}
                    paginationInfo={{
                        totalItems: totalItems,
                        totalPages: Math.ceil(totalItems / view.perPage),
                    }}
                />

                {/*<DataViews*/}
                {/*    data={data}*/}
                {/*    namespace='post-data-view'*/}
                {/*    // responsive={false} // we can override the table default responsive behavior by passing the `false` value.*/}
                {/*    defaultLayouts={{ ...defaultLayouts }}*/}
                {/*    fields={fields}*/}
                {/*    getItemId={(item) => item.id}*/}
                {/*    onChangeView={setView}*/}
                {/*    paginationInfo={{*/}
                {/*        // Set pagination information for the table.*/}
                {/*        totalItems: totalPosts,*/}
                {/*        totalPages: Math.ceil( totalPosts / view.perPage ),*/}
                {/*    }}*/}
                {/*    view={view}*/}
                {/*    selection={selection}*/}
                {/*    onChangeSelection={setSelection}*/}
                {/*    actions={actions}*/}
                {/*    isLoading={isLoading}*/}
                {/*    // Set header for the DataViewTable component.*/}
                {/*    header={*/}
                {/*        <Button*/}
                {/*            isPrimary*/}
                {/*            onClick={() => navigate('/posts/new')}*/}
                {/*            className={'!bg-dokan-btn !text-dokan-btn hover:bg-dokan-btn-hover hover:text-dokan-btn-hover'}*/}
                {/*        >*/}
                {/*            { __( 'Add New Post', 'dokan' ) }*/}
                {/*        </Button>*/}
                {/*    }*/}
                {/*/>*/}
            </div>
        </div>
    );
};

export default Statement;
