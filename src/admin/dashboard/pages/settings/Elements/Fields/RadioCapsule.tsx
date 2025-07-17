import { SettingsProps } from '../../types';
import {
    DokanFieldLabel,
    DokanRadioCapsule,
} from '../../../../../../components/fields';

const RadioCapsule = ( { element, onValueChange }: SettingsProps ) => {
    const handleChange = ( value: string ) => {
        onValueChange( {
            ...element,
            value,
        } );
    };

    return (
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanRadioCapsule
                options={
                    element.options?.map( ( option ) => ( {
                        value: option.value as string,
                        title: option.title,
                    } ) ) || []
                }
                selected={ ( element.value as string ) || '' }
                onChange={ handleChange }
            />
        </div>
    );
};

export default RadioCapsule;
