import { dokanConfig } from "./dokan-config";
import { getHistory } from "@woocommerce/navigation";
import {applyFilters} from "@wordpress/hooks";

export const mapToDashboardRoute = (url: string): string => {
    const mappers = [
        {
            search: 'wp-admin/admin.php',
            replace: dokanConfig.dashboardReportUrl,
        },
        {
            search: 'admin.php',
            replace: '',
        }
    ]

    for(let i = 0; i < mappers.length; i++) {
        const item = mappers[i];

        if (url.includes(item.search)) {
            return url.replace(item.search, item.replace)
                .replace("page=wc-admin", "page=dokan-reports");
        }
    }

    return url;
}

/**
 * Determines if navigation should be blocked and handles redirects.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @return {boolean} Whether navigation should be blocked.
 */
export const shouldBlockNavigation = () => {
    const REDIRECT_RULES_FILTER = 'dokan_analytics_redirect_rules',
        BLOCK_NAVIGATION_FILTER = 'dokan_analytics_block_navigation';

    const redirectRules = applyFilters(
        REDIRECT_RULES_FILTER,
        [
            {
                path     : '/dashboard/',
                redirect : '/dashboard/?path=%2Fanalytics%2FOverview'
            },
            {
                path     : '/dashboard/reports/',
                redirect : '/dashboard/reports/?path=%2Fanalytics%2Fproducts'
            }
        ]
    );

    const decodedURL = decodeURIComponent( document.location.search || document.location.href ),
        pathMatch = decodedURL.match( /path=([^&]*)/ ),
        currentPathName = pathMatch ? pathMatch[1] : '',
        currentURLPath = document.location.pathname,
        isAnalyticsExcluded = ! currentPathName.toLowerCase().includes( 'analytics' ),
        matchingRedirectRule = redirectRules.find( rule => rule.path === currentURLPath );

    if ( isAnalyticsExcluded && matchingRedirectRule ) {
        document.location.href = matchingRedirectRule.redirect;
    }

    return applyFilters( BLOCK_NAVIGATION_FILTER, isAnalyticsExcluded );
}

export const handleAnalyticsLinkPrevention = () => {
    // Select all anchor tags within the dokan navigation element.
    const navigationLinks = document.querySelectorAll( '#dokan-navigation a' );

    navigationLinks.forEach(anchor => {
        anchor.addEventListener( 'click', ( event ) => {
            const targetUrl = event.target.href;
            if ( ! targetUrl.toLowerCase().includes( 'analytics' ) ) {
                return;
            }

            event.preventDefault();         // Prevent redirection if the link is related to 'analytics'.
            getHistory().push( targetUrl ); // Optionally push the URL to history for routing (if required).
        });
    });
};
