import { useState } from '@wordpress/element';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import { SettingsProps } from '../../StepSettings';

const ToggleSwitchField = ( { element, onValueChange }: SettingsProps ) => {
    // Initialize state with enabled prop or defaultValue
    const { default: defaultValue } = element;
    const [ isEnabled, setIsEnabled ] = useState( Boolean( defaultValue ) );

    // Handle toggle change
    const handleChange = ( checked ) => {
        setIsEnabled( checked );

        onValueChange( {
            ...element,
            value: checked,
        } );
    };

    if ( ! element.display ) {
        return <></>;
    }
    return (
        <div
            id={ element.hook_key + '_div' }
            className=" flex justify-between flex-wrap items-center p-4 gap-y-4 w-full "
        >
            <div className="flex-col flex gap-1">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className=" text-sm font-normal text-[#828282]">
                    { element?.description }
                </p>
            </div>
            <ToggleSwitch checked={ isEnabled } onChange={ handleChange } />
        </div>
    );
};

export default ToggleSwitchField;
