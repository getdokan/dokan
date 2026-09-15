// Shared helpers for reasoning about the old ↔ new admin-settings bridge from
// the live schema (`GET /dokan/v1/admin/settings`).
//
// Used by the bridge sweep, which drives every field through both persistence
// paths, and by the coverage guard, which needs the same notion of "can this
// field be swept" to know what is left untested.

export type LegacyKey = string | { option?: string; field?: string; [key: string]: unknown };

export type SchemaEntry = {
    id: string;
    type: string;
    variant?: string;
    value?: unknown;
    default?: unknown;
    options?: Array<{ value?: unknown } | string>;
    enable_state?: { value: unknown };
    disable_state?: { value: unknown };
    legacy_key?: LegacyKey;
    section_id?: string;
    field_group_id?: string;
    subpage_id?: string;
    page_id?: string;
    tab_id?: string;
};

// `legacy_key` comes in four shapes: "option.field", { option, field }, a map of
// sub-key -> "option.field", and a map of sub-key -> { option, field }.
export function legacyPaths(key: LegacyKey): string[][] {
    if (typeof key === 'string') {
        return [key.split('.')];
    }
    if (typeof key.option === 'string') {
        return [[key.option, String(key.field)]];
    }
    return Object.values(key).flatMap(nested => legacyPaths(nested as LegacyKey));
}

// Ids are only guaranteed unique among fields, so a section may share its id
// with the subpage that holds it (`fees`, `commission`, `vendor_capabilities`).
// Resolve parent pointers against the page-ish entries first, or the walk
// resolves a section to itself and the field ends up with no scope.
export function scopeResolver(schema: SchemaEntry[]): (entry: SchemaEntry) => string | null {
    const pageish = new Map<string, SchemaEntry>();
    const anyEntry = new Map<string, SchemaEntry>();
    for (const entry of schema) {
        if (['page', 'subpage', 'tab'].includes(entry.type)) {
            pageish.set(entry.id, entry);
        }
        if (!anyEntry.has(entry.id)) {
            anyEntry.set(entry.id, entry);
        }
    }

    return (entry: SchemaEntry): string | null => {
        let cursor: SchemaEntry | undefined = entry;
        let fallback: string | null = null;
        for (let hops = 0; hops < 8 && cursor; hops++) {
            const parentId: string | undefined =
                cursor.field_group_id ?? cursor.section_id ?? cursor.subpage_id ?? cursor.tab_id ?? cursor.page_id;
            if (!parentId) {
                break;
            }
            const next: SchemaEntry | undefined = pageish.get(parentId) ?? anyEntry.get(parentId);
            cursor = next && next !== cursor ? next : undefined;
            if (cursor?.type === 'subpage') {
                return cursor.id;
            }
            if (cursor?.type === 'page') {
                fallback = cursor.id;
            }
        }
        return fallback;
    };
}

function optionValues(field: SchemaEntry): string[] {
    const raw = (field.options ?? []).map(option => (typeof option === 'string' ? option : option?.value));
    return [...new Set(raw.filter(value => value !== undefined && value !== null).map(String))];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === 'object' && !Array.isArray(value);

// Structured variants carry a shape the schema does not describe, so derive the
// pair from the field's own stored value (or its default) and perturb it. That
// keeps the payload valid without hardcoding a shape the product may change.
function structuredPair(field: SchemaEntry): [unknown, unknown] | null {
    const variant = field.variant ?? '';
    const current = field.value ?? field.default;

    // { admin_percentage, additional_fee } — a percentage/flat-fee pair.
    if (variant === 'combine_input' || variant === 'category_based_commission') {
        if (!isRecord(current)) {
            return null;
        }
        const perturb = (percentage: string, flat: string): unknown => {
            const clone = JSON.parse(JSON.stringify(current)) as Record<string, unknown>;
            if ('admin_percentage' in clone) {
                clone.admin_percentage = percentage;
                clone.additional_fee = flat;
                return clone;
            }
            if (isRecord(clone.all)) {
                clone.all = { ...clone.all, percentage, flat };
                return clone;
            }
            return null;
        };
        const a = perturb('3', '1');
        const b = perturb('7', '2');
        return a && b ? [a, b] : null;
    }

    // A stored URL. Existence is never validated, so a suffixed twin is enough
    // to prove the value reaches the legacy row.
    if (variant === 'wp_media_upload') {
        if (typeof current !== 'string' || !current) {
            return null;
        }
        return [current, current.replace(/(\.[A-Za-z0-9]+)$/, '-dokan-bridge$1')];
    }

    // Full palette objects; the options list holds valid ones.
    if (variant === 'color_customizer') {
        const palettes = (field.options ?? []).filter(isRecord);
        return palettes.length >= 2 ? [palettes[0], palettes[1]] : null;
    }

    // Per-weekday { delivery_status, opening_time, closing_time }.
    if (variant === 'delivery_days') {
        if (!isRecord(current)) {
            return null;
        }
        const off = JSON.parse(JSON.stringify(current)) as Record<string, unknown>;
        for (const day of Object.keys(off)) {
            if (isRecord(off[day])) {
                off[day] = { ...(off[day] as Record<string, unknown>), delivery_status: '', opening_time: '', closing_time: '' };
            }
        }
        const firstDay = Object.keys(off).find(day => isRecord(off[day]));
        if (!firstDay) {
            return null;
        }
        const on = JSON.parse(JSON.stringify(off)) as Record<string, unknown>;
        on[firstDay] = { ...(on[firstDay] as Record<string, unknown>), delivery_status: firstDay, opening_time: '__full_day__' };
        return [off, on];
    }

    // { latitude, longitude, address, zoom }.
    if (variant === 'location_map') {
        if (!isRecord(current)) {
            return null;
        }
        return [
            { ...current, latitude: 23.709921, longitude: 90.407143, address: 'Dhaka' },
            { ...current, latitude: 40.7127753, longitude: -74.0059728, address: 'New York, NY, USA' },
        ];
    }

    // Row lists. Clone row zero so the row shape stays whatever this repeater
    // uses (they differ: id/title/order/required vs id/value/title).
    if (variant === 'repeater') {
        if (!Array.isArray(current) || !current.length || !isRecord(current[0])) {
            return null;
        }
        const base = current as Array<Record<string, unknown>>;
        const extra: Record<string, unknown> = { ...base[0]!, id: 'dokan_bridge_row', title: 'Dokan Bridge Row' };
        if ('value' in extra) {
            extra.value = 'Dokan Bridge Row';
        }
        if ('order' in extra) {
            extra.order = base.length + 1;
        }
        return [base, [...base, extra]];
    }

    return null;
}

// Two distinct valid values for a field. Null when the shape cannot be
// synthesised safely — those are reported as skipped rather than guessed at.
export function valuePair(field: SchemaEntry): [unknown, unknown] | null {
    const variant = field.variant ?? '';

    if (field.enable_state && field.disable_state) {
        return [String(field.disable_state.value), String(field.enable_state.value)];
    }
    if (['select', 'radio_capsule', 'customize_radio', 'biweekly_week_pair', 'quarter_anchor_month'].includes(variant)) {
        const options = optionValues(field);
        return options.length >= 2 ? [options[0], options[1]] : null;
    }
    if (variant === 'number') {
        return ['11', '22'];
    }
    if (variant === 'select_color_picker') {
        return ['#112233', '#445566'];
    }
    if (['text', 'textarea', 'show_hide', 'rich_text', 'copy_field'].includes(variant)) {
        return ['dokan_bridge_a', 'dokan_bridge_b'];
    }
    if (variant === 'multicheck') {
        const options = optionValues(field);
        return options.length >= 2 ? [[options[0]], [options[0], options[1]]] : null;
    }
    if (variant === 'double_input') {
        return [
            { first: 111, second: 222 },
            { first: 333, second: 444 },
        ];
    }
    const structured = structuredPair(field);
    if (structured) {
        return structured;
    }
    if (variant === 'info_preview' && field.default && typeof field.default === 'object') {
        const keys = Object.keys(field.default as Record<string, unknown>);
        if (!keys.length) {
            return null;
        }
        const allOn = Object.fromEntries(keys.map(key => [key, true]));
        return [allOn, { ...allOn, [keys[0]!]: false }];
    }
    return null;
}

// The single legal value of a choice field, when that is all it offers.
function soleChoice(field: SchemaEntry): string | null {
    const options = optionValues(field);
    return options.length === 1 ? options[0]! : null;
}

export type SweepTarget = {
    id: string;
    scope: string;
    variant: string;
    a: unknown;
    b: unknown;
    paths: string[][];
    // 'moves': the legacy leaf must differ between a and b. 'equals': the field
    // has only one legal value, so assert the leaf matches what was saved
    // instead of demanding a change.
    mode: 'moves' | 'equals';
};

// Bridged fields the sweep can drive, plus the ones it has to skip.
export function sweepTargets(schema: SchemaEntry[]): { targets: SweepTarget[]; skipped: SchemaEntry[] } {
    const scopeOf = scopeResolver(schema);
    const targets: SweepTarget[] = [];
    const skipped: SchemaEntry[] = [];

    for (const field of schema) {
        if (field.type !== 'field' || !field.legacy_key) {
            continue;
        }
        const scope = scopeOf(field);
        if (!scope) {
            skipped.push(field);
            continue;
        }
        const pair = valuePair(field);
        // A choice field offering exactly one option cannot be flipped, so
        // verify it by equality rather than dropping it.
        const only = !pair ? soleChoice(field) : null;
        if (!pair && only === null) {
            skipped.push(field);
            continue;
        }
        targets.push({
            id: field.id,
            scope,
            variant: field.variant ?? '',
            a: pair ? pair[0] : only,
            b: pair ? pair[1] : only,
            paths: legacyPaths(field.legacy_key),
            mode: pair ? 'moves' : 'equals',
        });
    }
    return { targets, skipped };
}
