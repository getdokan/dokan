import { MediaUploader } from '@src/components';
import { useState } from '@wordpress/element';
import { Upload } from 'lucide-react';
import CustomField from './CustomField';
import ImagePreview from './ImagePreview';

const GalleryImages = ( { field, onChange }: any ) => {
    const [ images, setImages ] = useState( field.value || [] );
    const onSelect = ( value: any ) => {
        const newImages = value.map( ( img: any ) => ( {
            id: img.id,
            url: img.url,
            alt: img.alt,
        } ) );
        const newValues = [ ...images, ...newImages ];
        // find unique images based on id
        const uniqueValues = newValues.filter( ( img, index, self ) => {
            return index === self.findIndex( ( t ) => t.id === img.id );
        } );
        onChange( {
            [ field.id ]: uniqueValues.map( ( img: any ) => img.id ),
        } );
        setImages( uniqueValues );
    };

    const onRemove = ( index: number ) => {
        const newValues = images.filter( ( _: any, i: number ) => i !== index );
        onChange( {
            [ field.id ]: newValues.map( ( img: any ) => img.id ),
        } );
        setImages( newValues );
    };

    return (
        <CustomField label={ field.label } error={ field.error }>
            <ImagePreview
                images={ images }
                onRemove={ onRemove }
                itemClassName={ `dokan-product-${ field.id }` }
            >
                <MediaUploader
                    onSelect={ onSelect }
                    className={ `dokan-product-${ field.id }` }
                    multiple={ true }
                >
                    <Upload size={ 16 } />
                </MediaUploader>
            </ImagePreview>
        </CustomField>
    );
};

export default GalleryImages;
