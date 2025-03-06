import React, { useEffect, useState } from 'react';
import {
    fetchOnboardingData,
    formatPlugins,
    submitOnboardingData,
} from './utility/api';
import { FormData, OnboardingData } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import BasicInfoScreen from './screens/BasicInfoScreen';
import MarketplaceGoalScreen from './screens/MarketplaceGoalScreen';
import AddonsScreen from './screens/AddonsScreen';
import LoadingScreen from './screens/LoadingScreen';
import SuccessScreen from './screens/SuccessScreen';
import ErrorMessage from './components/ErrorMessage';
import StepIndicator from './components/StepIndicator';
import './tailwind.scss';

const defaultFormData: FormData = {
    custom_store_url: 'store',
    share_essentials: true,
    marketplace_goal: {
        marketplace_focus: 'physical',
        handle_delivery: 'vendor',
        top_priority: 'sales',
    },
    plugins: [],
};

const OnboardingApp: React.FC = () => {
    // State management
    const [ currentStep, setCurrentStep ] = useState( 0 );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ apiError, setApiError ] = useState( '' );
    const [ initialData, setInitialData ] = useState< OnboardingData | null >(
        null
    );
    const [ formData, setFormData ] = useState< FormData >( defaultFormData );

    // Fetch initial data
    const loadInitialData = async () => {
        try {
            setIsLoading( true );
            setApiError( '' );

            const response = await fetchOnboardingData();
            setInitialData( response );

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
            console.error( 'Error fetching onboarding data:', error );
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
    const handleSubmit = async () => {
        setIsLoading( true );
        setCurrentStep( 4 ); // Show loading screen

        try {
            await submitOnboardingData( formData );
            setCurrentStep( 5 ); // Success screen
        } catch ( error ) {
            console.error( 'Error submitting onboarding data:', error );
            setApiError( 'Failed to save onboarding data. Please try again.' );
            setCurrentStep( 3 ); // Back to addons screen
        } finally {
            setIsLoading( false );
        }
    };

    // Update handlers
    const updateBasicInfo = ( storeUrl: string, shareEssentials: boolean ) => {
        setFormData( ( prevData ) => ( {
            ...prevData,
            custom_store_url: storeUrl,
            share_essentials: shareEssentials,
        } ) );
    };

    const updateMarketplaceGoal = (
        focus: string,
        deliveryHandling: string,
        priority: string
    ) => {
        setFormData( ( prevData ) => ( {
            ...prevData,
            marketplace_goal: {
                marketplace_focus: focus,
                handle_delivery: deliveryHandling,
                top_priority: priority,
            },
        } ) );
    };

    const updateSelectedPlugins = ( pluginIds: string[] ) => {
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
        if ( currentStep === 3 ) {
            // Submit data when leaving addons screen
            handleSubmit();
        } else {
            setCurrentStep( ( prevStep ) => Math.min( prevStep + 1, 5 ) );
        }
    };

    const goToPrevStep = () => {
        setCurrentStep( ( prevStep ) => Math.max( prevStep - 1, 0 ) );
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
                return (
                    <AddonsScreen
                        onNext={ goToNextStep }
                        onBack={ goToPrevStep }
                        onSkip={ goToNextStep }
                        selectedAddons={ formData.plugins.map(
                            ( plugin ) => plugin.id
                        ) }
                        availableAddons={ initialData?.plugins || [] }
                        onUpdate={ updateSelectedPlugins }
                    />
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
                isDisabled={ isLoading }
            />
        </div>
    );
};

export default OnboardingApp;
