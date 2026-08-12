//COVERAGE_TAG: GET /dokan/v1/admin/settings
//COVERAGE_TAG: PUT /dokan/v1/admin/settings/(?P<page_id>[a-z_-]+)

import { test, expect, request } from '@utils/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { AdminSettingsPage } from '@pages/adminSettingsPage';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';

/**
 * Whole-schema regression for the admin settings revamp.
 *
 * The migration spec drives a representative field per control type through the
 * UI. This spec goes the other way: it reads the live schema — every page,
 * subpage, section and field the install actually registers, Lite and Pro — and
 * asserts the properties that must hold for *all* of them. Nothing here is a
 * hand-maintained list, so a field added by a module is covered the day it ships.
 */

interface SettingsNode {
    id: string;
    type: 'page' | 'subpage' | 'tab' | 'section' | 'fieldgroup' | 'field';
    variant?: string;
    title?: string;
    page_id?: string;
    subpage_id?: string;
    tab_id?: string;
    section_id?: string;
    field_group_id?: string;
    options?: Array<{ value: string | number; title: string }>;
    value?: unknown;
    default?: unknown;
    display?: boolean;
    // The schema serialises this either as a dotted path ("dokan_general.custom_store_url",
    // sometimes nested deeper) or as an { option, field } pair. Normalise before use.
    legacy_key?: string | { option: string; field: string };
}

const NEW_OPTION = 'dokan_admin_settings';
const LEGACY_SNAPSHOT_OPTION = 'dokan_admin_settings_legacy_snapshot';

let apiUtils: ApiUtils;
let schema: SettingsNode[];

const fieldsOf = (nodes: SettingsNode[]) => nodes.filter(node => node.type === 'field');

// Values a single control can legitimately hold outside its own option list.
const isEmpty = (value: unknown) => value === '' || value === null || value === undefined;

// Both serialised shapes of `legacy_key` collapse to an option row plus a path
// into it (`dokan_withdraw.withdraw_methods.paypal` is two levels deep).
function legacyPath(field: SettingsNode): { option: string; path: string[] } | null {
    const key = field.legacy_key;
    if (!key) {
        return null;
    }
    if (typeof key === 'string') {
        const [option, ...path] = key.split('.');
        return option && path.length ? { option, path } : null;
    }
    return key.option && key.field ? { option: key.option, path: [key.field] } : null;
}

// Walk a field back up to the page whose save endpoint owns it.
function pageOf(field: SettingsNode): string {
    let node: SettingsNode | undefined = field;
    const byId = (id?: string) => schema.find(candidate => candidate.id === id);
    while (node && node.type !== 'page') {
        node = byId(node.page_id) ?? byId(node.subpage_id) ?? byId(node.tab_id) ?? byId(node.section_id) ?? byId(node.field_group_id);
    }
    if (!node) {
        throw new Error(`no owning page for field ${field.id}`);
    }
    return node.id;
}

async function fetchSchema(): Promise<SettingsNode[]> {
    const [, body] = await apiUtils.get(endPoints.getAdminSettingsSchema);
    return body as unknown as SettingsNode[];
}

test.describe('Admin settings whole-schema regression', () => {
    test.use({ storageState: data.auth.adminAuthFile });

    test.beforeAll(async () => {
        // `request.newContext()` inherits the running test's `use` options, and a
        // logged-in cookie without an X-WP-Nonce makes WordPress reject the request
        // before basic auth is ever considered. Start from an empty jar.
        apiUtils = new ApiUtils(await request.newContext({ ...data.header.adminAuth, ...data.auth.noAuth }));
        schema = await fetchSchema();
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('should expose a settings schema in which every node is reachable from a page', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        const pages = schema.filter(node => node.type === 'page');
        const subpages = schema.filter(node => node.type === 'subpage');

        expect(pages.length, 'settings pages').toBeGreaterThan(0);
        expect(subpages.length, 'settings subpages').toBeGreaterThan(0);
        expect(fieldsOf(schema).length, 'settings fields').toBeGreaterThan(0);

        // Containers nest loosely: a field may sit in a section, a fieldgroup, a
        // tab or straight on a subpage. Whichever parent it names has to exist,
        // otherwise the node never reaches the screen.
        const containers = new Map(schema.filter(node => node.type !== 'field').map(node => [node.id, node.type]));
        const parentKeys = ['page_id', 'subpage_id', 'tab_id', 'section_id', 'field_group_id'] as const;

        const unreachable = schema
            .filter(node => node.type !== 'page')
            .filter(node => {
                const declared = parentKeys.map(key => node[key]).filter(Boolean) as string[];
                return declared.length > 0 && !declared.some(parent => containers.has(parent));
            })
            .map(node => `${node.type} "${node.id}" -> ${parentKeys.map(key => node[key]).filter(Boolean).join(', ')}`);

        expect(unreachable, 'nodes naming a parent that does not exist').toEqual([]);

        const parentless = schema.filter(node => node.type !== 'page' && parentKeys.every(key => !node[key])).map(node => `${node.type} "${node.id}"`);
        expect(parentless, 'nodes with no parent at all').toEqual([]);
    });

    test('should give every field an id that is unique across the whole schema', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        // Ids key the flat option row; a duplicate means two controls fight over
        // one stored value.
        const seen = new Map<string, number>();
        for (const field of fieldsOf(schema)) {
            seen.set(field.id, (seen.get(field.id) ?? 0) + 1);
        }
        const duplicates = [...seen.entries()].filter(([, count]) => count > 1).map(([id]) => id);
        expect(duplicates, 'field ids used more than once').toEqual([]);
    });

    test('should hold a value every field can actually represent', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        // A stored value outside a control's own option list cannot be shown as
        // selected. A select silently falls back to displaying its first option, so
        // the admin reads one setting while a different one is stored and used.
        const offList = fieldsOf(schema)
            .filter(field => Array.isArray(field.options) && field.options.length)
            .filter(field => {
                const value = field.value;
                if (isEmpty(value) || typeof value === 'object') {
                    return false;
                }
                return !field.options!.map(option => String(option.value)).includes(String(value));
            })
            .map(field => `${field.id} (${field.variant}) = ${JSON.stringify(field.value)} not in [${field.options!.map(option => option.value).join(', ')}]`);

        expect(offList, 'fields whose stored value matches none of their options').toEqual([]);
    });

    test('should offer every field a default it can actually select', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        // The default is what a fresh install stores and what a field falls back to,
        // so a default outside the option list is wrong before anyone touches it.
        const offList = fieldsOf(schema)
            .filter(field => Array.isArray(field.options) && field.options.length)
            .filter(field => !isEmpty(field.default) && typeof field.default !== 'object')
            .filter(field => !field.options!.map(option => String(option.value)).includes(String(field.default)))
            .map(field => `${field.id} (${field.variant}) default ${JSON.stringify(field.default)} not in [${field.options!.map(option => option.value).join(', ')}]`);

        expect(offList, 'fields whose default matches none of their options').toEqual([]);
    });

    test('should migrate an unmigrated legacy value and keep it through an unchanged save', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        // The upgrade state: the legacy row holds the marketplace's configuration and
        // the flat option has no key for it yet. Opening the settings must show the
        // configured value, and saving that page without touching anything must leave
        // it alone. `dokan_admin_settings` is authoritative once populated, so this is
        // the one window where the legacy row is the only copy.
        const probe = fieldsOf(schema).find(field => field.id === 'vendor_store_url_slug');
        const bridge = probe ? legacyPath(probe) : null;
        expect(bridge, 'probe field must bridge to a legacy option').toBeTruthy();

        const { option, path } = bridge!;
        const key = path[0]!;
        const legacyBefore = await dbUtils.getOptionValue(option);
        const newBefore = await dbUtils.getOptionValue(NEW_OPTION);
        const snapshotBefore = await dbUtils.getOptionValue(LEGACY_SNAPSHOT_OPTION);
        const configured = 'upgraded-store-slug';

        const without = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).filter(([name]) => name !== probe!.id));

        await dbUtils.setOptionValue(option, { ...legacyBefore, [key]: configured });
        await dbUtils.setOptionValue(NEW_OPTION, without(newBefore));
        await dbUtils.setOptionValue(LEGACY_SNAPSHOT_OPTION, without(snapshotBefore));

        try {
            const rendered = fieldsOf(await fetchSchema()).find(node => node.id === probe!.id)?.value;
            expect(String(rendered), `${option}.${key} must reach the settings screen`).toBe(configured);

            const [response] = await apiUtils.put(endPoints.saveAdminSettingsPage(pageOf(probe!)), { data: { values: { [probe!.id]: rendered } } });
            expect(response.ok(), 'saving the migrated page unchanged').toBeTruthy();

            const legacyAfter = await dbUtils.getOptionValue(option);
            expect(String(legacyAfter[key]), `${option}.${key} after an unchanged save`).toBe(configured);
        } finally {
            await dbUtils.setOptionValue(option, legacyBefore);
            await dbUtils.setOptionValue(NEW_OPTION, newBefore);
            await dbUtils.setOptionValue(LEGACY_SNAPSHOT_OPTION, snapshotBefore);
        }
    });

    test('should return the same values on two consecutive reads', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        // A read that changes what the next read returns is a read that cannot be
        // trusted — the settings screen would show one thing and store another.
        const first = await fetchSchema();
        const second = await fetchSchema();

        const valuesOf = (nodes: SettingsNode[]) => Object.fromEntries(fieldsOf(nodes).map(field => [field.id, field.value]));
        const before = valuesOf(first);
        const after = valuesOf(second);

        const drifted = Object.keys(before)
            .filter(id => JSON.stringify(before[id]) !== JSON.stringify(after[id]))
            .map(id => `${id}: ${JSON.stringify(before[id])} -> ${JSON.stringify(after[id])}`);

        expect(drifted, 'fields whose value changed between two identical reads').toEqual([]);
    });

    test('should not change any stored setting when a page is saved unchanged', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        // The single most common upgrade action: open the migrated settings, save,
        // change nothing.
        const pages = schema.filter(node => node.type === 'page');
        const options = [...new Set(fieldsOf(schema).map(field => legacyPath(field)?.option).filter(Boolean) as string[]), NEW_OPTION];

        const snapshot: Record<string, unknown> = {};
        for (const option of options) {
            snapshot[option] = await dbUtils.getOptionValue(option);
        }

        for (const page of pages) {
            const values = Object.fromEntries(
                fieldsOf(schema)
                    .filter(field => {
                        const section = schema.find(node => node.id === field.section_id);
                        const subpage = schema.find(node => node.id === section?.subpage_id);
                        return subpage?.page_id === page.id;
                    })
                    .map(field => [field.id, field.value]),
            );
            if (!Object.keys(values).length) {
                continue;
            }
            const [response] = await apiUtils.put(endPoints.saveAdminSettingsPage(page.id), { data: { values } });
            expect(response.ok(), `saving page "${page.id}" unchanged`).toBeTruthy();
        }

        for (const option of options) {
            expect(await dbUtils.getOptionValue(option), `${option} after saving every page unchanged`).toEqual(snapshot[option]);
        }
    });

    test('should render every settings subpage without console errors or unsupported fields', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // One pass over every subpage the install registers; the default per-test
        // budget is sized for a single screen.
        test.setTimeout(4 * 60 * 1000);

        // React logs its development warnings through console.error. They are worth
        // reading but are not failures; an uncaught exception always is.
        const isReactWarning = (text: string) => text.startsWith('Warning:');
        const consoleErrors: string[] = [];
        const uncaught: string[] = [];
        page.on('console', message => {
            if (message.type() === 'error') {
                consoleErrors.push(message.text().split('\n')[0]!);
            }
        });
        page.on('pageerror', error => uncaught.push(error.message));

        const settings = new AdminSettingsPage(page);
        const pages = schema.filter(node => node.type === 'page');
        const problems: string[] = [];

        for (const subpage of schema.filter(node => node.type === 'subpage' && node.display !== false)) {
            const parent = pages.find(node => node.id === subpage.page_id);
            if (!parent) {
                continue;
            }
            const where = `${parent.title ?? parent.id} → ${subpage.title ?? subpage.id}`;

            try {
                await settings.openNewSubpage({ page: parent.id, subpage: subpage.id });
            } catch (error) {
                problems.push(`${where}: not reachable (${String(error).split('\n')[0]})`);
                continue;
            }

            const unsupported = await page.getByText(/Unsupported field type/i).count();
            if (unsupported) {
                problems.push(`${where}: ${unsupported} unsupported field(s)`);
            }
        }

        expect(problems, 'subpages that failed to render').toEqual([]);
        expect(uncaught, 'uncaught exceptions while walking every subpage').toEqual([]);
        expect([...new Set(consoleErrors.filter(text => !isReactWarning(text) && !text.includes('favicon')))], 'console errors while walking every subpage').toEqual([]);
    });
});
