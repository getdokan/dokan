import { useSelect } from '@wordpress/data';
import coreStore from '@dokan/stores/core';

type CapType = string | string[];

export const usePermission = ( cap: CapType = 'dokandar' ) => {
    return useSelect(
        ( select ) => {
            if ( typeof cap === 'string' ) {
                return select( coreStore ).hasCap( cap );
            }
            if ( cap?.length ) {
                return cap.every( ( item ) =>
                    select( coreStore ).hasCap( item )
                );
            }
            return false;
        },
        [ cap ]
    );
};
