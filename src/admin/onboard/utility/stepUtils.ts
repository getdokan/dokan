import { OnboardingStep } from '@src/admin/onboard/types';

/**
 * Gets the appropriate step sequence based on whether plugins are available
 * @param hasPlugins
 */
export function getStepSequence( hasPlugins: boolean ): OnboardingStep[] {
    const baseSteps = [
        OnboardingStep.WELCOME,
        OnboardingStep.BASIC_INFO,
        OnboardingStep.MARKETPLACE_GOAL,
    ];

    if ( hasPlugins ) {
        baseSteps.push( OnboardingStep.ADDONS );
    }

    baseSteps.push( OnboardingStep.SUCCESS );
    return baseSteps;
}

/**
 * Gets the next step in the sequence
 * @param currentStep
 * @param hasPlugins
 */
export function getNextStep(
    currentStep: OnboardingStep,
    hasPlugins: boolean
): OnboardingStep {
    const steps = getStepSequence( hasPlugins );
    const currentIndex = steps.indexOf( currentStep );

    if ( currentIndex === -1 || currentIndex === steps.length - 1 ) {
        return currentStep; // Stay on current step if not found or already at the end
    }

    return steps[ currentIndex + 1 ];
}

/**
 * Gets the previous step in the sequence
 * @param currentStep
 * @param hasPlugins
 */
export function getPreviousStep(
    currentStep: OnboardingStep,
    hasPlugins: boolean
): OnboardingStep {
    const steps = getStepSequence( hasPlugins );
    const currentIndex = steps.indexOf( currentStep );

    if ( currentIndex <= 0 ) {
        return currentStep; // Stay on current step if not found or already at the beginning
    }

    return steps[ currentIndex - 1 ];
}

/**
 * Insert the loading step after the current step
 * @param currentStep
 */
export function insertLoadingAfter(
    currentStep: OnboardingStep
): OnboardingStep {
    return OnboardingStep.LOADING;
}

/**
 * Skip to success step
 */
export function skipToSuccess(): OnboardingStep {
    return OnboardingStep.SUCCESS;
}
