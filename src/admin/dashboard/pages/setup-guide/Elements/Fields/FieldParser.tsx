import Text from './Text';
import Select from './Select';
import Password from './Password';
import Tel from './Tel';
import { SettingsProps } from '../../StepSettings';

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
        case 'checkbox':
        case 'color':
        case 'date':
        case 'datetime-local':
        case 'email':
        case 'file':
        case 'hidden':
        case 'image':
        case 'month':
        case 'radio':
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
