import AsyncSelectEdit from '../components/AsyncSelectEdit';
import AttributeVariationEdit from '../components/AttributeVariationEdit';
import DateTimePickerEdit from '../components/DateTimePickerEdit';
import FeatureImage from '../components/FeatureImage';
import FileUploadEdit from '../components/FileUploadEdit';
import GalleryImages from '../components/GalleryImages';
import PriceEdit from '../components/PriceEdit';
import RichTextEdit from '../components/RichTextEdit';
import SelectEdit from '../components/SelectEdit';
import { FieldConfig, FieldHandler, FormField } from '../types';

/**
 * Helper function to normalize options into an array of label/value objects.
 * Handles both array and object formats for options.
 *
 * @param {FormField} field The options to process.
 *
 * @return {Array} Array of options with label and value.
 */
export const getElementsFromOptions = ( field?: FormField ) => {
    const { options } = field || {};
    if ( ! options ) {
        return [];
    }

    let normalizedOptions = [];
    if ( Array.isArray( options ) ) {
        normalizedOptions = [ ...options ]; // Clone to prevent mutation of the original array
    } else {
        normalizedOptions = Object.entries( options ).map(
            ( [ value, label ] ) => ( {
                label,
                value,
            } )
        );
    }
    return normalizedOptions;
};

/**
 * Handler for text fields using a Rich Text Editor.
 *
 * @return {Object} Configuration object with type 'text' and RichTextEdit component.
 */
export const textFieldHandler: FieldHandler = () => ( {
    type: 'text',
    Edit: RichTextEdit,
} );

/**
 * Handler for checkbox fields.
 *
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
export const radioHandler: FieldHandler = ( field ) => ( {
    type: 'text',
    elements: getElementsFromOptions( field ),
    Edit: 'radio',
} );

/**
 * Handler for numeric fields.
 *
 * @return {Object} Configuration object with type 'integer'.
 */
export const numberHandler: FieldHandler = () => ( {
    type: 'integer',
} );

/**
 * Handler for date fields.
 *
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
        elements: getElementsFromOptions( field ),
        Edit: SelectEdit,
        multiple: false,
    };

    if ( Array.isArray( field?.value ) ) {
        config.type = 'array';
        config.multiple = true;
    }

    // async select fields
    const asyncSelectFields = [ 'upsell_ids', 'cross_sell_ids', 'children' ];
    if ( asyncSelectFields.includes( field!.id ) ) {
        config.Edit = AsyncSelectEdit;
    }
    return config;
};

/**
 * Handler for select/dropdown fields.
 * Handles normal select options and special cases like product categories.
 *
 * @param {Object} [field] The field configuration.
 * @return {Object} Configuration object including type, elements, and Edit component.
 */
export const multiSelectHandler: FieldHandler = ( field ) => {
    const config: any = {
        type: 'array',
        elements: getElementsFromOptions( field ),
        Edit: SelectEdit,
        multiple: true,
    };
    return config;
};

/**
 * Handler for single image upload fields.
 *
 * @return {Object} Configuration object with type 'integer' and FeatureImage component.
 */
export const imageHandler: FieldHandler = () => ( {
    type: 'integer',
    Edit: FeatureImage,
} );

/**
 * Handler for downloadable fields.
 *
 * @return {Object} Configuration object with type 'integer' and FileUploadEdit component.
 */
export const downloadableHandler: FieldHandler = () => ( {
    type: 'integer',
    Edit: FileUploadEdit,
} );

/**
 * Handler for attributes fields.
 *
 * @param {Object} field The field configuration.
 * @return {Object} Configuration object with type 'array' and AttributeVariationEdit component.
 */
export const attributeHandler: FieldHandler = ( field ) => ( {
    type: 'array',
    Edit: AttributeVariationEdit,
    elements: getElementsFromOptions( field ),
} );

/**
 * Handler for image gallery fields.
 *
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
    const config: FieldConfig = {
        type: 'text',
    };
    if ( field?.name?.includes( 'price' ) ) {
        config.Edit = PriceEdit;
        config.type = 'number';
    }
    return config;
};
