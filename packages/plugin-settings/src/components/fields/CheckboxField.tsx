import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';

/**
 * CheckboxField Component
 *
 * Renders a checkbox input field.
 */
const CheckboxField = ( { element, onValueChange }: FieldProps ) => {
    const isChecked = Boolean( element.value ) ||
        element.value === 'on' ||
        element.value === '1' ||
        element.value === 1;

    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLInputElement > ) => {
            onValueChange?.( {
                ...element,
                value: e.target.checked,
            } );
        },
        [ element, onValueChange ]
    );

    return (
        <div className={ `flex items-start p-4 ${ element.css_class || '' }` }>
            <div className="flex items-center h-5">
                <input
                    id={ element.id }
                    type="checkbox"
                    checked={ isChecked }
                    onChange={ handleChange }
                    disabled={ element.disabled }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            <div className="ml-3">
                { element.title && (
                    <label
                        htmlFor={ element.id }
                        className="text-sm font-medium text-gray-700"
                    >
                        { element.title }
                    </label>
                ) }
                { element.description && (
                    <p className="text-sm text-gray-500">{ element.description }</p>
                ) }
            </div>
        </div>
    );
};

export default CheckboxField;

