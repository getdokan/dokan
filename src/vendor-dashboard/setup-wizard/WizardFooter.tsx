import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wedevs/plugin-ui';
import { ChevronLeft } from 'lucide-react';
import CreatingOverlay from './CreatingOverlay';
import { useStepNav } from './step-nav';

type WizardFooterProps = {
    nextLabel?: string;
    // Resolves true to advance; false/throw keeps the vendor on the step.
    onNext: () => Promise< boolean >;
    busy?: boolean;
    // False drops Skip — a step the vendor has to complete (Pro's required verification).
    skippable?: boolean;
};

// Back pinned left, Skip + Next right. Every action moves the SPA — no navigation.
export default function WizardFooter( {
    nextLabel,
    onNext,
    busy = false,
    skippable = true,
}: WizardFooterProps ) {
    const { next, previous, goTo, isNextReady } = useStepNav();
    const [ advancing, setAdvancing ] = useState( false );

    const advance = () => {
        if ( next ) {
            goTo( next );
        }
    };

    const handleNext = async () => {
        setAdvancing( true );

        try {
            if ( await onNext() ) {
                advance();
            }
        } catch ( error ) {
            // The step surfaces its own error; staying put is the correct outcome.
        }

        setAdvancing( false );
    };

    return (
        <>
            { /* The store really is being finalised while the last save is in flight — no fake delay. */ }
            { advancing && isNextReady && <CreatingOverlay /> }

            <div className="dokan-vsw-step-footer">
                { previous ? (
                    <Button
                        variant="ghost"
                        className="gap-1 border border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                        onClick={ () => goTo( previous ) }
                    >
                        <ChevronLeft
                            size={ 16 }
                            aria-hidden="true"
                            className="fill-none"
                        />
                        { __( 'Back', 'dokan-lite' ) }
                    </Button>
                ) : (
                    <span />
                ) }

                <span className="inline-flex items-center gap-3">
                    { next && skippable && (
                        <Button
                            variant="ghost"
                            className="border border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                            onClick={ advance }
                        >
                            { __( 'Skip', 'dokan-lite' ) }
                        </Button>
                    ) }
                    <Button
                        onClick={ handleNext }
                        disabled={ busy || advancing }
                        className="px-5"
                    >
                        { nextLabel ?? __( 'Next', 'dokan-lite' ) }
                    </Button>
                </span>
            </div>
        </>
    );
}
