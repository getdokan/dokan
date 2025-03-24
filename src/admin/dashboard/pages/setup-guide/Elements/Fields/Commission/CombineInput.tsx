import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { debounce } from '@wordpress/compose';
import { SettingsProps } from '../../StepSettings';
import { useState } from '@wordpress/element';
import { MaskedInput } from "@getdokan/dokan-ui";

const CombineInput = ({ element, onValueChange }: SettingsProps) => {
    const [ values, setValues ] = useState( element.value );

    const { currency } = adminWithdrawData;
    const getCurrencySymbol = currency?.symbol;

    const handlePercentageChange = ( value ) => {
        // Validate percentage (0-100)
        let validatedValue = value;
        if ( value !== '' ) {
            const numValue = parseFloat( unFormatValue( value ) );
            if ( isNaN( numValue ) || numValue < 0 || numValue > 100 ) {
                validatedValue = '';
            }
        }

        setValues( prev => ( {
            ...prev,
            admin_percentage : parseFloat( unFormatValue( validatedValue ) )
        } ) );

        onValueChange( {
            ...element,
            value: {
                ...values,
                admin_percentage : parseFloat( unFormatValue( validatedValue ) ),
            }
        } );
    };

    const handleFixedChange = ( value ) => {
        setValues( prev => ( {
            ...prev,
            additional_fee : parseFloat( unFormatValue( value ) )
        } ) );

        onValueChange( {
            ...element,
            value: {
                ...values,
                additional_fee : parseFloat( unFormatValue( value ) )
            }
        } );
    };

    const unFormatValue = ( value ) => {
        if ( value === '' ) {
            return value;
        }

        // Use accounting.js if available, otherwise simple conversion
        if ( window.accounting ) {
            return String( window.accounting.unformat( value, currency?.decimal || '.' ) );
        }

        return String( value ).replace( /[^0-9.-]/g, '' );
    };

    const formatValue = ( value ) => {
        if ( value === '' ) {
            return value;
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

        return value;
    };

    // Apply to debounce for percentage and fixed amount change.
    const debounceWithPercentageAmountChange = debounce( handlePercentageChange, 500 );
    const debounceWithFixedAmountChange = debounce( handleFixedChange, 500 );

    if ( ! element.display ) {
        return null;
    }

    return (
        <div
            id={ element.hook_key + '_div' }
            className=" @container/combine grid grid-cols-12 p-4 gap-2"
        >
            <div className="flex flex-col @xl/combine:col-span-7 col-span-12 gap-1">
                <h2 className="text-sm @md/combine:text-base leading-6 font-semibold text-gray-900">
                    <RawHTML>{ element?.title }</RawHTML>
                </h2>
                <p className="text-xs @md/combine:text-sm font-normal text-[#828282] mt-1">
                    <RawHTML>{ element?.description }</RawHTML>
                </p>
            </div>
            <div className="@xl/combine:col-span-5 col-span-12 flex items-center justify-end space-x-2">
                <MaskedInput
                    value={ formatValue( values.admin_percentage ) }
                    addOnRight={ <span>{ __( '%', 'dokan-lite' ) }</span> }
                    onChange={ ( e ) =>
                        debounceWithPercentageAmountChange( e.target.value )
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
                    addOnLeft={ getCurrencySymbol }
                    value={ formatValue( values.additional_fee ) }
                    onChange={ ( e ) =>
                        debounceWithFixedAmountChange( e.target.value )
                    }
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

export default CombineInput;
