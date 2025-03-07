import React, { useEffect, useState } from 'react';
import {
    fetchOnboardingData,
    formatPlugins,
    submitOnboardingData,
} from './utility/api';
import WelcomeScreen from './screens/WelcomeScreen';
import BasicInfoScreen from './screens/BasicInfoScreen';
import MarketplaceGoalScreen from './screens/MarketplaceGoalScreen';
import AddonsScreen from './screens/AddonsScreen';
import LoadingScreen from './screens/LoadingScreen';
import SuccessScreen from './screens/SuccessScreen';
import ErrorMessage from './components/ErrorMessage';
import StepIndicator from './components/StepIndicator';
import './tailwind.scss';

const defaultFormData = {
    custom_store_url: 'store',
    share_essentials: true,
    marketplace_goal: {
        marketplace_focus: 'physical',
        handle_delivery: 'vendor',
        top_priority: 'sales',
    },
    plugins: [],
};

const OnboardingApp = () => {
    // State management
    const [ currentStep, setCurrentStep ] = useState( 0 );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ apiError, setApiError ] = useState( '' );
    const [ initialData, setInitialData ] = useState( null );
    const [ formData, setFormData ] = useState( defaultFormData );
    const [ hasPlugins, setHasPlugins ] = useState( true );

    // Fetch initial data
    const loadInitialData = async () => {
        try {
            setIsLoading( true );
            setApiError( '' );

            const response = await fetchOnboardingData();
            setInitialData( response );

            // Check if there are plugins available
            const pluginsAvailable =
                response?.plugins && response.plugins.length > 0;
            setHasPlugins( pluginsAvailable );

            if ( response ) {
                setFormData( {
                    custom_store_url:
                        response.general_options?.custom_store_url || 'store',
                    share_essentials:
                        typeof response.share_essentials === 'string'
                            ? response.share_essentials === '1'
                            : Boolean( response.share_essentials ),
                    marketplace_goal: {
                        marketplace_focus:
                            response.marketplace_goal?.marketplace_focus ||
                            'physical',
                        handle_delivery:
                            response.marketplace_goal?.handle_delivery ||
                            'vendor',
                        top_priority:
                            response.marketplace_goal?.top_priority || 'sales',
                    },
                    plugins: formatPlugins( response.plugins || [] ),
                } );

                // Skip to success screen if already onboarded
                if ( response?.onboarding ) {
                    setCurrentStep( 5 );
                }
            }
        } catch ( error ) {
            setApiError(
                'Failed to load initial data. Please refresh the page.'
            );
        } finally {
            setIsLoading( false );
        }
    };

    // Load data on mount
    useEffect( () => {
        loadInitialData();
    }, [] );

    // Handle form submission
    const handleSubmit = async ( skipPlugins = false ) => {
        setIsLoading( true );
        setCurrentStep( 4 ); // Show loading screen

        try {
            // If skipPlugins is true, submit form data without plugins
            const dataToSubmit = skipPlugins
                ? { ...formData, plugins: [] }
                : formData;

            await submitOnboardingData( dataToSubmit );
            setCurrentStep( 5 ); // Success screen
        } catch ( error ) {
            console.error( 'Error submitting onboarding data:', error );
            setApiError( 'Failed to save onboarding data. Please try again.' );
            // Go back to previous screen (either addons or marketplace goal)
            setCurrentStep( hasPlugins ? 3 : 2 );
        } finally {
            setIsLoading( false );
        }
    };

    // Update handlers
    const updateBasicInfo = ( storeUrl, shareEssentials ) => {
        setFormData( ( prevData ) => ( {
            ...prevData,
            custom_store_url: storeUrl,
            share_essentials: shareEssentials,
        } ) );
    };

    const updateMarketplaceGoal = ( focus, deliveryHandling, priority ) => {
        setFormData( ( prevData ) => ( {
            ...prevData,
            marketplace_goal: {
                marketplace_focus: focus,
                handle_delivery: deliveryHandling,
                top_priority: priority,
            },
        } ) );
    };

    const updateSelectedPlugins = ( pluginIds ) => {
        if ( ! initialData?.plugins?.length ) {
            return;
        }

        const selectedPlugins = initialData.plugins.filter( ( plugin ) =>
            pluginIds.includes( plugin?.plugins?.[ 0 ]?.slug )
        );

        setFormData( ( prevData ) => ( {
            ...prevData,
            plugins: formatPlugins( selectedPlugins ),
        } ) );
    };

    // Navigation handlers
    const goToNextStep = () => {
        // When moving from marketplace goal screen (step 2) to next step
        if ( currentStep === 2 ) {
            // If no plugins, skip AddonsScreen and submit
            if ( ! hasPlugins ) {
                handleSubmit( false );
                return;
            }
        }
        // When moving from AddonsScreen (step 3) to next step
        else if ( currentStep === 3 ) {
            handleSubmit( false );
            return;
        }

        // Normal step progression
        setCurrentStep( ( prevStep ) => Math.min( prevStep + 1, 5 ) );
    };

    const goToPrevStep = () => {
        setCurrentStep( ( prevStep ) => Math.max( prevStep - 1, 0 ) );
    };

    // Handle skip from addons screen - don't submit plugins
    const skipAddonsStep = () => {
        // Submit form data with empty plugins array
        handleSubmit( true );
    };

    // Render the current screen
    const renderCurrentScreen = () => {
        // Show loading screen while fetching initial data
        if ( isLoading && currentStep === 0 ) {
            return <LoadingScreen />;
        }

        // Display error message if API request failed and not on success screen
        if ( apiError && currentStep !== 5 ) {
            return (
                <ErrorMessage
                    message={ apiError }
                    onRetry={ loadInitialData }
                />
            );
        }

        switch ( currentStep ) {
            case 0:
                return <WelcomeScreen onNext={ goToNextStep } />;
            case 1:
                return (
                    <BasicInfoScreen
                        onNext={ goToNextStep }
                        storeUrl={ formData.custom_store_url }
                        shareDiagnostics={ formData.share_essentials }
                        onUpdate={ updateBasicInfo }
                    />
                );
            case 2:
                return (
                    <MarketplaceGoalScreen
                        onNext={ goToNextStep }
                        onBack={ goToPrevStep }
                        marketplaceType={
                            formData.marketplace_goal.marketplace_focus
                        }
                        deliveryMethod={
                            formData.marketplace_goal.handle_delivery
                        }
                        priority={ formData.marketplace_goal.top_priority }
                        onUpdate={ updateMarketplaceGoal }
                    />
                );
            case 3:
                // Only show AddonsScreen if there are plugins
                return hasPlugins ? (
                    <AddonsScreen
                        onNext={ goToNextStep }
                        onBack={ goToPrevStep }
                        onSkip={ skipAddonsStep }
                        selectedAddons={ [] }
                        availableAddons={ initialData?.plugins || [] }
                        onUpdate={ updateSelectedPlugins }
                    />
                ) : (
                    <LoadingScreen />
                );
            case 4:
                return <LoadingScreen />;
            case 5:
                return <SuccessScreen />;
            default:
                return <WelcomeScreen onNext={ goToNextStep } />;
        }
    };

    return (
        <div>
            { renderCurrentScreen() }

            <StepIndicator
                currentStep={ currentStep }
                onStepChange={ setCurrentStep }
                isDisabled={
                    isLoading || ( ! hasPlugins && currentStep === 3 )
                }
                totalSteps={ hasPlugins ? 6 : 5 }
            />
        </div>
    );
};

export default OnboardingApp;
