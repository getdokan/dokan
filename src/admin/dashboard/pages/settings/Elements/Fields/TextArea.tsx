import { SettingsProps } from '../../types';
import {
    DokanFieldLabel,
    DokanTextArea,
} from '../../../../../../components/fields';

const TextArea = ( { element, onValueChange }: SettingsProps ) => {
    const handleChange = (
        event: React.ChangeEvent< HTMLTextAreaElement >
    ) => {
        onValueChange( {
            ...element,
            value: event.target.value,
        } );
    };

    return (
        <div className="flex justify-between p-4" id={ element.hook_key }>
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanTextArea
                value={ ( element.value as string ) || '' }
                onChange={ handleChange }
                input={ {
                    placeholder: element.placeholder as string,
                    disabled: element.disabled,
                } }
            />
        </div>
    );
};

export default TextArea;
