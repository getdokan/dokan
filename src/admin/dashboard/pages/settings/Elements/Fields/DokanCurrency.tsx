import React from 'react';
import { DokanFieldLabel } from '../../../../../../components/fields';
import { MaskedInput } from '@getdokan/dokan-ui';

export default function DokanCurrency( { element, onValueChange } ) {
    const currency = window?.dokanWithdrawDashboard?.currency || {
        symbol: '$',
        thousand: ',',
        decimal: '.',
        precision: 2,
    };
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <MaskedInput
                value={ element.value }
                onChange={ ( e ) =>
                    onValueChange( { ...element, value: e.target.value } )
                }
                maskRule={ {
                    numeral: true,
                    numeralDecimalMark: currency.decimal,
                    delimiter: currency.thousand,
                    numeralDecimalScale: currency.precision,
                } }
                className="w-full h-10 rounded focus:border-gray-300 focus:ring-0"
                addOnLeft={
                    currency.position === 'left' ||
                    currency.position === 'left_space'
                        ? currency.symbol
                        : undefined
                }
                addOnRight={
                    currency.position === 'right' ||
                    currency.position === 'right_space'
                        ? currency.symbol
                        : undefined
                }
            />
        </div>
    );
}
