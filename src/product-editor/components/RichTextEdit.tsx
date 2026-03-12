import { TextArea } from '@getdokan/dokan-ui';
import { RichText } from '@src/components';
import CustomField, { getValidationError } from './CustomField';

const RichTextEdit = ( { data, field, onChange, validity }: any ) => {
    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            { field.variant === 'textarea' ? (
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
};

export default RichTextEdit;
