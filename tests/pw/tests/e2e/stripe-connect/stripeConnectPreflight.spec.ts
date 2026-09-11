import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { parseBoolean } from '@utils/helpers';
import { hasCredentials, HAS_REAL_CONNECTED_ACCOUNTS } from './helpers';
import { STRIPE_CONNECT_KEYS } from './stripeConnectPage';

declare const process: { env: Record<string, string | undefined> };

/**
 * Fail-loud pre-flight for the Stripe Connect suite.
 *
 * Every money / checkout / refund / 3DS test in this folder self-skips when the Stripe Connect
 * test secrets are absent. On a developer's machine — and on fork PRs, where GitHub withholds repo
 * secrets — that is correct. On an internal CI run where the secrets ARE expected, a silent skip
 * means a fully GREEN run with near-zero real coverage: a false safety signal hiding exactly the
 * regressions the suite exists to catch. This spec turns that silent skip into a LOUD failure, but
 * only when the keys are expected, gated on STRIPE_CONNECT_REQUIRED.
 *
 *   - STRIPE_CONNECT_REQUIRED unset/false (fork PR / local): soft — skip with a warning, so the run
 *     stays green exactly as the rest of the @pro suite self-skips.
 *   - STRIPE_CONNECT_REQUIRED=true but keys missing: hard FAIL, which is the misconfiguration the
 *     team wants surfaced.
 *   - Keys present but no real connected accounts: WARN only — the transfer/split/refund-reversal
 *     money cases skip, the keyed checkout cases still run.
 *
 * Unlike Express, Connect ALSO needs an OAuth client id: `Helper::is_ready()` returns false without
 * one and the gateway never reaches the checkout, so a key pair on its own would produce a suite
 * that runs and fails for a configuration reason rather than a product reason.
 *
 * Tagged @pro so it is selected only in the Pro lane. No role tag — this is a pure environment
 * guard with no page interaction.
 */
test.describe('Stripe Connect — pre-flight (fail loud when secrets are required but missing)', () => {
    const required = parseBoolean(process.env.STRIPE_CONNECT_REQUIRED);

    test('SC-PRE-01/02: Stripe Connect test secrets are present when required', { tag: ['@pro'] }, async () => {
        const missing = [!STRIPE_CONNECT_KEYS.publishable && 'TEST_PUBLISH_KEY_STRIPE_CONNECT', !STRIPE_CONNECT_KEYS.secret && 'TEST_SECRET_KEY_STRIPE_CONNECT', !STRIPE_CONNECT_KEYS.clientId && 'TEST_CLIENT_ID_STRIPE_CONNECT'].filter(Boolean);

        if (!required) {
            test.skip(!hasCredentials, `Stripe Connect keys absent and not required here (fork PR / local) — money/checkout tests will skip. Missing: ${missing.join(', ')}.`);
            log.success('Stripe Connect keys present — money/checkout tests will run.');
            if (!HAS_REAL_CONNECTED_ACCOUNTS) {
                log.warn('Keys present but no real STRIPE_VENDOR1_ACCT / STRIPE_VENDOR2_ACCT connected accounts — transfer / split / refund-reversal money tests will skip (documented gap).');
            }
            return;
        }

        // STRIPE_CONNECT_REQUIRED=true → the workflow expects the secrets. Their absence is a real
        // misconfiguration that must fail the run, not skip every money test to green.
        expect(hasCredentials, `STRIPE_CONNECT_REQUIRED=true but ${missing.join(', ')} missing — EVERY Stripe Connect money/checkout/refund test would silently skip to green. Inject the secrets in the workflow env.`).toBe(true);

        if (!HAS_REAL_CONNECTED_ACCOUNTS) {
            log.warn('Keys present but no real STRIPE_VENDOR1_ACCT / STRIPE_VENDOR2_ACCT connected accounts — transfer / split / refund-reversal money tests will skip (documented gap).');
        }
        log.success('Stripe Connect pre-flight passed: required API keys and client id present.');
    });
});
