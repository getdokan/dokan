import Text from './Text';
import Select from './Select';
import Password from './Password';
import Tel from './Tel';
import { SettingsElement } from '../../StepSettings';
import RecipientSelector from './RecipientSelector';
import { useState } from '@wordpress/element';
import RadioButton from './RadioButton';
import ToggleSwitchField from './ToggleSwitchField';
import CurrencyInput from './CurrencyInput';
import CheckboxGroup from './CheckboxGroup';

const FieldParser = ( { element }: { element: SettingsElement } ) => {
    // TODO: add support for custom input fields and custom hook.
    const [ value, setValue ] = useState( element.value || element.default );

    if ( ! element || ! element.type ) {
        return null;
    }

    const handleChange = ( newValue ) => {
        setValue( newValue );
        // You might want to dispatch this change to your state management system
    };
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
                    selectedValue={ value }
                    onChange={ handleChange }
                    title={ element.title }
                    description={ element.description }
                    options={ element.options }
                    name={ element.id }
                    default={ element.default }
                />
            );
        case 'radio_button':
            return (
                <RadioButton
                    title={ element.title }
                    description={ element.description }
                    selectedValue={ value }
                    onChange={ handleChange }
                    name={ element.id }
                    default={ element.default }
                />
            );
        case 'toggle_switch':
            return (
                <ToggleSwitchField
                    enabled={ value }
                    onChange={ handleChange }
                    title={ element.title }
                    description={ element.description }
                    name={ element.id }
                    default={ Boolean( element.default ) }
                />
            );
        case 'checkbox_group':
            return (
                <CheckboxGroup
                    key={ element.hook_key }
                    title={ element.title }
                    description={ element.description }
                    options={ element.options || [] }
                    defaultValue={ element.default || [] }
                    name={ element.id }
                    onChange={ handleChange }
                />
            );
        case 'currency_input':
            return (
                <CurrencyInput
                    key={ element.hook_key }
                    title={ element.title }
                    description={ element.description }
                    name={ element.id }
                    value={ value }
                    onChange={ handleChange }
                    currency={ element.currency || '$' }
                    placeholder={
                        String( element.placeholder ) || 'Enter amount'
                    }
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
