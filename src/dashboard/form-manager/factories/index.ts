import { FormField } from '../types';
import {
    textFieldHandler,
    checkboxHandler,
    radioHandler,
    numberHandler,
    dateHandler,
    selectHandler,
    imageHandler,
    galleryHandler,
    defaultHandler,
} from './handlers';
import { FieldHandler } from '../types';

const handlers: Record< string, FieldHandler > = {
    textarea: textFieldHandler,
    rich_text: textFieldHandler,
    checkbox: checkboxHandler,
    radio: radioHandler,
    number: numberHandler,
    date: dateHandler,
    datetime: dateHandler,
    select: selectHandler,
    image: imageHandler,
    gallery: galleryHandler,
};

export const getFieldConfigFromFactory = ( field: FormField ) => {
    const handler = handlers[ field.field_type ] || defaultHandler;
    return handler( field );
};
