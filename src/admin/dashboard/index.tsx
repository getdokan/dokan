import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import Dashboard from './components/Dashboard';
import './style.scss';

const dashboardDomNode = document.getElementById( 'dokan-admin-dashboard' );
const dashboardRoot = createRoot( dashboardDomNode! );

domReady( () => {
    if ( dashboardDomNode ) {
        dashboardRoot.render( <Dashboard /> );
    }
} );
