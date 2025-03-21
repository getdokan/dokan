import { debounce } from 'lodash';
import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';
import { useState, useEffect } from '@wordpress/element';
import { MaskedInput, SimpleInput } from "@getdokan/dokan-ui";

const CombineInput = ({ element, onValueChange }: SettingsProps) => {
    const [ values, setValues ] = useState( {
        percentage: '',
        fixed: ''
    } );

    const { currency } = adminWithdrawData;
    const getCurrencySymbol = currency?.symbol;

    // Initialize values from element
    useEffect( () => {
        if ( element ) {
            setValues( {
                percentage : element.percentage || '',
                fixed      : element.fixed || ''
            } );
        }
    }, [ element ] );

    // Handle change for percentage input
    const handlePercentageChange = debounce( ( value ) => {
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
            percentage: validatedValue
        } ) );

        // Emit change to parent component
        onValueChange( {
            ...element,
            percentage: validatedValue,
            fixed: values.fixed
        } );
    }, 500 );

    // Handle change for fixed input
    const handleFixedChange = debounce( ( value ) => {
        setValues( prev => ( {
            ...prev,
            fixed: value
        } ) );

        // Emit change to parent component
        onValueChange( {
            ...element,
            percentage: values.percentage,
            fixed: value
        } );
    }, 500 );

    // Format and unformat values
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

    const formatValue = (value) => {
        if (value === '') {
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

    if ( ! element.display ) {
        return null;
    }

    return (
        <div
            id={element.hook_key + '_div'}
            className=" @container/currency grid grid-cols-12 p-4 gap-2"
        >
            <div className="flex flex-col @sm/currency:col-span-8 col-span-12 gap-1">
                <h2 className="text-sm @sm/currency:text-base leading-6 font-semibold text-gray-900">
                    <RawHTML>{ element?.title }</RawHTML>
                </h2>
                <p className="text-xs @sm/currency:text-sm font-normal text-[#828282] mt-1">
                    <RawHTML>{ element?.description }</RawHTML>
                </p>
            </div>
            <div className="@sm/currency:col-span-4 col-span-12 flex items-center @sm/currency:justify-end space-x-2">
                <MaskedInput
                    value={ formatValue( values.percentage ) }
                    onChange={ ( e ) => handlePercentageChange( e.target.value ) }
                    addOnRight={ <span>{ __( '%', 'dokan-lite' ) }</span> }
                    className={ `w-24 h-10 rounded focus:border-gray-300 focus:ring-0` }
                />

                <div className="text-gray-500 text-lg">
                    { __( '+', 'dokan-lite' ) }
                </div>

                <MaskedInput
                    addOnLeft={ getCurrencySymbol }
                    value={ formatValue( values.fixed ) }
                    onChange={ ( e ) => handleFixedChange( e.target.value ) }
                    maskRule={ {
                        numeral: true,
                        numeralDecimalMark: currency?.decimal ?? '.',
                        delimiter: currency?.thousand ?? ',',
                        numeralDecimalScale: currency?.precision ?? 2,
                    } }
                    className={ `w-24 h-10 rounded focus:border-gray-300 focus:ring-0 border-l-0` }
                />
            </div>
        </div>
    );
};

export default CombineInput;
