/**
 * External dependencies
 */
import { Component } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import PropTypes from "prop-types";
import { __, sprintf } from "@wordpress/i18n";
import { Card, CardBody, CardHeader } from "@wordpress/components";
import {
  getHistory,
  getNewPath,
  getPersistedQuery,
} from "@woocommerce/navigation";
import { getAdminLink } from "@woocommerce/settings";
import { Text } from "@woocommerce/experimental";

/**
 * Internal dependencies
 */
import ReportChart from "../../analytics/components/report-chart";
// import './block.scss';

class ChartBlock extends Component {
  getChartPath(chart) {
    return getNewPath(
      { chart: chart.key },
      "/analytics/" + chart.endpoint,
      getPersistedQuery()
    );
  }

  render() {
    const { charts, endpoint, path, query, selectedChart, filters } =
      this.props;

    if (!selectedChart) {
      return null;
    }

    const LEGEND_HANDLER_FILTER = 'dokan_handle_chart_legends_availability',
      CHART_REDIRECTION_HANDLER_FILTER = 'dokan_handle_chart_redirection';

    return (
      <div
        role="presentation"
        className="woocommerce-dashboard__chart-block-wrapper"
        onClick={ applyFilters(
          CHART_REDIRECTION_HANDLER_FILTER,
          () => {}, // default handler
          selectedChart,
          getHistory,
          this.getChartPath
        ) }
      >
        <Card className="woocommerce-dashboard__chart-block">
          <CardHeader>
            <Text as="h3" size={16} weight={600} color="#23282d">
              {selectedChart.label}
            </Text>
          </CardHeader>
          <CardBody size={null}>
            <a
              className="screen-reader-text"
              href={getAdminLink(this.getChartPath(selectedChart))}
            >
              {sprintf(
                /* translators: %s is the chart type */
                __("%s Report", 'dokan-lite'),
                selectedChart.label
              )}
            </a>
            <ReportChart
              charts={charts}
              endpoint={endpoint}
              query={query}
              interactiveLegend={applyFilters(LEGEND_HANDLER_FILTER, false)}
              legendPosition="bottom"
              path={path}
              selectedChart={selectedChart}
              showHeaderControls={false}
              filters={filters}
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

ChartBlock.propTypes = {
  charts: PropTypes.array,
  endpoint: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  query: PropTypes.object.isRequired,
  selectedChart: PropTypes.object.isRequired,
};

export default ChartBlock;
