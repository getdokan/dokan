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

    if ( ! window?.dokanFrontend?.dokanCurrency ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return price;
    }

    if ( ! currencySymbol ) {
        currencySymbol = window?.dokanFrontend?.dokanCurrency.symbol;
    }

    if ( ! precision ) {
        precision = window?.dokanFrontend?.dokanCurrency.precision;
    }

    if ( ! thousand ) {
        thousand = window?.dokanFrontend?.dokanCurrency.thousand;
    }

    if ( ! decimal ) {
        decimal = window?.dokanFrontend?.dokanCurrency.decimal;
    }

    if ( ! format ) {
        format = window?.dokanFrontend?.dokanCurrency.format;
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

export const formatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }

    if ( ! window.accounting ) {
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return value;
    }

    if ( ! window?.dokanFrontend?.dokanCurrency ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return value;
    }

    return window.accounting.formatNumber(
        value,
        // @ts-ignore
        window?.dokanFrontend?.dokanCurrency.precision,
        window?.dokanFrontend?.dokanCurrency.thousand,
        window?.dokanFrontend?.dokanCurrency.decimal
    );
};
