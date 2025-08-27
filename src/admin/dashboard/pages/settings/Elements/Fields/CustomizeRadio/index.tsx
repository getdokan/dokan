import { dispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { DokanFieldLabel } from '../../../../../../../components/fields';
import settingsStore from '../../../../../../../stores/adminSettings';
import { SettingsProps } from '../../../types';
import CustomizeRadioCore from './CustomizeRadioCore';
import { RadioOption } from './types';
import parse from 'html-react-parser';

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
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    // Transform element options to RadioOption format
    const transformedOptions: RadioOption[] =
        element?.options?.map( ( option: RadioOption ) => ( {
            value: option.value,
            title: parse( option.title ),
            description: parse( option.description ),
            icon: option.icon,
            image: option.image,
            preview: option.preview,
        } ) ) || [];

    return (
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="bold"
                helperText={ element.description }
                imageUrl={ element?.image_url }
            />
            <div className="mt-4">
                <CustomizeRadioCore
                    options={ transformedOptions }
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
                />
            </div>
        </div>
    );
};

export default CustomizeRadio;
