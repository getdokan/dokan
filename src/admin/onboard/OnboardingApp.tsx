import WelcomeScreen from './WelcomeScreen';
import MarketplaceGoalScreen from './MarketplaceGoalScreen';
import AddonsScreen from './AddonsScreen';
import BasicInfoScreen from './BasicInfoScreen';
import LoadingScreen from './LoadingScreen';
import SuccessScreen from './SuccessScreen';
import { useState } from '@wordpress/element';

const OnboardingApp = () => {
    const [currentStep, setCurrentStep] = useState(0)

    const screens = [
        <WelcomeScreen key='welcome' />,
        <MarketplaceGoalScreen key='goal' />,
        <AddonsScreen key='addons' />,
        <BasicInfoScreen key='basic' />,
        <LoadingScreen key='loading' />,
        <SuccessScreen key='success' />
    ];

    return (
        <div>
            {screens[currentStep]}

            {/* Navigation controls for demo purposes */}
            <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-2 flex space-x-2'>
                {screens.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                            currentStep === index ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                        onClick={() => setCurrentStep(index)}
                    />
                ))}
            </div>
        </div>
    )
}

export default OnboardingApp;
