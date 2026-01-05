import { __ } from '@wordpress/i18n';
import { RichText, FieldLabel } from '@wedevs/plugin-ui';
import { dispatch } from '@wordpress/data';
import settingsStore from '../../../../../../stores/adminSettings';

const DokanRichText = ( { element, onValueChange } ) => {
    if ( ! element.display ) {
        return null;
    }

    const handleChange = ( newValue: string ) => {
        const updatedElement = { ...element, value: newValue };
        onValueChange?.( updatedElement );
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="space-y-3 p-5 w-full">
            { ( element.title || element.description ) && (
                <FieldLabel
                    title={ element.title }
                    description={ element.description }
                    tooltip={ element.helper_text }
                    imageUrl={ element?.image_url }
                    htmlFor={ element.id }
                    isBold={ true }
                    className={ element.title ? 'pb-2' : '' }
                />
            ) }

            <RichText
                id={ element.id }
                value={ element.value as string }
                defaultValue={ element.default as string }
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
