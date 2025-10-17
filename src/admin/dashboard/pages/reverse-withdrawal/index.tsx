import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import { RawHTML, useEffect, useState, useCallback, useMemo, memo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { formatPrice } from '@dokan/utilities';
import { DokanButton, DataViews, Filter } from '@dokan/components';
import { Funnel, House, Calendar } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import AddReverseWithdrawModal from './AddReverseWithdrawModal';
import { VendorAsyncSelect } from '@src/components';
import DateRangePicker from '@src/components/DateRangePicker';
import moment from 'moment';

const price = (amount) => <RawHTML>{formatPrice(amount)}</RawHTML>;

// Move StoreFilter outside and memoize it
const StoreFilter = memo(({ filterArgs, setFilterArgs, errors = {} }) => {
    const handleVendorChange = useCallback((selected) => {
        setFilterArgs(prev => ({
            ...prev,
            vendor_id: selected ? selected.value : '',
            vendor_name: selected ? selected.label : '',
        }));
    }, [setFilterArgs]);

    // Memoize the vendor value to prevent unnecessary re-renders
    const vendorValue = useMemo(() => {
        return filterArgs.vendor_id 
            ? { value: filterArgs.vendor_id, label: filterArgs.vendor_name || '' } 
            : null;
    }, [filterArgs.vendor_id, filterArgs.vendor_name]);

    // Memoize the styles object
    const selectStyles = useMemo(() => ({
        control: (provided) => ({ ...provided, paddingLeft: '1.5rem' }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }), []);

    return (
        <div className="flex flex-col min-w-48">
            <div className="relative">
                <House className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <VendorAsyncSelect
                    prefetch={true}
                    isClearable
                    value={vendorValue}
                    onChange={handleVendorChange}
                    placeholder={__('All Store', 'dokan-lite')}
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                />
            </div>
            {errors.vendorId && <span className="text-red-500 text-sm">{__('Please select a vendor', 'dokan-lite')}</span>}
        </div>
    );
});

StoreFilter.displayName = 'StoreFilter';

const ReverseWithdrawalPage = () => {
    const [stats, setStats] = useState({
        credit: 0,
        balance: 0,
        total_transactions: 0,
        total_vendors: 0,
    });

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [filterArgs, setFilterArgs] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [dateAfter, setDateAfter] = useState('');
    const [dateAfterText, setDateAfterText] = useState('');
    const [dateBefore, setDateBefore] = useState('');
    const [dateBeforeText, setDateBeforeText] = useState('');
    const [focusedInput, setFocusedInput] = useState('startDate');

    const [view, setView] = useState({
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        layout: { density: 'comfortable' },
        fields: ['store_name', 'balance', 'last_payment_date'],
    });

    // Memoize fields to prevent unnecessary re-renders
    const fields = useMemo(() => [
        {
            id: 'store_name',
            label: __('Store', 'dokan-lite'),
            enableGlobalSearch: true,
            render: ({ item }) => (
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                        {item.store_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">
                        {item.store_name || __('(no name)', 'dokan-lite')}
                    </span>
                </div>
            ),
        },
        {
            id: 'balance',
            label: __('Amount', 'dokan-lite'),
            enableSorting: true,
            render: ({ item }) => <span className="font-semibold text-gray-900">{price(item.balance)}</span>,
        },
        {
            id: 'last_payment_date',
            label: __('Date', 'dokan-lite'),
            enableSorting: true,
            render: ({ item }) => {
                if (!item.last_payment_date || isNaN(new Date(item.last_payment_date).getTime())) {
                    return '--';
                }
                const formattedDate = new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                }).format(new Date(item.last_payment_date));
                return <span>{formattedDate.replace(/\//g, '.')}</span>;
            },
        },
    ], []);

    const fetchData = useCallback(async (afterParam = dateAfter, beforeParam = dateBefore) => {
        setData([]);
        setTotalItems(0);
        setIsLoading(true);
        try {
            const queryArgs = {
                per_page: view.perPage,
                page: view.page,
                ...filterArgs,
            };

            if (afterParam || beforeParam) {
                queryArgs['trn_date'] = {};
                if (afterParam) queryArgs['trn_date']['from'] = moment(afterParam).format('YYYY-MM-DD 00:00:00');
                if (beforeParam) queryArgs['trn_date']['to'] = moment(beforeParam).format('YYYY-MM-DD 23:59:59');
            }

            const response = await apiFetch({
                path: addQueryArgs('dokan/v1/reverse-withdrawal/stores-balance', queryArgs),
                parse: false,
            });

            setStats({
                credit: parseFloat(response.headers.get('X-Status-Credit') || 0),
                balance: parseFloat(response.headers.get('X-Status-Balance') || 0),
                total_transactions: parseInt(response.headers.get('X-Status-Total-Transactions') || 0),
                total_vendors: parseInt(response.headers.get('X-Status-Total-Vendors') || 0),
            });

            const storeData = await response.json();
            setData(storeData);
            setTotalItems(parseInt(response.headers.get('X-WP-Total') || 0));
        } catch {
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [view.page, view.perPage, filterArgs]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleModalSave = useCallback(async (formData) => {
        try {
            await apiFetch({ path: 'dokan/v1/reverse-withdrawal', method: 'POST', data: formData });
            setShowAddModal(false);
            fetchData();
        } catch {}
    }, [fetchData]);

    // Memoize setFilterArgs to prevent unnecessary re-renders of StoreFilter
    const memoizedSetFilterArgs = useCallback((newArgs) => {
        if (typeof newArgs === 'function') {
            setFilterArgs(newArgs);
        } else {
            setFilterArgs(newArgs);
        }
    }, []);

    // Move DateFilter outside or memoize it
    const DateFilter = useCallback(() => {
        const [tempAfter, setTempAfter] = useState(dateAfter);
        const [tempAfterText, setTempAfterText] = useState(dateAfterText);
        const [tempBefore, setTempBefore] = useState(dateBefore);
        const [tempBeforeText, setTempBeforeText] = useState(dateBeforeText);
        const [tempFocused, setTempFocused] = useState(focusedInput);

        const handleDateRangeUpdate = (update) => {
            if (update.after !== undefined) setTempAfter(update.after);
            if (update.afterText !== undefined) setTempAfterText(update.afterText);
            if (update.before !== undefined) setTempBefore(update.before);
            if (update.beforeText !== undefined) setTempBeforeText(update.beforeText);
            if (update.focusedInput !== undefined) setTempFocused(update.focusedInput);
        };

        const handleClearDateRange = () => {
            setDateAfter('');
            setDateAfterText('');
            setDateBefore('');
            setDateBeforeText('');
            setFocusedInput('startDate');
            setTempAfter('');
            setTempAfterText('');
            setTempBefore('');
            setTempBeforeText('');
            setTempFocused('startDate');
            fetchData('', '');
        };

        const handleOk = () => {
            setDateAfter(tempAfter);
            setDateAfterText(tempAfterText);
            setDateBefore(tempBefore);
            setDateBeforeText(tempBeforeText);
            setFocusedInput(tempFocused);
            if(tempAfter && tempBefore) {
                fetchData(tempAfter, tempBefore);
            }
        };

        return (
            <div className="flex flex-col min-w-48 relative">
                <DateRangePicker
                    after={tempAfter}
                    afterText={tempAfterText}
                    before={tempBefore}
                    beforeText={tempBeforeText}
                    onUpdate={handleDateRangeUpdate}
                    shortDateFormat="MM/DD/YYYY"
                    focusedInput={tempFocused}
                    isInvalidDate={() => false}
                    wrapperClassName="w-full"
                    pickerToggleClassName="block"
                    wpPopoverClassName="dokan-layout"
                    popoverBodyClassName="p-4 w-auto text-sm/6"
                    onClear={handleClearDateRange}
                    onOk={handleOk}
                >
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                        <input
                            type="text"
                            value={(() => {
                                const parts = [];
                                if (tempAfterText || tempAfter) parts.push(tempAfterText || tempAfter);
                                if (tempBeforeText || tempBefore) parts.push(tempBeforeText || tempBefore);
                                return parts.join(' - ');
                            })()}
                            className="border border-gray-300 rounded-md pl-8 text-gray-900 cursor-pointer w-full bg-[#fdfdfd] h-11"
                            placeholder={__('Date', 'dokan-lite')}
                            readOnly
                        />
                    </div>
                </DateRangePicker>
            </div>
        );
    }, [dateAfter, dateAfterText, dateBefore, dateBeforeText, focusedInput, fetchData]);

    // Memoize filter fields to prevent recreation
    const filterFields = useMemo(() => [
        <StoreFilter key="store_filter" filterArgs={filterArgs} setFilterArgs={memoizedSetFilterArgs} />,
        <DateFilter key="date_filter" />,
    ], [filterArgs, memoizedSetFilterArgs, DateFilter]);

    return (
        <div className="p-6 bg-gray rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{__('Reverse Withdrawal', 'dokan-lite')}</h1>
                <DokanButton variant="primary" onClick={() => setShowAddModal(true)}>
                    + {__('Add New', 'dokan-lite')}
                </DokanButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">{__('Total Collected', 'dokan-lite')}</p>
                    <p className="text-2xl font-bold text-gray-900">{price(stats.credit)}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">{__('Remaining Balance', 'dokan-lite')}</p>
                    <p className="text-2xl font-bold text-gray-900">{price(stats.balance)}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">{__('Total Transactions', 'dokan-lite')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_transactions}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">{__('Total Vendors', 'dokan-lite')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_vendors}</p>
                </div>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-gray-200 mb-4">
                <h2 className="text-lg font-medium text-gray-900">{__('List of Data', 'dokan-lite')}</h2>
                <button
                    type="button"
                    className={twMerge(
                        'inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-[#7047EB] hover:text-white',
                        showFilters ? 'bg-[#7047EB] text-white' : 'text-[#575757] bg-white'
                    )}
                    onClick={() => setShowFilters((v) => !v)}
                >
                    <Funnel size={16} />
                    {__('Filter', 'dokan-lite')}
                </button>
            </div>

            <div className={showFilters ? 'mb-6' : 'hidden'}>
                <Filter
                    fields={filterFields}
                    onFilter={fetchData}
                    showFilter={false}
                    showReset={false}
                    namespace="reverse_withdrawal_filters"
                />
            </div>

            <DataViews
                data={data}
                namespace="reverse-withdrawal-data-view"
                defaultLayouts={{ table: {}, list: {}, grid: {}, density: 'comfortable' }}
                fields={fields}
                getItemId={(item) => item.vendor_id}
                onChangeView={setView}
                paginationInfo={{ totalItems, totalPages: Math.ceil(totalItems / view.perPage) }}
                view={view}
                isLoading={isLoading}
            />

            {showAddModal && (
                <AddReverseWithdrawModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleModalSave} />
            )}
        </div>
    );
};

export default ReverseWithdrawalPage;
