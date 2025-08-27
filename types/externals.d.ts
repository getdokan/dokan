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
