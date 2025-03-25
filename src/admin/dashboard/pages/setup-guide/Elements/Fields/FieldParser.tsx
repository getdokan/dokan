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
import CategoryBasedCommission from "./commission/CategoryBasedCommission";
import CombineInput from "./Commission/CombineInput";

const FieldParser = ( { element, getSetting, onValueChange }: SettingsProps ) => {
    // TODO: add support for custom input fields and custom hook.

    switch ( element.variant ) {
        case 'text':
            return (
                <Text
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );
        case 'select':
            return (
                <Select
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
                />
            );
        case 'tel':
            return (
                <Tel
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
                />
            );
        case 'radio':
            return (
                <Radio
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                />
            );
        case 'currency':
            return (
                <Currency
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                />
            );
        case 'switch':
            return (
                <Switcher
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                />
            );
        case 'multicheck':
            return (
                <MultiCheck
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                />
            );
        case 'category_based_commission':
            return (
                <CategoryBasedCommission
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                />
            );
        case 'combine_input':
            return (
                <CombineInput
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
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
            return (
                <Text
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );
    }
};

export default FieldParser;
