import React from 'react';
import { CopyButtonField } from '../../../../../../components/fields';

export default function DokanCopyButtonField( { element } ) {
    return (
        <CopyButtonField
            value={ element.value }
            label={ element.title }
            tooltip={ element.tooltip }
            disabled={ element.disabled }
            helperText={ element.description }
            placeholder={ element.placeholder }
        />
    );
}
