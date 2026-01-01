import { DateTimePicker } from '@src/components';
import CustomField from './CustomField';

const DateTimePickerEdit = ( { data, field, onChange }: any ) => (
    <CustomField label={ field.label }>
        <DateTimePicker
            placeholder={ field.placeholder }
            currentDate={ data[ field.id ] }
            onChange={ ( value: string ) => {
                console.log( 'DateTimePickerEdit value:', value );
                onChange( { [ field.id ]: value } );
            } }
        />
    </CustomField>
);

export default DateTimePickerEdit;
