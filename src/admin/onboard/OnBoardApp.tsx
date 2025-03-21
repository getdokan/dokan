import { useEffect, useState } from '@wordpress/element';
import WelcomeScreen from './screens/WelcomeScreen';
import BasicInfoScreen from './screens/BasicInfoScreen';
import MarketplaceGoalScreen from './screens/MarketplaceGoalScreen';
import AddonsScreen from './screens/AddonsScreen';
import LoadingScreen from './screens/LoadingScreen';
import SuccessScreen from './screens/SuccessScreen';
import { OnboardingStep } from './types';
import {
    getNextStep,
    getPreviousStep,
    insertLoadingAfter,
    skipToSuccess,
} from './utility/stepUtils';
import {
    formatPlugins,
    getOnboardingData,
    postOnboardingData,
} from '@dokan/admin/onboard/utility/api';

const OnboardingApp = () => {
    // Current step state
    const [ currentStep, setCurrentStep ] = useState< OnboardingStep >(
        OnboardingStep.WELCOME
    );

    // Data states
    const [ initialData, setInitialData ] = useState( null );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ apiError, setApiError ] = useState( '' );
    const [ hasPlugins, setHasPlugins ] = useState( true );

    // Form data
    const [ formData, setFormData ] = useState( {
        custom_store_url: 'store',
        share_essentials: true,
        marketplace_goal: {
            marketplace_focus: 'physical',
            handle_delivery: 'vendor',
            top_priority: 'sales',
        },
        plugins: [],
    } );

    // Fetch initial data
    useEffect( () => {
        fetchOnboardingData();
    }, [] );

    const fetchOnboardingData = async () => {
        try {
            setIsLoading( true );
            const response = await getOnboardingData();
            setInitialData( response );

            // Check if plugins are available
            const pluginsAvailable =
                response?.plugins && response.plugins.length > 0;
            setHasPlugins( pluginsAvailable );

            // Initialize form data
            if ( response ) {
                // Skip to success if already onboarded
                if ( Boolean( response.onboarding ) ) {
                    setCurrentStep( skipToSuccess() );
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

    const submitOnboardingData = async ( skipPlugins = false ) => {
        // Show loading screen
        setCurrentStep( insertLoadingAfter( currentStep ) );
        setIsLoading( true );

        try {
            // Prepare the data for submission
            const submitData = {
                onboarding: true,
                marketplace_goal: formData.marketplace_goal,
                custom_store_url: formData.custom_store_url,
                share_essentials: formData.share_essentials,
                plugins: skipPlugins ? [] : formData.plugins,
            };
            // Send the data to the API
            await postOnboardingData( submitData );

            // Go to success
            setCurrentStep( skipToSuccess() );
        } catch ( error ) {
            setApiError( 'Failed to save onboarding data. Please try again.' );
        } finally {
            setIsLoading( false );
        }
    };

    // Form update handlers
    const updateBasicInfo = ( storeUrl, shareEssentials ) => {
        setFormData( ( prev ) => ( {
            ...prev,
            custom_store_url: storeUrl,
            share_essentials: shareEssentials,
        } ) );
    };

    const updateMarketplaceGoal = ( focus, deliveryHandling, priority ) => {
        setFormData( ( prev ) => ( {
            ...prev,
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
            pluginIds.includes( plugin.slug )
        );

        setFormData( ( prevData ) => ( {
            ...prevData,
            plugins: formatPlugins( selectedPlugins ),
        } ) );
    };

    // Navigation handlers
    const handleNext = () => {
        const current = currentStep;

        // Handle special cases
        if ( current === OnboardingStep.MARKETPLACE_GOAL && ! hasPlugins ) {
            // If no plugins, skip directly to submission
            submitOnboardingData( false );
            return;
        }

        if ( current === OnboardingStep.ADDONS ) {
            // Submit data when finishing addon selection
            submitOnboardingData( false );
            return;
        }

        // Normal progression
        setCurrentStep( getNextStep( currentStep, hasPlugins ) );
    };

    const handleBack = () => {
        setCurrentStep( getPreviousStep( currentStep, hasPlugins ) );
    };

    const handleSkip = () => {
        // For addon screen, skip means submit without plugins
        if ( currentStep === OnboardingStep.ADDONS ) {
            submitOnboardingData( true );
        } else {
            setCurrentStep( getNextStep( currentStep, hasPlugins ) );
        }
    };

    // Render the current screen
    const renderCurrentScreen = () => {
        // Show loading while fetching initial data
        if ( isLoading && currentStep === OnboardingStep.WELCOME ) {
            return <LoadingScreen />;
        }

        // Handle error display (except on success screen)
        if ( apiError && currentStep !== OnboardingStep.SUCCESS ) {
            return (
                <div className="error-message p-8 text-center">
                    <h2 className="text-xl text-red-600 mb-4">Error</h2>
                    <p>{ apiError }</p>
                    <button
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={ fetchOnboardingData }
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        // Render the appropriate screen
        switch ( currentStep ) {
            case OnboardingStep.WELCOME:
                return <WelcomeScreen onNext={ handleNext } />;

            case OnboardingStep.BASIC_INFO:
                return (
                    <BasicInfoScreen
                        onNext={ handleNext }
                        storeUrl={ formData.custom_store_url }
                        shareDiagnostics={ formData.share_essentials }
                        onUpdate={ updateBasicInfo }
                    />
                );

            case OnboardingStep.MARKETPLACE_GOAL:
                return (
                    <MarketplaceGoalScreen
                        onNext={ handleNext }
                        onBack={ handleBack }
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

            case OnboardingStep.ADDONS:
                return (
                    <AddonsScreen
                        onNext={ handleNext }
                        onBack={ handleBack }
                        onSkip={ handleSkip }
                        availableAddons={ initialData?.plugins || [] }
                        onUpdate={ updateSelectedPlugins }
                    />
                );

            case OnboardingStep.LOADING:
                return <LoadingScreen />;

            case OnboardingStep.SUCCESS:
                return <SuccessScreen />;

            default:
                return <WelcomeScreen onNext={ handleNext } />;
        }
    };

    return <div>{ renderCurrentScreen() }</div>;
};

export default OnboardingApp;
