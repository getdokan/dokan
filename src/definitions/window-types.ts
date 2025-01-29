import { Hooks } from '@wordpress/hooks';
import WooCommerceAccounting from './woocommerce-accounting.d';

/**
 * To get dokan supports just import like a normal js file
 * Ex: import '../path.../src/Definitions/window-types';
 */

interface DokanCurrency {
    precision: number;
    symbol: string;
    decimal: string;
    thousand: string;
    format: string;
}

interface DokanWithdraw {
    paymentSettingUrl: string;
}

interface DokanFrontend {
    dokanCurrency: DokanCurrency;
    dokanWithdraw: DokanWithdraw;
}

declare global {
    interface Window extends Window {
        wp: {
            hooks: Hooks;
        };
        dokan_get_daterange_picker_format: () => string;
        moment: ( date: string ) => any;
        accounting: WooCommerceAccounting.AccountingStatic;
        dokanFrontend: DokanFrontend;
    }
}

// This empty export is necessary to make this a module
export {};
