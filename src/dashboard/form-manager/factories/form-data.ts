import { FormField, Section } from '../types';

interface FieldDataHandler {
    canHandle: ( field: FormField ) => boolean;
    getValue: ( field: FormField ) => any;
}

const ImageIdHandler: FieldDataHandler = {
    canHandle: ( field ) => {
        return field.id === 'image_id' && !! field.value;
    },
    getValue: ( field ) => field.value.id,
};

const GalleryImageIdsHandler: FieldDataHandler = {
    canHandle: ( field ) => {
        return field.id === 'gallery_image_ids' && Array.isArray( field.value );
    },
    getValue: ( field ) => field.value.map( ( img: any ) => img.id ),
};

const CheckboxHandler: FieldDataHandler = {
    canHandle: ( field ) => field.field_type === 'checkbox',
    getValue: ( field ) => {
        return (
            field.value === 'yes' ||
            field.value === 'on' ||
            field.value === true ||
            field.value === 1 ||
            field.value === '1'
        );
    },
};

const DefaultHandler: FieldDataHandler = {
    canHandle: () => true,
    getValue: ( field ) => field.value || '',
};

const handlers: FieldDataHandler[] = [
    ImageIdHandler,
    GalleryImageIdsHandler,
    CheckboxHandler,
    DefaultHandler, // Order matters
];

const getValue = ( field: FormField ): any => {
    const handler = handlers.find( ( h ) => h.canHandle( field ) );
    return ( handler || DefaultHandler ).getValue( field );
};

/**
 * Factory for handling initial data generation for forms.
 */
const dataFactory = {
    /**
     * Creates the initial data object from the given sections.
     *
     * @param {Section[]} sections - The sections containing form fields.
     * @return {Record< string, any >} The initial data object with field IDs as keys and their values.
     */
    create: ( sections: Section[] ): Record< string, any > => {
        const entries = sections.flatMap( ( section ) =>
            section.fields.map( ( field ) => [ field.id, getValue( field ) ] )
        );
        return Object.fromEntries( entries );
    },
};

export default dataFactory;
