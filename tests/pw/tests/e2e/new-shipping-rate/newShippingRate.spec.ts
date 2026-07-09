import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewShippingRatePage } from './newShippingRatePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Closes conversion GAP-1 (CONVERSION-AUDIT-2026-07 / shipping-gap-brief): the
// per-instance shipping drill-in FORMS on the React vendor dashboard, which the
// zones-list spec (new-shipping/) never reaches.
//
// Surfaces (Pro, table-rate-shipping module):
//   - /dashboard/new/#/settings/shipping/:zoneID/table-rate/:instanceID
//       DataViews-free settings form (table-settings/index.tsx)
//   - /dashboard/new/#/settings/shipping/:zoneID/distance-rate/:instanceID
//       GMAP-gated settings form (distance-settings/index.tsx)
//
// Tier: Pro. Legacy analogue: tableRateShipping.spec.ts (NOT skipped — it drives
// the legacy Vue/PHP shipping UI, a different surface).
//
// SEEDING CONTRACT (brief §3): vendor method instances live in Dokan's
// {prefix}dokan_shipping_zone_methods (seller-scoped), NOT WC's zone_methods
// table — so the WC-v3 helper cannot create them and there is no ApiUtils
// wrapper. We POST /dokan/v1/shipping/{zoneId}/methods/ with VENDOR auth to
// mint a deterministic instance, deep-link it, and DELETE it in the same test.
// The global setup (_env.setup.ts:57-60) enables dokan_table_rate_shipping /
// dokan_distance_rate_shipping on the admin US zone; without those enablers
// ShippingZone::get_shipping_methods filters our instance out of the create
// response (available_shipping_methods gate), so seeding depends on that setup.
//
// GMAP NOTE: the distance-rate form only renders when
// dokanTableRateShippingHelper.map_api_key (= dokan_appearance.gmap_api_key,
// seeded from the GMAP env) is truthy; otherwise it renders a requires-API-key
// gate alert. DR-1 asserts that alert (runs only when GMAP is absent); DR-2 is
// the behavioral persist path (runs only when GMAP is provisioned). Exactly one
// of the pair runs per environment — neither fakes green.
// ============================================

/** Newest instance id for a method type in the keyed methods map returned by
 *  POST/GET .../methods (keys are "{method_id}:{instance_id}"; each value has
 *  `id` = method_id and `instance_id`). Max id = the one we just created. */
function newestInstanceId(methodsMap: Record<string, any>, methodId: string): number {
    const ids = Object.values(methodsMap ?? {})
        .filter((m: any) => m?.id === methodId)
        .map((m: any) => Number(m.instance_id))
        .filter((n) => Number.isFinite(n));
    if (!ids.length) throw new Error(`No ${methodId} instance in methods response: ${JSON.stringify(methodsMap)}`);
    return Math.max(...ids);
}

test.describe('Shipping Rate (React) functionality', () => {
    test.describe('vendor', () => {
        let apiUtils: ApiUtils;
        let zoneId: string;
        let ctx: BrowserContext;
        let page: Page;
        let shippingRate: NewShippingRatePage;
        let seededInstanceIds: number[];

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
            // WC zones require ADMIN auth; the seeded fixture has one "US" zone.
            zoneId = await apiUtils.getZoneId('US', payloads.adminAuth);
            expect(zoneId, 'seeded US shipping zone exists').toBeTruthy();
        });

        test.afterAll(async () => {
            await apiUtils?.dispose();
        });

        test.beforeEach(async ({ browser }) => {
            seededInstanceIds = [];
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            shippingRate = new NewShippingRatePage(page);
        });

        test.afterEach(async () => {
            // Delete every instance seeded by the test so the shared US zone is
            // left as found (best-effort; failures here must not mask a test
            // failure). VENDOR auth — instances are seller-scoped.
            for (const instanceId of seededInstanceIds) {
                await apiUtils
                    .delete(`${SERVER_URL}/dokan/v1/shipping/${zoneId}/methods/${instanceId}`, { headers: payloads.vendorAuth })
                    .catch(() => undefined);
            }
            await page?.close();
            await ctx?.close();
        });

        /** Seed one vendor-owned method instance and return its instance id. */
        async function seedInstance(methodId: string, title: string): Promise<number> {
            const [, body] = await apiUtils.post(`${SERVER_URL}/dokan/v1/shipping/${zoneId}/methods/`, {
                data: { method_id: methodId, settings: { title, cost: 0, description: 'PW seed' } },
                headers: payloads.vendorAuth,
            });
            const instanceId = newestInstanceId(body, methodId);
            seededInstanceIds.push(instanceId);
            return instanceId;
        }

        // ---- TR-1: table-rate form renders ----
        test('vendor sees the table-rate settings form on the per-instance drill-in route (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const instanceId = await seedInstance('dokan_table_rate_shipping', `PW Table Rate ${Date.now()}`);
            await shippingRate.gotoTableRate(zoneId, instanceId);

            await expect(shippingRate.tableRateContainer, 'table-rate settings container rendered (not skeleton/NotFound)').toBeVisible();
            await expect(shippingRate.notFound, 'no NotFound fallback for a valid instance').toBeHidden();
            await expect(shippingRate.methodTitleInput, 'Method Title input rendered').toBeVisible();
            await expect(shippingRate.ratesTable, 'table-rates table rendered').toBeVisible();
            await expect(shippingRate.saveChangesButton, 'Save Changes control rendered').toBeVisible();
            // Supplementary only (house-style §7): behaviour is proven by TR-2.
            expect(await shippingRate.hasNoPhpFatal(), 'no PHP fatal on the table-rate route').toBe(true);
        });

        // ---- TR-2: PRIMARY behavioral oracle — Method Title persists ----
        test('vendor persists the table-rate Method Title via the settings PUT and it survives reload (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const instanceId = await seedInstance('dokan_table_rate_shipping', `PW Table Rate ${Date.now()}`);
            await shippingRate.gotoTableRate(zoneId, instanceId);

            const newTitle = `PW ${Date.now()}`;
            await shippingRate.setMethodTitle(newTitle);

            // Oracle 1: the Save Changes click fires the settings PUT and it 2xx's.
            const resp = await shippingRate.saveTableRateSettings();
            expect(resp, 'table-rate settings PUT fired on Save Changes').toBeTruthy();
            expect(resp!.ok(), `table-rate settings PUT succeeded (status ${resp?.status()})`).toBe(true);

            // Oracle 2: after a full reload the mount GET re-reads the saved
            // value into the Method Title input — i.e. it truly persisted.
            await shippingRate.reloadTableRate();
            await expect(shippingRate.methodTitleInput, 'Method Title input rehydrated after reload').toBeVisible();
            expect(await shippingRate.getMethodTitle(), 'Method Title persisted across reload').toBe(newTitle);
        });

        // ---- DR-1: distance-rate GMAP gate alert (GMAP absent only) ----
        test('distance-rate drill-in renders the Google-map-API-key gate alert when no map key is configured (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // When a map key IS configured the form renders instead of the gate
            // alert (verified live), so this branch is genuinely unreachable —
            // the behavioural half is covered by DR-2 in that environment.
            test.skip(!!process.env.GMAP, 'GMAP is provisioned in this environment; the distance-rate form renders instead of the requires-API-key gate alert (covered by DR-2).');

            const instanceId = await seedInstance('dokan_distance_rate_shipping', `PW Distance Rate ${Date.now()}`);
            await shippingRate.gotoDistanceRate(zoneId, instanceId);

            await expect(shippingRate.distanceRateContainer, 'distance-rate container rendered').toBeVisible();
            await expect(shippingRate.gmapAlert, 'requires-Google-map-API-key gate alert rendered').toBeVisible();
            await expect(shippingRate.gmapAlert, 'gate alert carries the requires-API-key message').toContainText(/requires Google map API key/i);
        });

        // ---- DR-2: distance-rate behavioral persist (GMAP provisioned only) ----
        test('vendor persists the distance-rate Method Title via the settings PUT and it survives reload (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // The full distance-rate form only mounts when a Google map API key
            // is configured; without one the route shows only the gate alert
            // (asserted by DR-1). Guard the behavioural path accordingly.
            test.skip(!process.env.GMAP, 'distance-rate form is GMAP-gated; GMAP not provisioned, so only the gate alert renders (covered by DR-1).');

            const instanceId = await seedInstance('dokan_distance_rate_shipping', `PW Distance Rate ${Date.now()}`);
            await shippingRate.gotoDistanceRate(zoneId, instanceId);

            // The gate is satisfied -> the full form (not the alert) renders.
            await expect(shippingRate.distanceRateContainer, 'distance-rate container rendered').toBeVisible();
            await expect(shippingRate.gmapAlert, 'no gate alert when a map key is configured').toBeHidden();
            await expect(shippingRate.methodTitleInput, 'Method Title input rendered (full form)').toBeVisible();

            const newTitle = `PW ${Date.now()}`;
            await shippingRate.setMethodTitle(newTitle);

            const resp = await shippingRate.saveDistanceRateSettings();
            expect(resp, 'distance-rate settings PUT fired on Save Changes').toBeTruthy();
            expect(resp!.ok(), `distance-rate settings PUT succeeded (status ${resp?.status()})`).toBe(true);

            await shippingRate.reloadDistanceRate();
            await expect(shippingRate.methodTitleInput, 'Method Title input rehydrated after reload').toBeVisible();
            expect(await shippingRate.getMethodTitle(), 'Method Title persisted across reload').toBe(newTitle);
        });
    });
});
