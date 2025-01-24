import '../definitions/window-types';

export const formatPrice = (
    price: number | string = '',
    currencySymbol = '',
    precision = null,
    thousand = '',
    decimal = '',
    format = ''
): string | number => {
    if ( ! window.accounting ) {
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return price;
    }

    if ( ! window.dokanCurrency ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return price;
    }

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
};

export default formatPrice;

export const formatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }

    if ( ! window.accounting ) {
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return value;
    }

    if ( ! window.dokanCurrency ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return value;
    }

    return window.accounting.formatNumber(
        value,
        // @ts-ignore
        window.dokanCurrency.precision,
        window.dokanCurrency.thousand,
        window.dokanCurrency.decimal
    );
};
