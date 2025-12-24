import { useCallback, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

export interface Customer {
    id: number;
    name: string;
    email: string;
}

interface UseCustomerSearchReturn {
    customers: Customer[];
    isLoading: boolean;
    error: Error | null;
    searchCustomers: ( term: string ) => Promise< Customer[] >;
    refresh: () => void;
}

export const useCustomerSearch = (): UseCustomerSearchReturn => {
    const [ customers, setCustomers ] = useState< Customer[] >( [] );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ error, setError ] = useState< Error | null >( null );
    const [ search, setSearch ] = useState( '' );

    const fetchCustomers = useCallback( async ( searchQuery: string ) => {
        setIsLoading( true );
        setError( null );

        try {
            const response = await apiFetch< Customer[] >( {
                path: addQueryArgs( '/dokan/v1/customers/search', {
                    search: searchQuery,
                } ),
            } );

            const customersList = Array.isArray( response ) ? response : [];
            setCustomers( customersList );
            return customersList;
        } catch ( err ) {
            const errorObj =
                err instanceof Error
                    ? err
                    : new Error( 'Failed to fetch customers' );
            setError( errorObj );
            setCustomers( [] );
            throw errorObj;
        } finally {
            setIsLoading( false );
        }
    }, [] );

    const searchCustomers = useCallback(
        async ( term: string ) => {
            setSearch( term );
            return await fetchCustomers( term );
        },
        [ fetchCustomers ]
    );

    const refresh = useCallback( () => {
        fetchCustomers( search );
    }, [ fetchCustomers, search ] );

    return {
        customers,
        isLoading,
        error,
        searchCustomers,
        refresh,
    };
};
