import { useState } from '@wordpress/element';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { SettingsProps } from '../../StepSettings';

const Switcher = ( { element, onValueChange }: SettingsProps ) => {
    const enableState = element?.enable_state
    const disableState = element?.disable_state

    const handleChange = ( checked ) => {
        setIsEnabled( checked );

        onValueChange( {
            ...element,
            value: checked ? enableState.value : disableState.value,
        } );
    };

    const initialEnabled = element?.value ? element?.value=== enableState?.value : element?.default === enableState?.value;

    // Initialize state with enabled prop or defaultValue
    const [ isEnabled, setIsEnabled ] = useState( initialEnabled )

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
            <ToggleSwitch
                checked={ isEnabled }
                onChange={ handleChange }
                label={ isEnabled ? enableState.label : disableState.label }
            />
        </div>
    );
};

export default Switcher;
