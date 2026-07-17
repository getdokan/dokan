import { __ } from '@wordpress/i18n';
import { registerVendorSettingsFields } from '@src/dashboard/settings/store/register-fields';
import SchemaStep from './SchemaStep';
import type { WizardPayload } from './types';

// The wizard shares the Store settings variant registry under the same
// hookPrefix — schema-injected Pro fields (e.g. the vendor_multiselect
// category picker) resolve without wizard-specific registration.
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
