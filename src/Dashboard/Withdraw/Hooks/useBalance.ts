import { useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface ChargeData {
    fixed: string;
    percentage: string;
}

interface LastWithdraw {
    id: number;
    user_id: number;
    amount: string;
    date: string;
    status: number;
    method: string;
    note: string;
    details: Record< any, any >;
    ip: string;
    charge: number;
    receivable: number;
    charge_data: ChargeData;
}

export interface BalanceData {
    current_balance: number;
    withdraw_limit: string;
    withdraw_threshold: number;
    withdraw_methods: string[];
    last_withdraw: LastWithdraw;
}

interface UseBalanceReturn {
    data: BalanceData | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => void;
}

export const useBalance = (): UseBalanceReturn => {
    const [data, setData] = useState<BalanceData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBalance = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await apiFetch<BalanceData>({
                path: '/dokan/v1/withdraw/balance',
                method: 'GET',
            });

            setData(response);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
            console.error('Error fetching balance:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const refresh = useCallback(() => {
        fetchBalance();
    }, [fetchBalance]);

    return { data, isLoading, error, refresh };
};
