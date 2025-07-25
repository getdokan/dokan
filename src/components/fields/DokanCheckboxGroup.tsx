import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';

export interface DokanCheckboxGroupProps {
    name?: string;
    label?: string;
    helpText?: string;
    className?: string;
    options: Array< {
        value: string | number;
        label: string | React.ReactNode;
        indeterminate?: boolean;
    } >;
    defaultValue?: Array< string | number >;
    errors?: string[];
    onChange?: ( checkedList: Array< string | number > ) => void;
    wrapperClassName?: string;
}

const DokanCheckboxGroup = ( {
    name,
    label,
    helpText,
    className = '',
    options = [],
    defaultValue = [],
    errors = [],
    onChange,
    wrapperClassName = '',
}: DokanCheckboxGroupProps ) => {
    return (
        <div className={ `flex flex-col gap-4 ${ wrapperClassName }` }>
            <SimpleCheckboxGroup
                name={ name }
                label={ label }
                helpText={ helpText }
                className={ className }
                options={ options }
                defaultValue={ defaultValue }
                errors={ errors }
                onChange={ onChange }
            />
        </div>
    );
};

export default DokanCheckboxGroup;
