import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * SwitchField Component
 *
 * Renders a toggle switch field.
 */
const SwitchField = ( { element, onValueChange }: FieldProps ) => {
    const enableState = element.enable_state || { label: 'On', value: 'on' };
    const disableState = element.disable_state || { label: 'Off', value: 'off' };

    const isEnabled = element.value === enableState.value ||
        element.value === true ||
        element.value === '1' ||
        element.value === 1;

    const handleChange = useCallback( () => {
        onValueChange?.( {
            ...element,
            value: isEnabled ? disableState.value : enableState.value,
        } );
    }, [ element, onValueChange, isEnabled, enableState, disableState ] );

    const hasLabel = Boolean( element.title );

    return (
        <div className={ `grid grid-cols-12 gap-2 justify-between w-full p-4 ${ element.css_class || '' }` }>
            { hasLabel && (
                <div className="sm:col-span-8 col-span-12">
                    <FieldLabel
                        title={ element.title }
                        description={ element.description }
                        tooltip={ element.tooltip }
                    />
                </div>
            ) }
            <div className={ hasLabel ? 'sm:col-span-4 col-span-12 flex items-center' : 'col-span-12' }>
                <button
                    type="button"
                    role="switch"
                    aria-checked={ isEnabled }
                    disabled={ element.disabled }
                    onClick={ handleChange }
                    className={ `relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                    }` }
                >
                    <span
                        aria-hidden="true"
                        className={ `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }` }
                    />
                </button>
                <span className="ml-3 text-sm text-gray-600">
                    { isEnabled ? enableState.label : disableState.label }
                </span>
            </div>
        </div>
    );
};

export default SwitchField;

