import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';

const CheckboxGroup = ( {
    options = [],
    defaultValue = [],
    name = 'checkboxGroup',
    onChange = () => {},
    title = 'Checkbox Group',
    description = 'Select options from the list',
} ) => {
    // State to track selected values
    const [ selectedValues, setSelectedValues ] = useState( defaultValue );

    // Initialize with default values
    useEffect( () => {
        setSelectedValues( defaultValue );
    }, [ defaultValue ] );

    // Handle change and propagate to parent component
    const handleChange = ( values ) => {
        setSelectedValues( values );
        onChange( values );
    };

    return (
        <div className="border bor-[#E9E9E9] flex justify-between flex-col items-start p-4 w-full">
            <div className="flex flex-col mb-4 w-full">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282] mb-2">
                    { description }
                </p>
            </div>
            <SimpleCheckboxGroup
                defaultValue={ selectedValues }
                name={ name }
                onChange={ handleChange }
                options={ options }
                className="focus:outline-none outline-none w-full"
            />
        </div>
    );
};

export default CheckboxGroup;
