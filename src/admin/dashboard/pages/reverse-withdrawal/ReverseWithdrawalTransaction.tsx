import { addQueryArgs } from '@wordpress/url';
import { __, sprintf } from '@wordpress/i18n';
import {
    RawHTML,
    useCallback,
    useEffect,
    useState,
} from '@wordpress/element';
import { dateI18n, getSettings } from '@wordpress/date';
import apiFetch from '@wordpress/api-fetch';
import { formatPrice } from '@dokan/utilities';
import { DataViews, DokanButton } from '@dokan/components';
import DateRangePicker from '@src/components/DateRangePicker';
import {
    ArrowLeft,
    ArrowRightLeft,
    Calendar,
    House,
    DollarSign,
    WalletMinimal,
} from 'lucide-react';
import { SimpleInput } from '@getdokan/dokan-ui';

const ReverseWithdrawalTransactionPage = ( { params, navigate } ) => {
    const vendorId = params?.id;
    const [ stats, setStats ] = useState( {
        credit: 0,
        balance: 0,
        total_transactions: 0,
    } );
    const [ store, setStore ] = useState( null );

    const [ data, setData ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ totalItems, setTotalItems ] = useState( 0 );

    const [ filterArgs, setFilterArgs ] = useState( {} );

    const [ dateAfter, setDateAfter ] = useState( '' );
    const [ dateAfterText, setDateAfterText ] = useState( '' );
    const [ dateBefore, setDateBefore ] = useState( '' );
    const [ dateBeforeText, setDateBeforeText ] = useState( '' );
    const [ focusedInput, setFocusedInput ] = useState( 'startDate' );

    const price = ( amount ) => <RawHTML>{ formatPrice( amount ) }</RawHTML>;

    const fields = [
        {
            id: 'trn_id',
            label: __( 'Transaction ID', 'dokan-lite' ),
            render: ( { item } ) =>
                item?.trn_id ? (
                    <a
                        className="hover:underline"
                        href={ item.trn_url }
                        target="_blank"
                        rel="noreferrer"
                    >
                        { item.trn_id }
                    </a>
                ) : (
                    <span>{ __( '--', 'dokan-lite' ) }</span>
                ),
        },
        {
            id: 'trn_date',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item } ) => {
                return (
                    <span className="text-[#575757] text-xs">
                        { item.trn_date }
                    </span>
                );
            },
        },
        {
            id: 'trn_type',
            label: __( 'Transaction Type', 'dokan-lite' ),
        },
        {
            id: 'note',
            label: __( 'Note', 'dokan-lite' ),
        },
        {
            id: 'debit',
            label: __( 'Debit', 'dokan-lite' ),
            render: ( { item } ) => {
                if ( item.debit === '' ) {
                    return <span>--</span>;
                }
                const amt = parseFloat( item.debit );
                if ( isNaN( amt ) ) {
                    return <span>--</span>;
                }
                return amt < 0 ? (
                    <div className="flex">( { price( Math.abs( amt ) ) } )</div>
                ) : (
                    <div className="flex">{ price( amt ) }</div>
                );
            },
        },
        {
            id: 'credit',
            label: __( 'Credit', 'dokan-lite' ),
            render: ( { item } ) => {
                if ( item.credit === '' ) {
                    return <span>--</span>;
                }
                const amt = parseFloat( item.credit );
                if ( isNaN( amt ) ) {
                    return <span>--</span>;
                }
                return amt < 0 ? (
                    <div className="flex">( { price( Math.abs( amt ) ) } )</div>
                ) : (
                    <div className="flex">{ price( amt ) }</div>
                );
            },
        },
        {
            id: 'balance',
            label: __( 'Balance', 'dokan-lite' ),
            render: ( { item } ) => {
                if ( item.balance === '' ) {
                    return <span>--</span>;
                }
                const amt = parseFloat( item.balance );
                if ( isNaN( amt ) ) {
                    return <span>--</span>;
                }
                return amt < 0 ? (
                    <div className="flex">( { price( Math.abs( amt ) ) } )</div>
                ) : (
                    <div className="flex">{ price( amt ) }</div>
                );
            },
        },
    ];

    const [ view, setView ] = useState( {
        perPage: 100,
        page: 1,
        search: '',
        type: 'table',
        layout: { density: 'comfortable' },
        fields: fields.map( ( f ) => f.id ),
    } );

    const tabItems = [
        {
            value: 'list',
            label: __( 'List of Transactions', 'dokan-lite' ),
        },
    ];

    const fetchStore = useCallback( async () => {
        if ( ! vendorId ) {
            return;
        }
        try {
            const response = await apiFetch( {
                path: `dokan/v1/stores/${ vendorId }`,
            } );
            setStore( response );
        } catch {
            setStore( null );
        }
    }, [ vendorId ] );

    const fetchTransactions = useCallback( async () => {
        if ( ! vendorId ) {
            return;
        }

        setIsLoading( true );
        setData( [] );
        try {
            const queryArgs: any = {
                orderby: ( view as any )?.sort?.field || 'added',
                order: ( view as any )?.sort?.direction || 'desc',
                vendor_id: vendorId,
                per_page: -1,
                ...filterArgs,
            };

            const response = await apiFetch( {
                path: addQueryArgs(
                    'dokan/v1/reverse-withdrawal/transactions',
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
            } );

            const list = await response.json();
            setData( list );
            setTotalItems( Array.isArray( list ) ? list.length : 0 );
        } catch {
            setData( [] );
            setTotalItems( 0 );
        } finally {
            setIsLoading( false );
        }
    }, [ vendorId, view.page, view.perPage, filterArgs ] );

    useEffect( () => {
        fetchStore();
    }, [ fetchStore ] );

    useEffect( () => {
        fetchTransactions();
    }, [ fetchTransactions ] );

    const clearSingleFilter = ( filterId ) => {
        const args = { ...filterArgs };
        switch ( filterId ) {
            case 'dokan-date-range':
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
        setDateAfter( '' );
        setDateAfterText( '' );
        setDateBefore( '' );
        setDateBeforeText( '' );
        setFilterArgs( {} );
    };

    const header = (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
                { __( 'Reverse Withdrawal', 'dokan-lite' ) }
            </h1>
            <DokanButton
                variant="secondary"
                onClick={ () => navigate( '/reverse-withdrawal' ) }
                className="flex items-center gap-2 py-2.5 px-6 font-medium text-sm leading-none"
            >
                <ArrowLeft size={ 16 } /> { __( 'Back', 'dokan-lite' ) }
            </DokanButton>
        </div>
    );

    const infoCards = [
        {
            icon: House,
            label: __( 'Store', 'dokan-lite' ),
            value: (
                <span className="block max-w-[260px] whitespace-nowrap overflow-hidden text-ellipsis">
                    { store?.store_name || '' }
                </span>
            ),
        },
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
    ];

    const displayDateRange = ( startDate, endDate ) => {
        return sprintf(
            // translators: %s: start date, %s: end date.
            __( '%s - %s', 'dokan-lite' ),
            dateI18n( getSettings().formats.date, startDate ),
            dateI18n( getSettings().formats.date, endDate )
        );
    };

    const filterFields = [
        {
            id: 'dokan-date-range',
            label: __( 'Date Range', 'dokan-lite' ),
            field: (
                <DateRangePicker
                    key="transactions-date-range"
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
                        // Apply the selected date range
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
                    <SimpleInput
                        addOnLeft={ <Calendar size="16" /> }
                        className="border rounded px-3 py-1.5 w-full bg-white"
                        onChange={ () => {} }
                        input={ {
                            type: 'text',
                            value:
                                ! dateAfter || ! dateBefore
                                    ? ''
                                    : displayDateRange( dateAfter, dateBefore ),
                            placeholder: 'Date',
                            readOnly: true,
                        } }
                    />
                </DateRangePicker>
            ),
        },
    ];

    return (
        <div
            id="reverse-withdrawal-transactions"
        >
            { header }

            <div className="grid grid-rows-1 md:grid-cols-4 gap-5 mb-7">
                { infoCards.map( ( stat, index ) => {
                    const Icon = stat.icon as any;
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

            <div className="dokan-admin-dashboard-datatable">
                <DataViews
                    data={ data }
                    fields={ fields }
                    namespace="reverse-withdrawal-transactions"
                    defaultLayouts={ {
                        table: { density: 'comfortable' },
                        list: {},
                    } }
                    getItemId={ ( item ) => item.id }
                    view={ view }
                    onChangeView={ setView }
                    isLoading={ isLoading }
                    emptyIcon={ <ArrowRightLeft size={ 52 } /> }
                    emptyTitle={ __( 'No transaction found', 'dokan-lite' ) }
                    paginationInfo={ {
                        totalItems,
                        totalPages: Math.ceil( totalItems / view.perPage ),
                    } }
                    tabs={ {
                        items: tabItems,
                        onSelect: () => {},
                        defaultValue: 'list',
                    } }
                    filter={ {
                        fields: filterFields,
                        onFilterRemove: ( filterId ) =>
                            clearSingleFilter( filterId ),
                        onReset: () => clearFilter(),
                    } }
                />
            </div>
        </div>
    );
};

export default ReverseWithdrawalTransactionPage;
