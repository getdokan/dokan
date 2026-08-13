import { __ } from '@wordpress/i18n';
import { registerVendorSettingsFields } from '@src/dashboard/settings/store/register-fields';
import SchemaStep from './SchemaStep';
import type { WizardPayload } from './types';

// Shares the Store settings variant registry, so schema-injected Pro fields resolve without wizard-specific registration.
registerVendorSettingsFields();

export default function StoreStep( { payload }: { payload: WizardPayload } ) {
    return (
        <SchemaStep
            payload={ payload }
            failureMessage={ __(
                'Failed to save your store details.',
                'dokan-lite'
            ) }
        />
    );
}
