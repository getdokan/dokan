/**
 * External dependencies
 */
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";

/**
 * Internal dependencies
 */
import { charts as ordersCharts } from "../../analytics/report/orders/config";
import { charts as productsCharts } from "../../analytics/report/products/config";
import { charts as revenueCharts } from "../../analytics/report/revenue/config";
import { charts as couponsCharts } from "../../analytics/report/coupons/config";
import { charts as taxesCharts } from "../../analytics/report/taxes/config";
import { charts as downloadsCharts } from "../../analytics/report/downloads/config";

const DASHBOARD_CHARTS_FILTER = "dokan_analytics_dashboard_charts_filter";

const charts = {
  revenue: revenueCharts,
  orders: ordersCharts,
  products: productsCharts,
  coupons: couponsCharts,
  taxes: taxesCharts,
  downloads: downloadsCharts,
};

const defaultCharts = [
  {
    label: __("Total sales", 'dokan-lite'),
    report: "revenue",
    key: "total_sales",
  },
  {
    label: __("Net sales", 'dokan-lite'),
    report: "revenue",
    key: "net_revenue",
  },
  {
    label: __("Orders", 'dokan-lite'),
    report: "orders",
    key: "orders_count",
  },
  {
    label: __("Average order value", 'dokan-lite'),
    report: "orders",
    key: "avg_order_value",
  },
  {
    label: __("Items sold", 'dokan-lite'),
    report: "products",
    key: "items_sold",
  },
  {
    label: __("Returns", 'dokan-lite'),
    report: "revenue",
    key: "refunds",
  },
  {
    label: __("Discounted orders", 'dokan-lite'),
    report: "coupons",
    key: "orders_count",
  },
  {
    label: __("Gross discounted", 'dokan-lite'),
    report: "coupons",
    key: "amount",
  },
  {
    label: __("Total tax", 'dokan-lite'),
    report: "taxes",
    key: "total_tax",
  },
  {
    label: __("Order tax", 'dokan-lite'),
    report: "taxes",
    key: "order_tax",
  },
  {
    label: __("Shipping tax", 'dokan-lite'),
    report: "taxes",
    key: "shipping_tax",
  },
  {
    label: __("Shipping", 'dokan-lite'),
    report: "revenue",
    key: "shipping",
  },
  {
    label: __("Downloads", 'dokan-lite'),
    report: "downloads",
    key: "download_count",
  },
];

/**
 * Dashboard Charts section charts.
 *
 * @filter dokan_analytics_dashboard_charts_filter
 * @param {Array.<Object>} charts Array of visible charts.
 */
export const uniqCharts = applyFilters(
  DASHBOARD_CHARTS_FILTER,
  defaultCharts
    .filter((chartDef) => chartDef.report !== 'downloads' && chartDef.key !== 'download_count')
    .map((chartDef) => ({
      ...charts[chartDef.report].find((chart) => chart.key === chartDef.key),
      label: chartDef.label,
      endpoint: chartDef.report,
    }))
);
