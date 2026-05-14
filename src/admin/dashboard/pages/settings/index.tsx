import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import {
    Settings,
    useSettings,
    Button,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import { registerSettingsFields } from './register-fields';

// Side effect: register custom field renderers exactly once when this module
// is first evaluated by the bundler. Calling from module scope (NOT inside
// SettingsPage) avoids re-registering on every React render.
registerSettingsFields();

const URL_PARAM_PAGE = 'page_id';
const URL_PARAM_SUBPAGE = 'subpage_id';
const URL_PARAM_TAB = 'tab_id';

const getUrlParam = ( name: string ): string | null => {
    if ( typeof window === 'undefined' ) {
        return null;
    }
    return new URLSearchParams( window.location.search ).get( name );
};

const setUrlParams = ( updates: Record< string, string | null > ): void => {
    if ( typeof window === 'undefined' ) {
        return;
    }
    const url = new URL( window.location.href );
    for ( const [ key, value ] of Object.entries( updates ) ) {
        if ( value ) {
            url.searchParams.set( key, value );
        } else {
            url.searchParams.delete( key );
        }
    }
    window.history.replaceState( {}, '', url );
};

/**
 * Mounts inside the SettingsProvider tree (via renderSaveButton) and binds
 * the active subpage/tab to URL query params. Plugin-ui only exposes the
 * top-level `initialPage` / `onNavigate` props, so subpage and tab state
 * has to be driven through the context hook.
 */
const UrlSync = (): null => {
    const {
        activePage,
        activeSubpage,
        activeTab,
        setActiveSubpage,
        setActiveTab,
    } = useSettings();
    const [ restored, setRestored ] = useState< boolean >( false );

    // Initial restore: after plugin-ui's auto-select has set defaults, replace
    // them with whatever the URL specifies. Runs once per session.
    useEffect( () => {
        if ( restored || ! activePage ) {
            return;
        }
        const urlSub = getUrlParam( URL_PARAM_SUBPAGE );
        const urlTab = getUrlParam( URL_PARAM_TAB );
        if ( urlSub && urlSub !== activeSubpage ) {
            setActiveSubpage( urlSub );
        }
        if ( urlTab && urlTab !== activeTab ) {
            setActiveTab( urlTab );
        }
        setRestored( true );
    }, [
        activePage,
        activeSubpage,
        activeTab,
        restored,
        setActiveSubpage,
        setActiveTab,
    ] );

    // Persist on change: every time the user navigates, mirror the state
    // into the URL. Skipped until the initial restore finishes so we don't
    // overwrite a URL subpage with plugin-ui's auto-selected default.
    useEffect( () => {
        if ( ! restored ) {
            return;
        }
        setUrlParams( {
            [ URL_PARAM_SUBPAGE ]: activeSubpage || null,
            [ URL_PARAM_TAB ]: activeTab || null,
        } );
    }, [ activeSubpage, activeTab, restored ] );

    return null;
};

export default function SettingsPage() {
    const [ schema, setSchema ] = useState< SettingsElement[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( true );

    useEffect( () => {
        apiFetch< SettingsElement[] >( { path: '/dokan/v1/admin/settings' } )
            .then( ( response ) => {
                setSchema( response );
                setLoading( false );
            } )
            .catch( ( error ) => {
                // eslint-disable-next-line no-console
                console.error( 'Failed to fetch settings:', error );
                setLoading( false );
            } );
    }, [] );

    const handleSave = (
        scopeId: string,
        _treeValues: Record< string, unknown >,
        flatValues: Record< string, unknown >
    ): void => {
        apiFetch( {
            path: `/dokan/v1/admin/settings/${ scopeId }`,
            method: 'PUT',
            data: { values: flatValues },
        } ).catch( ( error ) => {
            // eslint-disable-next-line no-console
            console.error( 'Failed to save settings:', error );
        } );
    };

    // Changing the top-level page resets subpage/tab — plugin-ui will auto-
    // select fresh defaults, and UrlSync will sync them back into the URL.
    const handleNavigate = ( pageId: string ): void => {
        setUrlParams( {
            [ URL_PARAM_PAGE ]: pageId,
            [ URL_PARAM_SUBPAGE ]: null,
            [ URL_PARAM_TAB ]: null,
        } );
    };

    const initialPage = getUrlParam( URL_PARAM_PAGE ) || undefined;

    return (
        <Settings
            schema={ schema }
            loading={ loading }
            title={ __( 'Dokan Settings', 'dokan-lite' ) }
            hookPrefix="dokan"
            applyFilters={ applyFilters }
            onSave={ handleSave }
            initialPage={ initialPage }
            onNavigate={ handleNavigate }
            renderSaveButton={ ( { dirty, hasErrors, onSave } ) => (
                <>
                    <UrlSync />
                    <Button
                        onClick={ onSave }
                        disabled={ ! dirty || hasErrors }
                    >
                        { __( 'Save Changes', 'dokan-lite' ) }
                    </Button>
                </>
            ) }
        />
    );
}
