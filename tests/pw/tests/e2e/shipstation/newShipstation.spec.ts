import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewShipstationPage } from './newShipstationPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor "ShipStation" credential settings (Pro
// module shipstation) at /dashboard/new/#/settings/shipstation. Ports the legacy
// vendor cases "vendor can generate ShipStation credentials" / "vendor can revoke
// ShipStation credentials" (tests/e2e/shipstation/shipstation.spec.ts, whose page
// object is a no-op stub) to the real React DokanModal flows. The admin
// enable/disable-module cases in that file STAY (D3); the legacy-URL "(React)"
// smokes are retired once this passes 3×.
//
// Behavioral oracle: the REST credential existence flip — GET
// /dokan/v1/shipstation/credentials/{vendorId} returns a key_id when present and
// 404 dokan_pro_rest_no_resource when revoked — paired with the card state flip
// (Generate ↔ Revoke). Never asserts on modal text alone (§7).
// ============================================

const { VENDOR_ID } = process.env;

let apiUtils: ApiUtils;

/** Read the vendor's ShipStation credential (2xx-assert disabled to allow the 404 state). */
async function getCredential(): Promise<{ status: number; body: { key_id?: number; code?: string } }> {
    const [response, body] = await apiUtils.get(endPoints.getShipStationCredential(VENDOR_ID as string), { headers: payloads.vendorAuth }, false);
    return { status: response.status(), body };
}

test.describe('ShipStation (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The vendor ShipStation route + REST only register while the module is active.
        await apiUtils.activateModules(payloads.moduleIds.shipStation, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let shipstation: NewShipstationPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            shipstation = new NewShipstationPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor sees Generate Credentials when no credential exists (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // Precondition: start with no credential.
            await apiUtils.deleteShipStationCredential(VENDOR_ID as string, payloads.vendorAuth);
            await shipstation.goto();
            expect(page.url(), 'on the /settings/shipstation route').toMatch(/#\/settings\/shipstation/);
            expect(await shipstation.generateVisible(), 'Generate Credentials button is shown').toBe(true);
            expect(await shipstation.credentialCodeCount(), 'no credential code blocks yet').toBe(0);
            expect(await shipstation.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can generate ShipStation credentials (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await apiUtils.deleteShipStationCredential(VENDOR_ID as string, payloads.vendorAuth);
            await shipstation.goto();
            await shipstation.generate();
            // UI oracle: credential code blocks now render with non-empty text.
            expect(await shipstation.credentialsRendered(), 'Authentication/Consumer Key code blocks render').toBe(true);
            // REST oracle (cross-check as admin): the credential now exists.
            const cred = await getCredential();
            expect(cred.status, 'GET credentials returns 200 after generate').toBe(200);
            expect(Number(cred.body?.key_id ?? 0), 'a non-zero key_id was created (REST)').toBeGreaterThan(0);
        });

        test('vendor can revoke ShipStation credentials (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // Precondition: a credential exists.
            await apiUtils.createShipStationCredential(VENDOR_ID as string, payloads.vendorAuth);
            await shipstation.goto();
            expect(await shipstation.revokeVisible(), 'Revoke Credentials button is shown').toBe(true);
            await shipstation.revoke();
            // UI oracle: back to the no-credential state (Generate button returns).
            expect(await shipstation.generateVisible(), 'Generate button returns after revoke').toBe(true);
            // REST oracle: the credential is gone (404 dokan_pro_rest_no_resource).
            const cred = await getCredential();
            expect(cred.status, 'GET credentials returns 404 after revoke').toBe(404);
            expect(String(cred.body?.code ?? ''), 'no-resource error code').toContain('no_resource');
        });

        test('HashRouter survives a reload on /settings/shipstation (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipstation.goto();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await shipstation.waitForReady();
            expect(page.url(), 'still on /settings/shipstation after reload').toMatch(/#\/settings\/shipstation/);
            expect(await shipstation.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });
});
