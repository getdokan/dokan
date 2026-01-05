import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * TextField Component
 *
 * A generic text input field for settings.
 */
const TextField = ( { element, onValueChange }: FieldProps ) => {
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
                <div className="flex items-center gap-2">
                    { element.prefix && (
                        <span className="text-gray-500 text-sm">
                            { element.prefix }
                        </span>
                    ) }
                    <input
                        id={ element.id }
                        type="text"
                        value={ value }
                        onChange={ handleChange }
                        placeholder={ element.placeholder as string }
                        disabled={ element.disabled }
                        readOnly={ element.readonly }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    { element.suffix && (
                        <span className="text-gray-500 text-sm">
                            { element.suffix }
                        </span>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default TextField;
