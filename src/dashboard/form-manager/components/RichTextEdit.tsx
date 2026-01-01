import { RichText } from '@src/components';
import CustomField from './CustomField';

const RichTextEdit = ( { data, field, onChange }: any ) => (
    <CustomField label={ field.label }>
        <RichText
            placeholder={ field.placeholder }
            value={ data[ field.id ] }
            onChange={ ( value: string ) => {
                onChange( { [ field.id ]: value } );
            } }
        />
    </CustomField>
);

export default RichTextEdit;
