import React, { Fragment, useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';
import { SimpleSelect } from '@getdokan/dokan-ui';

const Select = ( { element, onValueChange }: SettingsProps ) => {
    const [ selectedOption, setSelectedOption ] = useState( [] );
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
            className="flex justify-between p-4 flex-wrap "
            id={ element.hook_key + '_div' }
        >
            <div className="flex flex-col sm:w-[70%]">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className="text-sm font-normal text-[#828282]">
                    { element?.description }
                </p>
            </div>
            <div className="flex w-[11rem]">
                <SimpleSelect
                    name={ element?.id }
                    label={ '' }
                    options={
                        element?.options?.map( ( option ) => ( {
                            label: option.title,
                            value: option.value,
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
