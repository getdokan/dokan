import { TextArea } from '@getdokan/dokan-ui';

export type TextAreaProps = {
    className?: string;
    label?: React.ReactNode;
    errors?: string[];
    defaultValue?: string;
    value?: string;
    input: TextareaHTMLAttributes< HTMLTextAreaElement >;
    onChange: ChangeEventHandler< HTMLTextAreaElement >;
    helpText?: string;
    required?: boolean;
    disabled?: boolean;
};

const DokanTextArea = ( {
    input,
    label,
    className,
    errors,
    defaultValue,
    value,
    onChange,
    helpText,
    disabled,
    required,
    wrapperClassName = '',
}: TextAreaProps ) => {
    return (
        <div className={ ` ${ wrapperClassName }` }>
            <TextArea
                input={ input }
                className={ className }
                errors={ errors }
                defaultValue={ defaultValue }
                value={ value }
                onChange={ onChange }
                label={ label }
                helpText={ helpText }
                disabled={ disabled }
                required={ required }
            />
        </div>
    );
};

export default DokanTextArea;
