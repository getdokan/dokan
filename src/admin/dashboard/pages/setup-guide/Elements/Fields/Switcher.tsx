import { RawHTML } from '@wordpress/element';
import { useState } from '@wordpress/element';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import { SettingsProps } from '../../StepSettings';

const Switcher = ( { element, onValueChange }: SettingsProps ) => {
    const enableState = element?.enable_state;
    const disableState = element?.disable_state;

    const handleChange = ( checked ) => {
        setIsEnabled( checked );

        onValueChange( {
            ...element,
            value: checked ? enableState.value : disableState.value,
        } );
    };

    const initialEnabled = element?.value
        ? element?.value === enableState?.value
        : element?.default === enableState?.value;

    // Initialize state with enabled prop or defaultValue
    const [ isEnabled, setIsEnabled ] = useState( initialEnabled );

    if ( ! element.display ) {
        return <></>;
    }

    return (
        <div
            id={ element.hook_key + '_div' }
            className="grid grid-cols-12 p-4 gap-y-4 w-full @container/switcher"
        >
            <div className="col-span-12 @md/switcher:col-span-8 flex flex-col gap-1">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    <RawHTML>{element?.title}</RawHTML>
                </h2>
                <p className="text-sm font-normal text-[#828282]">
                    <RawHTML>{element?.description}</RawHTML>
                </p>
            </div>
            <div className="col-span-12 @md/switcher:col-span-4 flex items-center @md/switcher:justify-end">
                <ToggleSwitch
                    checked={ isEnabled }
                    onChange={ handleChange }
                    label={ isEnabled ? enableState.label : disableState.label }
                />
            </div>
        </div>
    );
};

export default Switcher;
