import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * RadioField Component
 *
 * Renders a radio button group field.
 */
const RadioField = ( { element, onValueChange }: FieldProps ) => {
    const handleChange = useCallback(
        ( value: string | number ) => () => {
            onValueChange?.( {
                ...element,
                value,
            } );
        },
        [ element, onValueChange ]
    );

    const hasLabel = Boolean( element.title );
    const currentValue = element.value ?? element.default;
    const options = element.options || [];

    return (
        <div className={ `p-4 ${ element.css_class || '' }` }>
            { hasLabel && (
                <FieldLabel
                    title={ element.title }
                    description={ element.description }
                    tooltip={ element.tooltip }
                />
            ) }
            <div className="mt-2 space-y-2">
                { options.map( ( option ) => (
                    <div key={ option.value } className="flex items-center">
                        <input
                            id={ `${ element.id }-${ option.value }` }
                            type="radio"
                            name={ element.id }
                            value={ option.value }
                            checked={ currentValue === option.value }
                            onChange={ handleChange( option.value ) }
                            disabled={ element.disabled }
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <label
                            htmlFor={ `${ element.id }-${ option.value }` }
                            className="ml-3 block text-sm text-gray-700"
                        >
                            { option.title }
                            { option.description && (
                                <span className="block text-xs text-gray-500">
                                    { option.description }
                                </span>
                            ) }
                        </label>
                    </div>
                ) ) }
            </div>
        </div>
    );
};

export default RadioField;

