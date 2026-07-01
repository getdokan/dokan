import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import {
    Settings,
    useSettings,
    Button,
    Spinner,
    Toaster,
    toast,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import { useSearchParams } from 'react-router-dom';
import { registerSettingsFields } from './register-fields';

// Side effect: register custom field renderers exactly once when this module
// is first evaluated by the bundler. Calling from module scope (NOT inside
// SettingsPage) avoids re-registering on every React render.
registerSettingsFields();

const URL_PARAM_PAGE = 'page_id';
const URL_PARAM_SUBPAGE = 'subpage_id';
const URL_PARAM_TAB = 'tab_id';

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
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ restored, setRestored ] = useState< boolean >( false );

    // Initial restore: after plugin-ui's auto-select has set defaults, replace
    // them with whatever the URL specifies. Runs once per session.
    useEffect( () => {
        if ( restored || ! activePage ) {
            return;
        }
        const urlSub = searchParams.get( URL_PARAM_SUBPAGE );
        const urlTab = searchParams.get( URL_PARAM_TAB );
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
        searchParams,
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
        setSearchParams(
            ( prev ) => {
                const next = new URLSearchParams( prev );
                if ( activeSubpage ) {
                    next.set( URL_PARAM_SUBPAGE, activeSubpage );
                } else {
                    next.delete( URL_PARAM_SUBPAGE );
                }
                if ( activeTab ) {
                    next.set( URL_PARAM_TAB, activeTab );
                } else {
                    next.delete( URL_PARAM_TAB );
                }
                return next;
            },
            { replace: true }
        );
    }, [ activeSubpage, activeTab, restored, setSearchParams ] );

    return null;
};

export default function SettingsPage() {
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ schema, setSchema ] = useState< SettingsElement[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( true );
    const [ saving, setSaving ] = useState< boolean >( false );

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

    const handleSave = async (
        scopeId: string,
        _treeValues: Record< string, unknown >,
        flatValues: Record< string, unknown >
    ): Promise< void > => {
        setSaving( true );
        try {
            await apiFetch( {
                path: `/dokan/v1/admin/settings/${ scopeId }`,
                method: 'PUT',
                data: { values: flatValues },
            } );
            toast.success( __( 'Settings saved.', 'dokan-lite' ) );
        } catch ( error ) {
            // eslint-disable-next-line no-console
            console.error( 'Failed to save settings:', error );
            toast.error(
                ( error as { message?: string } )?.message ||
                    __( 'Failed to save settings.', 'dokan-lite' )
            );
        } finally {
            setSaving( false );
        }
    };

    // Changing the top-level page resets subpage/tab — plugin-ui will auto-
    // select fresh defaults, and UrlSync will sync them back into the URL.
    const handleNavigate = ( pageId: string ): void => {
        setSearchParams(
            ( prev ) => {
                const next = new URLSearchParams( prev );
                next.set( URL_PARAM_PAGE, pageId );
                next.delete( URL_PARAM_SUBPAGE );
                next.delete( URL_PARAM_TAB );
                return next;
            },
            { replace: true }
        );
    };

    const initialPage = searchParams.get( URL_PARAM_PAGE ) || undefined;

    return (
        <>
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
                            disabled={ ! dirty || hasErrors || saving }
                        >
                            { saving && <Spinner className="size-4 mr-2" /> }
                            { saving
                                ? __( 'Saving…', 'dokan-lite' )
                                : __( 'Save Changes', 'dokan-lite' ) }
                        </Button>
                    </>
                ) }
            />
            <Toaster richColors />
        </>
    );
}
