import { MaskedInput } from '@getdokan/dokan-ui';
import { debounce } from '@wordpress/compose';
import { RawHTML, useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { CombineInputProps, FixedCommissionInputValues } from './types';

const FixedCommissionInput = ( {
    values,
    currency,
    title,
    description,
    hookKey,
    onValueChange,
    display = true,
    debounceDelay = 500,
}: CombineInputProps ) => {
    const [ localValues, setLocalValues ] =
        useState< FixedCommissionInputValues >( values );

    // Utility functions
    const unFormatValue = useCallback(
        ( value: string ): string => {
            if ( value === '' ) {
                return value;
            }

            // Use accounting.js if available, otherwise simple conversion
            if ( window.accounting ) {
                return String(
                    window.accounting.unformat(
                        value,
                        currency?.decimal || '.'
                    )
                );
            }

            return String( value ).replace( /[^0-9.-]/g, '' );
        },
        [ currency?.decimal ]
    );

    const formatValue = useCallback(
        ( value: number | string ): string => {
            if ( value === '' || value === 0 ) {
                return '';
            }

            // Use accounting.js if available, otherwise simple formatting
            if ( window.accounting ) {
                return window.accounting.formatNumber(
                    value,
                    currency?.precision || 2,
                    currency?.thousand || ',',
                    currency?.decimal || '.'
                );
            }

            return String( value );
        },
        [ currency?.precision, currency?.thousand, currency?.decimal ]
    );

    // Handle percentage change
    const handlePercentageChange = useCallback(
        ( value: string ) => {
            // Validate percentage (0-100)
            let validatedValue = value;
            if ( value !== '' ) {
                const numValue = parseFloat( unFormatValue( value ) );
                if ( isNaN( numValue ) || numValue < 0 || numValue > 100 ) {
                    validatedValue = '';
                }
            }

            const newValues = {
                ...localValues,
                admin_percentage:
                    parseFloat( unFormatValue( validatedValue ) ) || 0,
            };

            setLocalValues( newValues );
            onValueChange( newValues );
        },
        [ localValues, unFormatValue, onValueChange ]
    );

    // Handle fixed amount change
    const handleFixedChange = useCallback(
        ( value: string ) => {
            const newValues = {
                ...localValues,
                additional_fee: parseFloat( unFormatValue( value ) ) || 0,
            };

            setLocalValues( newValues );
            onValueChange( newValues );
        },
        [ localValues, unFormatValue, onValueChange ]
    );

    // Debounced handlers
    const debouncedPercentageChange = useMemo(
        () => debounce( handlePercentageChange, debounceDelay ),
        [ handlePercentageChange, debounceDelay ]
    );

    const debouncedFixedChange = useMemo(
        () => debounce( handleFixedChange, debounceDelay ),
        [ handleFixedChange, debounceDelay ]
    );

    // Update local values when props change
    useMemo( () => {
        setLocalValues( values );
    }, [ values ] );

    if ( ! display ) {
        return null;
    }

    return (
        <div
            id={ hookKey }
            className="@container/combine grid grid-cols-12 p-4 gap-2"
        >
            <div className="flex flex-col @xl/combine:col-span-7 col-span-12 gap-1">
                <h2 className="text-sm @md/combine:text-base leading-6 font-semibold text-gray-900">
                    <RawHTML>{ title }</RawHTML>
                </h2>
                <p className="text-xs @md/combine:text-sm font-normal text-[#828282] mt-1">
                    <RawHTML>{ description }</RawHTML>
                </p>
            </div>
            <div className="@xl/combine:col-span-5 col-span-12 flex items-center justify-end space-x-2">
                <MaskedInput
                    value={ formatValue( localValues.admin_percentage ) }
                    addOnRight={ <span>{ __( '%', 'dokan-lite' ) }</span> }
                    onChange={ ( e ) =>
                        debouncedPercentageChange( e.target.value )
                    }
                    maskRule={ {
                        numeral: true,
                        delimiter: currency?.thousand ?? ',',
                        numeralDecimalMark: currency?.decimal ?? '.',
                        numeralDecimalScale: currency?.precision ?? 2,
                    } }
                    className={ `w-24 h-10 rounded rounded-r-none focus:border-gray-300 focus:ring-0` }
                />

                <div className="text-gray-500 text-lg">
                    { __( '+', 'dokan-lite' ) }
                </div>

                <MaskedInput
                    addOnLeft={ currency?.symbol }
                    value={ formatValue( localValues.additional_fee ) }
                    onChange={ ( e ) => debouncedFixedChange( e.target.value ) }
                    maskRule={ {
                        numeral: true,
                        delimiter: currency?.thousand ?? ',',
                        numeralDecimalMark: currency?.decimal ?? '.',
                        numeralDecimalScale: currency?.precision ?? 2,
                    } }
                    className={ `w-24 h-10 rounded focus:border-gray-300 focus:ring-0 border-l-0` }
                />
            </div>
        </div>
    );
};

export default FixedCommissionInput;
