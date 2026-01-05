import { useCallback } from '@wordpress/element';
import type { OptionItem } from '../types';

export interface CheckboxGroupProps {
    /**
     * Selected values
     */
    value?: ( string | number )[];

    /**
     * Default values
     */
    defaultValue?: ( string | number )[];

    /**
     * Options array
     */
    options: OptionItem[];

    /**
     * Change handler
     */
    onChange?: ( values: ( string | number )[] ) => void;

    /**
     * Whether group is disabled
     */
    disabled?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Layout direction
     */
    direction?: 'horizontal' | 'vertical';

    /**
     * Number of columns (for grid layout)
     */
    columns?: number;
}

/**
 * CheckboxGroup Component
 *
 * A group of checkboxes for multiple selection.
 */
const CheckboxGroup = ( {
    value = [],
    defaultValue = [],
    options = [],
    onChange,
    disabled = false,
    className = '',
    direction = 'vertical',
    columns,
}: CheckboxGroupProps ) => {
    const currentValues = value.length > 0 ? value : defaultValue;

    const handleChange = useCallback(
        ( optionValue: string | number, checked: boolean ) => {
            let newValues: ( string | number )[];

            if ( checked ) {
                newValues = [ ...currentValues, optionValue ];
            } else {
                newValues = currentValues.filter( ( v ) => v !== optionValue );
            }

            onChange?.( newValues );
        },
        [ currentValues, onChange ]
    );

    const layoutClass = columns
        ? `grid gap-3`
        : direction === 'horizontal'
        ? 'flex flex-wrap gap-4'
        : 'flex flex-col gap-3';

    const gridStyle = columns
        ? { gridTemplateColumns: `repeat(${ columns }, minmax(0, 1fr))` }
        : undefined;

    return (
        <div className={ `${ layoutClass } ${ className }` } style={ gridStyle }>
            { options.map( ( option ) => {
                const optionId = `checkbox-${ option.value }`;
                const isChecked = currentValues.includes( option.value );
                const isDisabled = disabled || option.disabled;

                return (
                    <label
                        key={ String( option.value ) }
                        htmlFor={ optionId }
                        className={ `flex items-start gap-3 cursor-pointer ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }` }
                    >
                        <div className="flex items-center h-5">
                            <input
                                id={ optionId }
                                type="checkbox"
                                checked={ isChecked }
                                onChange={ ( e ) =>
                                    handleChange(
                                        option.value,
                                        e.target.checked
                                    )
                                }
                                disabled={ isDisabled }
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-700">
                                { option.label }
                            </span>
                            { option.description && (
                                <p className="text-xs text-gray-500">
                                    { option.description }
                                </p>
                            ) }
                        </div>
                    </label>
                );
            } ) }
        </div>
    );
};

export default CheckboxGroup;

