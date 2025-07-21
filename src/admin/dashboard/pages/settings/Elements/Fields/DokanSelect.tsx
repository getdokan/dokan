import React from 'react';
import {
    DokanFieldLabel,
    DokanSelect,
} from '../../../../../../components/fields';

export default function DokanSelectField( { element, onValueChange } ) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanSelect
                value={ element.value }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                disabled={ element.disabled }
                containerClassName="w-full"
            />
        </div>
    );
}
