import DateTimePickerEdit from '../components/DateTimePickerEdit';
import FeatureImage from '../components/FeatureImage';
import RichTextEdit from '../components/RichTextEdit';
import TextWithAddon from '../components/TextWithAddon';
import CategoriesEdit from '../components/CategoriesEdit';
import GalleryImages from '../components/GalleryImages';
import { FieldHandler } from '../types';

const getElementsFromOptions = ( options: any ) => {
    if ( Array.isArray( options ) ) {
        return options;
    }

    return Object.entries( options ).map( ( [ value, label ] ) => ( {
        label,
        value,
    } ) );
};

export const textFieldHandler: FieldHandler = ( field ) => ( {
    type: 'text',
    Edit: RichTextEdit,
} );

export const checkboxHandler: FieldHandler = ( field ) => ( {
    type: 'boolean',
    Edit: 'checkbox',
} );

export const radioHandler: FieldHandler = ( field ) => ( {
    type: 'text',
    Edit: 'radio',
} );

export const numberHandler: FieldHandler = ( field ) => ( {
    type: 'integer',
} );

export const dateHandler: FieldHandler = ( field ) => ( {
    type: 'datetime',
    Edit: DateTimePickerEdit,
} );

export const selectHandler: FieldHandler = ( field ) => {
    const config: any = {
        type: 'number',
        elements: getElementsFromOptions( field.options ),
        Edit: 'select',
    };

    if ( Array.isArray( field.value ) ) {
        config.type = 'array';
    }

    if ( field.name === 'chosen_product_cat' ) {
        config.Edit = CategoriesEdit;
        config.type = 'array';
    }
    return config;
};

export const imageHandler: FieldHandler = ( field ) => ( {
    type: 'integer',
    Edit: FeatureImage,
} );

export const galleryHandler: FieldHandler = ( field ) => ( {
    type: 'array',
    Edit: GalleryImages,
} );

export const defaultHandler: FieldHandler = ( field ) => {
    const config: any = {
        type: 'text',
    };
    if ( field.left_icon || field.right_icon ) {
        config.Edit = TextWithAddon;
    }
    return config;
};
