import { SimpleCheckbox } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';

export interface DokanBaseCheckboxProps {
    checked?: boolean;
    indeterminate?: boolean;
    input: {
        [ key: string ]: any;
    };
    label?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onChange?: React.ChangeEventHandler< HTMLInputElement >;
    wrapperClassName?: string;
}

const DokanBaseCheckbox = ( {
    checked,
    onChange,
    disabled = false,
    label,
    input,
    wrapperClassName,
}: DokanBaseCheckboxProps ) => {
    return (
        <div
            className={ twMerge(
                'inline-flex items-center ',
                wrapperClassName
            ) }
        >
            <SimpleCheckbox
                checked={ checked }
                onChange={ onChange }
                disabled={ disabled }
                input={ input }
                label={ label }
            />
        </div>
    );
};

export default DokanBaseCheckbox;
