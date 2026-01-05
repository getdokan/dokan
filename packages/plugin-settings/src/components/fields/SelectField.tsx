import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * SelectField Component
 *
 * Renders a select dropdown field.
 */
const SelectField = ( { element, onValueChange }: FieldProps ) => {
    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLSelectElement > ) => {
            let newValue: string | string[];

            if ( element.multiple ) {
                newValue = Array.from( e.target.selectedOptions, ( option ) => option.value );
            } else {
                newValue = e.target.value;
            }

            onValueChange?.( {
                ...element,
                value: newValue,
            } );
        },
        [ element, onValueChange ]
    );

    const hasLabel = Boolean( element.title );
    const value = element.value ?? element.default ?? '';
    const options = element.options || [];

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
                <select
                    id={ element.id }
                    value={ value as string | string[] }
                    onChange={ handleChange }
                    disabled={ element.disabled }
                    multiple={ element.multiple }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    { ! element.multiple && (
                        <option value="">
                            { element.placeholder || '— Select —' }
                        </option>
                    ) }
                    { options.map( ( option ) => (
                        <option key={ option.value } value={ option.value }>
                            { option.title }
                        </option>
                    ) ) }
                </select>
                { element.helper_text && (
                    <p className="mt-1 text-xs text-gray-500">{ element.helper_text }</p>
                ) }
            </div>
        </div>
    );
};

export default SelectField;

