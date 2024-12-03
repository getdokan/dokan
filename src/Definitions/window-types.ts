import { Hooks } from '@wordpress/hooks';
import WooCommerceAccounting from './woocommerce-accounting.d';

/**
 * To get dokan supports just import like a normal js file
 * Ex: import '../path.../src/Definitions/window-types';
 */

declare global {
    interface Window extends Window {
        wp: {
            hooks: Hooks;
        };
        dokanProductSubscription: {
            currencySymbols: Record< string, string >;
        };
        dokan_get_daterange_picker_format: () => string;
        moment: ( date: string ) => any;
        accounting: WooCommerceAccounting.AccountingStatic;
        dokanCurrency: {
            decimal: string;
            format: string;
            precision: string;
            symbol: string;
            thousand: string;
        };
    }
}

// This empty export is necessary to make this a module
export {};
