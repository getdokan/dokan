// Global type declarations for WordPress and Dokan variables

declare global {
  // Dokan global variables
  var dokanSetupGuideBanner: {
    is_setup_guide_steps_completed: boolean;
    setup_guide_url: string;
    asset_url: string;
  } | undefined;

  var dokan: {
    api: any;
    hooks: any;
    util: any;
    urls: any;
  } | undefined;

   var dokanAdminDashboardSettings: {
    header_info?: {
      lite_version?: string;
      is_pro_exists?: boolean;
      pro_version?: string;
      license_plan?: string;
      has_new_version?: boolean;
      dashboard_url?: string;
    };
    [key: string]: any;
  } | undefined;

  // WordPress global variables
  var wp: {
    i18n: any;
    element: any;
    components: any;
    data: any;
    hooks: any;
    apiFetch: any;
  } | undefined;

  var wc: {
    wcBlocksRegistry: any;
    wcSettings: any;
    wcBlocksData: any;
    wcSharedContext: any;
    wcSharedHocs: any;
    priceFormat: any;
    blocksCheckout: any;
  } | undefined;

  // jQuery
  var jQuery: JQueryStatic;
  var $: JQueryStatic;

  // Chart.js
  var Chart: any;

  // Moment.js
  var moment: any;
}

export {};
