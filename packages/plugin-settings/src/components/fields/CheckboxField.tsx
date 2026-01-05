import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * CheckboxField Component
 *
 * A generic single checkbox field for settings.
 */
const CheckboxField = ( { element, onValueChange }: FieldProps ) => {
    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLInputElement > ) => {
            onValueChange?.( {
                ...element,
                value: e.target.checked,
            } );
        },
        [ element, onValueChange ]
    );

    if ( ! element.display ) {
        return null;
    }

    const isChecked = Boolean( element.value ?? element.default );

    return (
        <div
            className={ `flex items-start gap-3 w-full p-4 ${
                element.css_class || ''
            }` }
        >
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
            <div className="flex-1">
                { element.title && (
                    <label
                        htmlFor={ element.id }
                        className="font-medium text-gray-700 cursor-pointer"
                    >
                        { element.title }
                    </label>
                ) }
                { element.description && (
                    <p className="text-sm text-gray-500 mt-1">
                        { element.description }
                    </p>
                ) }
            </div>
        </div>
    );
};

export default CheckboxField;
