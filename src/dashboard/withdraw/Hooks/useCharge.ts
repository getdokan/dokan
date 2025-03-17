import { useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface ChargeData {
    fixed: string;
    percentage: string;
}

export interface ChargeResponse {
    charge: number;
    receivable: number;
    charge_data: ChargeData;
}

export interface UseChargeReturn {
    data: ChargeResponse | null;
    isLoading: boolean;
    error: Error | null;
    fetchCharge: ( method: string, amount: string ) => void;
}

export const useCharge = (): UseChargeReturn => {
    const [ data, setData ] = useState< ChargeResponse | null >( null );
    const [ isLoading, setIsLoading ] = useState< boolean >( false );
    const [ error, setError ] = useState< Error | null >( null );

    const fetchCharge = useCallback(
        async ( method: string, amount: string ) => {
            try {
                setIsLoading( true );
                setError( null );

                const response = await apiFetch< ChargeResponse >( {
                    path: `/dokan/v1/withdraw/charge?method=${ method }&amount=${ amount }`,
                    method: 'GET',
                } );

                setData( response );
            } catch ( err ) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error( 'Failed to fetch charge' )
                );
                console.error( 'Error fetching charge:', err );
            } finally {
                setIsLoading( false );
            }
        },
        []
    );

    return { data, isLoading, error, fetchCharge };
};
