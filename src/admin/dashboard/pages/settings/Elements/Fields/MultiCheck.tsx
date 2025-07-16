import React, { useState } from '@wordpress/element';
import { SettingsProps } from '../../types';
import { DokanCheckboxGroup, DokanFieldLabel } from '../../../../../../components/fields';

const MultiCheck = ( { element, onValueChange }: SettingsProps ) => {
    const [ selectedValues, setSelectedValues ] = useState(
        ( element.value as Array< string | number > ) || []
    );

    if ( ! element.display ) {
        return <></>;
    }

    const handleChange = ( values: Array< string | number > ) => {
        setSelectedValues( values );
        onValueChange( {
            ...element,
            value: values,
        } );
    };

    return (
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />

            <div className="mt-2">
                <DokanCheckboxGroup
                    options={
                        element.options?.map( ( option ) => ( {
                            label: option.title,
                            value: option.value,
                        } ) ) || []
                    }
                    defaultValue={ selectedValues }
                    onChange={ handleChange }
                />
            </div>
        </div>
    );
};

export default MultiCheck;
