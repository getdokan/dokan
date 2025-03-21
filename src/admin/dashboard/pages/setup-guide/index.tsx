import { useEffect, useState } from '@wordpress/element';
import getSettings from '../../settings/getSettings';
import StepSettings, {SettingsElement} from './StepSettings';
import StepComponent from './components/StepComponent';
import CompletedStep from './components/CompletedStep';
import apiFetch from "@wordpress/api-fetch";

export type Step = {
    title: string;
    id: string;
    is_completed: boolean;
    skippable: boolean;
    previous_step: string;
    next_step: string;
};

const SetupGuide = () => {
    const [ steps, setSteps ] = useState< Step[] >( [] );
    const [ isAllStepsCompleted, setIsAllStepsCompleted ] = useState<boolean>( false );

    const defaultStep = {
        id: '',
        is_completed: false,
        next_step: '',
        skippable: false,
        previous_step: '',
        title: '',
    };

    const [ currentStep, setCurrentStep ] = useState< Step >( { ...defaultStep } );

    useEffect( () => {
        const allSteps: Step[] = getSettings( 'setup' ).steps;

        setSteps( allSteps );
    }, [] );

    useEffect(() => {
        const allSteps: Step[] = getSettings('setup').steps;
        setSteps(allSteps);
    }, []);

    useEffect(() => {
        const isCompleted = steps.every( ( step ) => step.is_completed );
        // You can use this variable or set it to a state if needed
        setIsAllStepsCompleted( isCompleted );
    }, [steps]);

    const handleStepsChange = ( newSteps ) => {
        setSteps( newSteps );

        const isCompleted = newSteps.every( ( step ) => step.is_completed );
        setIsAllStepsCompleted( isCompleted );

        if ( isCompleted ) {
            try {
                apiFetch< SettingsElement[] >( {
                    path   : '/dokan/v1/admin/setup-guide/',
                    method : 'POST',
                    data   : { setup_completed: true },
                } );

                setCurrentStep( { ...defaultStep } );
            } catch ( err ) {
                console.error( err );
            }
        }
    }

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
                        currentStep={ currentStep }
                        updateStep={ handleStepsChange }
                        setCurrentStep={ setCurrentStep }
                    />
                ) }
            </div>
        </div>
    );
};

export default SetupGuide;
