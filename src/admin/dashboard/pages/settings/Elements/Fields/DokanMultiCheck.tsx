import React, { useState } from 'react';
import {
    DokanCheckboxGroup,
    DokanFieldLabel,
} from '../../../../../../components/fields';

export default function DokanMultiCheck( { element, onValueChange } ) {
    const [ selectedValues, setSelectedValues ] = useState(
        element.value || []
    );
    return (
        <div className="flex flex-col gap-2 p-5 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanCheckboxGroup
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                defaultValue={ selectedValues }
                onChange={ ( values ) => {
                    setSelectedValues( values );
                    onValueChange( { ...element, value: values } );
                } }
            />
        </div>
    );
}
