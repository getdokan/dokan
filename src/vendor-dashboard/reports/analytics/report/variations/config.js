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
import {
  getCategoryLabels,
  getProductLabels,
  getVariationLabels,
} from "../../../lib/async-requests";

const VARIATIONS_REPORT_CHARTS_FILTER =
  "dokan_analytics_variations_report_charts";
const VARIATIONS_REPORT_FILTERS_FILTER =
  "dokan_analytics_variations_report_filters";
const VARIATIONS_REPORT_ADVANCED_FILTERS_FILTER =
  "dokan_analytics_variations_report_advanced_filters";

const { addCesSurveyForAnalytics } = dispatch(CES_STORE_KEY);

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Variations Report charts filter.
 *
 * @filter dokan_analytics_variations_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters(VARIATIONS_REPORT_CHARTS_FILTER, [
  {
    key: "items_sold",
    label: __("Items sold", 'dokan-lite'),
    order: "desc",
    orderby: "items_sold",
    type: "number",
  },
  {
    key: "net_revenue",
    label: __("Net sales", 'dokan-lite'),
    order: "desc",
    orderby: "net_revenue",
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
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Variations Report Filters.
 *
 * @filter dokan_analytics_variations_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters(VARIATIONS_REPORT_FILTERS_FILTER, [
  {
    label: __("Show", 'dokan-lite'),
    staticParams: ["chartType", "paged", "per_page"],
    param: "filter-variations",
    showFilters: () => true,
    filters: [
      {
        label: __("All variations", 'dokan-lite'),
        chartMode: "item-comparison",
        value: "all",
      },
      {
        label: __("Single variation", 'dokan-lite'),
        value: "select_variation",
        subFilters: [
          {
            component: "Search",
            value: "single_variation",
            path: ["select_variation"],
            settings: {
              type: "variations",
              param: "variations",
              getLabels: getVariationLabels,
              labels: {
                placeholder: __(
                  "Type to search for a variation",
                  'dokan-lite'
                ),
                button: __("Single variation", 'dokan-lite'),
              },
            },
          },
        ],
      },
      {
        label: __("Comparison", 'dokan-lite'),
        chartMode: "item-comparison",
        value: "compare-variations",
        settings: {
          type: "variations",
          param: "variations",
          getLabels: getVariationLabels,
          labels: {
            helpText: __(
              "Check at least two variations below to compare",
              'dokan-lite'
            ),
            placeholder: __("Search for variations to compare", 'dokan-lite'),
            title: __("Compare Variations", 'dokan-lite'),
            update: __("Compare", 'dokan-lite'),
          },
          onClick: addCesSurveyForAnalytics,
        },
      },
      {
        label: __("Advanced filters", 'dokan-lite'),
        value: "advanced",
      },
    ],
  },
]);

/**
 * Variations Report Advanced Filters.
 *
 * @filter dokan_analytics_variations_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
  VARIATIONS_REPORT_ADVANCED_FILTERS_FILTER,
  {
    title: _x(
      "Variations match <select/> filters",
      "A sentence describing filters for Variations. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ",
      'dokan-lite'
    ),
    filters: {
      attribute: {
        allowMultiple: true,
        labels: {
          add: __("Product attribute", 'dokan-lite'),
          placeholder: __("Search product attributes", 'dokan-lite'),
          remove: __("Remove product attribute filter", 'dokan-lite'),
          rule: __("Select a product attribute filter match", 'dokan-lite'),
          /* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
          title: __(
            "<title>Product attribute</title> <rule/> <filter/>",
            'dokan-lite'
          ),
          filter: __("Select product attributes", 'dokan-lite'),
        },
        rules: [
          {
            value: "is",
            /* translators: Sentence fragment, logical, "Is" refers to searching for product variations matching a chosen attribute. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Is", "product attribute", 'dokan-lite'),
          },
          {
            value: "is_not",
            /* translators: Sentence fragment, logical, "Is Not" refers to searching for product variations that don\'t match a chosen attribute. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Is Not", "product attribute", 'dokan-lite'),
          },
        ],
        input: {
          component: "ProductAttribute",
        },
      },
      category: {
        labels: {
          add: __("Product category", 'dokan-lite'),
          placeholder: __("Search product categories", 'dokan-lite'),
          remove: __("Remove product category filter", 'dokan-lite'),
          rule: __("Select a product category filter match", 'dokan-lite'),
          /* translators: A sentence describing a Category filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
          title: __(
            "<title>Product category</title> <rule/> <filter/>",
            'dokan-lite'
          ),
          filter: __("Select product categories", 'dokan-lite'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to variations including a given category. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Includes", "categories", 'dokan-lite'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to variations excluding a given category. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Excludes", "categories", 'dokan-lite'),
          },
        ],
        input: {
          component: "Search",
          type: "categories",
          getLabels: getCategoryLabels,
        },
      },
      product: {
        labels: {
          add: __("Product", 'dokan-lite'),
          placeholder: __("Search products", 'dokan-lite'),
          remove: __("Remove product filter", 'dokan-lite'),
          rule: __("Select a product filter match", 'dokan-lite'),
          /* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
          title: __("<title>Product</title> <rule/> <filter/>", 'dokan-lite'),
          filter: __("Select products", 'dokan-lite'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to orders including a given product(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Includes", "products", 'dokan-lite'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to orders excluding a given product(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Excludes", "products", 'dokan-lite'),
          },
        ],
        input: {
          component: "Search",
          type: "variableProducts",
          getLabels: getProductLabels,
        },
      },
    },
  }
);
