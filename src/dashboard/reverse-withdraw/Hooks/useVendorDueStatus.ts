import { useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export interface VendorDueStatus {
    status: boolean;
    due_date: string;
    balance: number;
    formatted_balance: string;
    billing_type: string;
    formatted_billing_type: string;
    billing_day: number;
    due_period: number;
    threshold: number;
    formatted_threshold: string;
    payable_amount: number;
    formatted_payable_amount: string;
    display_notice: boolean;
    formatted_failed_actions: string;
    formatted_action_taken_message: string;
}

export interface UseVendorDueStatusReturn {
    data: VendorDueStatus | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => void;
}

export const useVendorDueStatus = (): UseVendorDueStatusReturn => {
    const [ data, setData ] = useState< VendorDueStatus | null >( null );
    const [ isLoading, setIsLoading ] = useState< boolean >( true );
    const [ error, setError ] = useState< Error | null >( null );

    const fetchDueStatus = useCallback( async () => {
        try {
            setIsLoading( true );
            setError( null );

            const response = await apiFetch< VendorDueStatus >( {
                path: '/dokan/v1/reverse-withdrawal/vendor-due-status',
                method: 'GET',
            } );

            setData( response );
        } catch ( err ) {
            setError(
                err instanceof Error
                    ? err
                    : new Error( 'Failed to fetch vendor due status' )
            );
        } finally {
            setIsLoading( false );
        }
    }, [] );

    useEffect( () => {
        fetchDueStatus();
    }, [ fetchDueStatus ] );

    return { data, isLoading, error, refresh: fetchDueStatus };
};
