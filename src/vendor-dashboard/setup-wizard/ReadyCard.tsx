import { __ } from '@wordpress/i18n';
import { Button } from '@wedevs/plugin-ui';
import { CircleCheckBig, Eye, LayoutGrid } from 'lucide-react';
import type { WizardPayload } from './types';

// The completion card — View Site and Explore Dashboard both leave the wizard, so they stay real links.
export default function ReadyCard( { payload }: { payload: WizardPayload } ) {
    return (
        // Utilities can't sit on the .dokan-layout element itself — the token scope matches descendants only.
        <div className="dokan-setup-wizard-step dokan-layout">
            <div className="flex flex-col items-center px-2 py-8 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600/10 text-green-600">
                    <CircleCheckBig
                        size={ 40 }
                        strokeWidth={ 2 }
                        aria-hidden="true"
                    />
                </span>

                <h1 className="mt-6 mb-0 text-2xl font-bold leading-snug text-gray-900">
                    { __( 'Congratulations!', 'dokan-lite' ) }
                </h1>
                <p className="m-0 text-2xl font-bold leading-snug text-gray-900">
                    { __( 'Your store is completely ready.', 'dokan-lite' ) }
                </p>

                <div className="mt-6 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        className="h-11 gap-2 border-gray-200 px-5 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        render={
                            <a href={ payload.viewSiteUrl }>
                                <Eye size={ 16 } aria-hidden="true" />
                                { __( 'View Site', 'dokan-lite' ) }
                            </a>
                        }
                    />
                    <Button
                        className="h-11 gap-2 px-5"
                        render={
                            <a href={ payload.dashboardUrl }>
                                <LayoutGrid size={ 16 } aria-hidden="true" />
                                { __( 'Explore Dashboard', 'dokan-lite' ) }
                            </a>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
