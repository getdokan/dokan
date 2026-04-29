// Type declarations for webpack externals

// jQuery - mapped to global jQuery
declare module 'jquery' {
  const jQuery: JQueryStatic;
  export = jQuery;
}

// Moment.js - mapped to global moment
declare module 'moment' {
  import moment from 'moment';
  export = moment;
}

// Chart.js - mapped to global Chart
declare module 'chart.js' {
  import Chart from 'chart.js';
  export = Chart;
}

// WooCommerce packages - mapped to global wc object
declare module '@woocommerce/blocks-registry' {
  const registry: any;
  export = registry;
}

declare module '@woocommerce/settings' {
  const settings: any;
  export = settings;
}

declare module '@woocommerce/block-data' {
  const blockData: any;
  export = blockData;
}

declare module '@woocommerce/shared-context' {
  const sharedContext: any;
  export = sharedContext;
}

declare module '@woocommerce/shared-hocs' {
  const sharedHocs: any;
  export = sharedHocs;
}

declare module '@woocommerce/price-format' {
  const priceFormat: any;
  export = priceFormat;
}

declare module '@woocommerce/blocks-checkout' {
  const blocksCheckout: any;
  export = blocksCheckout;
}

declare module '@woocommerce/csv-export' {
    export function downloadCSVFile( fileName: string, content: string ): void;
    export function generateCSVDataFromTable(
        headers: Array< { key: string; label: string } >,
        rows: Array<Array<{ display: string; value: string | number }>>
    ): string;
    export function generateCSVFileName(
        name: string,
        params?: Record< string, string >
    ): string;
}

// Dokan global packages - mapped to global dokan object
declare module '@dokan/components' {
  export const DataViews: any;
  export const Filter: any;
  export const DokanTab: any;
  export const DokanButton: any;
  export const DokanAlert: any;
  export const DokanPriceInput: any;
  export const DokanModal: any;
  export const DokanBadge: any;
  export const DokanLink: any;
  export const Alert: any;
  export const Button: any;
  export const Badge: any;
  export const Link: any;
  export const Tab: any;
  export const PriceInput: any;
  export const PriceHtml: any;
  export const CustomerFilter: any;
  export const ShortContent: any;
  export const DokanTooltip: any;
}

declare module '@dokan/utilities' {
  export const formatPrice: any;
  export const unformatNumber: any;
  export const kebabCase: any;
  export const snakeCase: any;
  export const generateColorVariants: any;
}

declare module '@dokan/hooks' {
  export const useWindowDimensions: any;
  export const useCurrentUser: any;
  export const useCustomerSearch: any;
  export const ViewportDimensions: any;
}

declare module '@dokan/product-editor' {
  import type { ComponentType } from 'react';

  export const DataForm: ComponentType<any>;
  export function useFormValidity(data: any, fields: any[], form: any): { validity: any; isValid: boolean };
  export function useProductEditor(productId: number): {
    product: Record<string, any>;
    fields: any[];
    formItems: any[];
    onChange: (newData: Record<string, any>) => void;
    submitHandler: (e: any) => Promise<void>;
    isLoading: boolean;
    defaultAttributes: any[];
    getDefaultValue: (attr: any) => any;
    handleDefaultChange: (attr: any, selectedOption: any) => void;
  };
  export function useLayouts(formItems: any[], product: Record<string, any>): {
    formLayouts: { fields: any[] };
    width: number | undefined;
  };
  export function getFieldConfigFrom(field: any): any;
  export function getFieldConfig(field: any): any;
  export function getField(formItems: any[], fieldId: string): any;
  export function resolveLabel(item: any, productType?: string): string;
  export function resolveVisibility(item: any, productType?: string): boolean;
  export function getFieldHeading(formItems: any[], fieldId: string): { label?: string; description?: string };
  export function fieldValueForProduct(item: any): any;
  export function resolveDependency(field: any, data: Record<string, any>): boolean;
  export function layoutBuilder(layouts: any[], formItems?: any[], product?: Record<string, any>): any[];
  export function appendToLeftColumn(items: any[], newSections: any[]): any[];
  export function collectUsedFields(items: any[], usedFields?: Set<string>): Set<string>;
  export function getRemainingFields(formItems: any[], usedFields: Set<string>): Record<string, string[]>;
  export function injectRemainingFields(items: any[], remainingFieldsBySection: Record<string, string[]>): any[];
}
