import { useSelect } from '@wordpress/data';

export const useCurrentUser = () => {
    return useSelect( ( select ) => {
        return select( 'dokan/core' ).getCurrentUser();
    }, [] );
};
