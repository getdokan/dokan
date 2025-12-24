import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import Dashboard from './components/Dashboard';
import './style.scss';
import menuFix from '../utils/admin-menu-fix.js';

domReady( () => {
    const dashboardDomNode = document.getElementById( 'dokan-admin-dashboard' );
    if ( dashboardDomNode ) {
        const dashboardRoot = createRoot( dashboardDomNode! );
        dashboardRoot.render( <Dashboard /> );
    }
} );
menuFix( 'dokan' );
