import { FieldHandler, FormField } from '../types';
import {
    attributeHandler,
    checkboxHandler,
    dateHandler,
    defaultHandler,
    downloadableHandler,
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
    multiselect: multiSelectHandler,
    image: imageHandler,
    gallery: galleryHandler,
    attribute: attributeHandler,
    downloadable: downloadableHandler,
};

export const getFieldConfigFromFactory = ( field: FormField ) => {
    const variant = field.variant ?? '';
    const handler = handlers[ variant ] || defaultHandler;
    return handler( field );
};
