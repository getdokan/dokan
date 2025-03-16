import { useState } from '@wordpress/element';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { SettingsProps } from '../../StepSettings';

const ToggleSwitchField = ( { element, onValueChange }: SettingsProps ) => {
    // Handle toggle change
    const handleChange = ( checked ) => {
        setIsEnabled( checked );

        const { value } = element;
        onValueChange( {
            ...element,
            value: checked,
        } );
    };

    // Initialize state with enabled prop or defaultValue
    const { default: defaultValue } = element;
    const [ isEnabled, setIsEnabled ] = useState( Boolean( defaultValue ) );
    return (
        <div className=" flex justify-between items-center p-4 w-full ">
            <div className="flex-col flex gap-1">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className=" text-sm font-normal text-[#828282]">
                    { element?.description }
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
                name={ element?.id }
                value={ isEnabled ? '1' : '0' }
            />
        </div>
    );
};

export default ToggleSwitchField;
