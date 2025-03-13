// Reusable toggle switch component
import { ToggleSwitch } from '@getdokan/dokan-ui';

const DokanToggleSwitch = ( { enabled, onChange, label = 'Enabled' } ) => {
    return (
        <div className="flex items-center">
            <ToggleSwitch
                checked={ enabled }
                onChange={ onChange }
                label={ label }
                color="primary"
            />
        </div>
    );
};

export default DokanToggleSwitch;
