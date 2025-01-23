import '../definitions/window-types';

function formatPrice(
    price = 0,
    currencySymbol = '',
    precision = null,
    thousand = '',
    decimal = '',
    format = ''
): string {
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

    return window.accounting.formatMoney(
        price,
        currencySymbol,
        precision,
        thousand,
        decimal,
        format
    );
}

export default formatPrice;
