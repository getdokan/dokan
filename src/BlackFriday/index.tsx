// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); only the menu entry auto-hides.
import domReady from '@wordpress/dom-ready';
import type { DokanAdminRoute } from '../admin/dashboard/components/Dashboard';
import BlackFridayPage from './BlackFridayPage';

domReady( () => {
    // @ts-ignore
    wp.hooks.addFilter(
        'dokan-admin-dashboard-routes',
        'dokan-admin-dashboard-black-friday',
        ( routes: Array< DokanAdminRoute > ) => {
            routes.push( {
                id: 'black-friday',
                element: <BlackFridayPage />,
                path: '/black-friday',
            } satisfies DokanAdminRoute );

            return routes;
        }
    );
} );
