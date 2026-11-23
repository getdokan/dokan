import { TextArea } from '@getdokan/dokan-ui';
import CustomField, { getValidationError } from './CustomField';

const TextAreaEdit = ( { data, field, onChange, validity }: any ) => {
    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <TextArea
                input={ {
                    id: `textarea-${ field.id }`,
                    placeholder: field.placeholder,
                    rows: 5,
                } }
                value={ data[ field.id ] || '' }
                onChange={ ( e ) => {
                    onChange( { [ field.id ]: e.target.value } );
                } }
            />
        </CustomField>
    );
};

export default TextAreaEdit;
