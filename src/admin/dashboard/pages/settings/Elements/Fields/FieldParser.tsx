import { SettingsProps } from '../../types';
import { applyFilters } from '@wordpress/hooks';
import Text from './Text';
import Select from './Select';
import Password from './Password';
import Email from './Email';
import Number from './Number';
import TextArea from './TextArea';
import RadioBox from './RadioBox';
import Currency from './Currency';
import CategoryBasedCommission from './Commission/CategoryBasedCommission';
import CombineInput from './Commission/CombineInput';
import Tel from './Tel';
import DokanSwitch from './DokanSwitch';
import DokanRadioCapsule from './DokanRadioCapsule';
import DokanMultiCheck from './DokanMultiCheck';

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
                <DokanSwitch
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
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
                <DokanMultiCheck
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
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

        case 'radio_capsule':
            return (
                <DokanRadioCapsule
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'radio_box':
            return (
                <RadioBox
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'currency':
            return (
                <Currency
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'multicheck':
            return (
                <DokanMultiCheck
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'category_based_commission':
            return (
                <CategoryBasedCommission
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'combine_input':
            return (
                <CombineInput
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'tel':
            return (
                <Tel
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'checkbox':
        case 'color':
        case 'date':
        case 'datetime-local':
        case 'file':
        case 'hidden':
        case 'image':
        case 'month':
        case 'range':
        case 'search':
        case 'time':
        case 'url':
        case 'week':
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
