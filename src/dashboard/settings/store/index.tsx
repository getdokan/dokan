import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import {
    Settings,
    Button,
    Spinner,
    Toaster,
    toast,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import { registerVendorSettingsFields } from './register-fields';

// Side effect: register the custom variants exactly once at module load —
// registering inside the component would duplicate handlers on every render.
registerVendorSettingsFields();

const ENDPOINT = '/dokan/v1/vendor-settings/store';

type ServerFieldErrors = Record< string, string[] | string >;

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

    useEffect( () => {
        apiFetch< SettingsElement[] >( { path: ENDPOINT } )
            .then( ( response ) => {
                setSchema( response );
                setLoading( false );
            } )
            .catch( ( error ) => {
                // eslint-disable-next-line no-console
                console.error( 'Failed to fetch store settings:', error );
                toast.error(
                    ( error as { message?: string } )?.message ||
                        __( 'Failed to load store settings.', 'dokan-lite' )
                );
                setLoading( false );
            } );
    }, [] );

    const handleSave = async (
        _scopeId: string,
        _treeValues: Record< string, unknown >,
        flatValues: Record< string, unknown >
    ): Promise< void > => {
        setSaving( true );
        try {
            await apiFetch( {
                path: ENDPOINT,
                method: 'PUT',
                data: { values: flatValues },
            } );
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

            // Re-throw in the shape plugin-ui merges into per-field errors
            // (`error.errors` keyed by field id) — also keeps the form dirty.
            const fieldErrors = typedError?.data?.errors;
            if ( fieldErrors && 'object' === typeof fieldErrors ) {
                throw {
                    errors: Object.fromEntries(
                        Object.entries( fieldErrors ).map(
                            ( [ fieldId, messages ] ) => [
                                fieldId,
                                Array.isArray( messages )
                                    ? messages.join( ' ' )
                                    : String( messages ),
                            ]
                        )
                    ),
                };
            }

            throw error;
        } finally {
            setSaving( false );
        }
    };

    // Cancel = refetch + remount the engine so every field resets to the saved state.
    const handleCancel = async (): Promise< void > => {
        setLoading( true );
        try {
            const response = await apiFetch< SettingsElement[] >( {
                path: ENDPOINT,
            } );
            setSchema( response );
            setResetKey( ( key ) => key + 1 );
        } catch ( error ) {
            // eslint-disable-next-line no-console
            console.error( 'Failed to reload store settings:', error );
        } finally {
            setLoading( false );
        }
    };

    return (
        <div className="dokan-vendor-store-settings">
            <Settings
                key={ resetKey }
                schema={ schema }
                loading={ loading }
                title={ __( 'Store', 'dokan-lite' ) }
                hookPrefix="dokan_vendor"
                applyFilters={ applyFilters }
                onSave={ handleSave }
                renderSaveButton={ ( { dirty, hasErrors, onSave } ) => (
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={ handleCancel }
                            disabled={ ! dirty || saving }
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                        <Button
                            onClick={ onSave }
                            disabled={ ! dirty || hasErrors || saving }
                        >
                            { saving && <Spinner className="size-4 mr-2" /> }
                            { saving
                                ? __( 'Saving…', 'dokan-lite' )
                                : __( 'Save Changes', 'dokan-lite' ) }
                        </Button>
                    </div>
                ) }
            />
            <Toaster richColors />
        </div>
    );
}
