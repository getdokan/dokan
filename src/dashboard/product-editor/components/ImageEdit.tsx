import { DokanButton, MediaUploader } from '@src/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Upload } from 'lucide-react';
import CustomField, { getValidationError } from './CustomField';
import ImagePreview from './ImagePreview';
import { applyFilters } from '@wordpress/hooks';

const ImageEdit = ( { data, field, onChange, validity }: any ) => {
    const [ image, setImage ] = useState( data[ field.id ] );
    const onSelect = ( value: any ) => {
        onChange( {
            [ field.id ]: value,
        } );
        setImage( {
            id: value.id,
            url: value.url,
            alt: value.alt,
        } );
    };

    const onRemove = () => {
        onChange( {
            [ field.id ]: null,
        } );
        setImage( null );
    };

    const className = `dokan-product-image_id ${
        field.is_custom ? 'is-custom' : ''
    }`;

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            { image?.url ? (
                <ImagePreview
                    itemClassName={ className }
                    images={ image }
                    onRemove={ onRemove }
                />
            ) : (
                <MediaUploader onSelect={ onSelect } className={ className }>
                    <DokanButton variant="secondary" className="uppercase">
                        <Upload size={ 16 } />
                        { __( 'Upload', 'dokan-lite' ) }
                    </DokanButton>
                </MediaUploader>
            ) }
            {
                applyFilters(
                    'dokan_product_editor_after_ui_image_id',
                    null,
                    data,
                    field,
                    onSelect
                ) as React.ReactNode
            }
        </CustomField>
    );
};
export default ImageEdit;
