import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';

// Define custom animation keyframes
const customStyles = `
@keyframes completeStep {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.animate-complete-step {
  animation: completeStep 0.9s ease-in-out;
}
`;

const StepComponent = ( { steps, currentStep } ) => {
    const [ displayedStep, setDisplayedStep ] = useState( currentStep );
    const [ completedSteps, setCompletedSteps ] = useState( {} );
    const prevStepsRef = useRef( steps );

    // Track step completion changes
    useEffect( () => {
        if ( prevStepsRef.current && steps ) {
            // Check for newly completed steps
            steps.forEach( ( step ) => {
                const prevStep = prevStepsRef.current.find(
                    ( s ) => s.id === step.id
                );
                if (
                    prevStep &&
                    ! prevStep.is_completed &&
                    step.is_completed
                ) {
                    // Mark this step as newly completed
                    setCompletedSteps( ( prev ) => ( {
                        ...prev,
                        [ step.id ]: true,
                    } ) );

                    // Clear the animation flag after animation completes
                    setTimeout( () => {
                        setCompletedSteps( ( prev ) => ( {
                            ...prev,
                            [ step.id ]: false,
                        } ) );
                    }, 1500 ); // Animation duration + extra time
                }
            } );
        }

        // Update ref for next comparison
        prevStepsRef.current = [ ...steps ];
    }, [ steps ] );

    // Handle transition when currentStep changes
    useEffect( () => {
        if ( currentStep?.id !== displayedStep?.id ) {
            // Simple update of the displayed step
            setDisplayedStep( currentStep );
        }
    }, [ currentStep, displayedStep ] );

    return (
        <div className="@3xl/main:col-span-3 @xl/main:col-span-4 col-span-12 flex flex-col rounded-lg @5xl/main:pl-12 @3xl/main:py-10 @xs/main:py-4 pl-4 bg-white shadow">
            { /* Add the custom style for animations */ }
            <style>{ customStyles }</style>
            <h3 className="text-2xl font-bold leading-6 @2xl/main:mb-10 mb-3">
                { __( 'Setup Guide', 'dokan-lite' ) }
            </h3>
            <ol className="relative text-gray-500 border-s-2 border-dashed @xl/main:my-0 my-4 ml-5 border-gray-200 dark:border-gray-700 dark:text-gray-400">
                { steps.map( ( step, index ) => {
                    const isCurrentStep = step.id === displayedStep?.id;

                    return (
                        <li
                            key={ index }
                            className="mb-14 ms-10 last:mb-0 flex items-center transition-colors duration-300"
                        >
                            { step.is_completed ? (
                                <span
                                    className={ `absolute flex items-center justify-center w-12 h-12 bg-[#7047EB] rounded-full -start-6 transition-all duration-500 ${
                                        completedSteps[ step.id ]
                                            ? 'animate-complete-step'
                                            : ''
                                    }` }
                                >
                                    <svg
                                        className="w-3.5 h-3.5 text-white dark:text-black transition-opacity duration-300"
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
                                <span
                                    className={ `absolute flex items-center justify-center w-12 h-12 border border-[#7047EB] bg-white text-base text-black leading-5 rounded-full -start-6 transition-all duration-300 ` }
                                >
                                    { index + 1 }
                                </span>
                            ) }
                            <h4
                                className={ `font-semibold leading-5 text-base transition-colors duration-300 ${
                                    isCurrentStep
                                        ? 'text-[#7047EB]'
                                        : 'text-black'
                                }` }
                            >
                                { step.title }
                            </h4>
                        </li>
                    );
                } ) }
            </ol>
        </div>
    );
};

export default StepComponent;
