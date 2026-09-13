import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';
import {
    Onboarding,
    type OnboardingStep,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import getSettings from '../../settings/getSettings';
import { registerSettingsFields } from './register-fields';

// Register Dokan custom field variants so the wizard renders them exactly like
// the settings page (idempotent — safe to call from both entry points).
registerSettingsFields();

export type Step = {
    id: string;
    title: string;
    is_completed: boolean;
    skippable: boolean;
};

const SetupGuide = () => {
    const [ steps, setSteps ] = useState< OnboardingStep[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( true );

    useEffect( () => {
        const metas: Step[] = getSettings( 'setup' )?.steps ?? [];
        let cancelled = false;

        ( async () => {
            const built = await Promise.all(
                metas.map( async ( meta ): Promise< OnboardingStep > => {
                    const schema = await apiFetch< SettingsElement[] >( {
                        path: `/dokan/v1/admin/setup-guide/${ meta.id }`,
                    } );

                    return {
                        id: meta.id,
                        label: meta.title,
                        schema,
                        skippable: meta.skippable,
                        completed: meta.is_completed,
                    };
                } )
            );

            if ( ! cancelled ) {
                setSteps( built );
                setLoading( false );
            }
        } )();

        return () => {
            cancelled = true;
        };
    }, [] );

    const handleStepSave = async (
        stepId: string,
        _treeValues: Record< string, unknown >,
        flatValues: Record< string, unknown >
    ): Promise< void > => {
        await apiFetch( {
            path: `/dokan/v1/admin/setup-guide/${ stepId }`,
            method: 'POST',
            data: { values: flatValues },
        } );

        setSteps( ( prev ) =>
            prev.map( ( step ) =>
                step.id === stepId ? { ...step, completed: true } : step
            )
        );
    };

    const handleComplete = async (): Promise< void > => {
        try {
            await apiFetch( {
                path: '/dokan/v1/admin/setup-guide/',
                method: 'POST',
                data: { setup_completed: true },
            } );
        } catch ( error ) {
            // eslint-disable-next-line no-console
            console.error( 'Failed to mark setup complete:', error );
        }

        const dashboardUrl = getSettings( 'header_info' )?.dashboard_url;
        if ( dashboardUrl ) {
            window.location.href = dashboardUrl;
        }
    };

    return (
        <Onboarding
            steps={ steps }
            orientation="vertical"
            hookPrefix="dokan"
            applyFilters={ applyFilters }
            loading={ loading }
            onStepSave={ handleStepSave }
            onComplete={ handleComplete }
        />
    );
};

export default SetupGuide;
