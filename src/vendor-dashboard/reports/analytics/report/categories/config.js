/**
 * External dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import { dispatch } from "@wordpress/data";
import { STORE_KEY as CES_STORE_KEY } from "@woocommerce/customer-effort-score";

/**
 * Internal dependencies
 */
import { getCategoryLabels } from "../../../lib/async-requests";

const CATEGORY_REPORT_CHARTS_FILTER =
  "dokan_analytics_categories_report_charts";
const CATEGORY_REPORT_FILTERS_FILTER =
  "dokan_analytics_categories_report_filters";
const CATEGORY_REPORT_ADVANCED_FILTERS_FILTER =
  "dokan_analytics_category_report_advanced_filters";

const { addCesSurveyForAnalytics } = dispatch(CES_STORE_KEY);

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Category Report charts filter.
 *
 * @filter dokan_analytics_categories_report_charts
 * @param {Array.<chart>} charts Category Report charts.
 */
export const charts = applyFilters(CATEGORY_REPORT_CHARTS_FILTER, [
  {
    key: "items_sold",
    label: __("Items sold", 'dokan'),
    order: "desc",
    orderby: "items_sold",
    type: "number",
  },
  {
    key: "net_revenue",
    label: __("Net sales", 'dokan'),
    order: "desc",
    orderby: "net_revenue",
    type: "currency",
  },
  {
    key: "orders_count",
    label: __("Orders", 'dokan'),
    order: "desc",
    orderby: "orders_count",
    type: "number",
  },
]);

/**
 * Category Report Advanced Filters.
 *
 * @filter dokan_analytics_category_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
  CATEGORY_REPORT_ADVANCED_FILTERS_FILTER,
  {
    filters: {},
    title: _x(
      "Categories match <select/> filters",
      "A sentence describing filters for Categories. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ",
      'dokan'
    ),
  }
);

const filterValues = [
  {
    label: __("All categories", 'dokan'),
    value: "all",
  },
  {
    label: __("Single category", 'dokan'),
    value: "select_category",
    chartMode: "item-comparison",
    subFilters: [
      {
        component: "Search",
        value: "single_category",
        chartMode: "item-comparison",
        path: ["select_category"],
        settings: {
          type: "categories",
          param: "categories",
          getLabels: getCategoryLabels,
          labels: {
            placeholder: __("Type to search for a category", 'dokan'),
            button: __("Single Category", 'dokan'),
          },
        },
      },
    ],
  },
  {
    label: __("Comparison", 'dokan'),
    value: "compare-categories",
    chartMode: "item-comparison",
    settings: {
      type: "categories",
      param: "categories",
      getLabels: getCategoryLabels,
      labels: {
        helpText: __(
          "Check at least two categories below to compare",
          'dokan'
        ),
        placeholder: __("Search for categories to compare", 'dokan'),
        title: __("Compare Categories", 'dokan'),
        update: __("Compare", 'dokan'),
      },
      onClick: addCesSurveyForAnalytics,
    },
  },
];

if (Object.keys(advancedFilters.filters).length) {
  filterValues.push({
    label: __("Advanced filters", 'dokan'),
    value: "advanced",
  });
}

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Category Report Filters.
 *
 * @filter dokan_analytics_categories_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters(CATEGORY_REPORT_FILTERS_FILTER, [
  {
    label: __("Show", 'dokan'),
    staticParams: ["chartType", "paged", "per_page"],
    param: "filter",
    showFilters: () => true,
    filters: filterValues,
  },
]);
