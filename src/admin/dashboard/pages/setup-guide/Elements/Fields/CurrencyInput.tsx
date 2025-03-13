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
    title = 'Currency',
    description = 'Enter the currency for your store',
} ) => {
    return (
        <div className="border bor-[#E9E9E9] flex justify-between items-center flex-wrap  p-4 w-full ">
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
                    type,
                } }
                addOnLeft={
                    <span className="w-7 h-7 flex justify-center items-center">
                        { currency }
                    </span>
                }
                required
                value={ value }
                onChange={ onChange }
                className={ `w-32 h-12 focus:outline-none ${ className }` }
            />
        </div>
    );
};

export default CurrencyInput;
