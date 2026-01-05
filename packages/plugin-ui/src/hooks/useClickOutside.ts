import { useEffect, useRef, useCallback } from '@wordpress/element';
import type { RefObject } from 'react';

/**
 * Hook for detecting clicks outside an element.
 *
 * @param callback - Function to call when clicking outside
 */
const useClickOutside = < T extends HTMLElement >(
    callback: () => void
): RefObject< T > => {
    const ref = useRef< T >( null );

    const handleClick = useCallback(
        ( event: MouseEvent ) => {
            if ( ref.current && ! ref.current.contains( event.target as Node ) ) {
                callback();
            }
        },
        [ callback ]
    );

    useEffect( () => {
        document.addEventListener( 'mousedown', handleClick );
        return () => {
            document.removeEventListener( 'mousedown', handleClick );
        };
    }, [ handleClick ] );

    return ref;
};

export default useClickOutside;

