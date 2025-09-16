import domReady from '@wordpress/dom-ready';
import './tailwind.scss';
import { DokanAdminRoute } from '../admin/dashboard/components/Dashboard';
import ProFeatures from './ProFeatures';

// Add viewport meta tag for admin area
const addViewportMeta = () => {
    const meta = document.createElement( 'meta' );
    meta.name = 'viewport';
    meta.content =
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild( meta );
};

domReady( () => {
    // Add viewport meta when route matches pro-features
    if ( window.location.href.includes( 'pro-features' ) ) {
        addViewportMeta();
    }

    // @ts-ignore
    wp.hooks.addFilter(
        'dokan-admin-dashboard-routes',
        'dokan-admin-dashboard-pro-features',
        ( routes: Array< DokanAdminRoute > ) => {
            routes.push( {
                id: 'dokan-pro-features',
                element: <ProFeatures />,
                path: '/pro-features',
            } satisfies DokanAdminRoute );

            return routes;
        }
    );
} );
