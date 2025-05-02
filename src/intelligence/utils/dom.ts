declare global {
    interface Window {
        tinymce: any;
    }
}

export const updateWordPressField = (
    content: string,
    field: string
): boolean => {
    try {
        let success = false;

        // Helper function to update an input/textarea element
        const updateInputField = (
            element: HTMLInputElement | HTMLTextAreaElement
        ) => {
            element.value = content;
            element.dispatchEvent( new Event( 'input', { bubbles: true } ) );
            element.dispatchEvent( new Event( 'change', { bubbles: true } ) );
            return true;
        };

        // Helper function to update TinyMCE editor
        const updateTinyMCEEditor = ( editorId: string ) => {
            if ( window.tinymce ) {
                const editor = window.tinymce.get( editorId );
                if ( editor ) {
                    editor.setContent( content );
                    editor.fire( 'change' );
                    editor.fire( 'input' );

                    // Also update underlying textarea
                    const textarea = document.getElementById(
                        editorId
                    ) as HTMLTextAreaElement;
                    if ( textarea ) {
                        updateInputField( textarea );
                    }
                    return true;
                }
            }
            return false;
        };

        // Find target element using various selectors
        const findTargetElement = ( fieldId: string ) => {
            // Try different selectors in order
            const selectors = [
                `input[name="${ fieldId }"]`, // By name attribute
                `#${ fieldId }`, // By ID
                `textarea[name="${ fieldId }"]`, // Textarea by name
                `[data-id="${ fieldId }"]`, // By data attribute
            ];

            for ( const selector of selectors ) {
                const element = document.querySelector( selector );
                if ( element ) {
                    return element;
                }
            }
            return null;
        };

        // Get the target element
        const targetElement = findTargetElement( field );

        if ( targetElement ) {
            // Check if it's a TinyMCE editor
            if ( targetElement.closest( '.wp-editor-wrap' ) !== null ) {
                // Try TinyMCE first
                success = updateTinyMCEEditor( field );

                // Fallback to regular textarea if TinyMCE fails
                if (
                    ! success &&
                    targetElement instanceof HTMLTextAreaElement
                ) {
                    success = updateInputField( targetElement );
                }
            }
            // Handle regular input/textarea
            else if (
                targetElement instanceof HTMLInputElement ||
                targetElement instanceof HTMLTextAreaElement
            ) {
                success = updateInputField( targetElement );
            }
        }

        return success;
    } catch ( error ) {
        return false;
    }
};
