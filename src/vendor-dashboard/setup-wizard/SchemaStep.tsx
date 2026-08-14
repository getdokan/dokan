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

// Shared shell for the schema-driven steps; server errors re-key to the engine's dependency_key contract.
export default function SchemaStep( {
    payload,
    failureMessage,
}: SchemaStepProps ) {
    const [ schema ] = useState< SettingsElement[] >( () =>
        qualifyDependencyKeys( payload.schema ?? [] )
    );
    const [ saving, setSaving ] = useState< boolean >( false );
    const saveRef = useRef< ( () => void ) | null >( null );
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

            // PHP bootstraps each step once, so a revisit would otherwise remount the page-load snapshot and lose the save.
            payload.schema?.forEach( ( element ) => {
                if (
                    'field' === element.type &&
                    Object.prototype.hasOwnProperty.call(
                        flatValues,
                        element.id
                    )
                ) {
                    element.value = flatValues[ element.id ];
                }
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

    // Every Next saves, touched or not — required fields are enforced server-side, so skipping an untouched step would walk the vendor past validation.
    const onNext = () =>
        new Promise< boolean >( ( resolve ) => {
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
                renderSaveButton={ ( { onSave } ) => {
                    // The wizard footer owns the action; the engine's save bar renders empty.
                    saveRef.current = onSave;
                    return null;
                } }
            />
            <WizardFooter
                onNext={ onNext }
                busy={ saving }
                skippable={ false !== payload.skippable }
            />
            <Toaster />
        </div>
    );
}
