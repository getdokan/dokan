import React, { useState } from '@wordpress/element';
import { SettingsProps } from '../../types';
import { DokanFieldLabel, DokanSelect } from '../../../../../../components/fields';

const Select = ( { element, onValueChange }: SettingsProps ) => {
    const initialValue = element.value ? element.value : element.default;
    const [ selectedOption, setSelectedOption ] = useState( initialValue );

    if ( ! element.display ) {
        return <></>;
    }

    const onHandleChange = ( value ) => {
        setSelectedOption( value );
        onValueChange( {
            ...element,
            value,
        } );
    };

    return (
        <div className="flex justify-between p-4" id={ element.hook_key }>
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />

            <div className="flex w-[11rem]">
                <DokanSelect
                    name={ element?.id }
                    options={
                        element?.options?.map( ( option ) => ( {
                            label: option?.title,
                            value: option?.value,
                        } ) ) || []
                    }
                    value={ selectedOption as string }
                    onChange={ onHandleChange }
                    disabled={ element.disabled }
                />
            </div>
        </div>
    );
};

export default Select;
