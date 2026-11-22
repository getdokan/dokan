/*
 * Self-check for planFilter.js and its use in getShardSpecs.js. Run: node utils/planFilter.check.js
 * It writes playwright/available-modules.json for a moment and puts back whatever was there.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { blockedSpecs, blockedTagPattern } = require('./planFilter');

const pwRoot = path.resolve(__dirname, '..');
const availableFile = path.join(pwRoot, 'playwright', 'available-modules.json');
const saved = fs.existsSync(availableFile) ? fs.readFileSync(availableFile) : null;

/** @param {string | undefined} plan @param {string[] | null} available */
function as(plan, available) {
    process.env.DOKAN_PLAN = plan ?? '';
    fs.mkdirSync(path.dirname(availableFile), { recursive: true });
    if (available) fs.writeFileSync(availableFile, JSON.stringify(available));
    else fs.rmSync(availableFile, { force: true });
    return new Set(blockedSpecs('e2e').map(spec => spec.file));
}

try {
    assert.equal(as(undefined, null).size, 0, 'no plan: nothing blocked');

    let blocked = as('free', null);
    assert(blocked.has('vendor-auction/vendorAuction.spec.ts'), 'free: auction blocked');
    assert(!blocked.has('orders/orders.spec.ts'), 'free: core spec kept');

    blocked = as('starter', ['color_scheme_customizer', 'delivery_time', 'germanized', 'product_editor', 'vendor_support']);
    assert(!blocked.has('vendor-delivery-time/vendorDeliveryTime.spec.ts'), 'starter: delivery time kept');
    assert(blocked.has('vendor-booking/vendorBooking.spec.ts'), 'starter: booking blocked');
    assert(blocked.has('admin/adminStoreSupport.spec.ts'), 'starter: module spec in a core folder blocked');
    assert(!blocked.has('admin/adminVendors.spec.ts'), 'starter: core spec in the same folder kept');
    assert(blockedTagPattern()?.test('@module-booking'), 'starter: @module-booking tag dropped');
    assert(!blockedTagPattern()?.test('@module-delivery_time'), 'starter: @module-delivery_time tag kept');

    blocked = as('professional', ['stripe', 'product_subscription']);
    assert(!blocked.has('stripe-connect/stripeConnectCheckout.spec.ts'), 'professional: stripe folder kept');
    assert(blocked.has('stripe-connect/stripeConnectWcSubscriptions.spec.ts'), 'professional: file needing vsp blocked');

    as('starter', ['delivery_time']);
    const shard = execFileSync('node', [path.join(__dirname, 'getShardSpecs.js'), '1', '1'], { encoding: 'utf8' });
    assert(!shard.includes('tests/e2e/vendor-auction/'), 'getShardSpecs: blocked spec not in the shard list');
    assert(shard.includes('tests/e2e/vendor-delivery-time/'), 'getShardSpecs: available module spec in the shard list');
    /** @type {{ file: string, modules: string[] }[]} */
    const recorded = JSON.parse(fs.readFileSync(path.join(pwRoot, 'playwright', 'blocked-specs.json'), 'utf8'));
    assert(
        recorded.some(spec => spec.file === 'vendor-auction/vendorAuction.spec.ts' && spec.modules.includes('auction')),
        'getShardSpecs: blocked list written',
    );

    console.log('planFilter check passed');
} finally {
    if (saved) fs.writeFileSync(availableFile, saved);
    else fs.rmSync(availableFile, { force: true });
}
