import { __ } from '@wordpress/i18n';
import { Button } from '@wedevs/plugin-ui';
import type { WizardPayload } from './types';

// The welcome card — logo + site name, greeting, admin-configurable message,
// Skip / Start Journey. Mirrors the Figma intro frame: 24px column rhythm
// (brand → title block → actions), 8px title→description, 10px between buttons.
export default function IntroCard( { payload }: { payload: WizardPayload } ) {
    return (
        // Utilities can't sit on the .dokan-layout element itself — the token scope matches descendants only.
        <div className="dokan-setup-wizard-step dokan-layout">
            <div className="flex flex-col items-center px-2 py-8 text-center">
                <div className="flex items-center justify-center gap-2.5">
                    { payload.logoUrl && (
                        <img
                            src={ payload.logoUrl }
                            alt=""
                            className="h-8 w-8 rounded-md object-contain"
                        />
                    ) }
                    { payload.siteName && (
                        <span className="text-2xl font-bold text-gray-900">
                            { payload.siteName }
                        </span>
                    ) }
                </div>

                <h1 className="mt-6 mb-0 text-2xl font-bold leading-tight text-gray-900">
                    { __( 'Welcome to the Marketplace!', 'dokan-lite' ) }
                </h1>

                { payload.message && (
                    <div
                        // A div, not a p: the stored option is <p>-wrapped rich text.
                        className="mt-2 max-w-[480px] text-sm leading-[22px] text-gray-500 [&>p]:m-0"
                        // The message is an admin-configured option that may carry markup (legacy behaviour).
                        dangerouslySetInnerHTML={ { __html: payload.message } }
                    />
                ) }

                <div className="mt-6 flex items-center justify-center gap-2.5">
                    <Button
                        variant="outline"
                        className="h-10 border-gray-200 px-5 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        render={
                            <a href={ payload.skipUrl }>
                                { __( 'Skip', 'dokan-lite' ) }
                            </a>
                        }
                    />
                    <Button
                        className="h-10 px-5"
                        render={
                            <a href={ payload.nextStepUrl }>
                                { __( 'Start Journey', 'dokan-lite' ) }
                            </a>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
