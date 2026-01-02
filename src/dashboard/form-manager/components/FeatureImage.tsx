import { DokanButton, MediaUploader } from '@src/components';
import { __ } from '@wordpress/i18n';
import { Upload, X } from 'lucide-react';
import CustomField from './CustomField';

export const ImagePreview = ( {
    images,
    onRemove,
    multiple = false,
}: {
    images: any;
    onRemove: ( index: number ) => void;
    multiple?: boolean;
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
                    className={ `relative group border border-gray-200 rounded-md overflow-hidden ${
                        multiple && 'w-20 h-20'
                    }` }
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
        let ids, values;

        if ( Array.isArray( value ) ) {
            ids = value.map( ( item: any ) => item.id );
            values = value;
        } else {
            ids = value.id;
            values = value;
        }

        onChange( {
            [ field.id ]: ids,
            [ `$${ field.id }_value` ]: values,
        } );
    };

    const onRemove = () => {
        onChange( {
            [ field.id ]: [],
            [ `$${ field.id }_value` ]: [],
        } );
    };

    const multiple = field.field_type === 'gallery';
    const images = field.value;

    return (
        <CustomField label={ field.label } className={ `${ field.id }-field` }>
            { images.length ? (
                <ImagePreview images={ images } onRemove={ onRemove } />
            ) : (
                <MediaUploader
                    onSelect={ onSelect }
                    className={ `product-${ field.id }` }
                    multiple={ field.field_type === 'gallery' }
                >
                    {  }
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
