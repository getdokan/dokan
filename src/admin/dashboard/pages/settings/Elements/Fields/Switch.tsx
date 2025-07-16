import { SettingsProps } from '../../types';
import { DokanSwitch } from '../../../../../../components/fields';

const Switch = ( { element, onValueChange }: SettingsProps ) => {
    const handleChange = ( checked: boolean ) => {
        const value = checked
            ? element.enable_state?.value
            : element.disable_state?.value;
        onValueChange( {
            ...element,
            value,
        } );
    };

    return (
        <div className="p-4">
            <DokanSwitch
                checked={ element.value === element.enable_state?.value }
                onChange={ handleChange }
                label={ element.title }
                disabled={ element.disabled }
            />
        </div>
    );
};

export default Switch;
