import { MaskedInput } from '@getdokan/dokan-ui';
import { dispatch } from '@wordpress/data';
import React from 'react';
import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanCurrency( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    const currency = window?.dokanWithdrawDashboard?.currency || {
        symbol: '$',
        thousand: ',',
        decimal: '.',
        precision: 2,
    };

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
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
