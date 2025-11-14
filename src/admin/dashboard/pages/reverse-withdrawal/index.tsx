import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import { RawHTML, useEffect, useState, useCallback } from '@wordpress/element';
import { dateI18n, getSettings } from '@wordpress/date';
import apiFetch from '@wordpress/api-fetch';
import { formatPrice } from '@dokan/utilities';
import { DokanButton, AdminDataViews as DataViews } from '@dokan/components';
import {
    House,
    Calendar,
    Plus,
    WalletMinimal,
    DollarSign,
    ArrowRightLeft,
} from 'lucide-react';
import AddReverseWithdrawModal from './AddReverseWithdrawModal';
import { VendorAsyncSelect } from '@src/components';
import DateRangePicker from '@src/components/DateRangePicker';

const price = ( amount ) => <RawHTML>{ formatPrice( amount ) }</RawHTML>;

const ReverseWithdrawalPage = () => {
    const [ stats, setStats ] = useState( {
        credit: 0,
        balance: 0,
        total_transactions: 0,
        total_vendors: 0,
    } );

    const [ data, setData ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ filterArgs, setFilterArgs ] = useState( {} );
    const [ showAddModal, setShowAddModal ] = useState( false );
    const [ vendorFilter, setVendorFilter ] = useState( null );

    const [ dateAfter, setDateAfter ] = useState( '' );
    const [ dateAfterText, setDateAfterText ] = useState( '' );
    const [ dateBefore, setDateBefore ] = useState( '' );
    const [ dateBeforeText, setDateBeforeText ] = useState( '' );
    const [ focusedInput, setFocusedInput ] = useState( 'startDate' );

    // Memoize fields to prevent unnecessary re-renders
    const fields = [
        {
            id: 'store_name',
            label: __( 'Store', 'dokan-lite' ),
            enableGlobalSearch: true,
            render: ( { item } ) => (
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                        { item.store_name?.charAt( 0 ).toUpperCase() }
                    </div>
                    <span className="font-medium text-gray-900">
                        { item.store_name || __( '(no name)', 'dokan-lite' ) }
                    </span>
                </div>
            ),
        },
        {
            id: 'balance',
            label: __( 'Amount', 'dokan-lite' ),
            enableSorting: true,
            render: ( { item } ) => (
                <span className="font-semibold text-xs text-[#575757]">
                    { price( item.balance ) }
                </span>
            ),
        },
        {
            id: 'last_payment_date',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: true,
            render: ( { item } ) => {
                if (
                    ! item.last_payment_date ||
                    isNaN( new Date( item.last_payment_date ).getTime() )
                ) {
                    return '--';
                }
                const formattedDate = dateI18n(
                    getSettings().formats.date,
                    item.last_payment_date
                );
                return (
                    <span className="text-[#575757] text-xs">
                        { formattedDate.replace( /\//g, '.' ) }
                    </span>
                );
            },
        },
    ];

    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        titleField: 'store_name',
        layout: { density: 'comfortable' },
        fields: fields.map( ( field ) =>
            field.id !== 'store_name' ? field.id : ''
        ),
    } );

    // Create tabs for "List of Data" header
    const tabs = [
        {
            name: 'list',
            icon: () => {
                return (
                    <div className="flex items-center gap-1.5 px-2 text-black text-sm font-semibold">
                        { __( 'List of Data', 'dokan-lite' ) }
                    </div>
                );
            },
            title: __( 'List of Data', 'dokan-lite' ),
        },
    ];

    const fetchData = useCallback( async () => {
        setData( [] );
        setTotalItems( 0 );
        setIsLoading( true );
        try {
            const queryArgs = {
                per_page: view.perPage,
                page: view.page,
                ...filterArgs,
            };

            const response = await apiFetch( {
                path: addQueryArgs(
                    'dokan/v1/reverse-withdrawal/stores-balance',
                    queryArgs
                ),
                parse: false,
            } );

            setStats( {
                credit: parseFloat(
                    response.headers.get( 'X-Status-Credit' ) || 0
                ),
                balance: parseFloat(
                    response.headers.get( 'X-Status-Balance' ) || 0
                ),
                total_transactions: parseInt(
                    response.headers.get( 'X-Status-Total-Transactions' ) || 0
                ),
                total_vendors: parseInt(
                    response.headers.get( 'X-Status-Total-Vendors' ) || 0
                ),
            } );

            const storeData = await response.json();
            setData( storeData );
            setTotalItems(
                parseInt( response.headers.get( 'X-WP-Total' ) || 0 )
            );
        } catch {
            setData( [] );
        } finally {
            setIsLoading( false );
        }
    }, [ view.page, view.perPage, filterArgs ] );

    useEffect( () => {
        fetchData();
    }, [ fetchData ] );

    const handleModalSave = useCallback(
        async ( formData ) => {
            try {
                await apiFetch( {
                    path: 'dokan/v1/reverse-withdrawal',
                    method: 'POST',
                    data: formData,
                } );
                setShowAddModal( false );
                fetchData();
            } catch {}
        },
        [ fetchData ]
    );

    const clearSingleFilter = ( filterId ) => {
        const args = { ...filterArgs };
        switch ( filterId ) {
            case 'vendor':
                setVendorFilter( null );
                delete args.vendor_id;
                break;
            case 'date-range':
                setDateAfter( '' );
                setDateAfterText( '' );
                setDateBefore( '' );
                setDateBeforeText( '' );
                delete args.trn_date;
                break;
            default:
                break;
        }
        setFilterArgs( args );
    };

    const clearFilter = () => {
        setVendorFilter( null );
        setDateAfter( '' );
        setDateAfterText( '' );
        setDateBefore( '' );
        setDateBeforeText( '' );
        setFilterArgs( {} );
    };

    // Memoize filter fields to prevent recreation
    const filterFields = [
        {
            id: 'vendor',
            label: __( 'Vendor', 'dokan-lite' ),
            field: (
                <VendorAsyncSelect
                    icon={ <House size={ 16 } /> }
                    key="vendor-select"
                    value={ vendorFilter }
                    onChange={ ( selectedVendorObj ) => {
                        const args = { ...filterArgs };
                        delete args.vendor_id;
                        if ( selectedVendorObj ) {
                            args.vendor_id = selectedVendorObj.value;
                        }
                        setVendorFilter( selectedVendorObj );
                        setFilterArgs( args );
                    } }
                    placeholder={ __( 'Select Vendor', 'dokan-lite' ) }
                    prefetch
                    defaultOptions
                    cacheOptions
                />
            ),
        },
        {
            id: 'date-range',
            label: __( 'Date Range', 'dokan-lite' ),
            field: (
                <DateRangePicker
                    key="date-range-select"
                    after={ dateAfter }
                    afterText={ dateAfterText }
                    before={ dateBefore }
                    beforeText={ dateBeforeText }
                    onUpdate={ ( update ) => {
                        if ( update.after ) {
                            setDateAfter( update.after );
                        }
                        if ( update.afterText ) {
                            setDateAfterText( update.afterText );
                        }
                        if ( update.before ) {
                            setDateBefore( update.before );
                        }
                        if ( update.beforeText ) {
                            setDateBeforeText( update.beforeText );
                        }
                        if ( update.focusedInput ) {
                            setFocusedInput( update.focusedInput );
                            if (
                                update.focusedInput === 'endDate' &&
                                dateAfter
                            ) {
                                setDateBefore( '' );
                                setDateBeforeText( '' );
                            }
                        }
                    } }
                    shortDateFormat="MM/DD/YYYY"
                    focusedInput={ focusedInput }
                    isInvalidDate={ () => false }
                    wrapperClassName="w-full"
                    pickerToggleClassName="block"
                    wpPopoverClassName="dokan-layout"
                    popoverBodyClassName="p-4 w-auto text-sm/6"
                    onClear={ () => {
                        setDateAfter( '' );
                        setDateAfterText( '' );
                        setDateBefore( '' );
                        setDateBeforeText( '' );
                        const args = { ...filterArgs };
                        delete args.trn_date;
                        setFilterArgs( args );
                    } }
                    onOk={ () => {
                        const args = { ...filterArgs };
                        if ( dateAfter || dateBefore ) {
                            args.trn_date = {};
                            if ( dateAfter ) {
                                args.trn_date.from = dateI18n(
                                    'Y-m-d 00:00:00',
                                    dateAfter
                                );
                            }
                            if ( dateBefore ) {
                                args.trn_date.to = dateI18n(
                                    'Y-m-d 23:59:59',
                                    dateBefore
                                );
                            }
                        }
                        setFilterArgs( args );
                    } }
                >
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                        <input
                            type="text"
                            value={ ( () => {
                                const parts = [];
                                if ( dateAfterText || dateAfter ) {
                                    parts.push(
                                        // dateAfterText || dateAfter
                                        dateI18n(
                                            getSettings().formats.date,
                                            dateAfterText || dateAfter
                                        )
                                    );
                                }
                                if ( dateBeforeText || dateBefore ) {
                                    parts.push(
                                        // dateBeforeText || dateBefore
                                        dateI18n(
                                            getSettings().formats.date,
                                            dateBeforeText || dateBefore
                                        )
                                    );
                                }

                                return parts.join( ' - ' );
                            } )() }
                            className="border border-gray-300 rounded-md pl-8 text-gray-900 cursor-pointer w-full bg-[#fdfdfd] h-11"
                            placeholder={ __( 'Date', 'dokan-lite' ) }
                            readOnly
                        />
                    </div>
                </DateRangePicker>
            ),
        },
    ];

    const withdrawalStats = [
        {
            icon: WalletMinimal,
            label: __( 'Total Collected', 'dokan-lite' ),
            value: price( stats.credit ),
        },
        {
            icon: DollarSign,
            label: __( 'Remaining Balance', 'dokan-lite' ),
            value: price( stats.balance ),
        },
        {
            icon: ArrowRightLeft,
            label: __( 'Total Transactions', 'dokan-lite' ),
            value: stats.total_transactions,
        },
        {
            icon: House,
            label: __( 'Total Vendors', 'dokan-lite' ),
            value: stats.total_vendors,
        },
    ];

    return (
        <div className="rounded-md shadow-sm pt-3">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    { __( 'Reverse Withdrawal', 'dokan-lite' ) }
                </h1>
                <DokanButton
                    variant="primary"
                    onClick={ () => setShowAddModal( true ) }
                    className="flex items-center gap-2 py-2.5 px-6 font-medium text-sm leading-none"
                >
                    <Plus size={ 16 } color={ '#FFF' } strokeWidth={ 3 } />
                    { __( 'Add New', 'dokan-lite' ) }
                </DokanButton>
            </div>

            <div className="grid grid-rows-1 md:grid-cols-4 gap-5 mb-7">
                { withdrawalStats?.map( ( stat, index ) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={ index }
                            className="bg-white p-5 rounded-md shadow border border-gray-200"
                        >
                            <div className="flex items-center gap-1 mb-2.5">
                                <Icon
                                    size={ 16 }
                                    strokeWidth={ 3 }
                                    color="#7047EB"
                                />
                                <p className="text-xs text-[#828282]">
                                    { stat.label }
                                </p>
                            </div>
                            <p className="text-lg font-bold text-[#25252D]">
                                { stat.value }
                            </p>
                        </div>
                    );
                } ) }
            </div>

            <DataViews
                data={ data }
                namespace="reverse-withdrawal-data-view"
                defaultLayouts={ {
                    table: { density: 'comfortable' },
                    list: {},
                } }
                fields={ fields }
                getItemId={ ( item ) => item.vendor_id }
                onChangeView={ setView }
                paginationInfo={ {
                    totalItems,
                    totalPages: Math.ceil( totalItems / view.perPage ),
                } }
                view={ view }
                isLoading={ isLoading }
                emptyIcon={ <ArrowRightLeft size={ 52 } /> }
                emptyTitle={ __( 'No transaction found', 'dokan-lite' ) }
                tabs={ {
                    tabs,
                    onSelect: () => {},
                    initialTabName: 'list',
                } }
                filter={ {
                    fields: filterFields,
                    onFilterRemove: ( filterId ) =>
                        clearSingleFilter( filterId ),
                    onReset: () => clearFilter(),
                } }
            />

            { showAddModal && (
                <AddReverseWithdrawModal
                    open={ showAddModal }
                    onClose={ () => setShowAddModal( false ) }
                    onSave={ handleModalSave }
                />
            ) }
        </div>
    );
};

export default ReverseWithdrawalPage;
