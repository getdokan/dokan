import { DokanButton, MediaUploader } from '@src/components';
import { __ } from '@wordpress/i18n';
import { Upload, X } from 'lucide-react';
import CustomField from './CustomField';

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
        <div className="flex flex-wrap gap-3">
            { items.map( ( item: any, index: number ) => (
                <div
                    key={ index }
                    className="relative group border border-gray-200 rounded-md overflow-hidden"
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

const FeatureImage = ( { field, onChange }: any ) => {
    const onSelect = ( value: any ) => {
        onChange( {
            [ field.id ]: value.id,
        } );
        field.value = [
            {
                id: value.id,
                url: value.url,
                alt: value.alt,
            },
        ];
    };

    const onRemove = () => {
        onChange( {
            [ field.id ]: [],
        } );
        field.value = [];
    };

    return (
        <CustomField className={ `${ field.id }-field` }>
            { field.value.url ? (
                <ImagePreview images={ field.value } onRemove={ onRemove } />
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
