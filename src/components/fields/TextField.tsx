import { useEffect, useState } from '@wordpress/element';
import { SimpleInput } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';

interface TextFieldVariant {
    size: 'sm' | 'md' | 'lg' | 'xl';
    layout: 'horizontal' | 'vertical' | 'compact';
    style: 'default' | 'outlined' | 'filled' | 'minimal';
}

interface TextFieldProps {
    value: string;
    onChange: ( val: string ) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    copyable?: boolean;
    password?: boolean;
    prefix?: React.ReactNode;
    postfix?: React.ReactNode;
    label?: string;
    helperText?: string;
    required?: boolean;
    variant?: Partial< TextFieldVariant >;
    containerClassName?: string;
    inputClassName?: string;
    maxLength?: number;
    showCharCount?: boolean;
    responsive?: boolean;
    autoSize?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    validation?: ( value: string ) => string | null;
    actionsButtons?: React.ReactNode;
    inputType?: React.HTMLInputTypeAttribute;
    wrapperClassName?: string;
    status?: 'default' | 'error' | 'success' | 'warning' | 'info';
}

const TextField: React.FC< TextFieldProps > = ( {
    value,
    inputType = 'text',
    onChange,
    placeholder,
    disabled = false,
    error,
    prefix,
    postfix,
    label,
    helperText,
    required = false,
    containerClassName = '',
    wrapperClassName = '',
    inputClassName = '',
    maxLength,
    showCharCount = false,
    onFocus,
    onBlur,
    validation,
    actionsButtons,
    status = 'default',
} ) => {
    const [ validationError, setValidationError ] = useState< string | null >(
        null
    );

    // Run validation on initial render and when value changes
    useEffect( () => {
        if ( validation ) {
            const validationResult = validation( value );
            setValidationError( validationResult );
        }
    }, [ value, validation ] );

    const handleChange = ( newValue: string ) => {
        onChange( newValue );
    };

    const displayError = error || validationError;

    // If there's an error, override the status
    const fieldStatus = displayError ? 'error' : status;

    // Determine if counter should be shown
    const showCounter = showCharCount || !! maxLength;

    // Get appropriate border color based on status
    const getBorderColorClass = () => {
        switch ( fieldStatus ) {
            case 'error':
                return 'border-dokan-danger hover:border-dokan-danger-hover';
            case 'success':
                return 'border-dokan-success hover:border-dokan-success-hover';
            case 'warning':
                return 'border-dokan-warning hover:border-dokan-warning-hover';
            case 'info':
                return 'border-dokan-info hover:border-dokan-info-hover';
            default:
                return 'border-[#E9E9E9] focus:border-dokan-btn hover:border-dokan-btn-hover';
        }
    };

    return (
        <div
            className={ twMerge(
                `flex items-start  gap-4 h-10  w-full `,
                containerClassName
            ) }
        >
            <div
                className={ twMerge(
                    'flex flex-col flex-1 w-[18rem] ',
                    wrapperClassName
                ) }
            >
                <SimpleInput
                    value={ value }
                    onChange={ ( e ) => handleChange( e.target.value ) }
                    onFocus={ onFocus }
                    onBlur={ onBlur }
                    helpText={ helperText }
                    counter={ showCounter }
                    required={ required }
                    disabled={ disabled }
                    errors={ displayError ? [ displayError ] : [] }
                    label={ label }
                    className={ twMerge(
                        'rounded  w-full',
                        getBorderColorClass(),
                        disabled ? 'bg-[#F1F1F4] border-gray-200' : '',
                        inputClassName,
                        prefix ? 'rounded-l-none' : '',
                        postfix ? 'rounded-r-none' : ''
                    ) }
                    input={ {
                        type: inputType,
                        placeholder,
                        maxLength,
                    } }
                    addOnLeft={ prefix || null }
                    addOnRight={ postfix || null }
                />
            </div>
            { actionsButtons && (
                <div className="flex items-center gap-2">
                    { actionsButtons }
                </div>
            ) }
        </div>
    );
};

export default TextField;
