import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export interface UseAddToCartReturn {
    addToCart: ( amount: number ) => Promise< void >;
    isLoading: boolean;
    error: Error | null;
}

declare const window: Window & {
    dokan?: Record< string, any >;
};

export const useAddToCart = (): UseAddToCartReturn => {
    const [ isLoading, setIsLoading ] = useState< boolean >( false );
    const [ error, setError ] = useState< Error | null >( null );

    const addToCart = async ( amount: number ): Promise< void > => {
        try {
            setIsLoading( true );
            setError( null );

            const dokanData = window.dokan;

            if ( ! dokanData?.reverse_withdrawal?.nonce ) {
                throw new Error(
                    __( 'Reverse withdrawal payment data is not available. Please reload the page.', 'dokan-lite' )
                );
            }

            const nonce = dokanData.reverse_withdrawal.nonce;
            const ajaxUrl = dokanData.ajaxurl || '/wp-admin/admin-ajax.php';

            const formData = new FormData();
            formData.append( 'action', 'dokan_reverse_withdrawal_payment_to_cart' );
            formData.append( 'price', String( amount ) );
            formData.append( '_reverse_withdrawal_nonce', nonce );

            const response = await fetch( ajaxUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
            } );

            const text = await response.text();

            let result;
            try {
                result = JSON.parse( text );
            } catch {
                throw new Error(
                    __( 'Unexpected server response. Please reload the page and try again.', 'dokan-lite' )
                );
            }

            if ( ! result.success ) {
                const message =
                    result.data?.message ||
                    ( typeof result.data === 'string' ? result.data : '' ) ||
                    __( 'Something went wrong. Please try again.', 'dokan-lite' );
                throw new Error( message );
            }
        } catch ( err ) {
            const addToCartError =
                err instanceof Error ? err : new Error( __( 'Failed to add to cart', 'dokan-lite' ) );
            setError( addToCartError );
            throw addToCartError;
        } finally {
            setIsLoading( false );
        }
    };

    return { addToCart, isLoading, error };
};
