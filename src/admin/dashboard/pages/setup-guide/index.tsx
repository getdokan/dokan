import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { useToast } from '@getdokan/dokan-ui';
import {
    Button,
    extractValues,
    Onboarding,
    SettingsSkeleton,
    type OnboardingStep,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import getSettings from '../../settings/getSettings';
import { registerSettingsFields } from './register-fields';
import {
    categoryCommissionError,
    fixedCommissionError,
} from '../settings/fields/commission-fields/validation';

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
    const [ loadFailed, setLoadFailed ] = useState< boolean >( false );
    const [ edits, setEdits ] = useState< Record< string, any > >( {} );
    const toast = useToast();

    useEffect( () => {
        // Retrying clears the flag, which runs the load again.
        if ( loadFailed ) {
            return;
        }

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
        } )().catch( () => {
            // An empty wizard looks broken, so say the load failed and offer a retry.
            if ( ! cancelled ) {
                setLoadFailed( true );
            }
        } );

        return () => {
            cancelled = true;
        };
    }, [ loadFailed ] );

    const handleStepSave = async (
        stepId: string,
        _treeValues: Record< string, unknown >,
        flatValues: Record< string, unknown >
    ): Promise< void > => {
        const fields = await apiFetch< SettingsElement[] >( {
            path: `/dokan/v1/admin/setup-guide/${ stepId }`,
            method: 'POST',
            data: { values: flatValues },
        } ).catch( ( error ) => {
            toast( {
                type: 'error',
                title:
                    error?.message ||
                    __( 'Failed to save settings.', 'dokan-lite' ),
            } );
            // plugin-ui opens the next step once the save settles, even on a rejection, so a failed save never settles.
            return new Promise< never >( () => {} );
        } );
        const saved = new Map( fields.map( ( field ) => [ field.id, field ] ) );

        setEdits( {} );
        // Changing `steps` rebuilds the form from the schema, so the schema must carry the saved values.
        setSteps( ( prev ) =>
            prev.map( ( step ) =>
                step.id === stepId
                    ? {
                          ...step,
                          completed: true,
                          schema: step.schema.map(
                              ( element ) => saved.get( element.id ) ?? element
                          ),
                      }
                    : step
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

    // Live values: the unsaved edits over what the steps loaded with.
    const values = {
        ...extractValues( steps.flatMap( ( step ) => step.schema ) ),
        ...edits,
    };

    // plugin-ui can't validate the object-shaped commission values, so apply the settings page's rule here.
    const commissionError =
        values.commission_type === 'fixed'
            ? fixedCommissionError( values.admin_commission )
            : categoryCommissionError(
                  values.commission_category_based_values
              );

    if ( loadFailed ) {
        return (
            <Notice
                status="error"
                isDismissible={ false }
                actions={ [
                    {
                        label: __( 'Retry Loading', 'dokan-lite' ),
                        onClick: () => setLoadFailed( false ),
                    },
                ] }
            >
                { __( 'Failed to load settings', 'dokan-lite' ) }
            </Notice>
        );
    }

    // Same placeholder the settings page shows while its schema loads.
    if ( loading ) {
        return <SettingsSkeleton />;
    }

    return (
        <Onboarding
            steps={ steps }
            orientation="vertical"
            hookPrefix="dokan"
            applyFilters={ applyFilters }
            onChange={ ( _stepId, key, value ) =>
                setEdits( ( prev ) => ( { ...prev, [ key ]: value } ) )
            }
            onStepSave={ handleStepSave }
            onComplete={ handleComplete }
            // The built-in footer can't disable Skip or Continue for the commission rule.
            renderFooter={ ( footer ) => {
                const blocked =
                    footer.hasErrors ||
                    ( footer.activeStepId === 'commission' &&
                        !! commissionError );

                return (
                    <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background px-6 py-3">
                        <div>
                            { ! footer.isFirst && (
                                <Button
                                    variant="ghost"
                                    onClick={ footer.onBack }
                                >
                                    { __( 'Back', 'dokan-lite' ) }
                                </Button>
                            ) }
                        </div>
                        <div className="flex items-center gap-2">
                            { footer.skippable && ! footer.isLast && (
                                <Button
                                    variant="outline"
                                    disabled={ blocked }
                                    onClick={ footer.onSkip }
                                >
                                    { __( 'Skip', 'dokan-lite' ) }
                                </Button>
                            ) }
                            <Button
                                disabled={ blocked }
                                onClick={
                                    footer.isLast
                                        ? footer.onFinish
                                        : footer.onNext
                                }
                            >
                                { footer.isLast
                                    ? __( 'Finish', 'dokan-lite' )
                                    : __( 'Continue', 'dokan-lite' ) }
                            </Button>
                        </div>
                    </div>
                );
            } }
        />
    );
};

export default SetupGuide;
