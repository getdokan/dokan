import { useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface WithdrawPayload {
    method: string;
    amount: number;
}

type UpdateWithdrawPayload = Record< any, any >;

export interface UseWithdrawReturn {
    isLoading: boolean;
    error: Error | null;
    createWithdraw: ( payload: WithdrawPayload ) => Promise< void >;
    updateWithdraw: (
        id: number,
        payload: UpdateWithdrawPayload
    ) => Promise< void >;
}

export const useWithdraw = (): UseWithdrawReturn => {
    const [ isLoading, setIsLoading ] = useState< boolean >( false );
    const [ error, setError ] = useState< Error | null >( null );

    const createWithdraw = useCallback(
        async ( payload: WithdrawPayload ): Promise< void > => {
            try {
                setIsLoading( true );
                setError( null );

                await apiFetch( {
                    path: '/dokan/v1/withdraw',
                    method: 'POST',
                    data: payload,
                } );
            } catch ( err ) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error( 'Failed to create withdraw' )
                );
                console.error( 'Error creating withdraw:', err );
                throw err;
            } finally {
                setIsLoading( false );
            }
        },
        []
    );

    const updateWithdraw = useCallback(
        async (
            id: number,
            payload: UpdateWithdrawPayload
        ): Promise< void > => {
            try {
                setIsLoading( true );
                setError( null );

                await apiFetch( {
                    path: `/dokan/v1/withdraw/${ id }`,
                    method: 'PUT',
                    data: payload,
                } );
            } catch ( err ) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error( 'Failed to update withdraw' )
                );
                console.error( 'Error updating withdraw:', err );
                throw err;
            } finally {
                setIsLoading( false );
            }
        },
        []
    );

    return { isLoading, error, createWithdraw, updateWithdraw };
};
