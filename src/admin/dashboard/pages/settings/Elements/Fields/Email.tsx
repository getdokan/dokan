import { SettingsProps } from '../../types';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';

const Email = ( { element, onValueChange }: SettingsProps ) => {
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
            <TextField
                value={ ( element.value as string ) || '' }
                onChange={ handleChange }
                placeholder={ element.placeholder as string }
                disabled={ element.disabled }
                inputType="email"
                helperText={ element.description }
            />
        </div>
    );
};

export default Email;
