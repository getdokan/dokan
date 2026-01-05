import { useCallback, useState } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * PasswordField Component
 *
 * A generic password input field for settings with show/hide toggle.
 */
const PasswordField = ( { element, onValueChange }: FieldProps ) => {
    const [ showPassword, setShowPassword ] = useState( false );

    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLInputElement > ) => {
            onValueChange?.( {
                ...element,
                value: e.target.value,
            } );
        },
        [ element, onValueChange ]
    );

    if ( ! element.display ) {
        return null;
    }

    const hasLabel = Boolean( element.title );
    const value =
        ( element.value as string ) ?? ( element.default as string ) ?? '';

    return (
        <div
            className={ `grid grid-cols-12 gap-2 justify-between w-full p-4 ${
                element.css_class || ''
            }` }
        >
            { hasLabel && (
                <div className="sm:col-span-8 col-span-12">
                    <FieldLabel
                        title={ element.title }
                        description={ element.description }
                        tooltip={ element.helper_text }
                        imageUrl={ element.image_url }
                        htmlFor={ element.id }
                    />
                </div>
            ) }
            <div
                className={
                    hasLabel ? 'sm:col-span-4 col-span-12' : 'col-span-12'
                }
            >
                <div className="relative">
                    <input
                        id={ element.id }
                        type={ showPassword ? 'text' : 'password' }
                        value={ value }
                        onChange={ handleChange }
                        placeholder={ element.placeholder as string }
                        disabled={ element.disabled }
                        readOnly={ element.readonly }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        onClick={ () => setShowPassword( ! showPassword ) }
                    >
                        { showPassword ? (
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
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
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
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
                </div>
            </div>
        </div>
    );
};

export default PasswordField;
