declare namespace WooCommerceAccounting {
    interface Settings {
        currency: {
            symbol: string;
            format: string;
            decimal: string;
            thousand: string;
            precision: number;
            grouping: number;
        };
        number: {
            precision: number;
            grouping: number;
            thousand: string;
            decimal: string;
        };
    }

    interface UnformatOptions {
        precision?: number|string;
        decimal?: string;
        thousand?: string;
    }

    interface FormatNumberOptions {
        precision?: number;
        thousand?: string;
        decimal?: string;
        format?: string;
    }

    interface AccountingStatic {
        settings: Settings;

        // Formatting methods
        formatMoney(
            number: number | string,
            symbol?: string,
            precision?: number,
            thousand?: string,
            decimal?: string,
            format?: string
        ): string;

        formatNumber(
            number: number | string,
            precision?: number,
            thousand?: string,
            decimal?: string
        ): string;

        formatColumn(
            list: Array<number | string>,
            symbol?: string,
            precision?: number,
            thousand?: string,
            decimal?: string,
            format?: string
        ): Array<string>;

        // Parsing methods
        unformat(
            value: string,
            decimal?: string | UnformatOptions
        ): number;

        // Utility methods
        toFixed(
            value: number,
            precision?: number
        ): string;

        toPrecision(
            value: number,
            precision?: number
        ): string;

        toNumber(value: string | number): number;

        // Helper methods
        isNumber(value: any): boolean;
        isArray(value: any): boolean;
        isObject(value: any): boolean;
        isString(value: any): boolean;
        isFunction(value: any): boolean;
        isDefined(value: any): boolean;

        // Currency formatting helpers
        formatPrice(
            price: number | string,
            args?: FormatNumberOptions
        ): string;

        formatWeight(
            weight: number | string,
            args?: FormatNumberOptions
        ): string;

        formatDimension(
            dimension: number | string,
            args?: FormatNumberOptions
        ): string;

        // Currency data methods
        getCurrencySymbol(): string;
        getCurrencyFormat(): string;
        getCurrencyDecimal(): string;
        getCurrencyThousand(): string;
        getCurrencyPrecision(): number;
    }
}

export default WooCommerceAccounting;
