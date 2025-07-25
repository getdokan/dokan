import React from 'react';
import {
    DokanFieldLabel,
    DokanSimpleRadio,
} from '../../../../../../components/fields';

export default function DokanRadio( { element, onValueChange } ) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanSimpleRadio
                name={ element.id }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                value={ element.value }
                onChange={ ( e ) =>
                    onValueChange( { ...element, value: e.target.value } )
                }
            />
        </div>
    );
}
