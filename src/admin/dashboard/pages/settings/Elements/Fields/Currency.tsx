import React, { useState } from '@wordpress/element';
import { SettingsProps } from '../../types';
import { DokanFieldLabel } from '../../../../../../components/fields';
import { MaskedInput } from '@getdokan/dokan-ui';

// Declare global variables
declare global {
    interface Window {
        dokanWithdrawDashboard?: {
            currency?: {
                symbol: string;
                thousand: string;
                decimal: string;
                precision: number;
                position?: string;
            };
        };
        accounting?: {
            unformat: ( value: string, decimal: string ) => number;
            formatNumber: (
                value: string,
                precision: number,
                thousand: string,
                decimal: string
            ) => string;
        };
    }
}

const formatNumber = ( value: string ) => {
    if ( value === '' ) {
        return value;
    }

    if ( ! window.accounting ) {
        // eslint-disable-next-line no-console
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return value;
    }

    if ( ! window?.dokanWithdrawDashboard?.currency ) {
        // eslint-disable-next-line no-console
        console.warn( 'Dokan Currency Data Not Found' );
        return value;
    }

    return window.accounting.formatNumber(
        value,
        window?.dokanWithdrawDashboard?.currency.precision,
        window?.dokanWithdrawDashboard?.currency.thousand,
        window?.dokanWithdrawDashboard?.currency.decimal
    );
};

const unformatNumber = ( value: string ) => {
    if ( value === '' ) {
        return value;
    }

    if ( ! window.accounting ) {
        // eslint-disable-next-line no-console
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return value;
    }

    if ( ! window?.dokanWithdrawDashboard?.currency ) {
        // eslint-disable-next-line no-console
        console.warn( 'Dokan Currency Data Not Found' );
        return value;
    }

    return window.accounting.unformat(
        value,
        window?.dokanWithdrawDashboard?.currency.decimal
    );
};

const Currency = ( { element, onValueChange }: SettingsProps ) => {
    const [ localValue, setLocalValue ] = useState( element.value );
    const [ fieldError, setFieldError ] = useState< string | null >( null );

    if ( ! element.display ) {
        return null;
    }

    const handleValueChange = ( formattedValue: string, unformattedValue: number ) => {
        setFieldError( null );
        setLocalValue( formattedValue );

        // handle negative values
        if ( unformattedValue < 0 ) {
            setFieldError( 'Invalid value' );
            return;
        }

        onValueChange( {
            ...element,
            value: formattedValue,
        } );
    };

    const currencySymbol = window?.dokanWithdrawDashboard?.currency?.symbol ?? '';
    const position = window?.dokanWithdrawDashboard?.currency?.position ?? 'left';

    return (
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <div className="mt-2">
                <MaskedInput
                    value={ formatNumber( localValue as string ) }
                    onChange={ ( e: any ) => {
                        const formattedValue = e.target.value;
                        const unformattedValue = unformatNumber( formattedValue );
                        handleValueChange( formattedValue, unformattedValue );
                    } }
                    maskRule={ {
                        numeral: true,
                        numeralDecimalMark:
                            window?.dokanWithdrawDashboard?.currency?.decimal ?? '.',
                        delimiter:
                            window?.dokanWithdrawDashboard?.currency?.thousand ?? ',',
                        numeralDecimalScale:
                            window?.dokanWithdrawDashboard?.currency?.precision ?? 2,
                    } }
                    errors={ fieldError ? [ fieldError ] : [] }
                    className="w-full h-10 rounded focus:border-gray-300 focus:ring-0"
                    addOnLeft={ position === 'left' || position === 'left_space' ? currencySymbol : undefined }
                    addOnRight={ position === 'right' || position === 'right_space' ? currencySymbol : undefined }
                />
            </div>
        </div>
    );
};

export default Currency;
