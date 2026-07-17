import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import IntroCard from './IntroCard';
import StoreStep from './StoreStep';
import PaymentStep from './PaymentStep';
import VerificationStep from './VerificationStep';
import ReadyCard from './ReadyCard';
import { getWizardPayload } from './types';
import './style.scss';

// The PHP wizard shell renders one mount per step; navigation stays real page
// loads so $_GET-gated Pro assets and echo hooks keep working. Each step's
// payload (schema, urls) is bootstrapped inline by the shell.
domReady( () => {
    const mount = document.getElementById( 'dokan-setup-wizard-step' );
    const payload = getWizardPayload();

    if ( ! mount || ! payload ) {
        return;
    }

    const root = createRoot( mount );

    switch ( payload.step ) {
        case 'intro':
            root.render( <IntroCard payload={ payload } /> );
            break;
        case 'store':
            root.render( <StoreStep payload={ payload } /> );
            break;
        case 'payment':
            root.render( <PaymentStep payload={ payload } /> );
            break;
        case 'verification':
            root.render( <VerificationStep payload={ payload } /> );
            break;
        case 'ready':
            root.render( <ReadyCard payload={ payload } /> );
            break;
    }
} );
