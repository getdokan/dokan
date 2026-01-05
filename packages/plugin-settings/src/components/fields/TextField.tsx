import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * TextField Component
 *
 * Renders a text input field.
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

    const hasLabel = Boolean( element.title );
    const value = ( element.value as string ) ?? ( element.default as string ) ?? '';

    return (
        <div className={ `grid grid-cols-12 gap-2 justify-between w-full p-4 ${ element.css_class || '' }` }>
            { hasLabel && (
                <div className="sm:col-span-8 col-span-12">
                    <FieldLabel
                        title={ element.title }
                        description={ element.description }
                        tooltip={ element.tooltip }
                        htmlFor={ element.id }
                    />
                </div>
            ) }
            <div className={ hasLabel ? 'sm:col-span-4 col-span-12' : 'col-span-12' }>
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
                { element.helper_text && (
                    <p className="mt-1 text-xs text-gray-500">{ element.helper_text }</p>
                ) }
            </div>
        </div>
    );
};

export default TextField;

