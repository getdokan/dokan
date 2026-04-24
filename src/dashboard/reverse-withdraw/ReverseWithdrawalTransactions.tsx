import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { dateI18n, getSettings } from '@wordpress/date';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { DataViews, DateRangePicker } from '@dokan/components';
import { SimpleInput } from '@getdokan/dokan-ui';
import { Calendar } from 'lucide-react';
import { formatPrice } from '@dokan/utilities';
import { decodeEntities } from '@wordpress/html-entities';
import {
    ReverseWithdrawalTransaction,
    UseReverseWithdrawalTransactionsReturn,
} from './Hooks/useReverseWithdrawalTransactions';

function ReverseWithdrawalTransactions( {
    transactionsHook,
}: {
    transactionsHook: UseReverseWithdrawalTransactionsReturn;
} ) {
    const [ after, setAfter ] = useState( '' );
    const [ afterText, setAfterText ] = useState( '' );
    const [ before, setBefore ] = useState( '' );
    const [ beforeText, setBeforeText ] = useState( '' );
    const [ focusedInput, setFocusedInput ] = useState( 'startDate' );

    const fields = [
        {
            id: 'trn_id',
            label: __( 'Transaction ID', 'dokan-lite' ),
            enableSorting: false,
            render: ( {
                item,
            }: {
                item: ReverseWithdrawalTransaction;
            } ) => (
                <div>
                    { item.trn_url ? (
                        <a
                            href={ item.trn_url }
                            target="_blank"
                            rel="noreferrer"
                            className="text-dokan-link"
                        >
                            { item.trn_id }
                        </a>
                    ) : (
                        item.trn_id
                    ) }
                </div>
            ),
        },
        {
            id: 'trn_date',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            render: ( {
                item,
            }: {
                item: ReverseWithdrawalTransaction;
            } ) => (
                <div>{ item.trn_date }</div>
            ),
        },
        {
            id: 'trn_type',
            label: __( 'Transaction Type', 'dokan-lite' ),
            enableSorting: false,
            render: ( {
                item,
            }: {
                item: ReverseWithdrawalTransaction;
            } ) => (
                <div>{ item.trn_type }</div>
            ),
        },
        {
            id: 'note',
            label: __( 'Note', 'dokan-lite' ),
            enableSorting: false,
            render: ( {
                item,
            }: {
                item: ReverseWithdrawalTransaction;
            } ) => (
                <div>{ item.note }</div>
            ),
        },
        {
            id: 'debit',
            label: __( 'Debit', 'dokan-lite' ),
            enableSorting: false,
            render: ( {
                item,
            }: {
                item: ReverseWithdrawalTransaction;
            } ) => (
                <div>
                    { item.debit === '' || item.debit === '--' ? (
                        '--'
                    ) : (
                        <span className="inline-flex">
                            { decodeEntities( formatPrice( item.debit ) ) }
                        </span>
                    ) }
                </div>
            ),
        },
        {
            id: 'credit',
            label: __( 'Credit', 'dokan-lite' ),
            enableSorting: false,
            render: ( {
                item,
            }: {
                item: ReverseWithdrawalTransaction;
            } ) => (
                <div>
                    { item.credit === '' || item.credit === '--' ? (
                        '--'
                    ) : (
                        <span className="inline-flex">
                            { decodeEntities( formatPrice( item.credit ) ) }
                        </span>
                    ) }
                </div>
            ),
        },
        {
            id: 'balance',
            label: __( 'Balance', 'dokan-lite' ),
            enableSorting: false,
            render: ( {
                item,
            }: {
                item: ReverseWithdrawalTransaction;
            } ) => (
                <div>
                    <span>
                        { Number( item.balance ) < 0 ? '(' : '' }
                        <span className="inline-flex">
                            { decodeEntities(
                                formatPrice(
                                    Math.abs( Number( item.balance ) )
                                )
                            ) }
                        </span>
                        { Number( item.balance ) < 0 ? ')' : '' }
                    </span>
                </div>
            ),
        },
    ];

    const displayDateRange = ( startDate: string, endDate: string ) => {
        return sprintf(
            // translators: %s: start date, %s: end date.
            __( '%s - %s', 'dokan-lite' ),
            dateI18n( getSettings().formats.date, startDate ),
            dateI18n( getSettings().formats.date, endDate )
        );
    };

    const handleReset = () => {
        setAfter( '' );
        setAfterText( '' );
        setBefore( '' );
        setBeforeText( '' );
        transactionsHook.fetchTransactions( {
            per_page: transactionsHook.view.perPage,
            page: 1,
        } );
    };

    const clearSingleFilter = ( filterId: string ) => {
        if ( filterId === 'date-range' ) {
            handleReset();
        }
    };

    const filter = {
        fields: [
            {
                id: 'date-range',
                label: __( 'Date Range', 'dokan-lite' ),
                field: (
                    <DateRangePicker
                        key="reverse-withdraw-date-range"
                        after={ after }
                        afterText={ afterText }
                        before={ before }
                        beforeText={ beforeText }
                        onUpdate={ ( update: any ) => {
                            if ( update.after ) {
                                setAfter( update.after );
                            }
                            if ( update.afterText ) {
                                setAfterText( update.afterText );
                            }
                            if ( update.before ) {
                                setBefore( update.before );
                            }
                            if ( update.beforeText ) {
                                setBeforeText( update.beforeText );
                            }
                            if ( update.focusedInput ) {
                                setFocusedInput( update.focusedInput );
                                if (
                                    update.focusedInput === 'endDate' &&
                                    after
                                ) {
                                    setBefore( '' );
                                    setBeforeText( '' );
                                }
                            }
                        } }
                        shortDateFormat="MM/DD/YYYY"
                        focusedInput={ focusedInput }
                        isInvalidDate={ () => false }
                        wrapperClassName="w-full"
                        pickerToggleClassName="block"
                        wpPopoverClassName="dokan-layout"
                        onClear={ () => {
                            setAfter( '' );
                            setAfterText( '' );
                            setBefore( '' );
                            setBeforeText( '' );
                            transactionsHook.fetchTransactions( {
                                per_page: transactionsHook.view.perPage,
                                page: 1,
                            } );
                        } }
                        onOk={ () => {
                            const payload: any = {
                                per_page: transactionsHook.view.perPage,
                                page: 1,
                            };
                            if ( after || before ) {
                                payload.trn_date = {};
                                if ( after ) {
                                    payload.trn_date.from = dateI18n(
                                        'Y-m-d 00:00:00',
                                        after
                                    );
                                }
                                if ( before ) {
                                    payload.trn_date.to = dateI18n(
                                        'Y-m-d 23:59:59',
                                        before
                                    );
                                }
                            }
                            transactionsHook.fetchTransactions( payload );
                        } }
                    >
                        <SimpleInput
                            addOnLeft={ <Calendar size="16" /> }
                            className="border rounded px-3 py-1.5 w-full bg-white"
                            onChange={ () => {} }
                            input={ {
                                type: 'text',
                                value:
                                    ! after || ! before
                                        ? ''
                                        : displayDateRange( after, before ),
                                placeholder: __( 'Date', 'dokan-lite' ),
                                readOnly: true,
                            } }
                        />
                    </DateRangePicker>
                ),
            },
        ],
        onReset: handleReset,
        onFilterRemove: ( filterId: string ) =>
            clearSingleFilter( filterId ),
    };

    const onChangeView = ( newView: typeof transactionsHook.view ) => {
        const paginationChanged =
            newView.page !== transactionsHook.view.page ||
            newView.perPage !== transactionsHook.view.perPage;

        transactionsHook.setView( newView );

        if ( paginationChanged ) {
            transactionsHook.fetchTransactions( {
                ...transactionsHook.lastPayload,
                page: newView.page,
                per_page: newView.perPage,
            } );
        }
    };

    return (
        <div>
            <DataViews
                namespace="dokan-reverse-withdrawal-transactions"
                data={ transactionsHook.data ?? [] }
                fields={ fields }
                view={ transactionsHook.view }
                filter={ filter }
                search={ false }
                onChangeView={ onChangeView }
                getItemId={ (
                    item: ReverseWithdrawalTransaction
                ) => item.id }
                paginationInfo={ {
                    totalItems: transactionsHook.totalItems,
                    totalPages: transactionsHook.totalPages,
                } }
                isLoading={ transactionsHook.isLoading }
            />

            { ! transactionsHook.isLoading &&
                transactionsHook.data &&
                transactionsHook.data.length > 0 && (
                    <div className="flex justify-end items-center gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b">
                        <span className="font-semibold text-gray-700">
                            { __( 'Balance:', 'dokan-lite' ) }
                        </span>
                        <span className="font-semibold inline-flex">
                            { decodeEntities(
                                formatPrice( transactionsHook.summaryBalance )
                            ) }
                        </span>
                    </div>
                ) }
        </div>
    );
}

export default ReverseWithdrawalTransactions;
