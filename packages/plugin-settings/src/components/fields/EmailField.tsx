import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * EmailField Component
 *
 * A generic email input field for settings with validation.
 */
const EmailField = ( { element, onValueChange }: FieldProps ) => {
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
                <input
                    id={ element.id }
                    type="email"
                    value={ value }
                    onChange={ handleChange }
                    placeholder={
                        ( element.placeholder as string ) || 'email@example.com'
                    }
                    disabled={ element.disabled }
                    readOnly={ element.readonly }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );
};

export default EmailField;

