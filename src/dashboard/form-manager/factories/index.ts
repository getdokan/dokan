import { FieldHandler, FormField } from '../types';
import {
    checkboxHandler,
    dateHandler,
    defaultHandler,
    galleryHandler,
    imageHandler,
    multiSelectHandler,
    numberHandler,
    radioHandler,
    selectHandler,
    textFieldHandler,
} from './handlers';

const handlers: Record< string, FieldHandler > = {
    textarea: textFieldHandler,
    rich_text: textFieldHandler,
    checkbox: checkboxHandler,
    radio: radioHandler,
    number: numberHandler,
    date: dateHandler,
    datetime: dateHandler,
    select: selectHandler,
    multiselect: multiSelectHandler,
    image: imageHandler,
    gallery: galleryHandler,
};

export const getFieldConfigFromFactory = ( field: FormField ) => {
    const handler = handlers[ field.field_type ] || defaultHandler;
    return handler( field );
};
