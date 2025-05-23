import './tailwind.scss';
import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import OnBoardApp from './OnBoardApp';

domReady(function () {
    const setUpWizardRoot = document.querySelector( '.dokan-admin-setup-wizard' );
    if ( setUpWizardRoot ) {
        const mountDiv = document.createElement( 'div' );
        mountDiv.setAttribute( 'id', 'admin-onboard-root' );
        mountDiv.setAttribute( 'class', 'dokan-layout' );

        setUpWizardRoot.appendChild( mountDiv );
        const rootElement = document.querySelector( '#admin-onboard-root' );

        const root = createRoot( rootElement );
        root.render( <OnBoardApp /> );
    } else {
        console.error( 'Setup wizard root element not found' );
    }
});
