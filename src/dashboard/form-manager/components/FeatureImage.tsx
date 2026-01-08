import { DokanButton, MediaUploader } from '@src/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Upload } from 'lucide-react';
import CustomField from './CustomField';
import ImagePreview from './ImagePreview';

const FeatureImage = ( { field, onChange }: any ) => {
    const [ image, setImage ] = useState( field.value );
    const onSelect = ( value: any ) => {
        onChange( {
            [ field.id ]: value.id,
        } );
        setImage( {
            id: value.id,
            url: value.url,
            alt: value.alt,
        } );
    };

    const onRemove = () => {
        onChange( {
            [ field.id ]: 0,
        } );
        setImage( null );
    };

    return (
        <CustomField className={ `dokan-product-${ field.id }-field` }>
            { image?.url ? (
                <ImagePreview images={ image } onRemove={ onRemove } />
            ) : (
                <MediaUploader
                    onSelect={ onSelect }
                    className={ `dokan-product-${ field.id }` }
                >
                    <DokanButton variant="secondary" className="uppercase">
                        <Upload size={ 16 } />
                        { __( 'Upload File', 'dokan-lite' ) }
                    </DokanButton>
                    <span>
                        { __( 'A product cover image here.', 'dokan-lite' ) }
                    </span>
                </MediaUploader>
            ) }
        </CustomField>
    );
};
export default FeatureImage;
