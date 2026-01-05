import { applyFilters } from '@wordpress/hooks';
import type { FieldProps } from '../../types';
import { getField } from './FieldRegistry';
import TextField from './TextField';
import NumberField from './NumberField';
import SelectField from './SelectField';
import SwitchField from './SwitchField';
import CheckboxField from './CheckboxField';
import RadioField from './RadioField';
import TextAreaField from './TextAreaField';
import PasswordField from './PasswordField';

/**
 * FieldParser Component
 *
 * Parses and renders the appropriate field component based on variant.
 */
const FieldParser = ( { element, onValueChange }: FieldProps ) => {
    if ( ! element.display ) {
        return null;
    }

    const variant = element.variant || 'text';

    // Check for custom registered field first
    const CustomField = getField( variant );
    if ( CustomField ) {
        return (
            <CustomField
                key={ element.hook_key }
                element={ element }
                onValueChange={ onValueChange }
            />
        );
    }

    // Built-in field types
    switch ( variant ) {
        case 'text':
            return applyFilters(
                'plugin_settings_text_field',
                <TextField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'number':
            return applyFilters(
                'plugin_settings_number_field',
                <NumberField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'select':
            return applyFilters(
                'plugin_settings_select_field',
                <SelectField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'switch':
            return applyFilters(
                'plugin_settings_switch_field',
                <SwitchField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'checkbox':
            return applyFilters(
                'plugin_settings_checkbox_field',
                <CheckboxField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'radio':
            return applyFilters(
                'plugin_settings_radio_field',
                <RadioField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'textarea':
            return applyFilters(
                'plugin_settings_textarea_field',
                <TextAreaField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'password':
            return applyFilters(
                'plugin_settings_password_field',
                <PasswordField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        default:
            // Allow filtering for unknown field types
            return applyFilters(
                'plugin_settings_default_field',
                <TextField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;
    }
};

export default FieldParser;

