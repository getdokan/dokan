import { dispatch } from '@wordpress/data';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import {
    DokanCheckboxGroup as BaseCheckboxGroup,
    DokanFieldLabel,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanCheckboxGroup( { element, className } ) {
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className={ twMerge( 'flex flex-col gap-2 w-full', className ) }>
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
            />
            <BaseCheckboxGroup
                name={ element.id }
                label={ element.title }
                helpText={ element.description }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                defaultValue={ element.value || [] }
                onChange={ ( values ) =>
                    onValueChange( { ...element, value: values } )
                }
            />
        </div>
    );
}
