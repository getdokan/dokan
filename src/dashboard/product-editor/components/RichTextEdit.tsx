import { RichText } from '@src/components';
import CustomField, { getValidationError } from './CustomField';

const RichTextEdit = ( { data, field, onChange, validity }: any ) => {
    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <RichText
                placeholder={ field.placeholder }
                value={ data[ field.id ] }
                onChange={ ( value: string ) => {
                    onChange( { [ field.id ]: value } );
                } }
            />
        </CustomField>
    );
};

export default RichTextEdit;
