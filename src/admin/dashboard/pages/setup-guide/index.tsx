import { useEffect, useState } from '@wordpress/element';
import getSettings from '../../settings/getSettings';
import StepSettings from './StepSettings';

export type Step = {
    title: string;
    id: string;
    is_completed: boolean;
    previous_step: string;
    next_step: string;
};

const SetupGuide = ( props ) => {
    const [ steps, setSteps ] = useState< Step[] >( [] );

    useEffect( () => {
        const allSteps: Step[] = getSettings( 'setup' ).steps;

        setSteps( allSteps );
    }, [] );

    const isAllStepsCompleted = steps.every( ( step ) => step.is_completed );

    const currentStep = steps.find( ( step ) => ! step.is_completed );

    console.log( isAllStepsCompleted, currentStep );

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="flex flex-col col-span-3 space-y-4 rounded-lg">
                <h3 className="text-2xl font-bold">Setup Guide</h3>
                <ol className="relative text-gray-500 border-s ml-5 border-gray-200 dark:border-gray-700 dark:text-gray-400">
                    { steps.map( ( step, index ) => {
                        return (
                            <li key={ index } className="mb-10 ms-6">
                                { step.is_completed ? (
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-purple-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-purple-900">
                                        <svg
                                            className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 16 12"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M1 5.917 5.724 10.5 15 1.5"
                                            />
                                        </svg>
                                    </span>
                                ) : (
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-50 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-900">
                                        { index + 1 }
                                    </span>
                                ) }
                                <h4 className="font-medium leading-tight">
                                    { step.title }
                                </h4>
                            </li>
                        );
                    } ) }
                </ol>
            </div>
            <div className="col-span-9 bg-white">
                { isAllStepsCompleted ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <h2 className="text-3xl font-bold">Congratulations!</h2>
                        <p className="text-gray-500">
                            You have completed all the steps
                        </p>
                    </div>
                ) : (
                    <StepSettings step={ currentStep } />
                ) }
            </div>
        </div>
    );
};

export default SetupGuide;
