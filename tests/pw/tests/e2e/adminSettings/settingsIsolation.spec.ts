import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { isSerialized, unserialize } from 'php-serialize';
import { legacyPaths, type LegacyKey, type SchemaEntry } from '@utils/settingsBridge';

// The per-section specs answer "does my value survive the round trip?". This
// one answers the other half of the contract: saving one section must not
// rewrite settings it has no business touching (see a3514e069). Snapshot every
// `dokan_*` option row, save one scope, diff.

const newSettingsUrl = 'wp-admin/admin.php?page=dokan-dashboard#/settings';
const oldSettingsUrl = 'wp-admin/admin.php?page=dokan#/settings';

// Legacy option names a `legacy_key` points at, via the shared parser — the
// key has four shapes and the nested one is easy to miss.
function legacyOptions(legacyKey: SchemaEntry['legacy_key']): string[] {
    return legacyKey ? legacyPaths(legacyKey as LegacyKey).map(path => path[0]!) : [];
}

// Fields under a scope, walked up the page → subpage → section → fieldgroup
// chain. Derived from the live schema, so a relocated field widens the
// allow-list on its own instead of turning into a false positive.
function fieldsOwnedBy(schema: SchemaEntry[], scopeId: string): SchemaEntry[] {
    const byId = new Map(schema.map(e => [e.id, e]));

    const inScope = (entry: SchemaEntry): boolean => {
        let cursor: SchemaEntry | undefined = entry;
        for (let hops = 0; hops < 8 && cursor; hops++) {
            if (cursor.id === scopeId) {
                return true;
            }
            const parentId: string | undefined =
                cursor.field_group_id ?? cursor.section_id ?? cursor.subpage_id ?? cursor.tab_id ?? cursor.page_id;
            cursor = parentId ? byId.get(parentId) : undefined;
        }
        return false;
    };

    return schema.filter(entry => entry.type === 'field' && inScope(entry));
}

// Rewritten by every save by design, so never leakage at the row level.
// `dokan_admin_settings` is still diffed key by key below.
const SETTINGS_STORE_OPTION = 'dokan_admin_settings';
const INFRASTRUCTURE_OPTIONS = new Set([SETTINGS_STORE_OPTION, 'dokan_admin_settings_legacy_snapshot']);

// Rows that change for reasons unrelated to the settings bridge.
const VOLATILE_OPTIONS = [/_transient/, /_last_run$/, /_queue$/, /^dokan_pro_version$/, /^dokan_theme_/];

async function snapshotSettingOptions(): Promise<Record<string, string>> {
    const rows = await dbUtils.getOptionRows('dokan\\_%');
    return Object.fromEntries(Object.entries(rows).filter(([name]) => !VOLATILE_OPTIONS.some(re => re.test(name))));
}

function changedOptions(before: Record<string, string>, after: Record<string, string>): string[] {
    const names = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...names].filter(name => before[name] !== after[name]).sort();
}

function changedKeys(beforeRaw?: string, afterRaw?: string): string[] {
    const asMap = (raw?: string): Record<string, unknown> =>
        raw && isSerialized(raw) ? (unserialize(raw) as Record<string, unknown>) : {};
    const before = asMap(beforeRaw);
    const after = asMap(afterRaw);
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...keys].filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key])).sort();
}

test.describe('Admin Setting: cross-section isolation', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;
    let apiContext: APIRequestContext;
    let schema: SchemaEntry[];

    test.beforeAll(async () => {
        apiContext = await request.newContext(data.header.adminAuth);
        const response = await apiContext.get('/wp-json/dokan/v1/admin/settings');
        expect(response.ok(), 'settings schema should be readable').toBeTruthy();
        schema = await response.json();
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // `captcha` is the tightest scope on the new page: ten fields, all bridging
    // into `dokan_appearance`. Anything else moving is leakage.
    test('Saving a new-settings scope leaves other option rows untouched', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        const dataset = {
            title: 'Admin Setting: Moderation → Captcha',
            url: newSettingsUrl,
            selector: '[data-testid="settings-menu-moderation"] >> [data-testid="settings-menu-captcha"]',
            fields: [
                {
                    selector: '[data-testid="settings-field-captcha_enable_status"] [role="switch"]',
                    type: 'switch',
                    value: true,
                },
                {
                    selector: '[data-testid="settings-field-recaptcha_site_key"] input[type="password"]',
                    type: 'text',
                    value: `ISOLATION_SITE_KEY_${Date.now()}`,
                },
            ],
        };

        const before = await snapshotSettingOptions();
        await adminSettingsPage.updateSettings(dataset);
        const after = await snapshotSettingOptions();

        const scopeFields = fieldsOwnedBy(schema, 'captcha');
        expect(scopeFields.length, 'captcha scope should resolve to at least one field').toBeGreaterThan(0);

        const allowedOptions = new Set(scopeFields.flatMap(field => legacyOptions(field.legacy_key)));

        // Row level: no legacy option outside the scope may move.
        const leakedRows = changedOptions(before, after).filter(name => !allowedOptions.has(name) && !INFRASTRUCTURE_OPTIONS.has(name));
        expect(leakedRows, `saving Moderation → Captcha rewrote option rows it does not own: ${leakedRows.join(', ')}`).toEqual([]);

        // Key level: a save must not write field values from other scopes.
        const allowedKeys = new Set(scopeFields.map(field => field.id));
        const leakedKeys = changedKeys(before[SETTINGS_STORE_OPTION], after[SETTINGS_STORE_OPTION]).filter(key => !allowedKeys.has(key));
        expect(leakedKeys, `saving Moderation → Captcha wrote fields from other scopes: ${leakedKeys.join(', ')}`).toEqual([]);
    });

    // Same contract in the other direction.
    test('Saving an old-settings section leaves other option rows untouched', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        const dataset = {
            title: 'Admin Old Setting: Privacy',
            url: oldSettingsUrl,
            selector: '//div[@class="nav-title" and contains(text(),"Privacy")]',
            fields: [
                {
                    selector: '//label[@for="dokan_privacy[enable_privacy]"]//label[@class="switch tips"]',
                    type: 'checkbox',
                    value: true,
                },
            ],
        };

        adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);

        const before = await snapshotSettingOptions();
        await adminSettingsPage.updateSettings(dataset);
        const after = await snapshotSettingOptions();

        const leaked = changedOptions(before, after).filter(
            name => name !== 'dokan_privacy' && !INFRASTRUCTURE_OPTIONS.has(name),
        );
        expect(leaked, `saving the legacy Privacy section rewrote unrelated option rows: ${leaked.join(', ')}`).toEqual([]);
    });

    // Persistence beyond a reload: the value must survive leaving the settings
    // screen entirely and coming back.
    test('A saved value survives navigating away and back', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        const siteKey = `PERSIST_SITE_KEY_${Date.now()}`;
        const dataset = {
            title: 'Admin Setting: Moderation → Captcha',
            url: newSettingsUrl,
            selector: '[data-testid="settings-menu-moderation"] >> [data-testid="settings-menu-captcha"]',
            fields: [
                {
                    selector: '[data-testid="settings-field-captcha_enable_status"] [role="switch"]',
                    type: 'switch',
                    value: true,
                },
                {
                    selector: '[data-testid="settings-field-recaptcha_site_key"] input[type="password"]',
                    type: 'text',
                    value: siteKey,
                },
            ],
        };

        await adminSettingsPage.updateSettings(dataset);

        // Leave the settings app for an unrelated admin screen, then come back.
        await page.goto('wp-admin/index.php', { waitUntil: 'domcontentloaded' });
        await adminSettingsPage.checkSettings(dataset);
    });
});
