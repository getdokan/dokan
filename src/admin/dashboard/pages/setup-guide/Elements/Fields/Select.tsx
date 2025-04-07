import { useState, RawHTML } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';
import { SimpleSelect } from '@getdokan/dokan-ui';

const Select = ( { element, onValueChange }: SettingsProps ) => {
    const initialValue = element.value ? element.value : element.default;
    const [ selectedOption, setSelectedOption ] = useState( initialValue );

    const onHandleChange = ( event ) => {
        const selectedValue = event?.target?.value;

        setSelectedOption( selectedValue );
        onValueChange( {
            ...element,
            value: selectedValue,
        } );
    };

    if ( ! element.display ) {
        return <></>;
    }

    return (
        <div
            className="flex justify-between p-4"
            id={ element.hook_key }
        >
            <div className="flex flex-col sm:w-[70%]">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    <RawHTML>{ element?.title }</RawHTML>
                </h2>
                <p className="text-sm font-normal text-[#828282]">
                    <RawHTML>{ element?.description }</RawHTML>
                </p>
            </div>
            <div className="flex w-[11rem]">
                <SimpleSelect
                    name={ element?.id }
                    label={ '' }
                    options={
                        element?.options?.map( ( option ) => ( {
                            label: option?.title,
                            value: option?.value,
                        } ) ) || []
                    }
                    value={ selectedOption }
                    onChange={ onHandleChange }
                />
            </div>
        </div>
    );
};

export default Select;
