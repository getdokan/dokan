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
    inputProps?: React.InputHTMLAttributes< HTMLInputElement >;
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
    helperText,
    required = false,
    containerClassName = '',
    inputClassName = '',
    maxLength,
    showCharCount = false,
    onFocus,
    onBlur,
    validation,
    actionsButtons,
    inputProps = {},
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

    // Determine if counter should be shown
    const showCounter = showCharCount || !! maxLength;

    return (
        <div
            className={ twMerge(
                `flex items-center flex-1  gap-4 h-10  w-full `,
                containerClassName
            ) }
        >
            <div className={ twMerge( 'flex-1' ) }>
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
                    className={ twMerge(
                        'rounded h-6 w-full flex-1 focus:!ring-0 focus:!outline-0',
                        disabled ? 'bg-[#F1F1F4] border-gray-200' : '',
                        inputClassName,
                        prefix ? 'rounded-l-none' : '',
                        postfix ? 'rounded-r-none' : ''
                    ) }
                    input={ {
                        type: inputType,
                        maxLength,
                        placeholder,
                        ...inputProps,
                    } }
                    placeholder={ placeholder }
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
