import './tailwind.scss';
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
import AdminNotices from './components/AdminNotices';
import { applyFilters } from '@wordpress/hooks';

function Dashboard() {
    const noticeScopes = applyFilters( 'dokan_admin_dashboard_notices_scopes', [
        { scope: 'global', endpoint: 'admin' },
        { scope: '', endpoint: 'admin' },
        { scope: 'promo', endpoint: 'promo' },
    ] );

    return (
        <div>
            <h1 className="wp-heading-inline">
                { __( 'Dashboard', 'dokan-lite' ) }
            </h1>
            <hr className="wp-header-end" />

            { noticeScopes?.map( ( noticeConfig ) => (
                <AdminNotices
                    key={ `${ noticeConfig.endpoint }-${
                        noticeConfig.scope || 'local'
                    }` }
                    endpoint={ noticeConfig.endpoint }
                    scope={ noticeConfig.scope }
                />
            ) ) }

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
                { dokanAdminDashboardSettings?.show_most_reported_vendors && (
                    <MostReportedVendorsSection />
                ) }
            </div>

            <div className={ `legacy-dashboard-url text-sm font-medium pt-8` }>
                { __(
                    'If you want to go back to old dashboard,',
                    'dokan-lite'
                ) }{ ' ' }
                <a
                    className={ `skip-color-module underline font-bold text-sm text-[#7047EB] hover:text-[#502BBF]` }
                    href={
                        dokanAdminDashboardSettings?.legacy_dashboard_url || '#'
                    }
                >
                    { __( 'Click Here', 'dokan-lite' ) }
                </a>
            </div>
        </div>
    );
}

export default Dashboard;
