import { __ } from '@wordpress/i18n';
import { type SettingsElement } from '@wedevs/plugin-ui';
import Facebook from '@src/admin/dashboard/icons/socials/Facebook';
import Instagram from '@src/admin/dashboard/icons/socials/Instagram';
import LinkedIn from '@src/admin/dashboard/icons/socials/LinkedIn';
import Twitter from '@src/admin/dashboard/icons/socials/Twitter';

// `verification_social_note` variant — the channels a vendor can verify later.
const VerificationSocialNote = ( {
    element,
}: {
    element: SettingsElement;
} ) => (
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
);

export default VerificationSocialNote;
