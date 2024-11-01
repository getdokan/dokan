/**
 * External dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";

/**
 * Internal dependencies
 */
import {
  getCouponLabels,
  getProductLabels,
  getTaxRateLabels,
  getVariationLabels,
} from "../../../lib/async-requests";
import { ORDER_STATUSES } from "./../../../utils/admin-settings";

const ORDERS_REPORT_CHARTS_FILTER = "dokan_analytics_orders_report_charts";
const ORDERS_REPORT_FILTERS_FILTER = "dokan_analytics_orders_report_filters";
const ORDERS_REPORT_ADVANCED_FILTERS_FILTER =
  "dokan_analytics_orders_report_advanced_filters";

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Orders Report charts filter.
 *
 * @filter dokan_analytics_orders_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters(ORDERS_REPORT_CHARTS_FILTER, [
  {
    key: "orders_count",
    label: __("Orders", 'dokan-lite'),
    type: "number",
  },
  {
    key: "net_revenue",
    label: __("Net sales", 'dokan-lite'),
    order: "desc",
    orderby: "net_total",
    type: "currency",
  },
  {
    key: "avg_order_value",
    label: __("Average order value", 'dokan-lite'),
    type: "currency",
  },
  {
    key: "avg_items_per_order",
    label: __("Average items per order", 'dokan-lite'),
    order: "desc",
    orderby: "num_items_sold",
    type: "average",
  },
]);

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Orders Report Filters.
 *
 * @filter dokan_analytics_orders_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters(ORDERS_REPORT_FILTERS_FILTER, [
  {
    label: __("Show", 'dokan-lite'),
    staticParams: ["chartType", "paged", "per_page"],
    param: "filter",
    showFilters: () => true,
    filters: [
      { label: __("All orders", 'dokan-lite'), value: "all" },
      {
        label: __("Advanced filters", 'dokan-lite'),
        value: "advanced",
      },
    ],
  },
]);

/*eslint-disable max-len*/

/**
 * Orders Report Advanced Filters.
 *
 * @filter dokan_analytics_orders_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
  ORDERS_REPORT_ADVANCED_FILTERS_FILTER,
  {
    title: _x(
      "Orders match <select/> filters",
      "A sentence describing filters for Orders. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ",
      'dokan-lite'
    ),
    filters: {
      status: {
        labels: {
          add: __("Order status", 'dokan-lite'),
          remove: __("Remove order status filter", 'dokan-lite'),
          rule: __("Select an order status filter match", 'dokan-lite'),
          /* translators: A sentence describing an Order Status filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
          title: __(
            "<title>Order status</title> <rule/> <filter/>",
            'dokan-lite'
          ),
          filter: __("Select an order status", 'dokan-lite'),
        },
        rules: [
          {
            value: "is",
            /* translators: Sentence fragment, logical, "Is" refers to searching for orders matching a chosen order status. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Is", "order status", 'dokan-lite'),
          },
          {
            value: "is_not",
            /* translators: Sentence fragment, logical, "Is Not" refers to searching for orders that don\'t match a chosen order status. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Is Not", "order status", 'dokan-lite'),
          },
        ],
        input: {
          component: "SelectControl",
          options: Object.keys(ORDER_STATUSES).map((key) => ({
            value: key,
            label: ORDER_STATUSES[key],
          })),
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
          type: "products",
          getLabels: getProductLabels,
        },
      },
      variation: {
        labels: {
          add: __("Product variation", 'dokan-lite'),
          placeholder: __("Search product variations", 'dokan-lite'),
          remove: __("Remove product variation filter", 'dokan-lite'),
          rule: __("Select a product variation filter match", 'dokan-lite'),
          /* translators: A sentence describing a Variation filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
          title: __(
            "<title>Product variation</title> <rule/> <filter/>",
            'dokan-lite'
          ),
          filter: __("Select variation", 'dokan-lite'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to orders including a given variation(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Includes", "variations", 'dokan-lite'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to orders excluding a given variation(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Excludes", "variations", 'dokan-lite'),
          },
        ],
        input: {
          component: "Search",
          type: "variations",
          getLabels: getVariationLabels,
        },
      },
      coupon: {
        labels: {
          add: __("Coupon code", 'dokan-lite'),
          placeholder: __("Search coupons", 'dokan-lite'),
          remove: __("Remove coupon filter", 'dokan-lite'),
          rule: __("Select a coupon filter match", 'dokan-lite'),
          /* translators: A sentence describing a Coupon filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
          title: __(
            "<title>Coupon code</title> <rule/> <filter/>",
            'dokan-lite'
          ),
          filter: __("Select coupon codes", 'dokan-lite'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to orders including a given coupon code(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Includes", "coupon code", 'dokan-lite'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to orders excluding a given coupon code(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Excludes", "coupon code", 'dokan-lite'),
          },
        ],
        input: {
          component: "Search",
          type: "coupons",
          getLabels: getCouponLabels,
        },
      },
      customer_type: {
        labels: {
          add: __("Customer type", 'dokan-lite'),
          remove: __("Remove customer filter", 'dokan-lite'),
          rule: __("Select a customer filter match", 'dokan-lite'),
          /* translators: A sentence describing a Customer filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
          title: __("<title>Customer is</title> <filter/>", 'dokan-lite'),
          filter: __("Select a customer type", 'dokan-lite'),
        },
        input: {
          component: "SelectControl",
          options: [
            {
              value: "new",
              label: __("New", 'dokan-lite'),
            },
            {
              value: "returning",
              label: __("Returning", 'dokan-lite'),
            },
          ],
          defaultOption: "new",
        },
      },
      refunds: {
        labels: {
          add: __("Refund", 'dokan-lite'),
          remove: __("Remove refund filter", 'dokan-lite'),
          rule: __("Select a refund filter match", 'dokan-lite'),
          title: __("<title>Refund</title> <filter/>", 'dokan-lite'),
          filter: __("Select a refund type", 'dokan-lite'),
        },
        input: {
          component: "SelectControl",
          options: [
            {
              value: "all",
              label: __("All", 'dokan-lite'),
            },
            {
              value: "partial",
              label: __("Partially refunded", 'dokan-lite'),
            },
            {
              value: "full",
              label: __("Fully refunded", 'dokan-lite'),
            },
            {
              value: "none",
              label: __("None", 'dokan-lite'),
            },
          ],
          defaultOption: "all",
        },
      },
      tax_rate: {
        labels: {
          add: __("Tax rate", 'dokan-lite'),
          placeholder: __("Search tax rates", 'dokan-lite'),
          remove: __("Remove tax rate filter", 'dokan-lite'),
          rule: __("Select a tax rate filter match", 'dokan-lite'),
          /* translators: A sentence describing a tax rate filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
          title: __("<title>Tax Rate</title> <rule/> <filter/>", 'dokan-lite'),
          filter: __("Select tax rates", 'dokan-lite'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to orders including a given tax rate(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Includes", "tax rate", 'dokan-lite'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to orders excluding a given tax rate(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Excludes", "tax rate", 'dokan-lite'),
          },
        ],
        input: {
          component: "Search",
          type: "taxes",
          getLabels: getTaxRateLabels,
        },
      },
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
          filter: __("Select attributes", 'dokan-lite'),
        },
        rules: [
          {
            value: "is",
            /* translators: Sentence fragment, logical, "Is" refers to searching for products matching a chosen attribute. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Is", "product attribute", 'dokan-lite'),
          },
          {
            value: "is_not",
            /* translators: Sentence fragment, logical, "Is Not" refers to searching for products that don\'t match a chosen attribute. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
            label: _x("Is Not", "product attribute", 'dokan-lite'),
          },
        ],
        input: {
          component: "ProductAttribute",
        },
      },
    },
  }
);
/*eslint-enable max-len*/
