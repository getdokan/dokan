/**
 * External dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";

/**
 * Internal dependencies
 */
import {
  getCustomerLabels,
  getProductLabels,
} from "../../../lib/async-requests";

const DOWLOADS_REPORT_CHARTS_FILTER = "dokan_analytics_downloads_report_charts";
const DOWLOADS_REPORT_FILTERS_FILTER =
  "dokan_analytics_downloads_report_filters";
const DOWLOADS_REPORT_ADVANCED_FILTERS_FILTER =
  "dokan_analytics_downloads_report_advanced_filters";

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Downloads Report charts filter.
 *
 * @filter dokan_analytics_downloads_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters(DOWLOADS_REPORT_CHARTS_FILTER, [
  {
    key: "download_count",
    label: __("Downloads", 'dokan'),
    type: "number",
  },
]);

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Downloads Report Filters.
 *
 * @filter dokan_analytics_downloads_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters(DOWLOADS_REPORT_FILTERS_FILTER, [
  {
    label: __("Show", 'dokan'),
    staticParams: ["chartType", "paged", "per_page"],
    param: "filter",
    showFilters: () => true,
    filters: [
      { label: __("All downloads", 'dokan'), value: "all" },
      {
        label: __("Advanced filters", 'dokan'),
        value: "advanced",
      },
    ],
  },
]);

/*eslint-disable max-len*/

/**
 * Downloads Report Advanced Filters.
 *
 * @filter dokan_analytics_downloads_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
  DOWLOADS_REPORT_ADVANCED_FILTERS_FILTER,
  {
    title: _x(
      "Downloads match <select/> filters",
      "A sentence describing filters for Downloads. See screen shot for context: https://cloudup.com/ccxhyH2mEDg",
      'dokan'
    ),
    filters: {
      product: {
        labels: {
          add: __("Product", 'dokan'),
          placeholder: __("Search", 'dokan'),
          remove: __("Remove product filter", 'dokan'),
          rule: __("Select a product filter match", 'dokan'),
          /* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/ccxhyH2mEDg */
          title: __("<title>Product</title> <rule/> <filter/>", 'dokan'),
          filter: __("Select product", 'dokan'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to products including a given product(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
            label: _x("Includes", "products", 'dokan'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to products excluding a products(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
            label: _x("Excludes", "products", 'dokan'),
          },
        ],
        input: {
          component: "Search",
          type: "products",
          getLabels: getProductLabels,
        },
      },
      customer: {
        labels: {
          add: __("Username", 'dokan'),
          placeholder: __("Search customer username", 'dokan'),
          remove: __("Remove customer username filter", 'dokan'),
          rule: __("Select a customer username filter match", 'dokan'),
          /* translators: A sentence describing a customer username filter. See screen shot for context: https://cloudup.com/ccxhyH2mEDg */
          title: __(
            "<title>Username</title> <rule/> <filter />",
            'dokan'
          ),
          filter: __("Select customer username", 'dokan'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to customer usernames including a given username(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
            label: _x("Includes", "customer usernames", 'dokan'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to customer usernames excluding a given username(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
            label: _x("Excludes", "customer usernames", 'dokan'),
          },
        ],
        input: {
          component: "Search",
          type: "usernames",
          getLabels: getCustomerLabels,
        },
      },
      order: {
        labels: {
          add: __("Order #", 'dokan'),
          placeholder: __("Search order number", 'dokan'),
          remove: __("Remove order number filter", 'dokan'),
          rule: __("Select a order number filter match", 'dokan'),
          /* translators: A sentence describing a order number filter. See screen shot for context: https://cloudup.com/ccxhyH2mEDg */
          title: __("<title>Order #</title> <rule/> <filter/>", 'dokan'),
          filter: __("Select order number", 'dokan'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to order numbers including a given order(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
            label: _x("Includes", "order numbers", 'dokan'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to order numbers excluding a given order(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
            label: _x("Excludes", "order numbers", 'dokan'),
          },
        ],
        input: {
          component: "Search",
          type: "orders",
          getLabels: async (value) => {
            const orderIds = value.split(",");
            return await orderIds.map((orderId) => ({
              id: orderId,
              label: "#" + orderId,
            }));
          },
        },
      },
      ip_address: {
        labels: {
          add: __("IP Address", 'dokan'),
          placeholder: __("Search IP address", 'dokan'),
          remove: __("Remove IP address filter", 'dokan'),
          rule: __("Select an IP address filter match", 'dokan'),
          /* translators: A sentence describing a order number filter. See screen shot for context: https://cloudup.com/ccxhyH2mEDg */
          title: __(
            "<title>IP Address</title> <rule/> <filter/>",
            'dokan'
          ),
          filter: __("Select IP address", 'dokan'),
        },
        rules: [
          {
            value: "includes",
            /* translators: Sentence fragment, logical, "Includes" refers to IP addresses including a given address(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
            label: _x("Includes", "IP addresses", 'dokan'),
          },
          {
            value: "excludes",
            /* translators: Sentence fragment, logical, "Excludes" refers to IP addresses excluding a given address(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
            label: _x("Excludes", "IP addresses", 'dokan'),
          },
        ],
        input: {
          component: "Search",
          type: "downloadIps",
          getLabels: async (value) => {
            const ips = value.split(",");
            return await ips.map((ip) => {
              return {
                id: ip,
                label: ip,
              };
            });
          },
        },
      },
    },
  }
);
/*eslint-enable max-len*/
