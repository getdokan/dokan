import { ToggleSwitch } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';

interface DokanSwitchProps {
    containerClassName?: string;
    checked: boolean;
    onChange: ( value: boolean ) => void;
    color?: string;
    label?: string | React.ReactNode;
    children?: React.ReactNode;
    name?: string;
    value?: string;
    defaultChecked?: boolean;
    helpText?: string | React.ReactNode;
    disabled?: boolean;
    id?: string;
    required?: boolean;
}
const DokanSwitch = ( {
    containerClassName,
    checked,
    onChange,
    disabled = false,
    label,
    ...others
}: DokanSwitchProps ) => {
    return (
        <div
            className={ twMerge(
                'inline-flex flex-col items-center gap-4',
                containerClassName
            ) }
        >
            { /* The ToggleSwitch component from Dokan UI */ }
            <ToggleSwitch
                checked={ checked }
                onChange={ onChange }
                disabled={ disabled }
                label={
                    typeof label === 'string' ? (
                        <span className="text-sm font-normal text-gray-700 ms-2">
                            { label }
                        </span>
                    ) : (
                        label
                    )
                }
                { ...others }
            />
        </div>
    );
};

export default DokanSwitch;
