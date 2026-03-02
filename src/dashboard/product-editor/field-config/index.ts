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

const staticHandler = ( config: FieldConfig ) => () => config;

const defaultHandler: FieldHandler = ( field ) => {
    if ( field?.id.includes( 'price' ) ) {
        return { Edit: PriceEdit };
    }
    return {};
};

export const getFieldConfigFrom = ( field: FormField ) => {
    let handlers: Record< string, FieldHandler > = {
        textarea: staticHandler( { Edit: RichTextEdit } ),
        editor: staticHandler( { Edit: RichTextEdit } ),
        datetime: staticHandler( {
            type: 'datetime',
            Edit: DateTimePickerEdit,
        } ),
        select: staticHandler( { Edit: SelectEdit } ),
        async_select: staticHandler( { Edit: AsyncSelectEdit } ),
        multiselect: staticHandler( { Edit: SelectEdit, multiple: true } ),
        image: staticHandler( { Edit: ImageEdit } ),
        gallery: staticHandler( { Edit: GalleryImages } ),
        attribute: staticHandler( { Edit: AttributesEdit } ),
        file: staticHandler( { Edit: FileUploadEdit } ),
    };

    handlers = applyFilters(
        'dokan_product_editor_ui_variant',
        handlers,
        field
    ) as Record< string, FieldHandler >;
    const variant = field.variant ?? '';
    const handler = handlers[ variant ] || defaultHandler;
    return handler( field );
};
