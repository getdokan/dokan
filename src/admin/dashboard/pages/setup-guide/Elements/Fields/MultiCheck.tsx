import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';
import { useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';

const MultiCheck = ( { element, onValueChange }: SettingsProps ) => {
    const [ selectedValues, setSelectedValues ] = useState( [] );

    console.log( { element } );
    // Handle change and propagate to parent component
    const handleChange = ( values ) => {
        setSelectedValues( values );
        onValueChange( {
            ...element,
            value: values,
        } );
    };
    if ( ! element.display ) {
        return <></>;
    }
    return (
        <div
            id={ element.hook_key + '_div' }
            className=" flex justify-between flex-col items-start p-4 w-full"
        >
            <div className="flex flex-col mb-4 w-full">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className=" text-sm font-normal text-[#828282]">
                    { element?.description }
                </p>
            </div>
            <SimpleCheckboxGroup
                name={ element?.id }
                onChange={ handleChange }
                defaultValue={ Object.values( element?.default ) }
                options={
                    element?.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                value={ selectedValues }
                className="focus:outline-none outline-none w-full"
            />
        </div>
    );
};

export default MultiCheck;
