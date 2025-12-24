import { useCallback, useState, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Customer } from './useCustomerSearch';

interface UseCustomerByIdReturn {
    customer: Customer | null;
    isLoading: boolean;
    error: Error | null;
    fetchCustomerById: ( id: number ) => Promise< Customer >;
    refresh: () => void;
    abort: () => void;
}

export const useCustomerById = (): UseCustomerByIdReturn => {
    const [ customer, setCustomer ] = useState< Customer | null >( null );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ error, setError ] = useState< Error | null >( null );
    const [ customerId, setCustomerId ] = useState< number | null >( null );
    const abortControllerRef = useRef< AbortController | null >( null );

    const fetchCustomer = useCallback( async ( id: number ) => {
        setIsLoading( true );
        setError( null );

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        try {
            const response = await apiFetch< Customer >( {
                path: `/dokan/v1/customers/${ id }`,
                signal,
            } );

            setCustomer( response );
            return response;
        } catch ( err ) {
            if ( signal.aborted ) {
                console.log( 'Fetch aborted' );
            } else {
                const errorObj =
                    err instanceof Error
                        ? err
                        : new Error( 'Failed to fetch customer' );
                setError( errorObj );
                setCustomer( null );
                throw errorObj;
            }
        } finally {
            setIsLoading( false );
        }
    }, [] );

    const fetchCustomerById = useCallback(
        async ( id: number ) => {
            setCustomerId( id );
            return await fetchCustomer( id );
        },
        [ fetchCustomer ]
    );

    const refresh = useCallback( () => {
        if ( customerId !== null ) {
            fetchCustomer( customerId );
        }
    }, [ fetchCustomer, customerId ] );

    const abort = useCallback( () => {
        if ( abortControllerRef.current ) {
            abortControllerRef.current.abort();
        }
    }, [] );

    return {
        customer,
        isLoading,
        error,
        fetchCustomerById,
        refresh,
        abort,
    };
};
