import { dispatch } from '@wordpress/data';
import { FileUpload, FieldLabel } from '@wedevs/plugin-ui';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanFileUploadField( { element, onValueChange } ) {
    if ( ! element.display ) {
        return null;
    }

    const handleChange = ( url: string ) => {
        const updatedElement = { ...element, value: url };
        onValueChange?.( updatedElement );
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-col gap-2 w-full p-5">
            { ( element.title || element.description ) && (
                <FieldLabel
                    title={ element.title }
                    description={ element.description }
                    tooltip={ element.helper_text }
                    imageUrl={ element?.image_url }
                    htmlFor={ element.id }
                    isBold={ true }
                />
            ) }
            <FileUpload
                id={ element.id }
                value={ element.value as string }
                onChange={ handleChange }
                disabled={ element.disabled }
                allowedTypes={ element.allowed_types || [ 'image' ] }
                previewMode="image"
            />
        </div>
    );
}
