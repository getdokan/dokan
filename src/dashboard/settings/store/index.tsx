import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import {
    Settings,
    Button,
    Spinner,
    Toaster,
    toast,
    useSettings,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import { registerVendorSettingsFields } from './register-fields';
import {
    qualifyDependencyKeys,
    rekeyServerErrors,
} from '../shared/server-errors';
import StoreSettingsSkeleton from './StoreSettingsSkeleton';
import './style.scss';

// Side effect: register the custom variants exactly once at module load —
// registering inside the component would duplicate handlers on every render.
registerVendorSettingsFields();

const ENDPOINT = '/dokan/v1/vendor-settings/store';

type ServerFieldErrors = Record< string, string[] | string >;

// Module-level so it survives the Save/Cancel refresh-remounts (key bump) and the vendor's tab can be picked back up.
const lastActiveTab = { current: '' };

// Imperative bridge: handleSave lives outside the provider, so a failed save reaches the engine's tab state through this slot (filled by TabKeeper).
const tabControls: { setActiveTab: ( ( tab: string ) => void ) | null } = {
    setActiveTab: null,
};

// Mounted inside the engine provider via renderSaveButton: remembers the active line tab and restores it after a refresh-remount instead of snapping back to the first tab.
const TabKeeper = () => {
    const { activeTab, setActiveTab, getActiveTabs } = useSettings();
    const restored = useRef( false );

    useEffect( () => {
        tabControls.setActiveTab = setActiveTab;
        return () => {
            tabControls.setActiveTab = null;
        };
    }, [ setActiveTab ] );

    useEffect( () => {
        // The provider assigns the first tab async after mount — the first non-empty value is the restore moment; everything after is the vendor navigating.
        if ( ! activeTab ) {
            return;
        }
        if ( ! restored.current ) {
            restored.current = true;
            const remembered = lastActiveTab.current;
            if (
                remembered &&
                remembered !== activeTab &&
                getActiveTabs().some( ( tab ) => tab.id === remembered )
            ) {
                setActiveTab( remembered );
                return;
            }
        }
        lastActiveTab.current = activeTab;
    }, [ activeTab, setActiveTab, getActiveTabs ] );

    return null;
};

/**
 * Vendor dashboard › Settings › Store — the flat-array React page.
 *
 * The schema (with values) comes from the vendor settings REST endpoint and
 * renders through the same plugin-ui `<Settings>` engine the admin settings
 * page uses; saves go back through the legacy write pipeline server-side.
 */
export default function StoreSettings() {
    const [ schema, setSchema ] = useState< SettingsElement[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( true );
    const [ saving, setSaving ] = useState< boolean >( false );
    const [ resetKey, setResetKey ] = useState< number >( 0 );

    // Shared GET → qualify → mount sequence for both the initial load and Cancel.
    const loadSchema = async ( remount = false ): Promise< void > => {
        setLoading( true );
        try {
            const response = await apiFetch< SettingsElement[] >( {
                path: ENDPOINT,
            } );
            // plugin-ui v2 matches dependency keys literally against dot-path values.
            setSchema( qualifyDependencyKeys( response ) );
            if ( remount ) {
                setResetKey( ( key ) => key + 1 );
            }
        } catch ( error ) {
            // eslint-disable-next-line no-console
            console.error( 'Failed to fetch store settings:', error );
            toast.error(
                ( error as { message?: string } )?.message ||
                    __( 'Failed to load store settings.', 'dokan-lite' )
            );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        loadSchema();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    // A failed save may reject fields on a hidden tab — activate the first tab (in strip order) that carries an error so the vendor sees it.
    const focusErrorTab = ( fieldErrors: ServerFieldErrors ) => {
        const byId = new Map( schema.map( ( el ) => [ el.id, el ] ) );
        const tabOf = ( fieldId: string ): string => {
            let el = byId.get( fieldId );
            // Field → owning section → tab; section-less cards carry tab_id directly.
            while ( el ) {
                if ( el.tab_id ) {
                    return String( el.tab_id );
                }
                el = el.section_id
                    ? byId.get( String( el.section_id ) )
                    : undefined;
            }
            return '';
        };

        const errorTabs = new Set(
            Object.keys( fieldErrors ).map( tabOf ).filter( Boolean )
        );
        const target = schema
            .filter( ( el ) => 'tab' === el.type )
            .sort(
                ( a, b ) =>
                    ( ( a.priority as number ) ?? 0 ) -
                    ( ( b.priority as number ) ?? 0 )
            )
            .find( ( tab ) => errorTabs.has( tab.id ) );

        if ( target ) {
            // Keep TabKeeper aligned so a follow-up successful save stays here.
            lastActiveTab.current = target.id;
            tabControls.setActiveTab?.( target.id );
        }
    };

    const handleSave = async (
        _scopeId: string,
        _treeValues: Record< string, unknown >,
        flatValues: Record< string, unknown >
    ): Promise< void > => {
        setSaving( true );
        try {
            const response = await apiFetch< SettingsElement[] >( {
                path: ENDPOINT,
                method: 'PUT',
                data: { values: flatValues },
            } );

            // Apply the refreshed schema so server-derived values (vacation
            // history rows, cleared composer, dependent force-offs) come back
            // without a manual reload. No remount here: re-keying the engine
            // tears down every card and repaints, which reads as a blink.
            if ( Array.isArray( response ) ) {
                setSchema( qualifyDependencyKeys( response ) );
            }

            toast.success( __( 'Store settings saved.', 'dokan-lite' ) );
        } catch ( error ) {
            const typedError = error as {
                message?: string;
                data?: { errors?: ServerFieldErrors };
            };

            toast.error(
                typedError?.message ||
                    __( 'Failed to save store settings.', 'dokan-lite' )
            );

            // Re-throw in the shape plugin-ui merges into per-field errors — the
            // engine keys them by dependency_key (dot path), not bare field id.
            const fieldErrors = typedError?.data?.errors;
            if ( fieldErrors && 'object' === typeof fieldErrors ) {
                focusErrorTab( fieldErrors );
                throw {
                    errors: rekeyServerErrors( schema, fieldErrors ),
                };
            }

            throw error;
        } finally {
            setSaving( false );
        }
    };

    // Cancel = refetch + remount the engine so every field resets to the saved state.
    const handleCancel = (): Promise< void > => loadSchema( true );

    // The engine's built-in skeleton draws the admin sidebar+panel frame; this
    // page renders as bare full-width cards, so it gets a matching skeleton.
    if ( loading ) {
        return (
            <div className="dokan-vendor-store-settings">
                <StoreSettingsSkeleton />
                <Toaster richColors />
            </div>
        );
    }

    return (
        <div className="dokan-vendor-store-settings">
            <Settings
                key={ resetKey }
                schema={ schema }
                loading={ false }
                title={ __( 'Store Settings', 'dokan-lite' ) }
                hookPrefix="dokan_vendor"
                applyFilters={ applyFilters }
                onSave={ handleSave }
                // Strip the engine's outer panel chrome so the cards float on the
                // dashboard background, matching the Figma page.
                className="border-0 rounded-none min-h-0 bg-transparent"
                // Save/Cancel sit in the engine's save area at the page footer; style.scss strips that bar down to plain right-aligned buttons.
                renderSaveButton={ ( { dirty, hasErrors, onSave } ) => (
                    <>
                        <TabKeeper />
                        <div className="flex items-center justify-end gap-2.5">
                            <Button
                                variant="ghost"
                                onClick={ handleCancel }
                                disabled={ ! dirty || saving }
                            >
                                { __( 'Cancel', 'dokan-lite' ) }
                            </Button>
                            <Button
                                onClick={ onSave }
                                disabled={ ! dirty || hasErrors || saving }
                            >
                                { saving && (
                                    <Spinner className="size-4 mr-2" />
                                ) }
                                { saving
                                    ? __( 'Saving…', 'dokan-lite' )
                                    : __( 'Save Changes', 'dokan-lite' ) }
                            </Button>
                        </div>
                    </>
                ) }
            />
            <Toaster richColors />
        </div>
    );
}
