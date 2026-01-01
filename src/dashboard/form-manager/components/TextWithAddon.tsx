import { DokanPriceInput } from '@src/components';
import CustomField from './CustomField';

const TextWithAddon = ( { data, field, onChange }: any ) => (
    <CustomField label={ field.label }>
        <DokanPriceInput
            input={ {
                id: field.id,
                placeholder: field.placeholder || '',
            } }
            label=""
            className="form-manager-price-input"
            value={ data[ field.id ] }
            namespace={ `field.${ field.id }` }
            onChange={ ( _, rawValue ) =>
                onChange( { [ field.id ]: rawValue } )
            }
        />
    </CustomField>
);

export default TextWithAddon;
