import CategoriesEdit from '../components/CategoriesEdit';
import DateTimePickerEdit from '../components/DateTimePickerEdit';
import FeatureImage from '../components/FeatureImage';
import GalleryImages from '../components/GalleryImages';
import RichTextEdit from '../components/RichTextEdit';
import TextWithAddon from '../components/TextWithAddon';
import { FieldHandler } from '../types';

/**
 * Helper function to normalize options into an array of label/value objects.
 * Handles both array and object formats for options.
 *
 * @param {any} options The options to process.
 *
 * @return {Array} Array of options with label and value.
 */
const getElementsFromOptions = ( options: any ) => {
    if ( ! options ) {
        return [];
    }

    if ( Array.isArray( options ) ) {
        return options;
    }

    return Object.entries( options ).map( ( [ value, label ] ) => ( {
        label,
        value,
    } ) );
};

/**
 * Handler for text fields using a Rich Text Editor.
 *
 * @param {Object} field The field configuration.
 * @return {Object} Configuration object with type 'text' and RichTextEdit component.
 */
export const textFieldHandler: FieldHandler = () => ( {
    type: 'text',
    Edit: RichTextEdit,
} );

/**
 * Handler for checkbox fields.
 *
 * @param {Object} field The field configuration.
 * @return {Object} Configuration object with type 'boolean' and 'checkbox' edit type.
 */
export const checkboxHandler: FieldHandler = () => ( {
    type: 'boolean',
    Edit: 'checkbox',
} );

/**
 * Handler for radio button fields.
 *
 * @param {Object} field The field configuration.
 * @return {Object} Configuration object with type 'text' and 'radio' edit type.
 */
export const radioHandler: FieldHandler = () => ( {
    type: 'text',
    Edit: 'radio',
} );

/**
 * Handler for numeric fields.
 *
 * @param {Object} field The field configuration.
 * @return {Object} Configuration object with type 'integer'.
 */
export const numberHandler: FieldHandler = () => ( {
    type: 'integer',
} );

/**
 * Handler for date fields.
 * @param {Object} field The field configuration.
 * @return {Object} Configuration object with type 'datetime' and DateTimePickerEdit component.
 */
export const dateHandler: FieldHandler = () => ( {
    type: 'datetime',
    Edit: DateTimePickerEdit,
} );

/**
 * Handler for select/dropdown fields.
 * Handles normal select options and special cases like product categories.
 *
 * @param {Object} [field] The field configuration.
 * @return {Object} Configuration object including type, elements, and Edit component.
 */
export const selectHandler: FieldHandler = ( field ) => {
    const config: any = {
        type: 'number',
        elements: getElementsFromOptions( field?.options ),
        Edit: 'select',
    };

    if ( Array.isArray( field?.value ) ) {
        config.type = 'array';
    }

    if ( field?.name === 'chosen_product_cat' ) {
        config.Edit = CategoriesEdit;
        config.type = 'array';
    }
    return config;
};

/**
 * Handler for single image upload fields.
 *
 * @param {Object} [field] The field configuration.
 * @return {Object} Configuration object with type 'integer' and FeatureImage component.
 */
export const imageHandler: FieldHandler = () => ( {
    type: 'integer',
    Edit: FeatureImage,
} );

/**
 * Handler for image gallery fields.
 *
 * @param {Object} [field] The field configuration.
 * @return {Object} Configuration object with type 'array' and GalleryImages component.
 */
export const galleryHandler: FieldHandler = () => ( {
    type: 'array',
    Edit: GalleryImages,
} );

/**
 * Default field handler.
 * Applies specific components if icons are present, otherwise defaults to text.
 *
 * @param {Object} [field] The field configuration.
 * @return {Object} Configuration object with type 'text' and optionally TextWithAddon component.
 */
export const defaultHandler: FieldHandler = ( field ) => {
    const config: any = {
        type: 'text',
    };
    if ( field?.left_icon || field?.right_icon ) {
        config.Edit = TextWithAddon;
    }
    return config;
};
