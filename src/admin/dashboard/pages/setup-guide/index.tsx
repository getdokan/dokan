import { useEffect, useState } from '@wordpress/element';
import getSettings from '../../settings/getSettings';
import StepSettings from './StepSettings';
import StepComponent from './components/StepComponent';
import CompletedStep from './components/CompletedStep';

export type Step = {
    title: string;
    id: string;
    is_completed: boolean;
    previous_step: string;
    next_step: string;
};

const SetupGuide = () => {
    const [ steps, setSteps ] = useState< Step[] >( [] );
    const [ currentStep, setCurrentStep ] = useState< Step >( {
        id: '',
        is_completed: false,
        next_step: '',
        previous_step: '',
        title: '',
    } );

    useEffect( () => {
        const allSteps: Step[] = getSettings( 'setup' ).steps;

        setSteps( allSteps );
    }, [] );

    const isAllStepsCompleted = steps.every( ( step ) => step.is_completed );

    return (
        <div className="grid grid-cols-12 lg:gap-6 gap-4 @container/main">
            <StepComponent currentStep={ currentStep } steps={ steps } />
            <div className="@3xl/main:col-span-9 @xl/main:col-span-8 col-span-12 bg-white shadow rounded-lg">
                { isAllStepsCompleted ? (
                    <CompletedStep
                        dashBoardUrl={
                            dokanAdminDashboardSettings?.header_info
                                ?.dashboard_url
                        }
                        steps={ steps }
                    />
                ) : (
                    <StepSettings
                        steps={ steps }
                        updateStep={ setSteps }
                        currentStep={ currentStep }
                        setCurrentStep={ setCurrentStep }
                    />
                ) }
            </div>
        </div>
    );
};

export default SetupGuide;
