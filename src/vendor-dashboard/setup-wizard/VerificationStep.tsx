import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { Settings, Toaster, type SettingsElement } from '@wedevs/plugin-ui';
import Facebook from '@src/admin/dashboard/icons/socials/Facebook';
import Instagram from '@src/admin/dashboard/icons/socials/Instagram';
import LinkedIn from '@src/admin/dashboard/icons/socials/LinkedIn';
import Twitter from '@src/admin/dashboard/icons/socials/Twitter';
import { qualifyDependencyKeys } from '@src/dashboard/settings/shared/server-errors';
import VerificationMethodsField from './VerificationMethodsField';
import WizardFooter from './WizardFooter';
import type { WizardPayload } from './types';

addFilter(
    'dokan_vendor_settings_verification_methods_field',
    'dokan-lite/setup-wizard-verification-methods',
    ( _default: unknown, element: SettingsElement ) => (
        <VerificationMethodsField element={ element } />
    )
);

addFilter(
    'dokan_vendor_settings_verification_social_note_field',
    'dokan-lite/setup-wizard-verification-social-note',
    ( _default: unknown, element: SettingsElement ) => (
        <div className="flex w-full flex-col gap-1.5">
            <span className="flex items-center gap-1.5">
                <Facebook className="h-4 w-4" />
                <LinkedIn className="h-4 w-4" />
                <Twitter className="h-4 w-4" />
                <Instagram className="h-4 w-4" />
            </span>
            <span className="text-xs text-gray-400">
                { ( element.note as string ) ||
                    __(
                        'You can complete your social verification later',
                        'dokan-lite'
                    ) }
            </span>
        </div>
    )
);

// Pro ships the schema; each row talks to the verification endpoint directly, so nothing saves through the engine.
export default function VerificationStep( {
    payload,
}: {
    payload: WizardPayload;
} ) {
    const [ schema ] = useState< SettingsElement[] >( () =>
        qualifyDependencyKeys( payload.schema ?? [] )
    );

    if ( ! schema.length ) {
        return null;
    }

    return (
        <div className="dokan-setup-wizard-step dokan-layout">
            <Settings
                schema={ schema }
                applyFilters={ applyFilters }
                hookPrefix="dokan_vendor"
                renderSaveButton={ () => null }
            />
            <WizardFooter
                onNext={ () => Promise.resolve( true ) }
                skippable={ false !== payload.skippable }
            />
            <Toaster />
        </div>
    );
}
