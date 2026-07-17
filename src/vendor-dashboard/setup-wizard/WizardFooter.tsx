import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wedevs/plugin-ui';
import { ChevronLeft } from 'lucide-react';
import CreatingOverlay from './CreatingOverlay';

type WizardFooterProps = {
    backUrl?: string;
    skipUrl?: string;
    nextLabel?: string;
    // Resolves true to navigate to nextUrl; false/throw keeps the vendor on the step.
    onNext: () => Promise< boolean >;
    nextUrl: string;
    busy?: boolean;
    creatingOverlay?: boolean;
};

// The shared step footer: Back pinned left, Skip + Next on the right — sticky
// so long steps keep the actions in the viewport (design review note).
export default function WizardFooter( {
    backUrl,
    skipUrl,
    nextLabel,
    onNext,
    nextUrl,
    busy = false,
    creatingOverlay = false,
}: WizardFooterProps ) {
    const [ navigating, setNavigating ] = useState( false );

    const handleNext = async () => {
        let proceed = false;

        try {
            proceed = await onNext();
        } catch ( error ) {
            proceed = false;
        }

        if ( proceed ) {
            setNavigating( true );
            window.location.assign( nextUrl );
        }
    };

    return (
        <>
            <div className="dokan-vsw-step-footer">
                { backUrl ? (
                    <Button
                        variant="ghost"
                        className="gap-1"
                        render={
                            // Back is a plain navigation, styled as the quiet action (theme link color suppressed).
                            <a
                                href={ backUrl }
                                className="text-gray-500 no-underline hover:text-gray-800"
                            >
                                <ChevronLeft
                                    size={ 16 }
                                    aria-hidden="true"
                                    className="fill-none"
                                />
                                { __( 'Back', 'dokan-lite' ) }
                            </a>
                        }
                    />
                ) : (
                    <span />
                ) }

                <span className="inline-flex items-center gap-3">
                    { skipUrl && (
                        <Button
                            variant="ghost"
                            render={
                                // Skip is a plain navigation, styled as the quiet action (theme link color suppressed).
                                <a
                                    href={ skipUrl }
                                    className="text-gray-500 no-underline hover:text-gray-800"
                                >
                                    { __( 'Skip', 'dokan-lite' ) }
                                </a>
                            }
                        />
                    ) }
                    <Button
                        onClick={ handleNext }
                        disabled={ busy || navigating }
                        className="px-5"
                    >
                        { nextLabel ?? __( 'Next', 'dokan-lite' ) }
                    </Button>
                </span>
            </div>

            { navigating && creatingOverlay && <CreatingOverlay /> }
        </>
    );
}
