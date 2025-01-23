import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
export default {
    getOrderDetails( id ) {
        return async ( { dispatch } ) => {
            dispatch.setLoading( true );
            try {
                const order = await apiFetch( {
                    path: `/dokan/v1/orders/${ id }`,
                } );
                dispatch.setOrderDetails( order );
            } catch ( error ) {
                dispatch.setError(
                    __(
                        'No order data found with given order id.',
                        'dokan-lite'
                    )
                );
                dispatch.setOrderDetails( {} );
            } finally {
                dispatch.setLoading( false );
            }
        };
    },
};
