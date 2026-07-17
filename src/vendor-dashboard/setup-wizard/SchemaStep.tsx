import { useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import {
    Settings,
    Toaster,
    toast,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import {
    qualifyDependencyKeys,
    rekeyServerErrors,
} from '@src/dashboard/settings/shared/server-errors';
import WizardFooter from './WizardFooter';
import type { WizardPayload } from './types';

type SchemaStepProps = {
    payload: WizardPayload;
    // Toast shown when the step's PUT fails.
    failureMessage: string;
};

/**
 * Shared shell for the schema-driven wizard steps (store, payment).
 *
 * The schema is bootstrapped inline by PHP (never fetched — the page render is
 * the only context where the wizard's `$_GET` state is faithful). The engine's
 * save bar renders empty; the wizard footer drives the save and navigates once
 * the PUT settles. Server validation errors re-key to the engine's
 * dependency_key contract, same as the Store settings page.
 * @param root0
 * @param root0.payload
 * @param root0.failureMessage
 */
export default function SchemaStep( {
    payload,
    failureMessage,
}: SchemaStepProps ) {
    const [ schema ] = useState< SettingsElement[] >( () =>
        qualifyDependencyKeys( payload.schema ?? [] )
    );
    const [ saving, setSaving ] = useState< boolean >( false );
    const saveRef = useRef< ( () => void ) | null >( null );
    const dirtyRef = useRef< boolean >( false );
    const resultRef = useRef< ( ( ok: boolean ) => void ) | null >( null );

    const handleSave = async (
        _scopeId: string,
        _treeValues: Record< string, unknown >,
        flatValues: Record< string, unknown >
    ) => {
        setSaving( true );

        try {
            await apiFetch( {
                path: payload.endpoint ?? '',
                method: 'PUT',
                data: { values: flatValues },
            } );
            resultRef.current?.( true );
        } catch ( error ) {
            resultRef.current?.( false );
            setSaving( false );

            const typedError = error as {
                message?: string;
                data?: { errors?: Record< string, string[] | string > };
            };

            toast.error( typedError?.message || failureMessage );

            const fieldErrors = typedError?.data?.errors;
            if ( fieldErrors && 'object' === typeof fieldErrors ) {
                throw { errors: rekeyServerErrors( schema, fieldErrors ) };
            }

            throw error;
        }
    };

    // WizardFooter drives the engine save and resolves once the PUT settles.
    const onNext = () =>
        new Promise< boolean >( ( resolve ) => {
            if ( ! dirtyRef.current ) {
                resolve( true );
                return;
            }
            if ( ! saveRef.current ) {
                resolve( false );
                return;
            }
            resultRef.current = resolve;
            saveRef.current();
        } );

    if ( ! schema.length ) {
        return null;
    }

    return (
        <div className="dokan-setup-wizard-step dokan-layout">
            <Settings
                schema={ schema }
                onSave={ handleSave }
                applyFilters={ applyFilters }
                hookPrefix="dokan_vendor"
                renderSaveButton={ ( { dirty, onSave } ) => {
                    // The wizard footer owns the action; the engine's save bar renders empty.
                    saveRef.current = onSave;
                    dirtyRef.current = dirty;
                    return null;
                } }
            />
            <WizardFooter
                backUrl={ payload.backUrl }
                skipUrl={ payload.skipUrl }
                nextUrl={ payload.nextStepUrl ?? '' }
                onNext={ onNext }
                busy={ saving }
                creatingOverlay={ payload.creatingOverlay }
            />
            <Toaster />
        </div>
    );
}
