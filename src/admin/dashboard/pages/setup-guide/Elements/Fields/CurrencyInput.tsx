import { SimpleInput } from '@getdokan/dokan-ui';
import { useState } from '@wordpress/element';

const CurrencyInput = ( { element, onValueChange } ) => {
    const {
        name = 'currency',
        placeholder = 'Enter amount',
        type = 'text',
        onChange,
        currency = '$',
        className = '',
        title = 'Currency',
        description = 'Enter the currency for your store',
    } = element;

    const [ value, setValue ] = useState( element.value );

    const handleValueChange = ( event ) => {
        setValue( event.target.value );
        onValueChange( {
            ...element,
            value: event.target.value,
        } );
    };
    if ( ! element.display ) {
        return <></>;
    }
    return (
        <div className="border bor-[#E9E9E9] flex justify-between items-center flex-wrap p-4 w-full">
            <div className="flex flex-col">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282] mb-2">
                    { description }
                </p>
            </div>
            <SimpleInput
                input={ {
                    autoComplete: 'off',
                    id: name,
                    name,
                    placeholder,
                    type: 'number', // Changed to number for better mobile input experience
                    step: '0.01', // Allow decimal values for currency
                } }
                addOnLeft={
                    <span className="w-7 h-7 flex justify-center items-center">
                        { currency }
                    </span>
                }
                required
                value={ value }
                onChange={ handleValueChange }
                className={ `w-32 h-12 focus:outline-none` }
            />
        </div>
    );
};

export default CurrencyInput;
