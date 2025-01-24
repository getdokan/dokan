import { useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface PaymentMethod {
    label: string;
    value: string;
}

export interface WithdrawMethod {
    label: string;
    value: string;
    icon: string;
    info: string;
    has_information: boolean;
}

export interface WithdrawSettings {
    withdraw_method: string;
    payment_methods: PaymentMethod[];
    active_methods: Record< string, WithdrawMethod >;
    setup_url: string;
}

export interface UseWithdrawSettingsReturn {
    data: WithdrawSettings | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => void;
}

export const useWithdrawSettings = (): UseWithdrawSettingsReturn => {
    const [ data, setData ] = useState< WithdrawSettings | null >( null );
    const [ isLoading, setIsLoading ] = useState< boolean >( true );
    const [ error, setError ] = useState< Error | null >( null );

    const fetchSettings = useCallback( async () => {
        try {
            setIsLoading( true );
            setError( null );

            const response = await apiFetch< WithdrawSettings >( {
                path: '/dokan/v2/withdraw/settings',
                method: 'GET',
            } );

            setData( response );
        } catch ( err ) {
            setError(
                err instanceof Error
                    ? err
                    : new Error( 'Failed to fetch withdraw settings' )
            );
            console.error( 'Error fetching withdraw settings:', err );
        } finally {
            setIsLoading( false );
        }
    }, [] );

    useEffect( () => {
        fetchSettings();
    }, [ fetchSettings ] );

    const refresh = useCallback( () => {
        fetchSettings();
    }, [ fetchSettings ] );

    return { data, isLoading, error, refresh };
};
