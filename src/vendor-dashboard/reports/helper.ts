import { dokanConfig } from "./dokan-config";
import { getHistory } from "@woocommerce/navigation";

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

export const shouldBlockNavigation = () => {
    const decodedPath = decodeURIComponent( document.location.search || document.location.href ),
        match = decodedPath.match( /path=([^&]*)/ ),
        pathName = match ? match[1] : '';

    return ( ! pathName.toLowerCase().includes( 'analytics' ) ); // Check if 'analytics' is in the path
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
