import { dispatch } from '@wordpress/data';
import { TimePicker, FieldLabel } from '@wedevs/plugin-ui';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanTimePickerField( { element, onValueChange } ) {
    if ( ! element.display ) {
        return null;
    }

    const handleChange = ( val: string ) => {
        const updatedElement = { ...element, value: val };
        onValueChange?.( updatedElement );
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-col gap-2 w-full p-4">
            { ( element.title || element.description ) && (
                <FieldLabel
                    title={ element.title }
                    description={ element.description }
                    tooltip={ element.helper_text }
                    imageUrl={ element?.image_url }
                    htmlFor={ element.id }
                    isBold={ true }
                    className="md:max-w-[60%]"
                />
            ) }
            <TimePicker
                id={ element.id }
                value={ element.value as string }
                defaultValue={ element.default as string }
                onChange={ handleChange }
                placeholder={ element.placeholder as string }
                disabled={ element.disabled }
                className="w-full"
            />
        </div>
    );
}
