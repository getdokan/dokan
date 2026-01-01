import { DokanButton, MediaUploader } from '@src/components';
import { __ } from '@wordpress/i18n';
import { Upload } from 'lucide-react';
import CustomField from './CustomField';

const FeatureImage = ( { data, field, onChange }: any ) => {
    const onSelect = ( value: any ) => {
        onChange( {
            [ field.id ]: value.id,
            [ `$${ field.id }_url` ]: value.url,
        } );
    };

    const label = field.field_type === 'gallery' ? '' : field.label;

    return (
        <CustomField label={ label }>
            <MediaUploader
                onSelect={ onSelect }
                className={ `product-${ field.id }` }
                multiple={ field.field_type === 'gallery' }
            >
                <DokanButton variant="secondary" className="uppercase">
                    <Upload size={ 16 } />
                    { __( 'Upload File', 'dokan-lite' ) }
                </DokanButton>
                <span>
                    { __( 'A product cover image here.', 'dokan-lite' ) }
                </span>
                { data[ `$${ field.id }_url` ] && (
                    <img
                        src={ data[ `$${ field.id }_url` ] }
                        alt="Product"
                        style={ {
                            marginTop: '10px',
                            maxWidth: '100%',
                            width: '150px',
                        } }
                    />
                ) }
            </MediaUploader>
        </CustomField>
    );
};

export default FeatureImage;
