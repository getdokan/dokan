import { test, expect } from '@utils/test';
import type { Page, Response } from '@utils/test';
import { log } from '@utils/logger';
import { PAYPAL_IDS } from './paypalMarketplacePage';
import { getUccState, setUccGate, setVendorUcc } from './helpers';
import type { UccGateResult, VendorUccResult } from './helpers';

/**
 * The Advanced Card (UCC) capture flow, shared by the three money spec files.
 *
 * WHY THIS IS ITS OWN MODULE rather than living in `paypalMarketplacePage.ts` or `helpers.ts`.
 * `payWithCardOnClassicCheckout()` is the one helper in this suite that genuinely spans both halves:
 * it drives cross-origin hosted-field iframes and reads responses off the wire (browser), it opens
 * and reads the UCC gate through the mu-plugin route (API), and it raises `test.skip()` four times
 * and asserts seven times (so it needs `test` and `expect`, neither of which the page-object file
 * imports today). Its dependencies — `UCC_DOM`, `CARD`, `CARD_BUDGET_MS`, `hostedField`,
 * `cardOutcome`, `withinMs`, `bodyOf`, `cardRouteBlocker`, `openCardGates`, `restoreCardGates` — are
 * used by nothing outside the card path, so splitting them across the other two files would give one
 * flow two homes and make every one of them an import across three modules.
 */

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };

/** Classic checkout label — the control clicked to select the gateway, never the hidden radio. */
const CLASSIC_LABEL = `label[for="payment_method_${PAYPAL_IDS.gateway}"]`;

/* ------------------------------------------------------------------ */
/* Capture route                                                       */
/* ------------------------------------------------------------------ */

/**
 * HOW the buyer approves, chosen EXPLICITLY and never inferred.
 *
 *   unset | `wallet`  the PayPal-hosted approval window. The behaviour the money files were written
 *                     against, and the only route that exercises the redirect/return mechanics.
 *   `card`            the Advanced Card / unbranded (UCC) form on OUR OWN checkout page. The buyer
 *                     types a card into PayPal's hosted fields; PayPal never shows a login page.
 *
 * There is deliberately NO silent fallback in either direction. A wallet case that quietly reported
 * green off a card capture — or the reverse — would be a coverage lie, so the route is announced once
 * per file (`announceCaptureRoute()`) and every skip below names which route it is talking about.
 *
 * WHY the switch exists: every wallet case drives a PayPal-hosted buyer LOGIN. On 2026-08-03 roughly
 * fifty of them in one run got the sandbox buyer locked out ("It looks like you have tried too many
 * times"), each attempt costing up to 4.5 minutes, which exhausted the 1h globalTimeout and left 163
 * tests unrun. No PayPal API approves a wallet order on the buyer's behalf, so the wallet route cannot
 * avoid that login. The card route can: the card is typed on our page and PayPal never challenges for
 * a password.
 */
export const CAPTURE_ROUTE_RAW = (process.env.PAYPAL_MARKETPLACE_CAPTURE_ROUTE || '').trim().toLowerCase();
export const CAPTURE_ROUTE: 'wallet' | 'card' = CAPTURE_ROUTE_RAW === 'card' ? 'card' : 'wallet';
export const USE_CARD_CAPTURE = CAPTURE_ROUTE === 'card';

/**
 * PayPal's PUBLISHED sandbox card for "Test Case 1 — successful frictionless authentication"
 * (developer.paypal.com/docs/checkout/advanced/customize/3d-secure/test/). A fixed documented number,
 * not one generated per account.
 *
 * The choice is forced by product code: `hf.submit()` is called with `contingencies: ['3D_SECURE']`
 * hardcoded (assets/src/js/paypal-checkout.js:409-414), which PayPal documents as the deprecated
 * synonym of SCA_ALWAYS — authentication is requested on EVERY transaction. This is the only
 * documented card that satisfies that without drawing a step-up challenge, which is what an
 * unattended run needs. It is the documented CANDIDATE, not a built-in default: the number is supplied
 * through the environment (see below) so a run can use a freshly harvested one without editing this
 * file, and an unset variable is a declared skip rather than a guess. A card that DOES draw a challenge
 * is detected and reported, never waited out.
 */
export const CARD = {
    /**
     * `PAYPAL_UCC_TEST_CARD` is the name the catalogue documents and the name
     * `paypalMarketplaceUcc.spec.ts` reads, so ONE harvested PAN drives both card surfaces. The older
     * `PAYPAL_MARKETPLACE_TEST_CARD_NUMBER` is still honoured so an already-scripted run keeps working.
     *
     * NO default, deliberately. A published sandbox PAN is not a secret, but no number can be confirmed
     * FROM SOURCE to clear this sandbox account's 3DS without a step-up — baking one in would let a
     * card-route run spend real sandbox captures on an unvetted card and report the result as if the card
     * had been vetted. Unset means a declared skip naming the published candidate, never a silent guess.
     */
    number: (process.env.PAYPAL_UCC_TEST_CARD || process.env.PAYPAL_MARKETPLACE_TEST_CARD_NUMBER || '').replace(/[\s-]/g, ''),
    /** Any future date. braintree's expirationDate field accepts `mm/yy` and `mm/yyyy` alike. */
    expiry: process.env.PAYPAL_UCC_TEST_CARD_EXPIRY || process.env.PAYPAL_MARKETPLACE_TEST_CARD_EXPIRY || `12/${new Date().getFullYear() + 3}`,
    cvv: process.env.PAYPAL_UCC_TEST_CARD_CVV || process.env.PAYPAL_MARKETPLACE_TEST_CARD_CVV || '123',
    /**
     * Also PayPal's DECLINE lever: it reads `CCREJECT-*` triggers out of the cardholder-name field.
     * It must stay an ordinary name here — a stray `CCREJECT-` value would silently turn every money
     * case in this file into a decline test that then fails for the wrong reason.
     */
    holder: process.env.PAYPAL_UCC_TEST_CARD_HOLDER || process.env.PAYPAL_MARKETPLACE_TEST_CARD_HOLDER || 'Dokan QA Buyer',
} as const;

/** How long the card submit gets: tokenisation, PayPal's 3DS decision, the capture and the redirect. */
export const CARD_BUDGET_MS = 240_000;

/** Say once, in the run report, HOW the money moved. A reader must never have to guess. */
export function announceCaptureRoute(area: string): void {
    if (CAPTURE_ROUTE_RAW && CAPTURE_ROUTE_RAW !== 'card' && CAPTURE_ROUTE_RAW !== 'wallet') {
        log.warn(
            `${area}: PAYPAL_MARKETPLACE_CAPTURE_ROUTE="${CAPTURE_ROUTE_RAW}" is not a route name — the only values are "wallet" and "card". Running on WALLET, which is the default.`,
        );
    }
    if (USE_CARD_CAPTURE) {
        log.warn(
            `${area}: CAPTURE ROUTE = CARD (Advanced Card / UCC). Every captured order below is approved by typing card ${CARD.number ? `****${CARD.number.slice(-4)}` : '(PAYPAL_UCC_TEST_CARD is UNSET — every money case below will skip)'} into PayPal's hosted fields on our own checkout page — NO PayPal-hosted buyer login is driven. Post-capture behaviour is identical to the wallet route (both reach handle_capture_payment_validation()), but nothing in this run says anything about the wallet redirect, cancel or return mechanics.`,
        );
    } else {
        log.info(
            `${area}: CAPTURE ROUTE = WALLET (PayPal-hosted approval, one real buyer login per captured order). Set PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card to capture through the Advanced Card form instead — same post-capture code path, no buyer login.`,
        );
    }
}

/* ------------------------------------------------------------------ */
/* The UCC gate this flow needs open                                   */
/* ------------------------------------------------------------------ */

/**
 * The UCC gate rows this file opened, so `afterAll` can put back EXACTLY what it found.
 *
 * `previous.*` is `null` when the key was ABSENT, and feeding that null back deletes the key again —
 * writing `''` instead would leave `Helper::get_button_type()` returning an empty string rather than
 * falling through to its own default, which is a different site.
 */
let uccGatePrevious: UccGateResult['previous'] | null = null;
let vendorUccPrevious: VendorUccResult['previous'] | null = null;

/**
 * Open the two LOCAL halves of the gate: the gateway settings (`button_type` smart + `ucc_mode` yes)
 * and the per-seller meta.
 *
 * Every seller that can appear in a cart is passed: `CartManager::is_ucc_enabled_for_all_seller_in_cart()`
 * (Cart/CartManager.php:48-62) is all-or-nothing, so one un-flagged seller removes the card form for the
 * whole cart and the case would fall back to a wallet-only page with no signal.
 */
export async function openCardGates(vendorIds: Array<string | number>): Promise<void> {
    const gate = await setUccGate({ button_type: 'smart', ucc_mode: 'yes' }, vendorIds);
    uccGatePrevious = gate.previous;
    const seeded = await setVendorUcc(vendorIds, true);
    vendorUccPrevious = seeded.previous;
}

/**
 * Put the gate back exactly as found. Never skipped on failure: `ucc_mode` left at `yes` hands every
 * later checkout spec on this worker a card form none of them expect (an extra payment template, an
 * extra button, `components=hosted-fields` on the SDK URL and a live `v1/identity/generate-token` call
 * per checkout render), and PP-SET-19 re-asserts the `smart` + `ucc_mode: no` baseline, so the leak
 * would fail loudly in a file that did nothing wrong.
 */
export async function restoreCardGates(): Promise<void> {
    if (vendorUccPrevious) {
        for (const [vendorId, raw] of Object.entries(vendorUccPrevious)) {
            // PHP truthiness, not JavaScript's: the product reads this meta with a plain truthy test, and
            // both '' (row absent) and '0' are FALSE there while `Boolean('0')` is true. Restoring a '0'
            // as enabled would hand the next spec on this worker an open gate 5 it never asked for.
            const wasEnabled = raw !== '' && raw !== '0';
            await setVendorUcc(vendorId, wasEnabled).catch(error => log.warn(`could not restore the UCC meta of vendor ${vendorId} to ${JSON.stringify(raw)}: ${String(error)}`));
        }
        vendorUccPrevious = null;
    }
    if (uccGatePrevious) {
        await setUccGate(uccGatePrevious).catch(error => log.warn(`could not restore ucc_mode/button_type to what this file found: ${String(error)}`));
        uccGatePrevious = null;
    }
}

/**
 * The card form's own preconditions, resolved by the PRODUCT rather than recomputed here.
 *
 * Returns the reason the card route cannot run, or `null`. Each branch names a different cause,
 * because "there is no card form" has five of them and they are not interchangeable.
 */
export async function cardRouteBlocker(vendorIds: Array<string | number>): Promise<string | null> {
    const state = await getUccState(vendorIds);

    if (!state.module_active) {
        return `the paypal_marketplace module is not active (${state.skipped}), so no UCC gate exists and the card route has nothing to drive. Activate the module and re-run, or drop PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card to use the wallet route.`;
    }

    if (!state.is_ucc_enabled) {
        return (
            `Helper::is_ucc_enabled() (Helper.php:178-190) says the Advanced Card gate is SHUT, so templates/3DS-payment-option.php is never rendered and there is no card form to type into. ` +
            `The product resolves: button_type="${String(state.button_type_resolved)}" (must be "smart"), ucc_mode="${String(state.ucc_mode_raw)}" (must be "yes"), base country "${String(state.base_country)}" (must be one of ${JSON.stringify(state.ucc_supported_countries)}), store currency "${state.store_currency}" (must be one of ${JSON.stringify(state.ucc_supported_currencies)}). ` +
            `The first two are opened by this file; the country and the currency are NOT written by any test, because a store that cannot host UCC must report that rather than be silently reconfigured. Re-run without PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card to use the wallet route.`
        );
    }

    const shut = vendorIds.filter(vendorId => !state.vendors[String(vendorId)]?.enabled);
    if (shut.length > 0) {
        return (
            `gate 5 (CartManager::is_ucc_enabled_for_all_seller_in_cart(), Cart/CartManager.php:48-62) is shut for vendor(s) ${shut.join(', ')}: the meta "${String(state.ucc_meta_key)}" is empty. ` +
            `That gate is all-or-nothing across the cart, so the card form disappears for EVERY seller in it. This file seeds the meta in beforeAll, so an empty value here means the seeding was overwritten mid-run — most often by a re-seed of the vendor's PayPal metas.`
        );
    }

    return null;
}

/* ------------------------------------------------------------------ */
/* The rendered card surface                                           */
/* ------------------------------------------------------------------ */

/**
 * The rendered card surface. Ids come from templates/3DS-payment-option.php and
 * Cart/CartHandler.php:271-278; nothing here is guessed from a screenshot.
 */
export const UCC_DOM = {
    sdk: 'script#dokan_paypal_sdk-js',
    cardContainer: '.card_container',
    number: '#dpm_card_number',
    expiry: '#dpm_card_expiry',
    cvv: '#dpm_cvv',
    holder: '#dpm_name_on_card',
    unbranded: '.unbranded_checkout',
    payButton: '#pay_unbranded_order',
    /** The 3DS step-up target. Empty in the template; the SDK injects an iframe only for a challenge. */
    challenge: '#payments-sdk__contingency-lightbox iframe',
    /** What `submit_error()` prepends to the checkout form (paypal-checkout.js:96-112). */
    error: '.woocommerce-NoticeGroup-checkout .woocommerce-error, form.checkout ul.woocommerce-error, form.checkout .woocommerce-error',
} as const;

/**
 * One hosted-field input, inside its own CROSS-ORIGIN iframe.
 *
 * braintree-web — vendored by paypal/paypal-card-components, which is what the SDK's hosted-fields
 * component is built from — names the iframe `braintree-hosted-field-<field>` and gives the inner
 * input `data-braintree-name="<field>"`. That qualifier is load-bearing rather than decorative: the
 * same frame also carries a HIDDEN autofill decoy input, so a bare `input` locator is ambiguous and
 * can resolve onto the decoy and type the card into nothing.
 */
export const hostedField = (page: Page, container: string, field: 'number' | 'expirationDate' | 'cvv') =>
    page.frameLocator(`${container} iframe[name="braintree-hosted-field-${field}"]`).locator(`input[data-braintree-name="${field}"]`);

/** Resolve `promise` if it settles within `ms`, otherwise `null` — never leaves an unhandled rejection. */
export async function withinMs<T>(promise: Promise<T>, ms: number): Promise<T | null> {
    return Promise.race([promise, new Promise<null>(resolve => setTimeout(() => resolve(null), ms))]);
}

/** Read a response body without ever hiding why it could not be read. */
export async function bodyOf(response: Response | Error | null): Promise<string> {
    if (response === null) {
        return '(no response was observed)';
    }
    if (response instanceof Error) {
        return `(the response was never seen: ${response.message})`;
    }
    return response.text().catch(error => `(the body could not be read back: ${String(error)})`);
}

export type CardOutcome = 'returned' | 'challenge' | 'error' | 'timeout';

/**
 * What happened after the Pay button was clicked, decided by POLLING rather than by racing
 * `waitFor()`s: a losing `waitFor` keeps running and rejects unhandled later, which turns a passing
 * case into a late failure with no useful message.
 */
export async function cardOutcome(page: Page, timeoutMs: number): Promise<CardOutcome> {
    const deadline = Date.now() + timeoutMs;
    do {
        if (/order-received/i.test(page.url())) {
            return 'returned';
        }
        if (await page.locator(UCC_DOM.challenge).first().isVisible().catch(() => false)) {
            return 'challenge';
        }
        if (await page.locator(UCC_DOM.error).first().isVisible().catch(() => false)) {
            return 'error';
        }
        await page.waitForTimeout(500).catch(() => undefined);
    } while (Date.now() < deadline);
    return 'timeout';
}

/* ------------------------------------------------------------------ */
/* The card capture itself                                             */
/* ------------------------------------------------------------------ */

/**
 * Everything the card route's checkout POST can answer with — the UNION of the three local result
 * interfaces the money files declared, every field optional, so each of them can keep annotating its
 * own variable with its own type name and still receive this value.
 */
export interface CardCheckoutResponse {
    result?: string;
    id?: number | string;
    order_id?: number | string;
    paypal_order_id?: string;
    paypal_redirect_url?: string;
    redirect?: string;
    success_redirect?: string;
    messages?: string;
    message?: string;
    __error?: string;
}

/**
 * Pay for the cart with the Advanced Card form, and let the MODULE create the order and capture it.
 *
 * Nothing here substitutes for a product step. Clicking `#pay_unbranded_order` runs
 * `hf.submit()`, whose `createOrder` callback runs `do_submit()` → `set_order()` — byte-for-byte the
 * same `wc-ajax=checkout` POST the wallet route makes, so `WC_Checkout::process_checkout()` and
 * `PayPal::process_payment()` run in full — and PayPal then tokenises the card against the order it
 * returned. On success the module itself POSTs `action=dokan_paypal_capture_payment`
 * (Order/OrderController.php:223-267) and redirects to the order-received page.
 *
 * The `wc-ajax=checkout` response is read off the wire on the way past because it is the only place
 * the WooCommerce order id and the PayPal order id appear together — and it is the SAME payload the
 * wallet route asserts on, so every existing expectation downstream is unchanged.
 */
export async function payWithCardOnClassicCheckout(page: Page, vendorIds: Array<string | number>): Promise<CardCheckoutResponse> {
    const blocked = await cardRouteBlocker(vendorIds);
    if (blocked) {
        test.skip(true, `PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card was requested, but ${blocked}`);
    }

    // ── 1. Did the SERVER put the card surface on the page? Three proofs, three messages, because
    //       "no card form" has three unrelated causes and one combined assertion would hide which.
    const sdk = page.locator(UCC_DOM.sdk);
    await expect(
        sdk,
        `the PayPal SDK script must be enqueued on the classic checkout before any card can be typed. CartHandler::payment_scripts() (Cart/CartHandler.php:85-120) returns early unless the gateway is enabled AND button_type is "smart", so its absence means the gateway is off or the button type was left on "standard" by a sibling case`,
    ).toBeAttached({ timeout: 60_000 });

    const sdkSrc = (await sdk.getAttribute('src')) ?? '';
    expect(
        sdkSrc,
        `the SDK URL must request the hosted-fields component. CartManager::get_paypal_sdk_url() (Cart/CartManager.php:26-37) only prepends "components=hosted-fields,buttons&" when is_ucc_enabled_for_all_seller_in_cart() is true, so without it window.paypal.HostedFields is undefined and no card field can ever mount — the server decided this cart has no card path. Actual src: ${sdkSrc || '(empty)'}`,
    ).toContain('components=hosted-fields');

    const clientToken = (await sdk.getAttribute('data-client-token')) ?? '';
    if (!clientToken) {
        test.skip(
            true,
            `the PayPal SDK script carries no data-client-token, so paypal.HostedFields.isEligible() returns false and no card field can mount. CartHandler::add_bn_code_to_script() (Cart/CartHandler.php:163-240) attaches it from Processor::get_generated_client_token() (Utilities/Processor.php:694-724, POST v1/identity/generate-token), and a WP_Error there is only written to the Dokan log before the attribute is silently dropped. Reported as an environment gap rather than a failure because the usual cause is PayPal declining to issue a token for this platform/merchant pair; check wp-content/uploads/wc-logs/ for the generate-token error, or re-run without PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card.`,
        );
    }

    await expect(
        page.locator(UCC_DOM.cardContainer),
        `the card fields template must be rendered inside the payment box. PayPal::payment_fields() (PaymentMethods/PayPal.php:182-190) loads templates/3DS-payment-option.php only under the UCC gate, so an absent .card_container means the gate closed between the state read above and this page render`,
    ).toBeAttached({ timeout: 30_000 });

    await expect(
        page.locator(UCC_DOM.unbranded),
        `the unbranded pay button must be rendered. CartHandler::display_paypal_button() (Cart/CartHandler.php:271-278) emits div.unbranded_checkout > button#pay_unbranded_order only under the same gate, and without it there is no way to submit the card`,
    ).toBeAttached({ timeout: 30_000 });

    // ── 2. Did the SDK actually mount? `init_paypal()` is fired on a 5s timer after DOM ready and
    //       `init_hosted_fields()` runs inside it, so the iframe is the first honest proof.
    const numberFrame = page.locator(`${UCC_DOM.number} iframe`);
    const mounted = await numberFrame
        .waitFor({ state: 'attached', timeout: 120_000 })
        .then(() => true)
        .catch(() => false);
    if (!mounted) {
        test.skip(
            true,
            `the card-number field never mounted: no iframe appeared inside ${UCC_DOM.number} within 120s even though the server rendered the whole card surface and issued a client token. init_hosted_fields() (assets/src/js/paypal-checkout.js:275-290) returns without rendering when paypal.HostedFields.isEligible() is false, which is PayPal's answer about the platform client-id and the merchant ids on the SDK URL — i.e. PPCP_CUSTOM is not vetted for these accounts. Reported as an environment gap: it is not seedable from this suite. Re-run without PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card to use the wallet route.`,
        );
    }

    // ── 3. Reveal the Pay button. `toggle_buttons()` runs once inside init_paypal() and again from
    //       the payment_method click handler, so a container still hidden here needs one click on the
    //       label — which fires `click` but not `change`, and therefore does not trigger an
    //       update_checkout that would tear the freshly mounted iframes back out.
    const payButton = page.locator(UCC_DOM.payButton);
    if (!(await payButton.isVisible().catch(() => false))) {
        await page.locator(CLASSIC_LABEL).first().click().catch(() => undefined);
    }
    await expect(
        payButton,
        `#pay_unbranded_order must become visible before the card can be submitted. It lives inside #paypal-button-container, which ships with inline display:none and is revealed by toggle_buttons() (paypal-checkout.js:36-44) when the PayPal method is the selected one`,
    ).toBeVisible({ timeout: 60_000 });

    // ── 4. Type the card. `pressSequentially`, not `fill`: braintree formats the value as it is typed
    //       from keypress listeners, and a blind fill leaves the field reporting invalid.
    await hostedField(page, UCC_DOM.number, 'number').click();
    await hostedField(page, UCC_DOM.number, 'number').pressSequentially(CARD.number, { delay: 25 });
    await hostedField(page, UCC_DOM.expiry, 'expirationDate').click();
    await hostedField(page, UCC_DOM.expiry, 'expirationDate').pressSequentially(CARD.expiry, { delay: 25 });
    await hostedField(page, UCC_DOM.cvv, 'cvv').click();
    await hostedField(page, UCC_DOM.cvv, 'cvv').pressSequentially(CARD.cvv, { delay: 25 });
    await page.fill(UCC_DOM.holder, CARD.holder);

    await expect(
        payButton,
        `#pay_unbranded_order must be ENABLED once every card field reports valid. The validityChange handler (paypal-checkout.js:322-358) sets disabled on every invalid change and only clears it when hf.getState() reports all three fields valid, so a button still disabled here means PayPal's own field validation rejected the card number, the expiry ${CARD.expiry} or the CVV — clicking anyway would only hit the "Please fill up the card info!" branch and no order would ever be created`,
    ).toBeEnabled({ timeout: 60_000 });

    // ── 5. Submit. Both server round trips are captured off the wire BEFORE the click, because
    //       neither is reachable afterwards and both are the only account of what the product did.
    const checkoutWaiter = page
        .waitForResponse(response => response.url().includes('wc-ajax=checkout') && response.request().method() === 'POST', { timeout: CARD_BUDGET_MS })
        .catch(error => error as Error);
    const captureWaiter = page
        .waitForResponse(response => response.url().includes('admin-ajax.php') && (response.request().postData() ?? '').includes('dokan_paypal_capture_payment'), {
            timeout: CARD_BUDGET_MS,
        })
        .catch(error => error as Error);

    await payButton.click();
    const outcome = await cardOutcome(page, CARD_BUDGET_MS);

    if (outcome === 'challenge') {
        test.skip(
            true,
            `PayPal drew a 3D Secure step-up challenge into #payments-sdk__contingency-lightbox, so the card cannot be approved unattended. The module hardcodes contingencies:['3D_SECURE'] (paypal-checkout.js:409-414), PayPal's documented synonym of SCA_ALWAYS, and QA cannot change product code — so the run depends on a frictionless card. Card ****${CARD.number.slice(-4)} did not stay frictionless here. Set PAYPAL_UCC_TEST_CARD to PayPal's "Test Case 1" card (4868719196829038 / MC 5329879707824603), or re-run on the wallet route. Reported as a declared block, never as a pass: no capture happened, so nothing below was exercised.`,
        );
    }

    const checkoutResponse = await withinMs(checkoutWaiter, outcome === 'returned' ? 30_000 : 60_000);
    const checkoutBody = await bodyOf(checkoutResponse);
    let parsed: CardCheckoutResponse | null = null;
    try {
        parsed = JSON.parse(checkoutBody) as CardCheckoutResponse;
    } catch {
        parsed = null;
    }

    if (outcome === 'error' || outcome === 'timeout') {
        // A checkout that WooCommerce itself refused is returned rather than thrown, so the caller's
        // own `result === success` assertion voices it with the message it was written for.
        if (parsed && parsed.result !== 'success') {
            return parsed;
        }

        const notice = await page
            .locator(UCC_DOM.error)
            .first()
            .innerText()
            .catch(() => '(no error notice could be read off the page)');
        const captureBody = await bodyOf(await withinMs(captureWaiter, 5_000));
        throw new Error(
            `the Advanced Card submit did not reach the order-received page, so NO capture happened and every assertion below would be about an unpaid order. ` +
                `Outcome: ${outcome}. Current URL: ${page.url()}. ` +
                `Error notice on the page: ${notice.slice(0, 400)}. ` +
                `wc-ajax=checkout answered: ${checkoutBody.slice(0, 400)}. ` +
                `dokan_paypal_capture_payment answered: ${captureBody.slice(0, 400)}. ` +
                `A capture failure is reported here in full because OrderController::capture_payment() only ever answers wp_send_json_error with the message, and paypal-checkout.js prints it into that notice and stops.`,
        );
    }

    expect(
        parsed,
        `WooCommerce must answer the card route's checkout POST with JSON — WC_AJAX::checkout() ends in wp_send_json(), so anything else is a PHP fatal, a redirect, or output printed before the JSON. Raw body: ${checkoutBody.slice(0, 400)}`,
    ).not.toBeNull();

    // The capture answer is a diagnostic, not the oracle: the caller's own
    // `_dokan_paypal_payment_charge_captured` assertion decides whether money moved. It is reported
    // rather than asserted so a missed interception can never turn a real capture into a false red.
    const captureResponse = await withinMs(captureWaiter, 15_000);
    const captureBody = await bodyOf(captureResponse);
    if (!/"success"\s*:\s*true/.test(captureBody)) {
        log.warn(`the dokan_paypal_capture_payment response could not be confirmed as a success; the order-received page was still reached. Body: ${captureBody.slice(0, 300)}`);
    }

    return parsed as CardCheckoutResponse;
}
