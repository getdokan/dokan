import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { parseBoolean } from '@utils/helpers';
import { hasCredentials, isReadyCapable } from './helpers';
import { HAS_REAL_CONNECTED_ACCOUNTS } from './stripeConnectPage';

declare const process: { env: Record<string, string | undefined> };

/**
 * Fail-loud pre-flight for the Stripe Connect suite.
 *
 * Almost every money / checkout / refund / 3DS / subscription test self-skips when the
 * Stripe test secrets are absent (`test.skip(!hasCredentials)`). On a developer's local
 * machine — and on fork PRs, where GitHub withholds repo secrets — that is correct. But on
 * an internal CI run where the secrets ARE expected, a silent skip means a fully GREEN run
 * with near-zero real coverage: a false safety signal hiding exactly the regressions the
 * suite exists to catch. This spec turns that silent skip into a LOUD failure, but ONLY
 * when the keys are expected — gated on the `STRIPE_CONNECT_REQUIRED` env (set to true by
 * the workflow on internal pushes/PRs, false on fork PRs where secrets are unavailable).
 *
 *   - STRIPE_CONNECT_REQUIRED unset/false (fork PR / local): soft — skip-with-warning, so
 *     the run stays green exactly as the rest of the @pro Stripe suite self-skips.
 *   - STRIPE_CONNECT_REQUIRED=true but keys missing: hard-FAIL (the misconfiguration the
 *     team wants surfaced).
 *   - Keys present but no real connected accounts / client id: WARN only — those specific
 *     tests skip, but the keyed tests still run.
 *
 * Tagged @pro so it is selected only in the Pro lane (the lane that actually runs the
 * Stripe specs); it is excluded from the Lite lane.
 */
test.describe('Stripe Connect — pre-flight (fail loud when secrets are required but missing)', () => {
    const required = parseBoolean(process.env.STRIPE_CONNECT_REQUIRED);

    test('Stripe Connect test secrets are present when required', { tag: ['@pro'] }, async () => {
        if (!required) {
            test.skip(
                !hasCredentials,
                'Stripe Connect keys absent and not required here (fork PR / local) — money/checkout tests will skip. Set TEST_PUBLISH_KEY_STRIPE_CONNECT + TEST_SECRET_KEY_STRIPE_CONNECT to run them.',
            );
            log.success('Stripe Connect keys present — money/checkout tests will run.');
            return;
        }

        // STRIPE_CONNECT_REQUIRED=true → the workflow expects the secrets. Their absence is a
        // real misconfiguration that must fail the run, not skip every money test to green.
        expect(
            hasCredentials,
            'STRIPE_CONNECT_REQUIRED=true but TEST_PUBLISH_KEY_STRIPE_CONNECT / TEST_SECRET_KEY_STRIPE_CONNECT are missing — EVERY Stripe money/checkout/refund test would silently skip to green. Inject the secrets in the workflow env.',
        ).toBe(true);

        if (!isReadyCapable) {
            log.warn(
                'Keys present but no TEST_CLIENT_ID_STRIPE_CONNECT — vendor-connect / onboarding / withdraw-method tests will skip (documented gap; add the client id for the same Connect account to close it).',
            );
        }
        if (!HAS_REAL_CONNECTED_ACCOUNTS) {
            log.warn(
                'Keys present but no real STRIPE_VENDOR1_ACCT / STRIPE_VENDOR2_ACCT connected accounts — transfer / split / refund-reversal money tests will skip (documented gap).',
            );
        }
        log.success('Stripe Connect pre-flight passed: required API keys present.');
    });
});
