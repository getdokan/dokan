import { Badge, MaskedInput } from '@getdokan/dokan-ui';
import { debounce } from '@wordpress/compose';
import { RawHTML, useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { CombineInputProps, FixedCommissionInputValues } from './types';
import { twMerge } from 'tailwind-merge';

const FixedCommissionInput = ( {
    values,
    currency,
    title,
    description,
    hookKey,
    onValueChange,
    isAutomated = false,
    display = true,
    debounceDelay = 500,
    validationError,
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
            const unformatted = unFormatValue( value );
            let validatedValue: string | number = unformatted;

            // Validate percentage (0-100)
            if ( unformatted !== '' ) {
                const numValue = parseFloat( unformatted );
                if ( isNaN( numValue ) || numValue < 0 || numValue > 100 ) {
                    validatedValue = '';
                } else {
                    validatedValue = numValue;
                }
            }

            const newValues = {
                ...localValues,
                admin_percentage: validatedValue,
            };
            setLocalValues( newValues );
            onValueChange( newValues );
        },
        [ localValues, unFormatValue, onValueChange ]
    );

    // Handle fixed amount change
    const handleFixedChange = useCallback(
        ( value: string ) => {
            const unformatted = unFormatValue( value );

            const newValues = {
                ...localValues,
                additional_fee: unformatted,
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

    // Check if we have title, description, or validation error
    const hasContent = title || description || validationError;

    return (
        <div
            id={ hookKey }
            className="@container/combine grid grid-cols-12 p-4 gap-2 w-full"
        >
            { hasContent && (
                <div className="flex flex-col justify-center @xl/combine:col-span-7 col-span-12 gap-1">
                    { title && (
                        <h2 className="text-sm @md/combine:text-base leading-6 font-semibold text-gray-900">
                            <RawHTML>{ title }</RawHTML>
                        </h2>
                    ) }
                    { description && (
                        <p className="text-xs @md/combine:text-sm font-normal text-[#828282] mt-1">
                            <RawHTML>{ description }</RawHTML>
                        </p>
                    ) }
                    { validationError && (
                        <i className="text-sm font-light text-[#9F2225]">
                            <RawHTML>{ validationError }</RawHTML>
                        </i>
                    ) }
                </div>
            ) }
            <div
                className={ twMerge(
                    'col-span-12 flex items-center space-x-2',
                    hasContent ? '@xl/combine:col-span-5' : '',
                    hasContent ? 'justify-end' : 'justify-start'
                ) }
            >
                { isAutomated ? (
                    <Badge
                        color="gray"
                        className="px-3 py-1 text-sm font-medium"
                        label={ __( 'Automated', 'dokan-lite' ) }
                    />
                ) : (
                    <>
                        <MaskedInput
                            value={ formatValue(
                                localValues.admin_percentage
                            ) }
                            addOnRight={
                                <span>{ __( '%', 'dokan-lite' ) }</span>
                            }
                            onChange={ ( e ) =>
                                debouncedPercentageChange( e.target.value )
                            }
                            maskRule={ {
                                numeral: true,
                                delimiter: currency?.thousand ?? ',',
                                numeralDecimalMark: currency?.decimal ?? '.',
                                numeralDecimalScale: currency?.precision ?? 2,
                            } }
                            // `!m-0` kills WordPress admin's `input { margin: 0 1px }`,
                            // which otherwise pushes a 1px gap into the seam with
                            // the addon and breaks the shared frame.
                            className={ `w-24 h-10 rounded focus:border-gray-300 focus:ring-0 !m-0 !border-r-0 !rounded-r-none` }
                        />

                        <div className="text-gray-500 text-lg">
                            { __( '+', 'dokan-lite' ) }
                        </div>

                        <MaskedInput
                            addOnLeft={ currency?.symbol }
                            value={ formatValue( localValues.additional_fee ) }
                            onChange={ ( e ) =>
                                debouncedFixedChange( e.target.value )
                            }
                            maskRule={ {
                                numeral: true,
                                delimiter: currency?.thousand ?? ',',
                                numeralDecimalMark: currency?.decimal ?? '.',
                                numeralDecimalScale: currency?.precision ?? 2,
                            } }
                            // Keep the left border — dokan-ui's addOnLeft span ships
                            // `border-r-0`, so the input has to draw the seam — and
                            // `!m-0` removes WP admin's 1px input margin that would
                            // otherwise hold the two halves apart.
                            className={ `w-24 h-10 rounded focus:border-gray-300 focus:ring-0 !m-0 !rounded-l-none` }
                        />
                    </>
                ) }
            </div>
        </div>
    );
};

export default FixedCommissionInput;
