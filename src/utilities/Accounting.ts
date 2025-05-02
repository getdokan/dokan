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

    if ( ! window?.dokanFrontend?.currency ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return price;
    }

    if ( ! currencySymbol ) {
        currencySymbol = window?.dokanFrontend?.currency.symbol;
    }

    if ( ! precision ) {
        precision = window?.dokanFrontend?.currency.precision;
    }

    if ( ! thousand ) {
        thousand = window?.dokanFrontend?.currency.thousand;
    }

    if ( ! decimal ) {
        decimal = window?.dokanFrontend?.currency.decimal;
    }

    if ( ! format ) {
        format = window?.dokanFrontend?.currency.format;
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

    if ( ! window?.dokanFrontend?.currency ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return value;
    }

    return window.accounting.formatNumber(
        value,
        // @ts-ignore
        window?.dokanFrontend?.currency.precision,
        window?.dokanFrontend?.currency.thousand,
        window?.dokanFrontend?.currency.decimal
    );
};

export const unformatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }
    return window.accounting.unformat(
        value,
        window?.dokanFrontend?.currency.decimal
    );
};

export const withCurrencySymbol = ( value: string ): string => {
    let priceValue = '';
    const currencySymbol = window?.dokanFrontend?.currency?.symbol ?? '';
    const position = window?.dokanFrontend?.currency?.position ?? 'left';

    switch ( position ) {
        case 'left':
        case 'left_space':
            priceValue = `${ currencySymbol }${ value }`;
            break;
        case 'right':
        case 'right_space':
            priceValue = `${ value }${ currencySymbol }`;
            break;
        default:
            break;
    }

    return priceValue;
};
