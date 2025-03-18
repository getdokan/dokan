import { useState } from '@wordpress/element';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { SettingsProps } from '../../StepSettings';

const Switcher = ({ element, onValueChange }: SettingsProps ) => {
    if ( ! element.display ) {
        return <></>;
    }

    const handleChange = ( checked ) => {
        setIsEnabled( checked );

        onValueChange( {
            ...element,
            value: checked,
        } );
    };

    // Initialize state with enabled prop or defaultValue
    const { default: defaultValue } = element;
    const [ isEnabled, setIsEnabled ] = useState( Boolean( defaultValue ) );
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
                label={
                    isEnabled
                        ? __( 'Enabled', 'dokan-lite' )
                        : __( 'Disabled', 'dokan-lite' )
                }
            />
        </div>
    );
};

export default Switcher;
