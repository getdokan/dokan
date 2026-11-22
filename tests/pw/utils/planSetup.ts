import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { auth } from '@utils/interfaces';

/*
 * Package workflow only (DOKAN_PLAN set, see e2e_api_package_tests.yml). Each lane activates its real
 * lifetime key and turns on exactly the modules the license unlocks. A refused activation, a plan that
 * unlocks the wrong number of modules, or a module that will not activate fails setup, so a lane never
 * runs on a fake license or with modules silently missing.
 */

export async function activatePlanLicense(apiUtils: ApiUtils, adminAuth: auth): Promise<void> {
    const { DOKAN_PLAN, LICENSE_KEY } = process.env;
    expect(LICENSE_KEY, `no license key for the ${DOKAN_PLAN} lane`).toBeTruthy();

    const [response, body] = await apiUtils.post(endPoints.activateLicense, { data: { license_key: LICENSE_KEY }, headers: adminAuth }, false);
    expect(response.ok(), `${DOKAN_PLAN} license activation refused: ${body?.message ?? response.status()}`).toBeTruthy();

    // Never log `data`: it holds the key.
    const [, statusBody] = await apiUtils.get(endPoints.getLicenseStatus, { headers: adminAuth });
    const { is_valid, source_id, data } = statusBody.status;
    console.log(`license: lane ${DOKAN_PLAN}, source_id ${source_id}, valid ${is_valid}, activations left ${data?.remaining}/${data?.activation_limit}`);
    expect(is_valid, `${DOKAN_PLAN} license is not valid after activation (source_id ${source_id})`).toBe(true);
}

export async function activatePlanModules(apiUtils: ApiUtils, adminAuth: auth): Promise<void> {
    const { DOKAN_PLAN, EXPECTED_MODULE_COUNT } = process.env;

    const modules: { id: string; available: boolean; active: boolean }[] = await apiUtils.getAllModules({}, adminAuth);
    const available = modules.filter(m => m.available).map(m => m.id);
    expect(available.length, `${DOKAN_PLAN} unlocks ${available.length} modules (${available.join(', ')}), plans.json lists ${EXPECTED_MODULE_COUNT}`).toBe(Number(EXPECTED_MODULE_COUNT));

    const [response, body] = await apiUtils.activateModules(available, adminAuth);
    expect(response.ok(), `${DOKAN_PLAN} module activation refused: ${body?.message ?? response.status()}`).toBeTruthy();

    const after: typeof modules = await apiUtils.getAllModules({}, adminAuth);
    expect(
        after.filter(m => m.available && !m.active).map(m => m.id),
        `${DOKAN_PLAN} modules still inactive after activation`,
    ).toEqual([]);

    // planFilter.js reads this to leave out the specs of every module the plan does not offer.
    const file = path.join(__dirname, '..', 'playwright', 'available-modules.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(available));
    console.log(`modules: lane ${DOKAN_PLAN}, ${available.length} active: ${available.join(', ')}`);
}
