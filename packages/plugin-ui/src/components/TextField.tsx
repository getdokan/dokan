import { useCallback, forwardRef } from '@wordpress/element';
import type { BaseFieldProps } from '../types';

export interface TextFieldProps extends BaseFieldProps {
    /**
     * Input type (text, email, tel, url, search)
     */
    type?: 'text' | 'email' | 'tel' | 'url' | 'search';

    /**
     * Prefix element (icon or text)
     */
    prefix?: React.ReactNode;

    /**
     * Suffix element (icon or text)
     */
    suffix?: React.ReactNode;

    /**
     * Maximum length
     */
    maxLength?: number;

    /**
     * Minimum length
     */
    minLength?: number;

    /**
     * Pattern for validation
     */
    pattern?: string;

    /**
     * Auto-complete attribute
     */
    autoComplete?: string;

    /**
     * Auto-focus on mount
     */
    autoFocus?: boolean;
}

/**
 * TextField Component
 *
 * A versatile text input component supporting various input types.
 */
const TextField = forwardRef< HTMLInputElement, TextFieldProps >(
    (
        {
            id,
            value,
            defaultValue,
            onChange,
            placeholder,
            disabled = false,
            readOnly = false,
            className = '',
            ariaLabel,
            type = 'text',
            prefix,
            suffix,
            maxLength,
            minLength,
            pattern,
            autoComplete,
            autoFocus,
        },
        ref
    ) => {
        const handleChange = useCallback(
            ( e: React.ChangeEvent< HTMLInputElement > ) => {
                onChange?.( e.target.value );
            },
            [ onChange ]
        );

        const inputClasses = `
            block w-full rounded-md border-gray-300 shadow-sm 
            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            disabled:bg-gray-100 disabled:cursor-not-allowed
            read-only:bg-gray-50
            ${ prefix ? 'pl-10' : '' }
            ${ suffix ? 'pr-10' : '' }
            ${ className }
        `.trim();

        return (
            <div className="relative">
                { prefix && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        { prefix }
                    </div>
                ) }
                <input
                    ref={ ref }
                    id={ id }
                    type={ type }
                    value={ value as string }
                    defaultValue={ defaultValue as string }
                    onChange={ handleChange }
                    placeholder={ placeholder }
                    disabled={ disabled }
                    readOnly={ readOnly }
                    className={ inputClasses }
                    aria-label={ ariaLabel }
                    maxLength={ maxLength }
                    minLength={ minLength }
                    pattern={ pattern }
                    autoComplete={ autoComplete }
                    autoFocus={ autoFocus }
                />
                { suffix && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        { suffix }
                    </div>
                ) }
            </div>
        );
    }
);

TextField.displayName = 'TextField';

export default TextField;

