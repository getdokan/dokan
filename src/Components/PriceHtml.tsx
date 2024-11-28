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
        currencySymbol = window.accounting.settings.currency.symbol;
    }

    if ( ! precision ) {
        precision = window.accounting.settings.currency.precision;
    }

    if ( ! thousand ) {
        thousand = window.accounting.settings.currency.thousand;
    }

    if ( ! decimal ) {
        decimal = window.accounting.settings.currency.decimal;
    }

    if ( ! format ) {
        format = window.accounting.settings.currency.format;
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
