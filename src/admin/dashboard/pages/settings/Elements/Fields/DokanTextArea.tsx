import React from 'react';
import {
    DokanFieldLabel,
    DokanTextArea,
} from '../../../../../../components/fields';

export default function DokanTextAreaField( { element, onValueChange } ) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanTextArea
                value={ element.value }
                onChange={ ( e ) =>
                    onValueChange( { ...element, value: e.target.value } )
                }
                input={ {
                    placeholder: element.placeholder,
                    disabled: element.disabled,
                } }
            />
        </div>
    );
}
