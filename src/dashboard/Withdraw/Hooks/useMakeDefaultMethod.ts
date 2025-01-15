import { useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface UseMakeDefaultMethodReturn {
    isLoading: boolean;
    error: Error | null;
    makeDefaultMethod: ( method: string ) => Promise< void >;
}

export const useMakeDefaultMethod = (): UseMakeDefaultMethodReturn => {
    const [ isLoading, setIsLoading ] = useState< boolean >( false );
    const [ error, setError ] = useState< Error | null >( null );

    const makeDefaultMethod = useCallback(
        async ( method: string ): Promise< void > => {
            try {
                setIsLoading( true );
                setError( null );

                await apiFetch( {
                    path: '/dokan/v2/withdraw/make-default-method',
                    method: 'POST',
                    data: { method },
                } );
            } catch ( err ) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error( 'Failed to make default method' )
                );
                console.error( 'Error making default method:', err );
            } finally {
                setIsLoading( false );
            }
        },
        []
    );

    return { isLoading, error, makeDefaultMethod };
};
