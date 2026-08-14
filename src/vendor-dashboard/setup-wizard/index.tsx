import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import Wizard from './Wizard';
import { getWizardBootstrap } from './types';
import './style.scss';

// PHP renders one mount and bootstraps every step, so steps swap client-side and only saves hit the network.
domReady( () => {
    const mount = document.getElementById( 'dokan-setup-wizard-step' );
    const boot = getWizardBootstrap();

    if ( ! mount || ! boot?.steps ) {
        return;
    }

    createRoot( mount ).render( <Wizard boot={ boot } /> );
} );
