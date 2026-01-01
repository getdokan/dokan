import { DokanButton, MediaUploader } from '@src/components';
import CustomField from './CustomField';

const FeatureImage = ( { data, field, onChange }: any ) => {
    return (
        <CustomField label={ field.label }>
            <MediaUploader
                multiple={ field.field_type === 'gallery' }
                onSelect={ ( value: any ) => {
                    onChange( {
                        [ field.id ]: value.id,
                        [ `$${ field.id }_url` ]: value.url,
                    } );
                } }
            >
                <DokanButton variant="secondary" className="uppercase">
                    Upload { field.field_type }
                </DokanButton>
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
