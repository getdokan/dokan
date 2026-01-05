import { DokanButton, MediaUploader } from '@src/components';
import { __ } from '@wordpress/i18n';
import { Upload, X } from 'lucide-react';
import CustomField from './CustomField';
import { Button } from '@wordpress/components';

export const ImagePreview = ( {
    images,
    onRemove,
}: {
    images: any;
    onRemove: ( index: number ) => void;
} ) => {
    const items = Array.isArray( images ) ? images : [ images ];
    if ( items.length === 0 ) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-3 mt-3">
            { items.map( ( item: any, index: number ) => (
                <div
                    key={ index }
                    className="relative group border border-gray-200 rounded-md overflow-hidden w-20 h-20"
                >
                    <img
                        src={ item.url }
                        alt="product"
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-500"
                        onClick={ ( e ) => {
                            e.preventDefault();
                            onRemove( index );
                        } }
                    >
                        <X size={ 14 } />
                    </button>
                </div>
            ) ) }
        </div>
    );
};

const GalleryImages = ( { field, onChange }: any ) => {
    const onSelect = ( value: any ) => {
        const images = field.value ? field.value : [];
        const newImages = value.map( ( img: any ) => ( {
            id: img.id,
            url: img.url,
            alt: img.alt,
        } ) );
        const newValues = [ ...images, ...newImages ];
        onChange( {
            [ field.id ]: newValues.map( ( img: any ) => img.id ),
        } );
        field.value = newValues;
    };

    const onRemove = ( index: number ) => {
        const images = field.value ? field.value : [];
        const newValues = images.filter( ( _: any, i: number ) => i !== index );
        onChange( {
            [ field.id ]: newValues.map( ( img: any ) => img.id ),
        } );
        field.value = newValues;
    };

    const images = field.value ? field.value : [];

    return (
        <CustomField className={ `${ field.id }-field` }>
            <ImagePreview images={ images } onRemove={ onRemove } />
            <MediaUploader
                onSelect={ onSelect }
                className={ `dokan-product-${ field.id } border border-gray-200 rounded-md overflow-hidden w-20 h-20` }
                multiple={ true }
            >
                <Button>
                    <Upload size={ 16 } />
                </Button>
            </MediaUploader>
        </CustomField>
    );
};

export default GalleryImages;
