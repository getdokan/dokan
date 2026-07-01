import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { parseBoolean } from '@utils/helpers';
import { hasCredentials, HAS_REAL_CONNECTED_ACCOUNTS } from './helpers';

declare const process: { env: Record<string, string | undefined> };

/**
 * Fail-loud pre-flight for the Stripe Express suite (SE-PRE-01 / SE-PRE-02).
 *
 * Almost every money / checkout / refund / 3DS / subscription Express test self-skips when
 * the Stripe Express test secrets are absent (`test.skip(!hasCredentials)`). On a developer's
 * local machine — and on fork PRs, where GitHub withholds repo secrets — that is correct. But
 * on an internal CI run where the secrets ARE expected, a silent skip means a fully GREEN run
 * with near-zero real coverage: a false safety signal hiding exactly the regressions the suite
 * exists to catch. This spec turns that silent skip into a LOUD failure, but ONLY when the keys
 * are expected — gated on the `STRIPE_EXPRESS_REQUIRED` env (set to true by the workflow on
 * internal pushes/PRs, false on fork PRs where secrets are unavailable).
 *
 *   - STRIPE_EXPRESS_REQUIRED unset/false (fork PR / local): soft — skip-with-warning, so the
 *     run stays green exactly as the rest of the @pro Stripe Express suite self-skips.
 *   - STRIPE_EXPRESS_REQUIRED=true but keys missing: hard-FAIL (the misconfiguration the team
 *     wants surfaced) — SE-PRE-01.
 *   - Keys present but no real connected accounts: WARN only — those specific transfer/refund
 *     money tests skip, but the keyed checkout tests still run — SE-PRE-02.
 *
 * Express has NO OAuth client id (hosted Account Links, not OAuth), so `hasCredentials`
 * (publishable + secret) is the only gate for the gateway becoming "ready"; there is no
 * Connect-style `isReadyCapable` check here.
 *
 * Tagged @pro so it is selected only in the Pro lane (the lane that actually runs the Stripe
 * Express specs); it is excluded from the Lite lane. No role tag — this is a pure env guard
 * with no page interaction.
 */
test.describe('Stripe Express — pre-flight (fail loud when secrets are required but missing)', () => {
    const required = parseBoolean(process.env.STRIPE_EXPRESS_REQUIRED);

    test('SE-PRE-01/02: Stripe Express test secrets are present when required', { tag: ['@pro'] }, async () => {
        if (!required) {
            test.skip(
                !hasCredentials,
                'Stripe Express keys absent and not required here (fork PR / local) — money/checkout tests will skip. Set TEST_PUBLISH_KEY_STRIPE_EXPRESS + TEST_SECRET_KEY_STRIPE_EXPRESS to run them.',
            );
            log.success('Stripe Express keys present — money/checkout tests will run.');
            if (!HAS_REAL_CONNECTED_ACCOUNTS) {
                log.warn(
                    'Keys present but no real STRIPE_EXPRESS_VENDOR1_ACCT / STRIPE_EXPRESS_VENDOR2_ACCT connected accounts — transfer / split / refund-reversal money tests will skip (documented gap).',
                );
            }
            return;
        }

        // STRIPE_EXPRESS_REQUIRED=true → the workflow expects the secrets. Their absence is a
        // real misconfiguration that must fail the run, not skip every money test to green.
        expect(
            hasCredentials,
            'STRIPE_EXPRESS_REQUIRED=true but TEST_PUBLISH_KEY_STRIPE_EXPRESS / TEST_SECRET_KEY_STRIPE_EXPRESS are missing — EVERY Stripe Express money/checkout/refund test would silently skip to green. Inject the secrets in the workflow env.',
        ).toBe(true);

        // SE-PRE-02: keys present but no real connected accounts → warn only (those money-movement
        // tests document-skip; the keyed checkout/charge tests still run).
        if (!HAS_REAL_CONNECTED_ACCOUNTS) {
            log.warn(
                'Keys present but no real STRIPE_EXPRESS_VENDOR1_ACCT / STRIPE_EXPRESS_VENDOR2_ACCT connected accounts — transfer / split / refund-reversal money tests will skip (documented gap).',
            );
        }
        log.success('Stripe Express pre-flight passed: required API keys present.');
    });
});
