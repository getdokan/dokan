import { useEffect, useState } from '@wordpress/element';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';

const ToggleSwitchField = ( {
    enabled,
    onChange,
    title,
    description,
    name = 'toggle_switch',
    default: defaultValue = false,
} ) => {
    // Initialize state with enabled prop or defaultValue
    const [ isEnabled, setIsEnabled ] = useState(
        typeof enabled !== 'undefined' ? enabled : defaultValue
    );

    // Update local state when enabled prop changes
    useEffect( () => {
        if ( typeof enabled !== 'undefined' ) {
            setIsEnabled( enabled );
        }
    }, [ enabled ] );

    // Handle toggle change
    const handleChange = ( checked ) => {
        setIsEnabled( checked );
        if ( onChange ) {
            onChange( checked );
        }
    };

    return (
        <div className="border border-[#E9E9E9] flex justify-between items-center p-4 w-full rounded-md">
            <div className="flex flex-col">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282] mb-2">
                    { description }
                </p>
            </div>
            <ToggleSwitch
                checked={ isEnabled }
                onChange={ handleChange }
                label={
                    isEnabled
                        ? __( 'Enabled', 'dokan-lite' )
                        : __( 'Disabled', 'dokan-lite' )
                }
                color="primary"
            />

            { /* Hidden input for form submission */ }
            <input
                type="hidden"
                name={ name }
                value={ isEnabled ? '1' : '0' }
            />
        </div>
    );
};

export default ToggleSwitchField;
