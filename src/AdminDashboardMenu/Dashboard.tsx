import { __ } from '@wordpress/i18n';
import TodoSection from './sections/TodoSection';
import AnalyticsSection from './sections/AnalyticsSection';
import SalesChartSection from './sections/SalesChartSection';
import MonthlyOverviewSection from './sections/MonthlyOverviewSection';
import CustomerMetricsSection from './sections/CustomerMetricsSection';
import AllTimeStatsSection from './sections/AllTimeStatsSection';
import TopPerformingVendorsSection from './sections/TopPerformingVendorsSection';
import MostReviewedProductsSection from './sections/MostReviewedProductsSection';
import MostReportedVendorsSection from './sections/MostReportedVendorsSection';
import getSettings from '../admin/dashboard/settings/getSettings';

function Dashboard() {
    return (
        <div>
            <h1 className="wp-heading-inline">
                { __( 'Dashboard', 'dokan-lite' ) }
            </h1>
            <hr className="wp-header-end" />

            { /* Render todo section. */ }
            <TodoSection />

            { /* Render analytics section. */ }
            <AnalyticsSection />

            { /* Render a monthly overview section. */ }
            <MonthlyOverviewSection />

            { /* Render sales chart section. */ }
            <SalesChartSection />

            { /* Render the customer metrics section. */ }
            <CustomerMetricsSection />

            { /* Render the all-time stats section. */ }
            <AllTimeStatsSection />

            { /* Render top performing vendors section. */ }
            <TopPerformingVendorsSection />

            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                { /* Render the most reviewed products section. */ }
                <MostReviewedProductsSection />

                { /* Render the most reported vendors section. */ }
                { getSettings( 'dashboard' )?.show_most_reported_vendors && (
                    <MostReportedVendorsSection />
                ) }
            </div>
        </div>
    );
}

export default Dashboard;
