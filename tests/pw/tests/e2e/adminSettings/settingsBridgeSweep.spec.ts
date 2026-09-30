import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { serialize } from 'php-serialize';
import { sweepTargets, type SchemaEntry, type SweepTarget } from '@utils/settingsBridge';

// Data-layer sweep over the whole old ↔ new bridge.
//
// The per-section specs drive the DOM, which is the right check but scales by
// hand — two thirds of the bridged fields have no spec. This one covers every
// field that declares a `legacy_key` by exercising the two persistence paths
// directly, so coverage tracks the schema instead of trailing it.
//
// It is transform-agnostic on purpose: rather than model each field's
// to_legacy/to_new transformer, it writes two distinct values and asserts the
// mapped legacy leaf MOVED. That catches the failure that matters — a field
// declaring a `legacy_key` that nothing actually writes — without duplicating
// the transformer logic in the test.

const valueAt = (root: unknown, path: string[]): unknown =>
    path.reduce<unknown>((node, key) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined), root);

// The REST layer round-trips numbers as numbers while the legacy rows hold
// strings, and neither side promises key order. Canonicalise both before
// comparing: scalars as strings, object keys sorted. Array order, key presence
// and the values themselves still have to match.
const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(canonical);
    }
    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        return Object.fromEntries(
            Object.keys(record)
                .sort()
                .map(key => [key, canonical(record[key])]),
        );
    }
    return value === null || value === undefined ? value : String(value);
};

const sameValue = (left: unknown, right: unknown): boolean => JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));

test.describe.configure({ mode: 'serial' });

test.describe('Admin Setting: legacy bridge sweep', () => {
    let apiContext: APIRequestContext;
    let schema: SchemaEntry[];
    let targets: SweepTarget[];
    let skipped: SchemaEntry[];
    let legacyOptionNames: string[];
    let restorePoint: Record<string, string>;
    let rowsAtA: Record<string, unknown>;

    const getSchema = async (): Promise<SchemaEntry[]> => {
        const response = await apiContext.get('/wp-json/dokan/v1/admin/settings');
        expect(response.ok(), 'settings schema should be readable').toBeTruthy();
        return response.json();
    };

    // Saving goes through the same route the settings app uses. `apiFetch` sends
    // it as POST + X-HTTP-Method-Override, so mirror that here.
    const saveScope = async (scope: string, values: Record<string, unknown>) =>
        apiContext.post(`/wp-json/dokan/v1/admin/settings/${scope}`, {
            headers: { 'X-HTTP-Method-Override': 'PUT' },
            data: { values },
        });

    const readLegacyRows = async (): Promise<Record<string, unknown>> => {
        const out: Record<string, unknown> = {};
        for (const name of legacyOptionNames) {
            out[name] = await dbUtils.getOptionValueOrNull(name);
        }
        return out;
    };

    const applyAll = async (which: 'a' | 'b'): Promise<Record<string, unknown>> => {
        const byScope = new Map<string, SweepTarget[]>();
        for (const target of targets) {
            byScope.set(target.scope, [...(byScope.get(target.scope) ?? []), target]);
        }
        for (const [scope, list] of byScope) {
            const values = Object.fromEntries(list.map(t => [t.id, t[which]]));
            const response = await saveScope(scope, values);
            expect(response.status(), `saving scope "${scope}" should succeed`).toBe(200);
        }
        return readLegacyRows();
    };

    test.beforeAll(async () => {
        apiContext = await request.newContext(data.header.adminAuth);
        schema = await getSchema();

        ({ targets, skipped } = sweepTargets(schema));

        expect(targets.length, 'sweep should resolve bridged fields to write').toBeGreaterThan(0);

        legacyOptionNames = [...new Set(targets.flatMap(t => t.paths.map(p => p[0]!)))];

        // Full restore point: the flat store plus every legacy row the sweep
        // writes. This spec moves every setting on the site, so it has to put
        // them back or it poisons the rest of the run.
        restorePoint = await dbUtils.getOptionRows('dokan\\_%');
    });

    test.afterAll(async () => {
        // Guarded: when beforeAll fails early there is nothing to restore, and
        // an unguarded Object.entries here buries the real failure.
        for (const [name, raw] of Object.entries(restorePoint ?? {})) {
            await dbUtils.setOptionValue(name, raw, false);
        }
        await apiContext?.dispose();
    });

    test('Every bridged field projects into its legacy option row', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        rowsAtA = await applyAll('a');
        const rowsAtB = await applyAll('b');

        const moved = (target: SweepTarget): boolean =>
            target.paths.some(path => JSON.stringify(valueAt(rowsAtA, path)) !== JSON.stringify(valueAt(rowsAtB, path)));

        // Single-choice fields cannot be flipped, so require the leaf to hold
        // what was saved instead of requiring it to change.
        const landed = (target: SweepTarget): boolean =>
            target.paths.some(path => {
                const leaf = valueAt(rowsAtB, path);
                return leaf !== undefined && (sameValue(leaf, target.b) || JSON.stringify(leaf) === JSON.stringify(target.b));
            });

        const inert = targets
            .filter(target => (target.mode === 'equals' ? !landed(target) : !moved(target)))
            .map(target => `${target.id} (${target.variant}, ${target.mode}) -> ${target.paths.map(p => p.join('.')).join(' | ')}`);

        expect(
            inert,
            `these fields declare a legacy_key but the legacy value did not follow:\n  ${inert.join('\n  ')}`,
        ).toEqual([]);

        console.log(`bridge sweep: ${targets.length} fields verified, ${skipped.length} skipped (shape not synthesisable)`);
    });

    test('Legacy edits made without the bridge reconcile back into the new store', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Put the legacy rows back to state A behind the bridge's back, which is
        // what an older plugin version writing raw options looks like. The flat
        // store still holds B, so reconciliation has real divergence to resolve.
        for (const [name, value] of Object.entries(rowsAtA)) {
            if (value === null) {
                continue;
            }
            await dbUtils.setOptionValue(name, typeof value === 'string' ? value : serialize(value), false);
        }

        // Reconciliation runs on admin_init, so it needs a real admin page load.
        await new LoginPage(page).adminLogin(data.admin);
        await page.goto('wp-admin/index.php', { waitUntil: 'domcontentloaded' });

        const after = await getSchema();
        const byId = new Map(after.filter(entry => entry.type === 'field').map(entry => [entry.id, entry]));

        const stale = targets
            .filter(target => !sameValue(byId.get(target.id)?.value, target.a))
            .map(target => `${target.id} (${target.variant}): want ${JSON.stringify(target.a)}, got ${JSON.stringify(byId.get(target.id)?.value)}`);

        expect(stale, `legacy edits were not adopted back into the flat store:\n  ${stale.join('\n  ')}`).toEqual([]);
    });
});
