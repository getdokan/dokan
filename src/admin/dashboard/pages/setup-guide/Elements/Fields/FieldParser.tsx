import Text from './Text';
import Password from './Password';
import Tel from './Tel';
import { SettingsProps } from '../../StepSettings';
import RecipientSelector from './RecipientSelector';
import RadioButton from './RadioButton';
import ToggleSwitchField from './ToggleSwitchField';
import CurrencyInput from './CurrencyInput';
import Select from './Select';

const FieldParser = ( { element, onValueChange }: SettingsProps ) => {
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
        case 'recipient_selector':
            return (
                <RecipientSelector
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );
        case 'radio_button':
            return (
                <RadioButton
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                />
            );
        case 'radio':
            return (
                <ToggleSwitchField
                    element={ element }
                    key={ element.hook_key }
                    onValueChange={ onValueChange }
                />
            );

        case 'currency':
            return (
                <CurrencyInput
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
