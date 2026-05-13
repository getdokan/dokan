import { useState, useCallback, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

export interface ReverseWithdrawalTransaction {
    id: number;
    trn_id: string;
    trn_url: string;
    trn_date: string;
    trn_type: string;
    trn_type_raw: string;
    vendor_id: number;
    note: string;
    debit: string | number;
    credit: string | number;
    balance: number;
}

export interface TransactionPayload {
    per_page: number;
    page: number;
    trn_date?: {
        from: string;
        to: string;
    };
}

export interface TransactionView {
    perPage: number;
    page: number;
    type: string;
    titleField: string;
    fields?: string[];
    layout?: Record< string, any >;
}

export interface UseReverseWithdrawalTransactionsReturn {
    data: ReverseWithdrawalTransaction[] | null;
    isLoading: boolean;
    error: Error | null;
    totalItems: number;
    totalPages: number;
    summaryDebit: number;
    summaryCredit: number;
    summaryBalance: number;
    fetchTransactions: ( payload: TransactionPayload ) => void;
    refresh: () => void;
    view: TransactionView;
    setView: ( view: TransactionView ) => void;
    lastPayload: TransactionPayload | null;
}

export const useReverseWithdrawalTransactions = (
    defaultLoader: boolean = false
): UseReverseWithdrawalTransactionsReturn => {
    const [ data, setData ] =
        useState< ReverseWithdrawalTransaction[] | null >( null );
    const [ isLoading, setIsLoading ] = useState< boolean >( defaultLoader );
    const [ error, setError ] = useState< Error | null >( null );
    const [ totalItems, setTotalItems ] = useState< number >( 0 );
    const [ totalPages, setTotalPages ] = useState< number >( 0 );
    const [ summaryDebit, setSummaryDebit ] = useState< number >( 0 );
    const [ summaryCredit, setSummaryCredit ] = useState< number >( 0 );
    const [ summaryBalance, setSummaryBalance ] = useState< number >( 0 );
    const [ view, setView ] = useState< TransactionView >( {
        perPage: 10,
        page: 1,
        type: 'table',
        fields: [
            'trn_id',
            'trn_date',
            'trn_type',
            'note',
            'debit',
            'credit',
            'balance',
        ],
        layout: {
            styles: {
                trn_id: { width: '14%' },
                trn_date: { width: '14%' },
                trn_type: { width: '14%' },
                note: { width: '14%' },
                debit: { width: '14%' },
                credit: { width: '14%' },
                balance: { width: '14%' },
            },
        },
    } );

    const lastPayloadRef = useRef< TransactionPayload | null >( null );

    const fetchTransactions = useCallback(
        async ( payload: TransactionPayload ) => {
            try {
                setIsLoading( true );
                setError( null );

                if ( lastPayloadRef.current ) {
                    lastPayloadRef.current = Object.assign(
                        {},
                        lastPayloadRef.current,
                        payload
                    );
                } else {
                    lastPayloadRef.current = payload;
                }

                const queryArgs: Record< string, any > = {
                    per_page: payload.per_page,
                    page: payload.page,
                };

                if ( payload.trn_date?.from ) {
                    queryArgs[ 'trn_date[from]' ] = payload.trn_date.from;
                }
                if ( payload.trn_date?.to ) {
                    queryArgs[ 'trn_date[to]' ] = payload.trn_date.to;
                }

                const path = addQueryArgs(
                    '/dokan/v1/reverse-withdrawal/transactions',
                    queryArgs
                );

                const response = await apiFetch< any >( {
                    path,
                    parse: false,
                } );

                const responseData: ReverseWithdrawalTransaction[] =
                    await response.json();
                const headers = response.headers;

                setData( responseData );
                setTotalItems(
                    Number( headers.get( 'X-WP-Total' ) || '0' )
                );
                setTotalPages(
                    Number( headers.get( 'X-WP-TotalPages' ) || '0' )
                );
                setSummaryDebit(
                    Number( headers.get( 'X-Status-Debit' ) || '0' )
                );
                setSummaryCredit(
                    Number( headers.get( 'X-Status-Credit' ) || '0' )
                );
                setSummaryBalance(
                    Number( headers.get( 'X-Status-Balance' ) || '0' )
                );
            } catch ( err ) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error( 'Failed to fetch transactions' )
                );
            } finally {
                setIsLoading( false );
            }
        },
        []
    );

    const refresh = useCallback( () => {
        if ( lastPayloadRef.current ) {
            fetchTransactions( lastPayloadRef.current );
        }
    }, [ fetchTransactions ] );

    return {
        data,
        isLoading,
        error,
        totalItems,
        totalPages,
        summaryDebit,
        summaryCredit,
        summaryBalance,
        fetchTransactions,
        refresh,
        view,
        setView,
        lastPayload: lastPayloadRef.current,
    };
};
