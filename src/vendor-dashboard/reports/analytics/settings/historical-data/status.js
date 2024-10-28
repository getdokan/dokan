/**
 * External dependencies
 */
import { __, sprintf } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import moment from "moment";
import { Spinner } from "@wordpress/components";

const HISTORICAL_DATA_STATUS_FILTER = "dokan_analytics_import_status";

function HistoricalDataStatus({ importDate, status }) {
  /**
   * Historical data import statuses.
   *
   * @filter dokan_analytics_import_status
   *
   * @param {Object} statuses              Import statuses.
   * @param {string} statuses.nothing      Nothing to import.
   * @param {string} statuses.ready        Ready to import.
   * @param {Array}  statuses.initializing Initializing string and spinner.
   * @param {Array}  statuses.customers    Importing customers string and spinner.
   * @param {Array}  statuses.orders       Importing orders string and spinner.
   * @param {Array}  statuses.finalizing   Finalizing string and spinner.
   * @param {string} statuses.finished     Message displayed after import.
   */
  const statusLabels = applyFilters(HISTORICAL_DATA_STATUS_FILTER, {
    nothing: __("Nothing To Import", 'dokan'),
    ready: __("Ready To Import", 'dokan'),
    initializing: [
      __("Initializing", 'dokan'),
      <Spinner key="spinner" />,
    ],
    customers: [
      __("Importing Customers", 'dokan'),
      <Spinner key="spinner" />,
    ],
    orders: [__("Importing Orders", 'dokan'), <Spinner key="spinner" />],
    finalizing: [__("Finalizing", 'dokan'), <Spinner key="spinner" />],
    finished:
      importDate === -1
        ? __("All historical data imported", 'dokan')
        : sprintf(
            /* translators: %s: YYYY-MM-DD formatted date */
            __("Historical data from %s onward imported", 'dokan'),
            // @todo The date formatting should be localized ( 'll' ), but this is currently broken in Gutenberg.
            // See https://github.com/WordPress/gutenberg/issues/12626 for details.
            moment(importDate).format("YYYY-MM-DD")
          ),
  });

  return (
    <span className="woocommerce-settings-historical-data__status">
      {__("Status:", 'dokan') + " "}
      {statusLabels[status]}
    </span>
  );
}

export default HistoricalDataStatus;
