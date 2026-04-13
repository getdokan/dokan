import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import menuFix from '../utils/admin-menu-fix.js';
import Dashboard from './components/Dashboard';
import './style.css';

domReady( () => {
    const dashboardDomNode = document.getElementById( 'dokan-admin-dashboard' );
    if ( dashboardDomNode ) {
        const dashboardRoot = createRoot( dashboardDomNode! );
        dashboardRoot.render( <Dashboard /> );
    }
} );
menuFix( 'dokan' );
