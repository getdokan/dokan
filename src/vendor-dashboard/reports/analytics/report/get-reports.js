/**
 * External dependencies
 */
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import { lazy } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { getAdminSetting } from "./../../utils/admin-settings";
const RevenueReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-revenue" */ "./revenue")
);
const ProductsReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-products" */ "./products")
);
const VariationsReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-variations" */ "./variations")
);
const OrdersReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-orders" */ "./orders")
);
const CategoriesReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-categories" */ "./categories")
);
const CouponsReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-coupons" */ "./coupons")
);
const TaxesReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-taxes" */ "./taxes")
);
const DownloadsReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-downloads" */ "./downloads")
);
const StockReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-stock" */ "./stock")
);
const CustomersReport = lazy(() =>
  import(/* webpackChunkName: "analytics-report-customers" */ "./customers")
);

const manageStock = getAdminSetting("manageStock", "no");
const REPORTS_FILTER = "dokan_analytics_reports_list";

export default () => {
  const reports = [
    {
      report: "revenue",
      title: __("Revenue", 'dokan'),
      component: RevenueReport,
      navArgs: {
        id: "woocommerce-analytics-revenue",
      },
    },
    {
      report: "products",
      title: __("Products", 'dokan'),
      component: ProductsReport,
      navArgs: {
        id: "woocommerce-analytics-products",
      },
    },
    {
      report: "variations",
      title: __("Variations", 'dokan'),
      component: VariationsReport,
      navArgs: {
        id: "woocommerce-analytics-variations",
      },
    },
    {
      report: "orders",
      title: __("Orders", 'dokan'),
      component: OrdersReport,
      navArgs: {
        id: "woocommerce-analytics-orders",
      },
    },
    {
      report: "categories",
      title: __("Categories", 'dokan'),
      component: CategoriesReport,
      navArgs: {
        id: "woocommerce-analytics-categories",
      },
    },
    {
      report: "coupons",
      title: __("Coupons", 'dokan'),
      component: CouponsReport,
      navArgs: {
        id: "woocommerce-analytics-coupons",
      },
    },
    {
      report: "taxes",
      title: __("Taxes", 'dokan'),
      component: TaxesReport,
      navArgs: {
        id: "woocommerce-analytics-taxes",
      },
    },
    manageStock === "yes" || true
      ? {
          report: "stock",
          title: __("Stock", 'dokan'),
          component: StockReport,
          navArgs: {
            id: "woocommerce-analytics-stock",
          },
        }
      : null,
    {
      report: "customers",
      title: __("Customers", 'dokan'),
      component: CustomersReport,
    },
    {
      report: "downloads",
      title: __("Downloads", 'dokan'),
      component: DownloadsReport,
      navArgs: {
        id: "woocommerce-analytics-downloads",
      },
    },
  ].filter(Boolean);

  /**
   * An object defining a report page.
   *
   * @typedef {Object} report
   * @property {string} report    Report slug.
   * @property {string} title     Report title.
   * @property {Node}   component React Component to render.
   * @property {Object} navArgs   Arguments supplied to WooCommerce Navigation.
   */

  /**
   * Filter Report pages list.
   *
   * @filter dokan_analytics_reports_list
   * @param {Array.<report>} reports Report pages list.
   */
  return applyFilters(REPORTS_FILTER, reports);
};
