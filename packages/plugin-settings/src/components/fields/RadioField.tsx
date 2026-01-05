import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * RadioField Component
 *
 * A generic radio button group field for settings.
 */
const RadioField = ( { element, onValueChange }: FieldProps ) => {
    const handleChange = useCallback(
        ( value: string | number ) => {
            onValueChange?.( {
                ...element,
                value,
            } );
        },
        [ element, onValueChange ]
    );

    if ( ! element.display ) {
        return null;
    }

    const currentValue = element.value ?? element.default;

    return (
        <div
            className={ `flex flex-col gap-4 w-full p-4 ${
                element.css_class || ''
            }` }
        >
            { ( element.title || element.description ) && (
                <FieldLabel
                    title={ element.title }
                    description={ element.description }
                    tooltip={ element.helper_text }
                    imageUrl={ element.image_url }
                />
            ) }
            <div className="flex flex-col gap-3">
                { element.options?.map( ( option ) => (
                    <label
                        key={ String( option.value ) }
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <input
                            type="radio"
                            name={ element.id }
                            value={ option.value }
                            checked={ currentValue === option.value }
                            onChange={ () => handleChange( option.value ) }
                            disabled={ element.disabled }
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-700">
                                { option.title }
                            </span>
                            { option.description && (
                                <p className="text-xs text-gray-500">
                                    { option.description }
                                </p>
                            ) }
                        </div>
                    </label>
                ) ) }
            </div>
        </div>
    );
};

export default RadioField;
