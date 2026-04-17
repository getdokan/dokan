import { useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export interface TransactionType {
    id: string;
    title: string;
}

export interface UseTransactionTypesReturn {
    data: TransactionType[];
    isLoading: boolean;
    error: Error | null;
}

export const useTransactionTypes = (): UseTransactionTypesReturn => {
    const [ data, setData ] = useState< TransactionType[] >( [] );
    const [ isLoading, setIsLoading ] = useState< boolean >( true );
    const [ error, setError ] = useState< Error | null >( null );

    const fetchTypes = useCallback( async () => {
        try {
            setIsLoading( true );
            setError( null );

            const response = await apiFetch< TransactionType[] >( {
                path: '/dokan/v1/reverse-withdrawal/transaction-types',
                method: 'GET',
            } );

            setData( response );
        } catch ( err ) {
            setError(
                err instanceof Error
                    ? err
                    : new Error( 'Failed to fetch transaction types' )
            );
        } finally {
            setIsLoading( false );
        }
    }, [] );

    useEffect( () => {
        fetchTypes();
    }, [ fetchTypes ] );

    return { data, isLoading, error };
};
