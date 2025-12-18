import { dispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { DokanFieldLabel } from '../../../../../../../components/fields';
import settingsStore from '../../../../../../../stores/adminSettings';
import { SettingsProps } from '../../../types';
import CustomizeRadioCore from './CustomizeRadioCore';
import { twMerge } from 'tailwind-merge';

const CustomizeRadio = ( { element }: SettingsProps ) => {
    const [ selected, setSelected ] = useState(
        element?.value || element?.default
    );

    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const handleChange = ( newValue: string | number ) => {
        setSelected( newValue );

        // Call external onChange if provided
        if ( element?.onChange ) {
            element.onChange( newValue );
        }

        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    // Transform element options to RadioOption format

    return (
        <div
            className={ twMerge(
                'p-4',
                element?.wrapper_class || ''
            ) }
            id={ element.hook_key }
        >
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="bold"
                helperText={ element?.description || '' }
                imageUrl={ element?.image_url }
            />
            <CustomizeRadioCore
                options={ element?.options }
                selectedValue={ ( selected as string | number ) || '' }
                onChange={ handleChange }
                radioVariant={
                    ( element?.radio_variant as
                        | 'simple'
                        | 'card'
                        | 'template'
                        | 'radio_box' ) || 'simple'
                }
                name={ element?.id }
                className={ element?.css_class || '' }
                disabled={ element?.disabled || false }
                divider={ element?.divider }
            />
        </div>
    );
};

export default CustomizeRadio;
