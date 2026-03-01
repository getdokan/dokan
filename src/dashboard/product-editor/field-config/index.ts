import { applyFilters } from '@wordpress/hooks';
import { FieldHandler, FormField, FieldConfig } from '../types';
import AsyncSelectEdit from '../components/AsyncSelectEdit';
import AttributesEdit from '../components/AttributesEdit';
import DateTimePickerEdit from '../components/DateTimePickerEdit';
import ImageEdit from '../components/ImageEdit';
import FileUploadEdit from '../components/FileUploadEdit';
import GalleryImages from '../components/GalleryImages';
import PriceEdit from '../components/PriceEdit';
import RichTextEdit from '../components/RichTextEdit';
import SelectEdit from '../components/SelectEdit';

/**
 * Handler for text fields using a Rich Text Editor.
 *
 * @return Configuration object with type 'text' and RichTextEdit component.
 */
const editorFieldHandler: FieldHandler = () => ( {
    Edit: RichTextEdit,
} );

/**
 * Handler for checkbox fields.
 *
 * @return Configuration object with type 'boolean' and 'checkbox' edit type.
 */
const checkboxHandler: FieldHandler = () => ( {
    type: 'boolean',
    Edit: 'checkbox',
} );

/**
 * Handler for radio button fields.
 *
 * @return Configuration object with type 'text' and 'radio' edit type.
 */
const radioHandler: FieldHandler = () => ( {
    Edit: 'radio',
} );

/**
 * Handler for numeric fields.
 *
 * @return Configuration object with type 'integer'.
 */
const numberHandler: FieldHandler = () => ( {
    type: 'integer',
} );

/**
 * Handler for date fields.
 *
 * @return Configuration object with type 'datetime' and DateTimePickerEdit component.
 */
const dateHandler: FieldHandler = () => ( {
    type: 'datetime',
    Edit: DateTimePickerEdit,
} );

/**
 * Handler for select/dropdown fields.
 * Handles normal select options and special cases like product categories.
 */
const selectHandler: FieldHandler = ( field ) => {
    const config: FieldConfig = {
        Edit: SelectEdit,
        multiple: false,
    };

    if ( Array.isArray( field?.value ) ) {
        config.multiple = true;
    }
    return config;
};

const asyncSelectHandler: FieldHandler = ( field ) => {
    const config: FieldConfig = {
        Edit: AsyncSelectEdit,
        multiple: false,
    };

    if ( Array.isArray( field?.value ) ) {
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
const multiSelectHandler: FieldHandler = () => {
    const config: FieldConfig = {
        Edit: SelectEdit,
        multiple: true,
    };
    return config;
};

/**
 * Handler for single image upload fields.
 *
 * @return Configuration object with type 'integer' and ImageEdit component.
 */
const imageHandler: FieldHandler = () => ( {
    Edit: ImageEdit,
} );

/**
 * Handler for downloadable fields.
 *
 * @return Configuration object with type 'integer' and FileUploadEdit component.
 */
const fileHandler: FieldHandler = () => ( {
    Edit: FileUploadEdit,
} );

/**
 * Handler for attributes fields.
 *
 * @return Configuration object with type 'array' and AttributesEdit component.
 */
const attributeHandler: FieldHandler = () => ( {
    Edit: AttributesEdit,
} );

/**
 * Handler for image gallery fields.
 *
 * @return Configuration object with type 'array' and GalleryImages component.
 */
const galleryHandler: FieldHandler = () => ( {
    Edit: GalleryImages,
} );

/**
 * Default field handler.
 * Applies specific components if icons are present, otherwise defaults to text.
 *
 * @param {Object} [field] The field configuration.
 * @return Configuration object with type 'text' and optionally TextWithAddon component.
 */
const defaultHandler: FieldHandler = ( field ) => {
    const config: FieldConfig = {};
    if ( field?.id.includes( 'price' ) ) {
        config.Edit = PriceEdit;
    }
    return config;
};

export const getFieldConfigFrom = ( field: FormField ) => {
    let handlers: Record< string, FieldHandler > = {
        textarea: editorFieldHandler,
        editor: editorFieldHandler,
        checkbox: checkboxHandler,
        radio: radioHandler,
        number: numberHandler,
        datetime: dateHandler,
        select: selectHandler,
        async_select: asyncSelectHandler,
        multiselect: multiSelectHandler,
        image: imageHandler,
        gallery_images: galleryHandler,
        attribute: attributeHandler,
        file: fileHandler,
    };

    handlers = applyFilters(
        'dokan_product_editor_variant',
        handlers,
        field
    ) as Record< string, FieldHandler >;
    const variant = field.variant ?? '';
    const handler = handlers[ variant ] || defaultHandler;
    return handler( field );
};
