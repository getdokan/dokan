import React from '@wordpress/element';
import { SettingsProps } from '../../types';
import { DokanFieldLabel, DokanSwitch } from '../../../../../../components/fields';

const Switch = ( { element, onValueChange }: SettingsProps ) => {
    if ( ! element.display ) {
        return <></>;
    }

    const handleChange = ( checked: boolean ) => {
        const value = checked
            ? element.enable_state?.value
            : element.disable_state?.value;
        onValueChange( {
            ...element,
            value,
        } );
    };

    return (
        <div className="flex justify-between p-4" id={ element.hook_key }>
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <div className="flex w-[11rem]">
                <DokanSwitch
                    checked={ element.value === element.enable_state?.value }
                    onChange={ handleChange }
                    label={ element.title }
                    disabled={ element.disabled }
                />
            </div>
        </div>
    );
};

export default Switch;
