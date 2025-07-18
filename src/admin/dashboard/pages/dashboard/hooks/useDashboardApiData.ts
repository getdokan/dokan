import { useState, useEffect } from '@wordpress/element';

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
            setError(
                err instanceof Error ? err.message : 'An error occurred'
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
