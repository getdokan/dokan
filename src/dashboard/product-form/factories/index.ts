import { applyFilters } from '@wordpress/hooks';
import { FieldHandler, FormField } from '../types';
import {
    asyncSelectHandler,
    attributeHandler,
    checkboxHandler,
    dateHandler,
    defaultHandler,
    fileHandler,
    editorFieldHandler,
    galleryHandler,
    imageHandler,
    multiSelectHandler,
    numberHandler,
    radioHandler,
    selectHandler,
} from './handlers';

export const getFieldConfigFromFactory = ( field: FormField ) => {
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
        'dokan_product_form_variant',
        handlers,
        field
    ) as Record< string, FieldHandler >;
    const variant = field.variant ?? '';
    const handler = handlers[ variant ] || defaultHandler;
    return handler( field );
};
