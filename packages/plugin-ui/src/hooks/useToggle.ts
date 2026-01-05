import { useState, useCallback } from '@wordpress/element';

type UseToggleReturn = [ boolean, () => void, ( value: boolean ) => void ];

/**
 * Hook for toggling boolean state.
 *
 * @param initialValue - Initial toggle state
 */
const useToggle = ( initialValue = false ): UseToggleReturn => {
    const [ value, setValue ] = useState( initialValue );

    const toggle = useCallback( () => {
        setValue( ( prev ) => ! prev );
    }, [] );

    const set = useCallback( ( newValue: boolean ) => {
        setValue( newValue );
    }, [] );

    return [ value, toggle, set ];
};

export default useToggle;

