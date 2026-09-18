/**
 * External dependencies
 */
import '@wordpress/notices';
import { createRoot } from '@wordpress/element';

import { dispatch } from '@wordpress/data';

import {
    OPTIONS_STORE_NAME,
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

/**
 * Seed the options data store with the values localized by PHP.
 *
 * Vendors are not permitted to read `/wc-admin/options`, so any component that
 * resolves an option through the store would fire a request that 403s. Hydrating
 * from a component effect lands too late — children start resolution during the
 * first render — so the store is seeded before the app mounts.
 */
const hydratePreloadedOptions = () => {
    const preloadOptions = getAdminSetting( 'preloadOptions', {} );
    const optionsStore = dispatch( OPTIONS_STORE_NAME );

    Object.entries( preloadOptions ).forEach( ( [ name, value ] ) => {
        optionsStore.startResolution( 'getOption', [ name ] );
        optionsStore.receiveOptions( { [ name ]: value } );
        optionsStore.finishResolution( 'getOption', [ name ] );
    } );
};

domReady( () => {
    const appRoot = document.getElementById( mountElementId );
    if ( appRoot ) {
        hydratePreloadedOptions();

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
    }
} );
