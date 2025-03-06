// components/StepIndicator.tsx
import React from 'react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps?: number;
    onStepChange: ( step: number ) => void;
    isDisabled?: boolean;
}

const StepIndicator: React.FC< StepIndicatorProps > = ( {
    currentStep,
    totalSteps = 6,
    onStepChange,
    isDisabled = false,
} ) => {
    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-2 flex space-x-2">
            { Array.from( { length: totalSteps } ).map( ( _, index ) => (
                <button
                    key={ index }
                    className={ `w-3 h-3 rounded-full ${
                        currentStep === index ? 'bg-indigo-600' : 'bg-gray-300'
                    }` }
                    onClick={ () => onStepChange( index ) }
                    disabled={ isDisabled }
                />
            ) ) }
        </div>
    );
};

export default StepIndicator;
