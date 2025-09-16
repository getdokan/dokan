/**
 * External dependencies
 */
import '@wordpress/notices';
import { createRoot } from '@wordpress/element';

import {
    withCurrentUserHydration,
    withSettingsHydration,
    // @ts-ignore
    // eslint-disable-next-line import/no-unresolved
} from '@woocommerce/data';

/**
 * Internal dependencies
 */
import './stylesheets/_index.scss';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { getAdminSetting } from 'reports/utils/admin-settings';
import { PageLayout } from './layout';
import { ErrorBoundary } from './error-boundary';
import domReady from '@wordpress/dom-ready';
const settingsGroup = 'wc_admin';
const hydrateUser = getAdminSetting( 'currentUserData' );
const mountElementId = 'dokan-analytics-app';

domReady( () => {
    const appRoot = document.getElementById( mountElementId );
    if ( appRoot ) {
        const root = createRoot( appRoot );

        let HydratedPageLayout = withSettingsHydration(
            settingsGroup,
            window.wcSettings?.admin
        )( PageLayout );
        const preloadSettings = window.wcSettings?.admin
            ? window.wcSettings?.admin.preloadSettings
            : false;
        const hydrateSettings = preloadSettings && preloadSettings.general;

        if ( hydrateSettings ) {
            HydratedPageLayout = withSettingsHydration( 'general', {
                general: preloadSettings.general,
            } )( HydratedPageLayout );
        }
        if ( hydrateUser ) {
            HydratedPageLayout =
                withCurrentUserHydration( hydrateUser )( HydratedPageLayout );
        }

        root.render(
            <ErrorBoundary>
                <HydratedPageLayout />
            </ErrorBoundary>
        );
    } else {
        // eslint-disable-next-line no-console
        console.error( `No DOM found by element ID: ${ mountElementId }` );
    }
} );
