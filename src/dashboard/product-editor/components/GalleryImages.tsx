import { MediaUploader } from '@src/components';
import { useState } from '@wordpress/element';
import { Upload } from 'lucide-react';
import CustomField, { getValidationError } from './CustomField';
import ImagePreview from './ImagePreview';

const GalleryImages = ( { field, onChange, validity }: any ) => {
    const [ files, setFiles ] = useState( field.value || [] );
    // A schema provider (e.g. a subscription pack) can cap the gallery via `max`; unset means no cap.
    const max = Number( field.max ) > 0 ? Number( field.max ) : Infinity;
    const atLimit = files.length >= max;
    const onSelect = ( value: any ) => {
        const newValues = [ ...files, ...value ];
        // find unique images based on id
        const uniqueValues = newValues.filter( ( img, index, self ) => {
            return index === self.findIndex( ( t ) => t.id === img.id );
        } );
        // Never drop what the product already had; only stop the selection from growing past the cap.
        const capped = uniqueValues.slice( 0, Math.max( max, files.length ) );
        onChange( {
            [ field.id ]: capped.map( ( img: any ) => img.id ),
        } );
        setFiles( capped );
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
                { ! atLimit && (
                    <MediaUploader
                        onSelect={ onSelect }
                        className={ `dokan-product-${ field.id }` }
                        multiple={ true }
                    >
                        <Upload size={ 16 } />
                    </MediaUploader>
                ) }
            </ImagePreview>
        </CustomField>
    );
};

export default GalleryImages;
