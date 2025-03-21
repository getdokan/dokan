import { useSelect } from '@wordpress/data';
import coreStore from '@dokan/stores/core';

export const useCurrentUser = () => {
    return useSelect( ( select ) => {
        return select( coreStore ).getCurrentUser();
    }, [] );
};
