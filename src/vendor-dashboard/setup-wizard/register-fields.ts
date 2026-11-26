import { addFilter } from '@wordpress/hooks';
import { createElement } from '@wordpress/element';
import { type SettingsElement } from '@wedevs/plugin-ui';
import { registerVendorSettingsFields } from '@src/dashboard/settings/store/register-fields';
import PaymentMethodsField from './PaymentMethodsField';
import VerificationMethodsField from './VerificationMethodsField';
import VerificationSocialNote from './VerificationSocialNote';

// One registry for every wizard step: a step is just a schema, so the field
// variants it may reference have to exist before any of them renders.
export default function registerWizardFields(): void {
    // The Store settings variants come along, so schema-injected Pro fields resolve without wizard-specific registration.
    registerVendorSettingsFields();

    const variant = (
        name: string,
        Component: ( props: { element: SettingsElement } ) => JSX.Element
    ) =>
        addFilter(
            `dokan_vendor_settings_${ name }_field`,
            `dokan-lite/setup-wizard-${ name }`,
            ( _default: unknown, element: SettingsElement ) =>
                createElement( Component, { element } )
        );

    variant( 'payment_methods', PaymentMethodsField );
    variant( 'verification_methods', VerificationMethodsField );
    variant( 'verification_social_note', VerificationSocialNote );
}
