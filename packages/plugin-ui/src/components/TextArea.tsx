import { useCallback, forwardRef } from '@wordpress/element';
import type { BaseFieldProps } from '../types';

export interface TextAreaProps extends BaseFieldProps {
    /**
     * Number of visible rows
     */
    rows?: number;

    /**
     * Maximum length
     */
    maxLength?: number;

    /**
     * Whether to allow resize
     */
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';

    /**
     * Show character count
     */
    showCount?: boolean;
}

/**
 * TextArea Component
 *
 * A multi-line text input.
 */
const TextArea = forwardRef< HTMLTextAreaElement, TextAreaProps >(
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
            rows = 4,
            maxLength,
            resize = 'vertical',
            showCount = false,
        },
        ref
    ) => {
        const handleChange = useCallback(
            ( e: React.ChangeEvent< HTMLTextAreaElement > ) => {
                onChange?.( e.target.value );
            },
            [ onChange ]
        );

        const currentLength = String( value || '' ).length;
        const resizeClass =
            resize === 'none'
                ? 'resize-none'
                : resize === 'horizontal'
                ? 'resize-x'
                : resize === 'vertical'
                ? 'resize-y'
                : 'resize';

        return (
            <div className="relative">
                <textarea
                    ref={ ref }
                    id={ id }
                    value={ value as string }
                    defaultValue={ defaultValue as string }
                    onChange={ handleChange }
                    placeholder={ placeholder }
                    disabled={ disabled }
                    readOnly={ readOnly }
                    rows={ rows }
                    maxLength={ maxLength }
                    aria-label={ ariaLabel }
                    className={ `
                        block w-full rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        read-only:bg-gray-50
                        ${ resizeClass }
                        ${ className }
                    `.trim() }
                />
                { showCount && maxLength && (
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        { currentLength }/{ maxLength }
                    </div>
                ) }
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';

export default TextArea;
