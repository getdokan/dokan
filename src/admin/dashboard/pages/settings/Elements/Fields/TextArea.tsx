import { SettingsProps } from '../../types';
import { DokanTextArea } from '../../../../../../components/fields';

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
        <div className="p-4">
            <DokanTextArea
                label={ element.title }
                helpText={ element.description }
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
