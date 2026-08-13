import type { SettingsElement } from '@wedevs/plugin-ui';

export type GatewayFieldConfig = {
    key: string;
    label: string;
    placeholder?: string;
    input?: 'text' | 'select' | 'textarea';
    options?: Array< { value: string; label: string } >;
    required?: boolean;
};

export type GatewayConfig = {
    id: string;
    title: string;
    logo?: string;
    fields?: GatewayFieldConfig[];
    // Rendered under the fields: the bank cheque helper image, attestation checkbox, advisory note.
    image?: string;
    declaration?: string;
    note?: string;
    // Connect-style gateways (Stripe Express, Paystack) link out instead of collecting fields.
    connect?: { url: string; label: string; description?: string };
};

export type VerificationMethod = {
    id: number;
    title: string;
    required: boolean;
    status: '' | 'pending' | 'approved' | 'rejected' | 'cancelled';
    // The vendor's latest request for this method — lets a pending one be cancelled.
    requestId?: number;
    help?: string;
    // The already-submitted file, so Edit opens on it instead of an empty picker.
    document?: WizardAttachment | null;
};

export type WizardPayload = {
    step: 'intro' | 'store' | 'payment' | 'verification' | 'ready';
    nextStepUrl?: string;
    backUrl?: string;
    skipUrl?: string;
    // Steps that lead into Ready show the "Creating your Store" transition.
    creatingOverlay?: boolean;

    // intro
    logoUrl?: string;
    siteName?: string;
    message?: string;

    // ready
    viewSiteUrl?: string;
    dashboardUrl?: string;

    // schema-driven steps (store / payment / verification)
    schema?: SettingsElement[];
    endpoint?: string;
};

// The wp.media attachment slice the verification uploader keeps.
export type WizardAttachment = {
    id: number;
    url: string;
    filename: string;
};

export type WizardStepKey = WizardPayload[ 'step' ];

export type WizardStepOrder = {
    key: WizardStepKey;
    // The `?step=` value this step lives at, so the SPA can keep the URL honest.
    stepArg: string;
    // The intro is un-numbered, matching the legacy rail.
    numbered: boolean;
};

export type WizardShell = {
    order: WizardStepOrder[];
    initialStep: WizardStepKey;
    baseUrl: string;
    nonce: string;
};

// PHP bootstraps every step in one page load; the SPA never fetches a step.
export type WizardBootstrap = {
    steps: Partial< Record< WizardStepKey, WizardPayload > >;
    shell?: WizardShell;
};

export const getWizardBootstrap = (): WizardBootstrap | undefined =>
    ( window as unknown as Record< string, unknown > ).dokanSetupWizard as
        | WizardBootstrap
        | undefined;
