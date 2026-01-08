import { DokanPriceInput } from '@src/components';
import CustomField from './CustomField';

const TextWithAddon = ( { data, field, onChange }: any ) => (
    <CustomField label={ field.label }>
        <DokanPriceInput
            label=""
            value={ data[ field.id ] }
            namespace={ `field.${ field.id }` }
            input={ {
                id: field.id,
                placeholder: field.placeholder || '',
            } }
            onChange={ ( _, rawValue ) =>
                onChange( { [ field.id ]: rawValue } )
            }
        />
    </CustomField>
);

export default TextWithAddon;
