import './tailwind.scss';
import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

const SetupGuideBanner = () => {
    return (
        <div className={`bg-white p-4 text-base text-gray-900 mt-5 mr-5 rounded-lg shadow`}>
            Hello From The Dashboard Setup Guide Banner
        </div>
    );
}

domReady(function () {
    const adminHeaderRoot = document.querySelector( '.dokan-admin-header' );
    if ( adminHeaderRoot ) {
        const mountDiv = document.createElement( 'div' );
        mountDiv.setAttribute( 'id', 'setup-guide-banner-root' );
        mountDiv.setAttribute( 'class', 'dokan-layout' );

        adminHeaderRoot.after( mountDiv );
        const rootElement = document.querySelector( '#setup-guide-banner-root' );

        const root = createRoot( rootElement );
        root.render( <SetupGuideBanner /> );
    } else {
        console.error( 'Setup guide banner root element not found' );
    }
});
