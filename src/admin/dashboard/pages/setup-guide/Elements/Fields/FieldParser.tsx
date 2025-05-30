import Text from './Text';
import Password from './Password';
import Tel from './Tel';
import { SettingsProps } from '../../StepSettings';
import RadioBox from './RadioBox';
import Radio from './Radio';
import Switcher from './Switcher';
import Currency from './Currency';
import Select from './Select';
import MultiCheck from './MultiCheck';
import CategoryBasedCommission from './Commission/CategoryBasedCommission';
import CombineInput from './Commission/CombineInput';
import { applyFilters } from '@wordpress/hooks';

const FieldParser = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ) => {
    // TODO: add support for custom input fields and custom hook.
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
        case 'password':
            return (
                <Password
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
        case 'radio_box':
            return (
                <RadioBox
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'radio':
            return (
                <Radio
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'currency':
            return (
                <Currency
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'switch':
            return (
                <Switcher
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'multicheck':
            return (
                <MultiCheck
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'category_based_commission':
            return (
                <CategoryBasedCommission
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'combine_input':
            return (
                <CombineInput
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'checkbox':
        case 'color':
        case 'date':
        case 'datetime-local':
        case 'email':
        case 'file':
        case 'hidden':
        case 'image':
        case 'month':
        case 'range':
        case 'search':
        case 'time':
        case 'url':
        case 'week':
        case 'number':
        default:
            return applyFilters(
                'dokan_admin_setup_guide_default_field_parser',
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
