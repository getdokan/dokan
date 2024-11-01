/**
 * External dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";

const REVENUE_REPORT_CHARTS_FILTER = "dokan_analytics_revenue_report_charts";
const REVENUE_REPORT_FILTERS_FILTER = "dokan_analytics_revenue_report_filters";
const REVENUE_REPORT_ADVANCED_FILTERS_FILTER =
  "dokan_analytics_revenue_report_advanced_filters";

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Revenue Report charts filter.
 *
 * @filter dokan_analytics_revenue_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters(REVENUE_REPORT_CHARTS_FILTER, [
  {
    key: "gross_sales",
    label: __("Gross sales", 'dokan-lite'),
    order: "desc",
    orderby: "gross_sales",
    type: "currency",
    isReverseTrend: false,
  },
  {
    key: "refunds",
    label: __("Returns", 'dokan-lite'),
    order: "desc",
    orderby: "refunds",
    type: "currency",
    isReverseTrend: true,
  },
  {
    key: "coupons",
    label: __("Coupons", 'dokan-lite'),
    order: "desc",
    orderby: "coupons",
    type: "currency",
    isReverseTrend: false,
  },
  {
    key: "net_revenue",
    label: __("Net sales", 'dokan-lite'),
    orderby: "net_revenue",
    type: "currency",
    isReverseTrend: false,
    labelTooltipText: __(
      "Full refunds are not deducted from tax or net sales totals",
      'dokan-lite'
    ),
  },
  {
    key: "taxes",
    label: __("Taxes", 'dokan-lite'),
    order: "desc",
    orderby: "taxes",
    type: "currency",
    isReverseTrend: false,
    labelTooltipText: __(
      "Full refunds are not deducted from tax or net sales totals",
      'dokan-lite'
    ),
  },
  {
    key: "shipping",
    label: __("Shipping", 'dokan-lite'),
    orderby: "shipping",
    type: "currency",
    isReverseTrend: false,
  },
  {
    key: "total_sales",
    label: __("Total sales", 'dokan-lite'),
    order: "desc",
    orderby: "total_sales",
    type: "currency",
    isReverseTrend: false,
  },
]);

/**
 * Revenue Report Advanced Filters.
 *
 * @filter dokan_analytics_revenue_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
  REVENUE_REPORT_ADVANCED_FILTERS_FILTER,
  {
    filters: {},
    title: _x(
      "Revenue Matches <select/> Filters",
      "A sentence describing filters for Revenue. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ",
      'dokan-lite'
    ),
  }
);

const filterValues = [];

if (Object.keys(advancedFilters.filters).length) {
  filterValues.push({
    label: __("All Revenue", 'dokan-lite'),
    value: "all",
  });
  filterValues.push({
    label: __("Advanced Filters", 'dokan-lite'),
    value: "advanced",
  });
}

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Revenue Report Filters.
 *
 * @filter dokan_analytics_revenue_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters(REVENUE_REPORT_FILTERS_FILTER, [
  {
    label: __("Show", 'dokan-lite'),
    staticParams: ["chartType", "paged", "per_page"],
    param: "filter",
    showFilters: () => filterValues.length > 0,
    filters: filterValues,
  },
]);
