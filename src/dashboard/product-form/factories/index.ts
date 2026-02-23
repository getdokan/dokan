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

const handlers: Record< string, FieldHandler > = {
    textarea: editorFieldHandler,
    editor: editorFieldHandler,
    checkbox: checkboxHandler,
    radio: radioHandler,
    number: numberHandler,
    date: dateHandler,
    datetime: dateHandler,
    select: selectHandler,
    async_select: asyncSelectHandler,
    multiselect: multiSelectHandler,
    feature_image: imageHandler,
    gallery_images: galleryHandler,
    attribute: attributeHandler,
    file: fileHandler,
};

export const getFieldConfigFromFactory = ( field: FormField ) => {
    const variant = field.variant ?? '';
    const handler = handlers[ variant ] || defaultHandler;
    return handler( field );
};
