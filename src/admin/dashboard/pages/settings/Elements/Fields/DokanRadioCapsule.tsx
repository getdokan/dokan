import { dispatch } from '@wordpress/data';
import { RadioCapsule, FieldLabel } from '@wedevs/plugin-ui';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanRadioCapsule( { element, onValueChange } ) {
    if ( ! element.display ) {
        return null;
    }

    const handleChange = ( val: string | number ) => {
        const updatedElement = { ...element, value: val };
        onValueChange?.( updatedElement );
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-wrap gap-4 justify-between items-center w-full p-5">
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
            <RadioCapsule
                name={ element.id }
                value={ element.value as string | number }
                defaultValue={ element.default as string | number }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                        icon: option.icon,
                    } ) ) || []
                }
                onChange={ handleChange }
                disabled={ element.disabled }
            />
        </div>
    );
}
