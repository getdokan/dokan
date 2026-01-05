import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * SwitchField Component
 *
 * A generic toggle/switch field for settings.
 */
const SwitchField = ( { element, onValueChange }: FieldProps ) => {
    const enableValue = element.enable_state?.value ?? 'on';
    const disableValue = element.disable_state?.value ?? 'off';

    const isChecked = element.value === enableValue;

    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLInputElement > ) => {
            onValueChange?.( {
                ...element,
                value: e.target.checked ? enableValue : disableValue,
            } );
        },
        [ element, onValueChange, enableValue, disableValue ]
    );

    if ( ! element.display ) {
        return null;
    }

    const hasLabel = Boolean( element.title );

    return (
        <div
            className={ `grid grid-cols-12 gap-2 justify-between items-center w-full p-4 ${
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
                    hasLabel
                        ? 'sm:col-span-4 col-span-12 flex justify-end'
                        : 'col-span-12'
                }
            >
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        id={ element.id }
                        type="checkbox"
                        checked={ isChecked }
                        onChange={ handleChange }
                        disabled={ element.disabled }
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    { element.enable_state?.label && (
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            { isChecked
                                ? element.enable_state.label
                                : element.disable_state?.label }
                        </span>
                    ) }
                </label>
            </div>
        </div>
    );
};

export default SwitchField;
