import React from 'react';
import {
    DokanFieldLabel,
    DokanFileUpload,
} from '../../../../../../components/fields';

export default function DokanFileUploadField( { element, onValueChange } ) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanFileUpload
                onUrlImport={ ( url ) =>
                    onValueChange( { ...element, value: url } )
                }
            />
        </div>
    );
}
