import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { data } from '@utils/testData';
import { sweepTargets, type SchemaEntry } from '@utils/settingsBridge';
import fs from 'fs';
import path from 'path';

// The bridge contract covers every setting declaring a `legacy_key`, not just
// the ones someone wrote a spec for. A field counts as covered when a spec in
// this folder drives it through the DOM, or when settingsBridgeSweep can drive
// it through both persistence paths.
//
// KNOWN_UNCOVERED is a debt list, not a permission slip: it may only shrink,
// and the second test fails when an entry becomes covered or leaves the schema.

const SPEC_DIR = __dirname;

// Bridged fields with no spec asserting the round trip yet.
const KNOWN_UNCOVERED = new Set<string>([
]);

// Every `settings-field-<id>` the specs reference. Comments are stripped first:
// a field parked behind `//` is not covered.
function referencedFieldIds(): Set<string> {
    const ids = new Set<string>();
    for (const name of fs.readdirSync(SPEC_DIR).filter(file => file.endsWith('.spec.ts'))) {
        const source = fs
            .readFileSync(path.join(SPEC_DIR, name), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n')
            .filter(line => !/^\s*\/\//.test(line))
            .join('\n');
        for (const match of source.matchAll(/settings-field-([A-Za-z0-9_-]+)/g)) {
            ids.add(match[1]!);
        }
    }
    return ids;
}

test.describe('Admin Setting: bridge coverage', () => {
    let apiContext: APIRequestContext;
    let bridgedFields: SchemaEntry[];
    let sweptIds: Set<string>;

    test.beforeAll(async () => {
        apiContext = await request.newContext(data.header.adminAuth);
        const response = await apiContext.get('/wp-json/dokan/v1/admin/settings');
        expect(response.ok(), 'settings schema should be readable').toBeTruthy();
        const schema: SchemaEntry[] = await response.json();
        bridgedFields = schema.filter(entry => entry.type === 'field' && entry.legacy_key);
        sweptIds = new Set(sweepTargets(schema).targets.map(target => target.id));
        expect(bridgedFields.length, 'schema should expose bridged fields').toBeGreaterThan(0);
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('Every bridged setting is either covered by a spec or acknowledged as debt', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        const referenced = referencedFieldIds();

        const unacknowledged = bridgedFields
            .filter(field => !referenced.has(field.id) && !sweptIds.has(field.id) && !KNOWN_UNCOVERED.has(field.id))
            .map(field => `${field.id} (${field.variant})`)
            .sort();

        expect(
            unacknowledged,
            `new settings fields bridge to legacy options but no spec covers them.\n` +
                `Add a dataset entry for each, or add the id to KNOWN_UNCOVERED with a reason:\n  ${unacknowledged.join('\n  ')}`,
        ).toEqual([]);
    });

    test('The uncovered-settings debt list has no stale entries', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        const referenced = referencedFieldIds();
        const bridgedIds = new Set(bridgedFields.map(field => field.id));

        const nowCovered = [...KNOWN_UNCOVERED].filter(id => referenced.has(id) || sweptIds.has(id)).sort();
        expect(nowCovered, `these are covered now — drop them from KNOWN_UNCOVERED:\n  ${nowCovered.join('\n  ')}`).toEqual([]);

        const gone = [...KNOWN_UNCOVERED].filter(id => !bridgedIds.has(id)).sort();
        expect(gone, `these no longer bridge to a legacy option — drop them from KNOWN_UNCOVERED:\n  ${gone.join('\n  ')}`).toEqual([]);
    });
});
