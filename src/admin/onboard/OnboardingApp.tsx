import WelcomeScreen from './WelcomeScreen';
import MarketplaceGoalScreen from './MarketplaceGoalScreen';
import AddonsScreen from './AddonsScreen';
import BasicInfoScreen from './BasicInfoScreen';
import LoadingScreen from './LoadingScreen';
import SuccessScreen from './SuccessScreen';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { IOnboard } from '@dokan/admin/onboard/types';

// Define types for our API data
const OnboardingApp = () => {
    const [ currentStep, setCurrentStep ] = useState( 0 );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ apiError, setApiError ] = useState( '' );
    const [ initialData, setInitialData ] = useState< IOnboard | null >( null );

    // Form data state
    const [ formData, setFormData ] = useState( {
        // Basic info
        custom_store_url: 'store',
        share_essentials: true,

        // Marketplace goal
        marketplace_goal: {
            marketplace_focus: 'physical',
            handle_delivery: 'vendor',
            top_priority: 'sales',
        },

        // Selected plugins/addons
        plugins: [] as Array< {
            id: string;
            info: {
                name: string;
                'repo-slug': string;
                [ key: string ]: any;
            };
        } >,
    } );

    // Fetch initial data when component mounts
    useEffect( () => {
        fetchOnboardingData();
    }, [] );

    const formatPlugins = ( plugins: any[] ) => {
        return plugins.map( ( plugin ) => {
            //  $plugin_details_arr = explode( '/', $plugin_details['basename'] ?? '' );
            const pluginDetails = plugin?.plugins[ 0 ]?.basename.split( '/' );
            return {
                id: plugin?.plugins[ 0 ]?.slug,
                info: {
                    name: plugin?.plugins[ 0 ]?.name,
                    'repo-slug': pluginDetails[ 0 ] || '',
                    file: pluginDetails[ 1 ] || '',
                },
            };
        } );
    };

    const fetchOnboardingData = async () => {
        try {
            setIsLoading( true );
            const response = await apiFetch< IOnboard >( {
                path: '/dokan/v1/admin-onboarding',
                method: 'GET',
            } );

            setInitialData( response );

            // Initialize form data with values from API if available
            if ( response ) {
                setFormData( {
                    custom_store_url:
                        response.general_options?.custom_store_url || 'store',
                    share_essentials:
                        response.share_essentials !== undefined
                            ? response.share_essentials === '1'
                            : true,
                    marketplace_goal: {
                        marketplace_focus:
                            response.marketplace_goal?.marketplace_focus ||
                            'physical',
                        handle_delivery:
                            response.marketplace_goal?.handle_delivery,
                        top_priority:
                            response.marketplace_goal?.top_priority || 'sales',
                    },
                    plugins: formatPlugins( response.plugins ) || [],
                } );

                const isAlreadyOnboarded = response?.onboarding;
                if ( isAlreadyOnboarded ) {
                    setCurrentStep( 5 ); // Show success screen if already onboarded
                }
            }

            setIsLoading( false );
        } catch ( error ) {
            console.error( 'Error fetching onboarding data:', error );
            setApiError(
                'Failed to load initial data. Please refresh the page.'
            );
            setIsLoading( false );
        }
    };

    const submitOnboardingData = async () => {
        setIsLoading( true );
        setCurrentStep( 4 ); // Show loading screen

        try {
            // Prepare the data for submission
            const submitData = {
                onboarding: true,
                marketplace_goal: formData.marketplace_goal,
                custom_store_url: formData.custom_store_url,
                share_essentials: formData.share_essentials,
                plugins: formData.plugins,
            };

            // Send the data to the API
            const response = await apiFetch( {
                path: '/dokan/v1/admin-onboarding',
                method: 'POST',
                data: submitData,
            } );

            console.log( 'Onboarding completed successfully:', response );

            // Move to success screen
            setCurrentStep( 5 );
        } catch ( error ) {
            console.error( 'Error submitting onboarding data:', error );
            setApiError( 'Failed to save onboarding data. Please try again.' );
            // Go back to previous step
            setCurrentStep( 3 );
        } finally {
            setIsLoading( false );
        }
    };

    // Update form data handlers for each section
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
        // Filter the full plugins list to include only selected ones
        console.log( 'Selected plugin IDs:', pluginIds );
        const selectedPlugins =
            initialData?.plugins.filter( ( plugin ) =>
                pluginIds.includes( plugin?.plugins?.[ 0 ]?.slug )
            ) || [];

        console.log( 'Selected plugins:', selectedPlugins );

        const formattedPlugins = formatPlugins( selectedPlugins );
        console.log( 'Formatted plugins:', formattedPlugins );
        setFormData( ( prevData ) => ( {
            ...prevData,
            plugins: formattedPlugins,
        } ) );
    };

    const goToNextStep = () => {
        if ( currentStep === 3 ) {
            // Submit data when moving from addon screen to loading screen
            submitOnboardingData();
        } else {
            setCurrentStep( ( prevStep ) => Math.min( prevStep + 1, 5 ) );
        }
    };

    const goToPrevStep = () => {
        setCurrentStep( ( prevStep ) => Math.max( prevStep - 1, 0 ) );
    };

    const goToStep = ( step: number ) => {
        setCurrentStep( step );
    };

    const renderCurrentScreen = () => {
        // Show loading screen while fetching initial data
        if ( isLoading && currentStep === 0 ) {
            return <LoadingScreen />;
        }

        // Display error message if API request failed
        if ( apiError && currentStep !== 5 ) {
            // You could create an ErrorScreen component or handle errors differently
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
                                ? 'marketplace'
                                : 'vendor'
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

            { /* Navigation dots */ }
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-2 flex space-x-2">
                { [ 0, 1, 2, 3, 4, 5 ].map( ( step ) => (
                    <button
                        key={ step }
                        className={ `w-3 h-3 rounded-full ${
                            currentStep === step
                                ? 'bg-indigo-600'
                                : 'bg-gray-300'
                        }` }
                        onClick={ () => goToStep( step ) }
                        disabled={ isLoading }
                    />
                ) ) }
            </div>
        </div>
    );
};

export default OnboardingApp;
