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

    if (
        ! window?.dokanFrontend?.currency &&
        ! window?.dokanAdminDashboard?.currency
    ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return price;
    }

    if ( ! currencySymbol ) {
        currencySymbol =
            window?.dokanFrontend?.currency.symbol ||
            window?.dokanAdminDashboard?.currency.symbol;
    }

    if ( ! precision ) {
        precision =
            window?.dokanFrontend?.currency.precision ||
            window?.dokanAdminDashboard?.currency.precision;
    }

    if ( ! thousand ) {
        thousand =
            window?.dokanFrontend?.currency.thousand ||
            window?.dokanAdminDashboard?.currency.thousand;
    }

    if ( ! decimal ) {
        decimal =
            window?.dokanFrontend?.currency.decimal ||
            window?.dokanAdminDashboard?.currency.decimal;
    }

    if ( ! format ) {
        format =
            window?.dokanFrontend?.currency.format ||
            window?.dokanAdminDashboard?.currency.format;
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

    if (
        ! window?.dokanFrontend?.currency &&
        ! window?.dokanAdminDashboard?.currency
    ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return value;
    }

    return window.accounting.formatNumber(
        value,
        // @ts-ignore
        window?.dokanFrontend?.currency.precision ||
            window?.dokanAdminDashboard?.currency.precision,
        window?.dokanFrontend?.currency.thousand ||
            window?.dokanAdminDashboard?.currency.thousand,
        window?.dokanFrontend?.currency.decimal ||
            window?.dokanAdminDashboard?.currency.decimal
    );
};

export const unformatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }
    return window.accounting.unformat(
        value,
        window?.dokanFrontend?.currency.decimal ||
            window?.dokanAdminDashboard?.currency.decimal
    );
};
