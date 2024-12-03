import { useState, useCallback, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { PaginationState } from '@tanstack/react-table';

interface WithdrawRequestPayload {
    per_page: number;
    page: number;
    status: string;
    user_id: number;
}

interface WithdrawRequest {
    id: number;
    user_id: number;
    amount: number;
    status: string;
    method: string;
    created_date: string;
}

export interface UseWithdrawRequestsReturn {
    data: WithdrawRequest[] | null;
    isLoading: boolean;
    error: Error | null;
    fetchWithdrawRequests: ( payload: WithdrawRequestPayload ) => void;
    refresh: () => void;
    totalItems: number;
    totalPages: number;
    pagination: PaginationState;
    lastPayload?: WithdrawRequestPayload | null;
}

export const useWithdrawRequests = (
    defaultLoader: boolean = false
): UseWithdrawRequestsReturn => {
    const [ data, setData ] = useState< WithdrawRequest[] | null >( null );
    const [ totalItems, setTotalItems ] = useState< number >( 0 );
    const [ totalPages, setTotalPages ] = useState< number >( 0 );
    const [ pagination, setPagination ] = useState< PaginationState >( {
        pageIndex: 0,
        pageSize: 10,
    } );
    const [ isLoading, setIsLoading ] = useState< boolean >( defaultLoader );
    const [ error, setError ] = useState< Error | null >( null );
    const lastPayload = useRef< WithdrawRequestPayload | null >( null );

    const fetchWithdrawRequests = useCallback(
        async ( payload: WithdrawRequestPayload ) => {
            try {
                setIsLoading( true );
                setError( null );

                if ( lastPayload.current ) {
                    lastPayload.current = Object.assign(
                        {},
                        lastPayload.current,
                        payload
                    );
                } else {
                    lastPayload.current = payload;
                }

                setPagination( ( old ) => {
                    return {
                        ...old,
                        pageIndex: payload.page ? payload.page - 1 : 1,
                        pageSize: payload.per_page,
                    };
                } );

                const newURL = addQueryArgs( `/dokan/v1/withdraw`, payload );

                const response = await apiFetch< WithdrawRequest[] >( {
                    path: newURL,
                    parse: false,
                } );

                // @ts-ignore
                const responseData: WithdrawRequest[] = await response.json();
                // @ts-ignore
                const headers = response.headers;
                const responseTotalItems = headers.get( 'X-WP-Total' );
                const responseTotalPages = headers.get( 'X-WP-TotalPages' );

                setTotalItems( Number( responseTotalItems ) );
                setTotalPages( Number( responseTotalPages ) );
                setData( responseData );
            } catch ( err ) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error( 'Failed to fetch withdraw requests' )
                );
                console.error( 'Error fetching withdraw requests:', err );
            } finally {
                setIsLoading( false );
            }
        },
        []
    );

    const refresh = useCallback( () => {
        if ( lastPayload.current ) {
            fetchWithdrawRequests( lastPayload.current );
        }
    }, [ fetchWithdrawRequests ] );

    return {
        data,
        isLoading,
        error,
        fetchWithdrawRequests,
        refresh,
        totalItems,
        totalPages,
        pagination,
        lastPayload: lastPayload.current,
    };
};
