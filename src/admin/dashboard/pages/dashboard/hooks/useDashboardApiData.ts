import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

interface UseApiDataOptions< T > {
    fetchFunction: ( params?: any ) => Promise< T >;
    dependencies?: any[];
    initialParams?: any;
}

export const useDashboardApiData = < T >({
    fetchFunction,
    dependencies = [],
    initialParams,
}: UseApiDataOptions< T > ) => {
    const [ data, setData ] = useState< T | null >( null );
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState< string | null >( null );

    const refetch = async ( params?: any ) => {
        try {
            setLoading( true );
            setError( null );
            const response = await fetchFunction( params || initialParams );
            setData( response );
        } catch ( err ) {
            // apiFetch rejects with a plain { code, message } object, so show its message to let admins see why the request failed.
            setError(
                ( err as { message?: string } )?.message ||
                    __( 'An error occurred', 'dokan-lite' )
            );
            // eslint-disable-next-line no-console
            console.error( 'API fetch error:', err );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        refetch();
    }, dependencies );

    return { data, loading, error, refetch };
};
