import domReady from '@wordpress/dom-ready';
import Status from './Status';
import './status.scss';
import { DokanAdminRoute } from '../admin/dashboard/components/Dashboard';
import Test from "./Test";

domReady( () => {
    // @ts-ignore
    wp.hooks.addFilter(
        'dokan-admin-dashboard-routes',
        'dokan-admin-dashboard-status',
        ( routes: Array< DokanAdminRoute > ) => {
            routes.push( {
                id: 'dokan-status',
                element: <Test />,
                path: '/status',
            } satisfies DokanAdminRoute );

            return routes;
        }
    );
} );
