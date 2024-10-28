/**
 * External dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";

const STOCK_REPORT_FILTERS_FILTER = "dokan_analytics_stock_report_filters";
const STOCK_REPORT_ADVANCED_FILTERS_FILTER =
  "dokan_analytics_stock_report_advanced_filters";

export const showDatePicker = false;

/**
 * Stock Report Advanced Filters.
 *
 * @filter dokan_analytics_stock_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
  STOCK_REPORT_ADVANCED_FILTERS_FILTER,
  {
    filters: {},
    title: _x(
      "Products Match <select/> Filters",
      "A sentence describing filters for Products. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ",
        'dokan'
    ),
  }
);

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Stock Report Filters.
 *
 * @filter dokan_analytics_stock_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters(STOCK_REPORT_FILTERS_FILTER, [
  {
    label: __("Show", 'dokan'),
    staticParams: ["paged", "per_page"],
    param: "type",
    showFilters: () => true,
    filters: [
      { label: __("All products", 'dokan'), value: "all" },
      {
        label: __("Out of stock", 'dokan'),
        value: "outofstock",
      },
      {
        label: __("Low stock", 'dokan'),
        value: "lowstock",
      },
      { label: __("In stock", 'dokan'), value: "instock" },
      {
        label: __("On backorder", 'dokan'),
        value: "onbackorder",
      },
    ],
  },
  {
    label: __("Filter by", 'dokan'),
    staticParams: ["paged", "per_page"],
    param: "filter",
    showFilters: () => Object.keys(advancedFilters.filters).length,
    filters: [
      { label: __("All Products", 'dokan'), value: "all" },
      {
        label: __("Advanced Filters", 'dokan'),
        value: "advanced",
      },
    ],
  },
]);
