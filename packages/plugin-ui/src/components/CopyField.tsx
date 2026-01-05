import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { BaseFieldProps } from '../types';

export interface CopyFieldProps extends BaseFieldProps {
    /**
     * Success message after copy
     */
    successMessage?: string;

    /**
     * Duration to show success state (ms)
     */
    successDuration?: number;
}

/**
 * CopyField Component
 *
 * A read-only text field with copy button.
 */
const CopyField = ( {
    id,
    value,
    placeholder,
    disabled = false,
    className = '',
    ariaLabel,
    successMessage,
    successDuration = 2000,
}: CopyFieldProps ) => {
    const [ copied, setCopied ] = useState( false );

    const handleCopy = useCallback( async () => {
        if ( ! value || disabled ) return;

        try {
            await navigator.clipboard.writeText( String( value ) );
            setCopied( true );
            setTimeout( () => setCopied( false ), successDuration );
        } catch ( err ) {
            // Fallback for older browsers
            const textArea = document.createElement( 'textarea' );
            textArea.value = String( value );
            document.body.appendChild( textArea );
            textArea.select();
            document.execCommand( 'copy' );
            document.body.removeChild( textArea );
            setCopied( true );
            setTimeout( () => setCopied( false ), successDuration );
        }
    }, [ value, disabled, successDuration ] );

    return (
        <div className={ `relative flex ${ className }` }>
            <input
                id={ id }
                type="text"
                value={ value as string }
                placeholder={ placeholder }
                readOnly
                disabled={ disabled }
                aria-label={ ariaLabel }
                className="block w-full rounded-l-md border-gray-300 shadow-sm bg-gray-50 sm:text-sm disabled:opacity-50"
            />
            <button
                type="button"
                onClick={ handleCopy }
                disabled={ disabled || ! value }
                className={ `
                    inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 
                    text-sm font-medium rounded-r-md
                    ${ copied 
                        ? 'bg-green-50 text-green-600 border-green-300' 
                        : 'bg-white text-gray-700 hover:bg-gray-50' 
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                `.trim() }
            >
                { copied ? (
                    <>
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        { successMessage || __( 'Copied!', 'wedevs-plugin-ui' ) }
                    </>
                ) : (
                    <>
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                        { __( 'Copy', 'wedevs-plugin-ui' ) }
                    </>
                ) }
            </button>
        </div>
    );
};

export default CopyField;

