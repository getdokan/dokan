import { RawHTML } from '@wordpress/element';
import '../Definitions/window-types';

type PriceHtmlProps = {
    price: string | number;
    currencySymbol?: string;
    precision?: number;
    thousand?: string;
    decimal?: string;
    format?: PriceFormat;
};

type PriceFormat = '%v%s' | '%s%v' | '%v %s' | '%s %v' | string;

const PriceHtml = ( {
    price = 0,
    currencySymbol = '',
    precision = null,
    thousand = '',
    decimal = '',
    format = '',
}: PriceHtmlProps ) => {
    if ( ! currencySymbol ) {
        currencySymbol = window.dokanCurrency.symbol;
    }

    if ( ! precision ) {
        precision = window.dokanCurrency.precision;
    }

    if ( ! thousand ) {
        thousand = window.dokanCurrency.thousand;
    }

    if ( ! decimal ) {
        decimal = window.dokanCurrency.decimal;
    }

    if ( ! format ) {
        format = window.dokanCurrency.format;
    }

    return (
        <RawHTML>
            { window.accounting.formatMoney(
                price,
                currencySymbol,
                precision,
                thousand,
                decimal,
                format
            ) }
        </RawHTML>
    );
};

export default PriceHtml;
