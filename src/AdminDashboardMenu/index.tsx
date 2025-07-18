import domReady from '@wordpress/dom-ready';
import './tailwind.scss';
import { DokanAdminRoute } from '../../components/Dashboard';
import Dashboard from './Dashboard';

domReady( () => {
    // @ts-ignore
    wp.hooks.addFilter(
        'dokan-admin-dashboard-routes',
        'dokan-admin-dashboard-dashboard',
        ( routes: Array< DokanAdminRoute > ) => {
            routes.push( {
                id: 'dashboard',
                element: <Dashboard />,
                path: '',
            } satisfies DokanAdminRoute );

            return routes;
        }
    );
} );
