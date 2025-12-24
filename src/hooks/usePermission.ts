import { useSelect } from '@wordpress/data';

type CapType = string | string[];

export const usePermission = ( cap: CapType = 'dokandar' ) => {
    return useSelect(
        ( select ) => {
            if ( typeof cap === 'string' ) {
                return select( 'dokan/core' ).hasCap( cap );
            }
            if ( cap?.length ) {
                return cap.every( ( item ) =>
                    select( 'dokan/core' ).hasCap( item )
                );
            }
            return false;
        },
        [ cap ]
    );
};
