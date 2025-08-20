import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DokanFieldLabel } from '../../../../../../components/fields';
import RichText from '../../../../../../components/richtext/RichText';
import { dispatch } from '@wordpress/data';
import settingsStore from '../../../../../../stores/adminSettings';

const DokanRichText = ( { element } ) => {
    if ( ! element.display ) {
        return <></>;
    }

    const [ value, setValue ] = useState< string >(
        element?.value || element?.default || ''
    );
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const handleChange = ( newValue: string ) => {
        setValue( newValue );
        if ( onValueChange ) {
            onValueChange( { ...element, value: newValue } );
        }
    };

    return (
        <div className="space-y-3 p-5 w-full">
            <div className="gap-4 flex items-center">
                <DokanFieldLabel
                    titleFontWeight="bold"
                    title={ element.title || '' }
                    helperText={ element.description || '' }
                    wrapperClassNames={ element.title ? 'pb-2' : '' }
                    imageUrl={ element?.image_url }
                />
            </div>

            <RichText
                value={ value }
                onChange={ handleChange }
                readOnly={ element.disabled || false }
                placeholder={
                    element.placeholder ||
                    __( 'Enter your content…', 'dokan-lite' )
                }
            />
        </div>
    );
};

export default DokanRichText;
