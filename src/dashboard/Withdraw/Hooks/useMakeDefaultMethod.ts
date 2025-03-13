import { useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface UseMakeDefaultMethodReturn {
    isLoading: boolean;
    error: Error | null;
    makeDefaultMethod: ( method: string ) => Promise< void >;
    makingDefault: string;
}

export const useMakeDefaultMethod = (): UseMakeDefaultMethodReturn => {
    const [ isLoading, setIsLoading ] = useState< boolean >( false );
    const [ error, setError ] = useState< Error | null >( null );
    const [ makingDefault, setMakingDefault ] = useState( '' );

    const makeDefaultMethod = useCallback(
        async ( method: string ): Promise< void > => {
            try {
                setIsLoading( true );
                setError( null );
                setMakingDefault( method );

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
                setMakingDefault( '' );
            }
        },
        []
    );

    return { isLoading, error, makeDefaultMethod, makingDefault };
};
