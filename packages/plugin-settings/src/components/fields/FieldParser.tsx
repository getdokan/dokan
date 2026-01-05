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

interface ExtendedFieldProps extends FieldProps {
    /**
     * Filter prefix for WordPress hooks.
     */
    filterPrefix?: string;
}

/**
 * FieldParser Component
 *
 * Parses and renders the appropriate field component based on variant.
 */
const FieldParser = ( {
    element,
    onValueChange,
    filterPrefix = 'plugin_settings',
}: ExtendedFieldProps ) => {
    if ( ! element.display ) {
        return null;
    }

    const variant = element.variant || 'text';

    // Check for custom registered field first
    const CustomField = getField( variant );
    if ( CustomField ) {
        const rendered = (
            <CustomField
                key={ element.hook_key }
                element={ element }
                onValueChange={ onValueChange }
            />
        );

        // Apply filter for custom fields
        return applyFilters(
            `${ filterPrefix }_${ variant }_field_parser`,
            rendered,
            element
        ) as JSX.Element;
    }

    // Built-in field types
    switch ( variant ) {
        case 'text':
            return applyFilters(
                `${ filterPrefix }_text_field`,
                <TextField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'number':
            return applyFilters(
                `${ filterPrefix }_number_field`,
                <NumberField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'select':
            return applyFilters(
                `${ filterPrefix }_select_field`,
                <SelectField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'switch':
            return applyFilters(
                `${ filterPrefix }_switch_field`,
                <SwitchField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'checkbox':
            return applyFilters(
                `${ filterPrefix }_checkbox_field`,
                <CheckboxField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'radio':
            return applyFilters(
                `${ filterPrefix }_radio_field`,
                <RadioField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'textarea':
            return applyFilters(
                `${ filterPrefix }_textarea_field`,
                <TextAreaField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />,
                element
            ) as JSX.Element;

        case 'password':
            return applyFilters(
                `${ filterPrefix }_password_field`,
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
                `${ filterPrefix }_default_field`,
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

