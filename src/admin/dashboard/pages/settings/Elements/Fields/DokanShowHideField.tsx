import React from 'react';
import { ShowHideField } from '../../../../../../components/fields';

export default function DokanShowHideField( { element } ) {
    return (
        <ShowHideField
            value={ element.value }
            label={ element.title }
            tooltip={ element.tooltip }
            disabled={ element.disabled }
            helperText={ element.description }
            placeholder={ element.placeholder }
        />
    );
}
