import domReady from '@wordpress/dom-ready';
import './tailwind.scss';
import { DokanAdminRoute } from '../admin/dashboard/components/Dashboard';
import ProFeatures from './ProFeatures';

domReady( () => {
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
