import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { type SettingsElement } from '@wedevs/plugin-ui';
import PaymentMethodsField from './PaymentMethodsField';
import SchemaStep from './SchemaStep';
import type { WizardPayload } from './types';

addFilter(
    'dokan_vendor_settings_payment_methods_field',
    'dokan-lite/setup-wizard-payment-methods',
    ( _default: unknown, element: SettingsElement ) => (
        <PaymentMethodsField element={ element } />
    )
);

// The payment step — gateway accordion driven by the wizard payment schema;
// saves through the onboarding REST endpoint (the writer fires the
// store-profile-saved seam, so the vendor cache invalidates — unlike the
// legacy payment save).
export default function PaymentStep( { payload }: { payload: WizardPayload } ) {
    return (
        <SchemaStep
            payload={ payload }
            failureMessage={ __(
                'Failed to save your payment details.',
                'dokan-lite'
            ) }
        />
    );
}
