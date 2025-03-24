import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';
import { useState, RawHTML } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';

const MultiCheck = ( { element, onValueChange }: SettingsProps ) => {
    const [ selectedValues, setSelectedValues ] = useState( [] );

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

    const initialValue = Object.values( element.value || element.default );

    return (
        <div
            id={ element.hook_key + '_div' }
            className=" flex justify-between flex-col items-start p-4 w-full"
        >
            <div className="flex flex-col mb-4 w-full">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    <RawHTML>{ element?.title }</RawHTML>
                </h2>
                <p className=" text-sm font-normal text-[#828282]">
                    <RawHTML>{ element?.description }</RawHTML>
                </p>
            </div>
            <SimpleCheckboxGroup
                name={ element?.id }
                onChange={ handleChange }
                defaultValue={ initialValue }
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
