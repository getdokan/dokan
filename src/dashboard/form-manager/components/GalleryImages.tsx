import { MediaUploader } from '@src/components';
import { useState } from '@wordpress/element';
import { Upload } from 'lucide-react';
import CustomField, { getValidationError } from './CustomField';
import ImagePreview from './ImagePreview';

const GalleryImages = ( { field, onChange, validity }: any ) => {
    const [ files, setFiles ] = useState( field.value || [] );
    const onSelect = ( value: any ) => {
        const newValues = [ ...files, ...value ];
        // find unique images based on id
        const uniqueValues = newValues.filter( ( img, index, self ) => {
            return index === self.findIndex( ( t ) => t.id === img.id );
        } );
        onChange( {
            [ field.id ]: uniqueValues.map( ( img: any ) => img.id ),
        } );
        setFiles( uniqueValues );
    };

    const onRemove = ( index: number ) => {
        const newValues = files.filter( ( _: any, i: number ) => i !== index );
        onChange( {
            [ field.id ]: newValues.map( ( img: any ) => img.id ),
        } );
        setFiles( newValues );
    };

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <ImagePreview
                images={ files }
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
