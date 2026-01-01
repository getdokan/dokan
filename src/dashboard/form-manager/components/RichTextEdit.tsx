import { RichText } from '@src/components';
import CustomField from './CustomField';
import { TextArea } from '@getdokan/dokan-ui';

const RichTextEdit = ( { data, field, onChange }: any ) => (
    <CustomField label={ field.label }>
        { field.field_type === 'textarea' ? (
            <TextArea
                input={ {
                    id: `textarea-${ field.id }`,
                    placeholder: field.placeholder,
                    rows: 5,
                } }
                value={ data[ field.id ] }
                onChange={ ( e ) => {
                    onChange( { [ field.id ]: e.target.value } );
                } }
            />
        ) : (
            <RichText
                placeholder={ field.placeholder }
                value={ data[ field.id ] }
                onChange={ ( value: string ) => {
                    onChange( { [ field.id ]: value } );
                } }
            />
        ) }
    </CustomField>
);

export default RichTextEdit;
