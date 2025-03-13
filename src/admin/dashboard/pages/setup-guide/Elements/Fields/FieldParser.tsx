import Text from './Text';
import Select from './Select';
import Password from './Password';
import Tel from './Tel';
import { SettingsElement } from '../../StepSettings';
import RecipientSelector from './RecipientSelector';

const FieldParser = ( { element }: { element: SettingsElement } ) => {
    // TODO: add support for custom input fields and custom hook.
    switch ( element.variant ) {
        case 'text':
            return <Text key={ element.hook_key } element={ element } />;
        case 'select':
            return <Select key={ element.hook_key } element={ element } />;
        case 'password':
            return <Password key={ element.hook_key } element={ element } />;
        case 'tel':
            return <Tel key={ element.hook_key } element={ element } />;
        case 'recipient_selector':
            return (
                <RecipientSelector
                    key={ element.hook_key }
                    element={ element }
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
            return <Text key={ element.hook_key } element={ element } />;
    }
};

export default FieldParser;
