import { useState, useCallback } from '@wordpress/element';

interface UseClipboardReturn {
    copied: boolean;
    copy: ( text: string ) => Promise< void >;
    reset: () => void;
}

/**
 * Hook for copying text to clipboard.
 *
 * @param duration - How long to show "copied" state (ms)
 */
const useClipboard = ( duration = 2000 ): UseClipboardReturn => {
    const [ copied, setCopied ] = useState( false );

    const copy = useCallback(
        async ( text: string ) => {
            try {
                await navigator.clipboard.writeText( text );
                setCopied( true );
                setTimeout( () => setCopied( false ), duration );
            } catch ( err ) {
                // Fallback for older browsers
                const textArea = document.createElement( 'textarea' );
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild( textArea );
                textArea.select();
                document.execCommand( 'copy' );
                document.body.removeChild( textArea );
                setCopied( true );
                setTimeout( () => setCopied( false ), duration );
            }
        },
        [ duration ]
    );

    const reset = useCallback( () => {
        setCopied( false );
    }, [] );

    return { copied, copy, reset };
};

export default useClipboard;

