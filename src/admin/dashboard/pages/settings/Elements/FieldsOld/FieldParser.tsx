import { SettingsProps } from '../../types';
import { applyFilters } from '@wordpress/hooks';
import Text from './Text';
import Select from './Select';
import Switch from './Switch';
import Password from './Password';
import Email from './Email';
import Number from './Number';
import CheckboxGroup from './CheckboxGroup';
import RadioCapsule from './RadioCapsule';
import TextArea from './TextArea';

const FieldParser = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ) => {
    if ( ! element.display ) {
        return null;
    }

    switch ( element.variant ) {
        case 'text':
            return (
                <Text
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'select':
            return (
                <Select
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'switch':
            return (
                <Switch
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'password':
            return (
                <Password
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'email':
            return (
                <Email
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'number':
            return (
                <Number
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'checkbox_group':
            return (
                <CheckboxGroup
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'radio_capsule':
            return (
                <RadioCapsule
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'textarea':
            return (
                <TextArea
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        default:
            return applyFilters(
                'dokan_admin_settings_default_field_parser',
                <Text
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />,
                element,
                getSetting,
                onValueChange
            );
    }
};

export default FieldParser;
