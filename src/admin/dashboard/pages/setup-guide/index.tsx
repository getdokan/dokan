import { useEffect, useState } from '@wordpress/element';
import getSettings from '../../settings/getSettings';
import StepSettings from './StepSettings';
import { __ } from '@wordpress/i18n';

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
            <div className="flex flex-col col-span-3 space-y-4 rounded-lg pl-10 pt-8">
                <h3 className="text-2xl font-bold leading-6 pb-10">
                    { __( 'Setup Guide', 'dokan-lite' ) }
                </h3>
                <ol className="relative text-gray-500 border-s-2 border-dashed ml-5 border-gray-200 dark:border-gray-700 dark:text-gray-400">
                    { steps.map( ( step, index ) => {
                        return (
                            <li key={ index } className="mb-14 ms-10 last:mb-0 flex items-center">
                                { step.is_completed ? (
                                    <span className="absolute flex items-center justify-center w-12 h-12 bg-[#7047EB] rounded-full -start-6 dark:bg-white">
                                        <svg
                                            className="w-3.5 h-3.5 text-white dark:text-black"
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
                                    <span className={ `absolute flex items-center justify-center w-12 h-12 border bg-white text-base text-black leading-5 rounded-full -start-6` }>
                                        { index + 1 }
                                    </span>
                                ) }
                                <h4 className={ `font-semibold leading-5 text-base ${ currentStep?.id === step.id ? 'text-[#7047EB]' : 'text-black' }` }>
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
                        <h2 className="text-3xl font-bold">{ __( 'Congratulations!', 'dokan-lite' ) }</h2>
                        <p className="text-gray-500">
                            { __( 'You have completed all the steps', 'dokan-lite' ) }
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
