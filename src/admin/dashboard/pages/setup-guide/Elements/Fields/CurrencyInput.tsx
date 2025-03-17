import { SimpleInput } from '@getdokan/dokan-ui';
import { useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';

const CurrencyInput = ( { element, onValueChange }: SettingsProps ) => {
    const [ localValue, setLocalValue ] = useState( element.value );

    const handleValueChange = ( event ) => {
        setLocalValue( event.target.value );
        onValueChange( {
            ...element,
            value: event.target.value,
        } );
    };
    if ( ! element.display ) {
        return <></>;
    }
    return (
        <div
            id={ element.hook_key + '_div' }
            className=" flex justify-between p-4 items-center flex-wrap  w-full"
        >
            <div className="flex flex-col">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className=" text-sm font-normal text-[#828282]">
                    { element?.description }
                </p>
            </div>
            <SimpleInput
                input={ {
                    autoComplete: 'off',
                    id: element?.id,
                    name: element?.id,
                    placeholder: String( element?.placeholder ),
                    type: element.type,
                } }
                addOnLeft={
                    <span className="w-7 h-7 flex justify-center items-center">
                        { element?.currency }
                    </span>
                }
                required
                value={ String( localValue ) }
                onChange={ handleValueChange }
                className={ `w-32 h-12 focus:outline-none` }
            />
        </div>
    );
};

export default CurrencyInput;
