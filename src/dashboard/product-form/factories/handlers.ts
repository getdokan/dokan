import AsyncSelectEdit from '../components/AsyncSelectEdit';
import AttributeVariationEdit from '../components/AttributeVariationEdit';
import DateTimePickerEdit from '../components/DateTimePickerEdit';
import FeatureImage from '../components/FeatureImage';
import FileUploadEdit from '../components/FileUploadEdit';
import GalleryImages from '../components/GalleryImages';
import PriceEdit from '../components/PriceEdit';
import RichTextEdit from '../components/RichTextEdit';
import SelectEdit from '../components/SelectEdit';
import { FieldConfig, FieldHandler } from '../types';

/**
 * Handler for text fields using a Rich Text Editor.
 *
 * @return Configuration object with type 'text' and RichTextEdit component.
 */
export const editorFieldHandler: FieldHandler = () => ( {
    type: 'text',
    Edit: RichTextEdit,
} );

/**
 * Handler for checkbox fields.
 *
 * @return Configuration object with type 'boolean' and 'checkbox' edit type.
 */
export const checkboxHandler: FieldHandler = () => ( {
    type: 'boolean',
    Edit: 'checkbox',
} );

/**
 * Handler for radio button fields.
 *
 * @return Configuration object with type 'text' and 'radio' edit type.
 */
export const radioHandler: FieldHandler = () => ( {
    type: 'text',
    Edit: 'radio',
} );

/**
 * Handler for numeric fields.
 *
 * @return Configuration object with type 'integer'.
 */
export const numberHandler: FieldHandler = () => ( {
    type: 'integer',
} );

/**
 * Handler for date fields.
 *
 * @return Configuration object with type 'datetime' and DateTimePickerEdit component.
 */
export const dateHandler: FieldHandler = () => ( {
    type: 'datetime',
    Edit: DateTimePickerEdit,
} );

/**
 * Handler for select/dropdown fields.
 * Handles normal select options and special cases like product categories.
 */
export const selectHandler: FieldHandler = ( field ) => {
    const config = {
        type: 'number',
        Edit: SelectEdit,
        multiple: false,
    };

    if ( Array.isArray( field?.value ) ) {
        config.type = 'array';
        config.multiple = true;
    }
    return config;
};

export const asyncSelectHandler: FieldHandler = ( field ) => {
    const config = {
        type: 'number',
        Edit: AsyncSelectEdit,
        multiple: false,
    };

    if ( Array.isArray( field?.value ) ) {
        config.type = 'array';
        config.multiple = true;
    }
    return config;
};

/**
 * Handler for select/dropdown fields.
 * Handles normal select options and special cases like product categories.
 *
 * @return Configuration object including type and Edit component.
 */
export const multiSelectHandler: FieldHandler = () => {
    const config: any = {
        type: 'array',
        Edit: SelectEdit,
        multiple: true,
    };
    return config;
};

/**
 * Handler for single image upload fields.
 *
 * @return Configuration object with type 'integer' and FeatureImage component.
 */
export const imageHandler: FieldHandler = () => ( {
    type: 'integer',
    Edit: FeatureImage,
} );

/**
 * Handler for downloadable fields.
 *
 * @return Configuration object with type 'integer' and FileUploadEdit component.
 */
export const fileHandler: FieldHandler = () => ( {
    type: 'integer',
    Edit: FileUploadEdit,
} );

/**
 * Handler for attributes fields.
 *
 * @return Configuration object with type 'array' and AttributeVariationEdit component.
 */
export const attributeHandler: FieldHandler = () => ( {
    type: 'array',
    Edit: AttributeVariationEdit,
} );

/**
 * Handler for image gallery fields.
 *
 * @return Configuration object with type 'array' and GalleryImages component.
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
 * @return Configuration object with type 'text' and optionally TextWithAddon component.
 */
export const defaultHandler: FieldHandler = ( field ) => {
    const config: FieldConfig = {
        type: 'text',
    };
    if ( field?.id?.includes( 'price' ) ) {
        config.Edit = PriceEdit;
        config.type = 'number';
    }
    return config;
};
