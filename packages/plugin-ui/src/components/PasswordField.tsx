import { useCallback, useState, forwardRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { BaseFieldProps } from '../types';

export interface PasswordFieldProps extends BaseFieldProps {
    /**
     * Show visibility toggle
     */
    showToggle?: boolean;

    /**
     * Auto-complete attribute
     */
    autoComplete?: string;
}

/**
 * PasswordField Component
 *
 * A password input with visibility toggle.
 */
const PasswordField = forwardRef< HTMLInputElement, PasswordFieldProps >(
    (
        {
            id,
            value,
            defaultValue,
            onChange,
            placeholder,
            disabled = false,
            readOnly = false,
            className = '',
            ariaLabel,
            showToggle = true,
            autoComplete = 'current-password',
        },
        ref
    ) => {
        const [ isVisible, setIsVisible ] = useState( false );

        const handleChange = useCallback(
            ( e: React.ChangeEvent< HTMLInputElement > ) => {
                onChange?.( e.target.value );
            },
            [ onChange ]
        );

        const toggleVisibility = useCallback( () => {
            setIsVisible( ( prev ) => ! prev );
        }, [] );

        return (
            <div className="relative">
                <input
                    ref={ ref }
                    id={ id }
                    type={ isVisible ? 'text' : 'password' }
                    value={ value as string }
                    defaultValue={ defaultValue as string }
                    onChange={ handleChange }
                    placeholder={ placeholder }
                    disabled={ disabled }
                    readOnly={ readOnly }
                    autoComplete={ autoComplete }
                    aria-label={ ariaLabel }
                    className={ `
                        block w-full rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        read-only:bg-gray-50
                        ${ showToggle ? 'pr-10' : '' }
                        ${ className }
                    `.trim() }
                />
                { showToggle && (
                    <button
                        type="button"
                        onClick={ toggleVisibility }
                        disabled={ disabled }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        aria-label={
                            isVisible
                                ? __( 'Hide password', 'wedevs-plugin-ui' )
                                : __( 'Show password', 'wedevs-plugin-ui' )
                        }
                    >
                        { isVisible ? (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={ 2 }
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={ 2 }
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={ 2 }
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        ) }
                    </button>
                ) }
            </div>
        );
    }
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;
