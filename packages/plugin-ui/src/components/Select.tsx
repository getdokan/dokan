import { useCallback, forwardRef } from '@wordpress/element';
import type { BaseFieldProps, OptionItem } from '../types';

export interface SelectProps extends BaseFieldProps {
    /**
     * Array of options
     */
    options: OptionItem[];

    /**
     * Allow multiple selection
     */
    multiple?: boolean;

    /**
     * Show search/filter
     */
    searchable?: boolean;

    /**
     * Empty state text
     */
    emptyText?: string;
}

/**
 * Select Component
 *
 * A dropdown select input.
 */
const Select = forwardRef< HTMLSelectElement, SelectProps >(
    (
        {
            id,
            value,
            defaultValue,
            onChange,
            placeholder,
            disabled = false,
            className = '',
            ariaLabel,
            options = [],
            multiple = false,
            emptyText = 'No options available',
        },
        ref
    ) => {
        const handleChange = useCallback(
            ( e: React.ChangeEvent< HTMLSelectElement > ) => {
                if ( multiple ) {
                    const selectedOptions = Array.from(
                        e.target.selectedOptions,
                        ( option ) => option.value
                    );
                    onChange?.( selectedOptions );
                } else {
                    onChange?.( e.target.value );
                }
            },
            [ onChange, multiple ]
        );

        return (
            <select
                ref={ ref }
                id={ id }
                value={ value as string | string[] }
                defaultValue={ defaultValue as string | string[] }
                onChange={ handleChange }
                disabled={ disabled }
                multiple={ multiple }
                aria-label={ ariaLabel }
                className={ `
                    block w-full rounded-md border-gray-300 shadow-sm 
                    focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${ className }
                `.trim() }
            >
                { placeholder && ! multiple && (
                    <option value="" disabled>
                        { placeholder }
                    </option>
                ) }
                { options.length === 0 ? (
                    <option value="" disabled>
                        { emptyText }
                    </option>
                ) : (
                    options.map( ( option ) => (
                        <option
                            key={ String( option.value ) }
                            value={ option.value }
                            disabled={ option.disabled }
                        >
                            { option.label }
                        </option>
                    ) )
                ) }
            </select>
        );
    }
);

Select.displayName = 'Select';

export default Select;

