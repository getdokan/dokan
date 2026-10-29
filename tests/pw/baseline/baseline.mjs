#!/usr/bin/env node
// Phase 0 risk baseline for the new-UI (React) suite.
//
//   node baseline/baseline.mjs [--days 180] [--pro ../../../dokan-pro]
//
// Risk = impact (business judgement, set in SURFACES) x likelihood (derived
// from git history: commits and fix commits touching the surface's source in
// the last N days, across dokan-lite and dokan-pro). Writes baseline/RISK-REGISTER.md.
// Coverage is listed as the specs that exercise the surface. Whether they hold
// a catching assertion per failure mode is judged by review, not by counting.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LITE = path.resolve(HERE, '../../..');
const E2E = path.join(HERE, '../tests/e2e');
const arg = (n, d) => (process.argv.includes(`--${n}`) ? process.argv[process.argv.indexOf(`--${n}`) + 1] : d);
const DAYS = Number(arg('days', 180));
const PRO = path.resolve(LITE, arg('pro', '../dokan-pro'));

// impact: 5 money/permissions/marketplace-wide, 4 vendor revenue flow, 3 feature breaks, 2 cosmetic/informational.
// lite/pro: source paths of the React surface. specs: e2e folders that drive it.
const SURFACES = [
    { name: 'Admin settings', kw: /setting/i, impact: 5, why: 'marketplace-wide config, commission, old/new sync', lite: ['src/admin/dashboard/pages/settings'], pro: [], specs: ['adminSettings'] },
    { name: 'Vendor withdraw', kw: /withdraw/i, impact: 5, why: 'payout amounts, balance, methods', lite: ['src/dashboard/withdraw', 'src/admin/dashboard/pages/withdraw'], pro: [], specs: ['withdraws'] },
    { name: 'Reverse withdrawal', kw: /reverse.withdraw/i, impact: 5, why: 'admin-owed balance, store blocking', lite: ['src/dashboard/reverse-withdraw', 'src/admin/dashboard/pages/reverse-withdrawal'], pro: [], specs: ['reverse-withdraws'] },
    { name: 'Vendor orders', kw: /order/i, impact: 5, why: 'order status, suborders, refunds, earnings', lite: ['src/dashboard/orders'], pro: [], specs: ['orders', 'manual-order'] },
    { name: 'Vendor subscription', kw: /subscription/i, impact: 5, why: 'billing, product limits, pack expiry', lite: [], pro: ['modules/subscription'], specs: ['vendor-subscriptions'] },
    { name: 'Vendor staff', kw: /staff/i, impact: 5, why: 'capability leaks across staff/vendor', lite: [], pro: ['modules/vendor-staff'], specs: ['vendor-staff'] },
    { name: 'Admin vendor create/edit', kw: /vendor (create|edit|single)|commission/i, impact: 4, why: 'per-vendor commission, payment info', lite: ['src/admin/dashboard/pages/vendor-create-edit', 'src/admin/dashboard/pages/vendors-single', 'src/admin/dashboard/pages/vendors.tsx'], pro: [], specs: ['admin/adminVendorCreate.spec.ts', 'admin/adminVendorEdit.spec.ts', 'admin/adminVendorSingle.spec.ts', 'admin/adminVendors.spec.ts'] },
    { name: 'Product editor', kw: /product.(editor|form)/i, impact: 4, why: 'product data, price, stock, types', lite: ['src/dashboard/product-editor'], pro: ['modules/product-editor'], specs: ['product-form-manager', 'vendor-products'] },
    { name: 'Vendor store settings', kw: /store.settings/i, impact: 4, why: 'store profile, payment, catalog mode', lite: ['src/dashboard/settings'], pro: [], specs: ['vendorStoreSettings'] },
    { name: 'Coupons', kw: /coupon/i, impact: 4, why: 'discount amounts, eligibility', lite: [], pro: ['src/frontend/coupons'], specs: ['coupons'] },
    { name: 'Shipping / table rate', kw: /shipping|table.rate/i, impact: 4, why: 'checkout shipping cost', lite: [], pro: ['modules/table-rate-shipping'], specs: ['vendor-shipping', 'table-rate-shipping'] },
    { name: 'Returns / RMA', kw: /rma|return|refund/i, impact: 4, why: 'refund amounts, warranty', lite: [], pro: ['modules/rma'], specs: ['vendor-return-request'] },
    { name: 'Products list', kw: /product.list|products? (list|table)/i, impact: 3, why: 'bulk actions, status, delete', lite: ['src/dashboard/products'], pro: [], specs: ['products'] },
    { name: 'Auction / booking', kw: /auction|booking/i, impact: 3, why: 'product-type specific pricing', lite: [], pro: ['modules/simple-auction', 'modules/booking'], specs: ['vendor-auction', 'vendor-booking'] },
    { name: 'Vendor verification', kw: /verification/i, impact: 3, why: 'gates selling, documents', lite: [], pro: ['modules/vendor-verification'], specs: ['vendor-verifications'] },
    { name: 'Request for quote', kw: /quote/i, impact: 3, why: 'quote to order conversion', lite: [], pro: ['modules/request-for-quotation'], specs: ['request-for-quotes'] },
    { name: 'Product add-ons', kw: /add.?on/i, impact: 3, why: 'add-on price at checkout', lite: [], pro: ['modules/product-addon'], specs: ['product-addons'] },
    { name: 'Product advertising', kw: /advertis/i, impact: 3, why: 'paid ad purchase', lite: [], pro: ['modules/product-adv'], specs: ['product-advertising'] },
    { name: 'Store support / reviews / QA', kw: /support|review|product.qa/i, impact: 2, why: 'customer communication', lite: [], pro: ['modules/store-support', 'modules/store-reviews', 'modules/product-qa'], specs: ['store-supports', 'store-reviews', 'product-qa', 'vendor-support'] },
    { name: 'Announcements / badges / social / SEO / followers', kw: /announcement|badge|social|seo|follow/i, impact: 2, why: 'informational', lite: [], pro: ['modules/seller-badge', 'modules/follow-store'], specs: ['announcements', 'seller-badges', 'social-linking', 'store-seo', 'follow-store'] },
    { name: 'Vendor dashboard home', kw: /dashboard (home|stats)|analytics/i, impact: 2, why: 'stats display', lite: ['src/vendor-dashboard'], pro: [], specs: ['dashboard'] },
];

const git = (repo, paths, extra = []) => {
    const existing = paths.filter((p) => fs.existsSync(path.join(repo, p)));
    if (!existing.length) return [];
    const out = execFileSync('git', ['-C', repo, 'log', `--since=${DAYS}.days`, '--no-merges', '--format=%s', ...extra, '--', ...existing], { encoding: 'utf8' });
    return out.split('\n').filter(Boolean);
};

// dokan-lite squashes history into release commits, so per-path churn
// undercounts lite surfaces. Fix commits matched by keyword across both whole
// repos (same window) fill that gap.
const isFix = (m) => /^(fix|hotfix)\b|\bbug\b|regression/i.test(m);
const allFixes = [...git(LITE, ['.']), ...(fs.existsSync(PRO) ? git(PRO, ['.']) : [])].filter(isFix);

const isNewUiSpec = (rel) => {
    if (/\/new[A-Z][^/]*\.spec\.ts$/.test(rel) || /^(adminSettings|vendorStoreSettings|admin)\//.test(rel)) return true;
    return /'@new-ui'/.test(fs.readFileSync(path.join(E2E, rel), 'utf8'));
};

const rows = SURFACES.map((s) => {
    const msgs = [...git(LITE, s.lite), ...(fs.existsSync(PRO) ? git(PRO, s.pro) : [])];
    const fixes = new Set([...msgs.filter(isFix), ...allFixes.filter((m) => s.kw.test(m))]).size;
    const specs = s.specs.flatMap((d) => {
        if (d.endsWith('.spec.ts')) return fs.existsSync(path.join(E2E, d)) ? [d] : [];
        const dir = path.join(E2E, d);
        return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.spec.ts')).map((f) => `${d}/${f}`) : [];
    }).filter(isNewUiSpec);
    return { ...s, commits: msgs.length, fixes, specs };
});

// Likelihood 1-5 by rank of (fixes weighted x2 + commits): change and past breakage predict future breakage.
const signal = (r) => r.fixes * 2 + r.commits;
const ranked = [...rows].sort((a, b) => signal(a) - signal(b));
for (const r of rows) r.likelihood = signal(r) === 0 ? 1 : 1 + Math.floor((ranked.indexOf(r) / rows.length) * 5);
for (const r of rows) {
    r.risk = r.impact * r.likelihood;
    // Impact 5 (money, permissions, marketplace-wide) never drops below P1: quiet history is not safety.
    r.tier = r.risk >= 16 ? 'P0' : r.risk >= 9 || r.impact === 5 ? 'P1' : 'P2';
}
rows.sort((a, b) => a.tier.localeCompare(b.tier) || b.risk - a.risk);

const L = [
    '# Risk register: new-UI (React) suite',
    '',
    `Generated ${new Date().toISOString().slice(0, 10)} by \`baseline/baseline.mjs\` (git window ${DAYS} days, pro repo ${fs.existsSync(PRO) ? 'found' : 'NOT found, pro likelihood understated'}).`,
    '',
    'Risk = impact x likelihood. P0 >= 16, P1 >= 9, else P2. Impact is business judgement (edit `SURFACES`); likelihood comes from commits and fix commits on the surface source.',
    '',
    '| Tier | Risk | Surface | Impact | Likelihood | Commits / fixes | Why it matters | Specs today |',
    '|---|---|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.tier} | ${r.risk} | ${r.name} | ${r.impact} | ${r.likelihood} | ${r.commits} / ${r.fixes} | ${r.why} | ${r.specs.length ? r.specs.join('<br>') : '**none**'} |`),
    '',
    '## Next (Phase 0b, per P0 surface)',
    '',
    'For each P0 surface, list its failure modes (wrong amount, wrong permission, lost data, broken old/new sync, broken cross-role flow) and mark whether an existing assertion would catch each one. Every uncaught failure mode is a gap. Fill the gaps before touching P1.',
    '',
];
fs.writeFileSync(path.join(HERE, 'RISK-REGISTER.md'), L.join('\n'));
console.log(L.slice(6, 6 + rows.length + 2).join('\n'));
