import WelcomeScreen from './WelcomeScreen';
import MarketplaceGoalScreen from './MarketplaceGoalScreen';
import AddonsScreen from './AddonsScreen';
import BasicInfoScreen from './BasicInfoScreen';
import LoadingScreen from './LoadingScreen';
import SuccessScreen from './SuccessScreen';
import { useState } from '@wordpress/element';

const OnboardingApp = () => {
    const [ currentStep, setCurrentStep ] = useState( 0 );

    const goToNextStep = () => {
        setCurrentStep( prevStep => Math.min( prevStep + 1, 5 ) );
    };

    const goToPrevStep = () => {
        setCurrentStep( prevStep => Math.max( prevStep - 1, 0 ) );
    };

    const goToStep = ( step ) => {
        setCurrentStep( step );
    };

    const renderCurrentScreen = () => {
        switch ( currentStep ) {
            case 0:
                return <WelcomeScreen onNext={ goToNextStep } />;
            case 1:
                return <BasicInfoScreen onNext={ goToNextStep } />;
            case 2:
                return <MarketplaceGoalScreen onNext={ goToNextStep } onBack={ goToPrevStep } />;
            case 3:
                return <AddonsScreen onNext={ goToNextStep } onBack={ goToPrevStep } onSkip={ goToNextStep } />;
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
            {/*{ screens[ currentStep ] }*/}
            { renderCurrentScreen() }

            {/* Navigation dots for demo purposes */}
            <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-2 flex space-x-2'>
                {[0, 1, 2, 3, 4, 5].map((step) => (
                    <button
                        key={step}
                        className={`w-3 h-3 rounded-full ${
                            currentStep === step ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                        onClick={() => goToStep(step)}
                    />
                ))}
            </div>
        </div>
    )
}

export default OnboardingApp;
