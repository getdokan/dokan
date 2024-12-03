import { useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

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
}

export const useWithdrawRequests = (
    defaultLoader: boolean = false
): UseWithdrawRequestsReturn => {
    const [ data, setData ] = useState< WithdrawRequest[] | null >( null );
    const [ isLoading, setIsLoading ] = useState< boolean >( defaultLoader );
    const [ error, setError ] = useState< Error | null >( null );

    const fetchWithdrawRequests = useCallback(
        async ( payload: WithdrawRequestPayload ) => {
            try {
                setIsLoading( true );
                setError( null );

                const newURL = addQueryArgs( `/dokan/v1/withdraw`, payload ); // https://google.com/?q=test

                const response = await apiFetch< WithdrawRequest[] >( {
                    path: newURL,
                } );

                setData( response );
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

    return { data, isLoading, error, fetchWithdrawRequests };
};
