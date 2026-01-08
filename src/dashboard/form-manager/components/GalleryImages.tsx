import { MediaUploader } from '@src/components';
import { Button } from '@wordpress/components';
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
        <CustomField className={ `${ field.id }-field` }>
            <ImagePreview
                images={ images }
                onRemove={ onRemove }
                itemClassName="w-20 h-20"
            >
                <MediaUploader
                    onSelect={ onSelect }
                    className={ `dokan-product-${ field.id } border border-gray-200 rounded-md overflow-hidden w-20 h-20` }
                    multiple={ true }
                >
                    <Button>
                        <Upload size={ 16 } />
                    </Button>
                </MediaUploader>
            </ImagePreview>
        </CustomField>
    );
};

export default GalleryImages;
