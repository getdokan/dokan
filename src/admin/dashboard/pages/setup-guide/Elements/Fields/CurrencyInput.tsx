import { SimpleInput } from '@getdokan/dokan-ui';

const CurrencyInput = ( {
    name = 'currency',
    label = 'Currency',
    placeholder = 'Enter currency',
    type = 'text',
    value,
    onChange,
    currency = '$',
    className = '',
} ) => {
    return (
        <SimpleInput
            input={ {
                autoComplete: 'off',
                id: name,
                name,
                placeholder,
                type,
            } }
            label={ label }
            addOnLeft={
                <span className="w-7 h-7 flex justify-center items-center">
                    { currency }
                </span>
            }
            required
            value={ value }
            onChange={ onChange }
            className={ `w-32 h-12 ${ className }` }
        />
    );
};

export default CurrencyInput;
