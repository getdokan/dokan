import { useSelect } from '@wordpress/data';
// eslint-disable-next-line import/no-unresolved
import coreStore from '@dokan/stores/core';

export const useCurrentUser = () => {
    const currentUser = useSelect( ( select ) => {
        return select( coreStore ).getCurrentUser();
    }, [] );

    return { currentUser };
};
