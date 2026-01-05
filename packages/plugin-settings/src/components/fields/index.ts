/**
 * Field Components exports
 */

// Core field components
export { default as FieldParser } from './FieldParser';
export { default as FieldLabel } from './FieldLabel';

// Basic input fields
export { default as TextField } from './TextField';
export { default as NumberField } from './NumberField';
export { default as EmailField } from './EmailField';
export { default as TelField } from './TelField';
export { default as PasswordField } from './PasswordField';
export { default as TextAreaField } from './TextAreaField';

// Selection fields
export { default as SelectField } from './SelectField';
export { default as CheckboxField } from './CheckboxField';
export { default as RadioField } from './RadioField';
export { default as MultiCheckField } from './MultiCheckField';
export { default as SwitchField } from './SwitchField';

// Advanced fields
export { default as ColorPickerField } from './ColorPickerField';
export { default as InfoField } from './InfoField';
export { default as HtmlField } from './HtmlField';

// Field registry for custom fields
export { registerField, getField, getAllFields } from './FieldRegistry';
