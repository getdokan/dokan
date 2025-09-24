import { ToggleSwitch } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';

interface DokanBaseSwitchProps {
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

const DokanBaseSwitch = ( {
    containerClassName,
    checked,
    onChange,
    disabled = false,
    label,
    color = 'primary',
    defaultChecked,
    ...others
}: DokanBaseSwitchProps ) => {
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
                color={ color }
                label={ label }
                defaultChecked={ defaultChecked }
                { ...others }
            />
        </div>
    );
};

export default DokanBaseSwitch;
