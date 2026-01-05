import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * MultiCheckField Component
 *
 * A generic multiple checkbox group field for settings.
 */
const MultiCheckField = ( { element, onValueChange }: FieldProps ) => {
    const currentValues = ( element.value as ( string | number )[] ) ||
        ( element.default as ( string | number )[] ) ||
        [];

    const handleChange = useCallback(
        ( optionValue: string | number, checked: boolean ) => {
            let newValues: ( string | number )[];

            if ( checked ) {
                newValues = [ ...currentValues, optionValue ];
            } else {
                newValues = currentValues.filter( ( v ) => v !== optionValue );
            }

            onValueChange?.( {
                ...element,
                value: newValues,
            } );
        },
        [ element, onValueChange, currentValues ]
    );

    if ( ! element.display ) {
        return null;
    }

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
                { element.options?.map( ( option ) => {
                    const isChecked = currentValues.includes( option.value );
                    const optionId = `${ element.id }-${ option.value }`;

                    return (
                        <label
                            key={ String( option.value ) }
                            htmlFor={ optionId }
                            className="flex items-start gap-3 cursor-pointer"
                        >
                            <div className="flex items-center h-5">
                                <input
                                    id={ optionId }
                                    type="checkbox"
                                    checked={ isChecked }
                                    onChange={ ( e ) =>
                                        handleChange(
                                            option.value,
                                            e.target.checked
                                        )
                                    }
                                    disabled={ element.disabled }
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
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
                    );
                } ) }
            </div>
        </div>
    );
};

export default MultiCheckField;

