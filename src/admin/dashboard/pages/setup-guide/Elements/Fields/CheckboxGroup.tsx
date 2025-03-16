import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';

const CheckboxGroup = ( { element, onValueChange }: SettingsProps ) => {
    const { default: defaultValue, value } = element;
    // State to track selected values
    const [ selectedValues, setSelectedValues ] = useState( defaultValue );

    // Initialize with default values
    useEffect( () => {
        setSelectedValues( defaultValue );
    }, [ defaultValue ] );

    // Handle change and propagate to parent component
    const handleChange = ( values ) => {
        setSelectedValues( values );
        onValueChange( {
            ...element,
            value: values,
        } );
    };

    return (
        <div className=" flex justify-between flex-col items-start p-4 w-full">
            <div className="flex flex-col mb-4 w-full">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282] mb-2">
                    { element?.description }
                </p>
            </div>
            <SimpleCheckboxGroup
                defaultValue={ [] }
                name={ element?.id }
                onChange={ handleChange }
                options={ [
                    ...element?.options,
                    {
                        value: 'all',
                        label: 'Select All',
                    },
                ] }
                className="focus:outline-none outline-none w-full"
            />
        </div>
    );
};

export default CheckboxGroup;
