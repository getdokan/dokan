import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { setDokanModule, setVendorSubscriptionFeature } from './helpers';

/**
 * Stripe Connect — folder teardown.
 *
 * The subscription cases switch the Vendor Subscription module on to do their work. The lead wants
 * it left OFF once the Stripe Connect run finishes, so this file exists purely to put it back.
 *
 * It is named to sort last inside the folder, which is what makes it run after the specs it cleans
 * up after. Running a single spec by name skips this, so a subset run can legitimately leave the
 * module on.
 *
 * `enable_pricing` is restored too. It gates the site-wide product-publish hooks, so leaving it on
 * would stop unrelated vendors publishing in later specs sharing this database, and that failure
 * looks nothing like its cause.
 */
test.describe('Stripe Connect — teardown @pro', () => {
    test('the vendor subscription module is left switched off', { tag: ['@pro', '@admin'] }, async () => {
        await setVendorSubscriptionFeature(false);

        // The route returns what the option row holds after the write, not what it was asked to do,
        // so this is a read-back rather than an echo.
        const stillActive = await setDokanModule('product_subscription', false);
        expect(stillActive, 'the product_subscription module should be inactive when the run ends').toBe(false);

        log.success('Vendor subscription module deactivated and enable_pricing restored to off');
    });
});
