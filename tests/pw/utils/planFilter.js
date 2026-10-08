/*
 * Plan filter for the package workflow (e2e_api_package_tests.yml).
 *
 * A lane runs only what its Dokan package offers. DOKAN_PLAN names the lane:
 *   unset        nothing is blocked (every other workflow and every local run)
 *   free         every Pro module is blocked
 *   <paid plan>  every module mapped in specModules.json that setup did not record as available in
 *                playwright/available-modules.json is blocked
 *
 * A spec is blocked when any module it needs is blocked. specModules.json maps a spec file or folder
 * (relative to tests/e2e or tests/api) to the module id(s) it needs; the most specific key wins, and an
 * unmapped spec is core and always runs. A single test inside a core spec that needs a module carries the
 * tag `@module-<id>` and is dropped through blockedTagPattern().
 */

'use strict';

const fs = require('fs');
const path = require('path');

const pwRoot = path.resolve(__dirname, '..');
/** @type {Record<'e2e' | 'api', Record<string, string | string[]>>} */
const specModules = require('./specModules.json');

/** @returns {string[]} module ids the plan under test does not offer */
function blockedModules() {
    const plan = process.env.DOKAN_PLAN;
    if (!plan) return [];
    const all = [...new Set([...Object.values(specModules.e2e), ...Object.values(specModules.api)].flat())];
    if (plan === 'free') return all;
    const file = path.join(pwRoot, 'playwright', 'available-modules.json');
    // Setup writes the file; before it has run (the setup projects themselves) nothing needs filtering.
    if (!fs.existsSync(file)) return [];
    /** @type {string[]} */
    const available = JSON.parse(fs.readFileSync(file, 'utf8'));
    return all.filter(id => !available.includes(id));
}

/**
 * @param {'e2e' | 'api'} kind
 * @param {string} file spec path relative to tests/<kind>, forward slashes
 * @returns {string[]} module ids the spec needs
 */
function specNeeds(kind, file) {
    const key = Object.keys(specModules[kind])
        .filter(k => k === file || (k.endsWith('/') && file.startsWith(k)))
        .sort((a, b) => b.length - a.length)[0];
    return key ? [specModules[kind][key] ?? []].flat() : [];
}

/**
 * @param {string} dir
 * @returns {string[]} spec paths relative to dir, forward slashes
 */
function walk(dir) {
    /** @type {string[]} */
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name)).map(f => `${entry.name}/${f}`));
        else if (entry.name.endsWith('.spec.ts')) out.push(entry.name);
    }
    return out;
}

/**
 * @param {'e2e' | 'api'} kind
 * @returns {{ file: string, modules: string[] }[]} specs left out for the plan, with the blocked modules each needs
 */
function blockedSpecs(kind) {
    const blocked = blockedModules();
    if (!blocked.length) return [];
    return walk(path.join(pwRoot, 'tests', kind))
        .map(file => ({ file, modules: specNeeds(kind, file).filter(id => blocked.includes(id)) }))
        .filter(spec => spec.modules.length);
}

/**
 * For setup code that seeds module data: true unless the plan under test leaves the module out.
 * @param {string} moduleId
 */
function planOffers(moduleId) {
    return !blockedModules().includes(moduleId);
}

/** @returns {RegExp | null} matches the `@module-<id>` tag of any blocked module */
function blockedTagPattern() {
    const blocked = blockedModules();
    return blocked.length ? new RegExp(`@module-(${blocked.join('|')})\\b`) : null;
}

module.exports = { blockedModules, specNeeds, blockedSpecs, blockedTagPattern, planOffers };
