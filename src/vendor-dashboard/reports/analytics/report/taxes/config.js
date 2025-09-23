/**
 * External dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import { STORE_KEY as CES_STORE_KEY } from "@woocommerce/customer-effort-score";
import { NAMESPACE } from "@woocommerce/data";
import { dispatch } from "@wordpress/data";

/**
 * Internal dependencies
 */
import { getRequestByIdString } from "../../../lib/async-requests";
import { getTaxCode } from "./utils";

const TAXES_REPORT_CHARTS_FILTER = "dokan_analytics_taxes_report_charts";
const TAXES_REPORT_FILTERS_FILTER = "dokan_analytics_taxes_report_filters";
const TAXES_REPORT_ADVANCED_FILTERS_FILTER =
  "dokan_analytics_taxes_report_advanced_filters";

const { addCesSurveyForAnalytics } = dispatch(CES_STORE_KEY);

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Taxes Report charts filter.
 *
 * @filter dokan_analytics_taxes_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters(TAXES_REPORT_CHARTS_FILTER, [
  {
    key: "total_tax",
    label: __("Total tax", 'dokan-lite'),
    order: "desc",
    orderby: "total_tax",
    type: "currency",
  },
  {
    key: "order_tax",
    label: __("Order tax", 'dokan-lite'),
    order: "desc",
    orderby: "order_tax",
    type: "currency",
  },
  {
    key: "shipping_tax",
    label: __("Shipping tax", 'dokan-lite'),
    order: "desc",
    orderby: "shipping_tax",
    type: "currency",
  },
  {
    key: "orders_count",
    label: __("Orders", 'dokan-lite'),
    order: "desc",
    orderby: "orders_count",
    type: "number",
  },
]);

/**
 * Taxes Report Advanced Filters.
 *
 * @filter dokan_analytics_taxes_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
  TAXES_REPORT_ADVANCED_FILTERS_FILTER,
  {
    filters: {},
    title: _x(
      "Taxes match <select/> filters",
      "A sentence describing filters for Taxes. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ",
      'dokan-lite'
    ),
  }
);

const filterValues = [
  { label: __("All taxes", 'dokan-lite'), value: "all" },
  {
    label: __("Comparison", 'dokan-lite'),
    value: "compare-taxes",
    chartMode: "item-comparison",
    settings: {
      type: "taxes",
      param: "taxes",
      getLabels: getRequestByIdString(NAMESPACE + "/taxes", (tax) => ({
        id: tax.id,
        key: tax.id,
        label: getTaxCode(tax),
      })),
      labels: {
        helpText: __(
          "Check at least two tax codes below to compare",
          'dokan-lite'
        ),
        placeholder: __("Search for tax codes to compare", 'dokan-lite'),
        title: __("Compare Tax Codes", 'dokan-lite'),
        update: __("Compare", 'dokan-lite'),
      },
      onClick: addCesSurveyForAnalytics,
    },
  },
];

if (Object.keys(advancedFilters.filters).length) {
  filterValues.push({
    label: __("Advanced filters", 'dokan-lite'),
    value: "advanced",
  });
}

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Coupons Report Filters.
 *
 * @filter dokan_analytics_taxes_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters(TAXES_REPORT_FILTERS_FILTER, [
  {
    label: __("Show", 'dokan-lite'),
    staticParams: ["chartType", "paged", "per_page"],
    param: "filter",
    showFilters: () => true,
    filters: filterValues,
  },
]);
