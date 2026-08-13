import { createContext, useContext } from '@wordpress/element';
import type { WizardStepKey } from './types';

export type StepNav = {
    next?: WizardStepKey;
    previous?: WizardStepKey;
    goTo: ( step: WizardStepKey ) => void;
    isNextReady: boolean;
};

// Steps move through this instead of navigating, so the wizard stays a single page load.
export const StepNavContext = createContext< StepNav | null >( null );

export const useStepNav = (): StepNav => {
    const nav = useContext( StepNavContext );

    if ( ! nav ) {
        throw new Error( 'useStepNav must be used inside the wizard shell.' );
    }

    return nav;
};
