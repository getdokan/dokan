import { test, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { assertOrderCalculation } from '@utils/calculationHelpers';
const { VENDOR_ID, CATEGORY_ID } = process.env;

test.use({ extraHTTPHeaders: { Authorization: payloads.adminAuth.Authorization } });

test.describe('commission test', () => {
    // TODO: update whole suite for single vendor and multiple vendor, single
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTaxRate, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.skip('calculation (debug)', { tag: ['@lite'] }, async () => {
        const orderId = '3528';
        const [orderResponse, orderResponsebody] = await apiUtils.getSingleOrder(orderId);
        // console.log(orderResponsebody);
        await assertOrderCalculation([orderResponse, orderResponsebody, orderId], { percentage: '10', flat: '0' });
    });

    test('global commission fixed (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, admin_percentage: '10', additional_fee: '0' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('global commission fixed (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, admin_percentage: '0', additional_fee: '10' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '0', flat: '10' });
    });

    test('global commission fixed (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, admin_percentage: '10', additional_fee: '10' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '10' });
    });

    test('global commission category based (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '10', flat: '0' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('global commission category based (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '0', flat: '10' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '0', flat: '10' });
    });

    test('global commission category based (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '10', flat: '10' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '10' });
    });

    test('global commission specific category based (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '10', flat: '0' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('global commission specific category based (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '0', flat: '10' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '0', flat: '10' });
    });

    test('global commission specific category based (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '10', flat: '10' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '10' });
    });

    test('vendorwise commission fixed (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '10', admin_additional_fee: '0' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('vendorwise commission fixed (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '0', admin_additional_fee: '10' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '0', flat: '10' });
    });

    test('vendorwise commission fixed (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '10', admin_additional_fee: '10' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '10' });
    });

    test('vendorwise commission category based (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '5', flat: '0' } } });
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission_type: 'category_based', admin_category_commission: { all: { percentage: '10', flat: '0' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('vendorwise commission category based (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '0', flat: '5' } } });
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission_type: 'category_based', admin_category_commission: { all: { percentage: '0', flat: '10' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '0', flat: '10' });
    });

    test('vendorwise commission category based (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '5', flat: '5' } } });
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission_type: 'category_based', admin_category_commission: { all: { percentage: '10', flat: '10' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '10' });
    });

    test('vendorwise commission specific category based (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '5', flat: '0' } } },
        });
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, {
            ...store,
            ...payloads.vendorwiseCommission,
            admin_commission_type: 'category_based',
            admin_category_commission: { ...payloads.vendorwiseCommission.admin_category_commission, items: { [CATEGORY_ID]: { percentage: '10', flat: '0' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('vendorwise commission specific category based (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '0', flat: '5' } } },
        });
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, {
            ...store,
            ...payloads.vendorwiseCommission,
            admin_commission_type: 'category_based',
            admin_category_commission: { ...payloads.vendorwiseCommission.admin_category_commission, items: { [CATEGORY_ID]: { percentage: '0', flat: '10' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '0', flat: '10' });
    });

    test('vendorwise commission specific category based (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '5', flat: '5' } } },
        });

        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, {
            ...store,
            ...payloads.vendorwiseCommission,
            admin_commission_type: 'category_based',
            admin_category_commission: { ...payloads.vendorwiseCommission.admin_category_commission, items: { [CATEGORY_ID]: { percentage: '10', flat: '10' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '10' });
    });

    test('productwise commission fixed (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '5', admin_additional_fee: '0' });
        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), meta_data: [...payloads.createProduct().meta_data, ...payloads.productCommissionOnlyPercent] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('productwise commission fixed (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '0', admin_additional_fee: '5' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), meta_data: [...payloads.createProduct().meta_data, ...payloads.productCommissionOnlyFixed] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '0', flat: '10' });
    });

    test('productwise commission fixed (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '5', admin_additional_fee: '5' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), meta_data: [...payloads.createProduct().meta_data, ...payloads.productCommissionBothPercentageAndFixed] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '10' });
    });
});

test.describe('fee receipient test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTaxRate, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('fee receipient test: shippingFee=seller, shippingTax=seller, productTax=seller', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller', tax_fee_recipient: 'seller', shipping_tax_fee_recipient: 'seller' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('fee receipient test: shippingFee=seller, shippingTax=seller, productTax=admin', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller', tax_fee_recipient: 'seller', shipping_tax_fee_recipient: 'admin' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('fee receipient test: shippingFee=seller, shippingTax=admin, productTax=seller', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller', tax_fee_recipient: 'admin', shipping_tax_fee_recipient: 'seller' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('fee receipient test: shippingFee=seller, shippingTax=admin, productTax=admin', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller', tax_fee_recipient: 'admin', shipping_tax_fee_recipient: 'admin' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('fee receipient test: shippingFee=admin, shippingTax=seller, productTax=seller', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin', tax_fee_recipient: 'seller', shipping_tax_fee_recipient: 'seller' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('fee receipient test: shippingFee=admin, shippingTax=seller, productTax=admin', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin', tax_fee_recipient: 'seller', shipping_tax_fee_recipient: 'admin' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('fee receipient test: shippingFee=admin, shippingTax=admin, productTax=seller', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin', tax_fee_recipient: 'admin', shipping_tax_fee_recipient: 'seller' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('fee receipient test: shippingFee=admin, shippingTax=admin, productTax=admin', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin', tax_fee_recipient: 'admin', shipping_tax_fee_recipient: 'admin' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });
});

test.describe('marketplace coupon test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTaxRate, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
        await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'no' });
    });

    test('marketplace coupon calculation test: single coupon', { tag: ['@pro'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('marketplace coupon calculation test: multiple coupon', { tag: ['@pro'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const [, , code2] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'no' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }, { code: code2 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('marketplace coupon calculation test: multiple coupon nonsequential', { tag: ['@pro'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const [, , code2] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'no' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }, { code: code2 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('marketplace coupon calculation test: multiple coupon sequential', { tag: ['@pro'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const [, , code2] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'yes' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }, { code: code2 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('marketplace coupon calculation test: percent coupon', { tag: ['@pro'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('marketplace coupon calculation test: fixed_cart coupon', { tag: ['@pro'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'fixed_cart' }, payloads.adminAuth);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });
});

test.describe('tax test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTaxRate, { ...payloads.createTaxRate, rate: '10' });
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.exclusive);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.exclusive);
        await apiUtils.dispose();
    });

    test('tax test: exclusive', { tag: ['@lite'] }, async () => {
        // set order condition
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.exclusive);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('tax test: inclusive', { tag: ['@lite'] }, async () => {
        // set order condition
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.inclusive);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('tax test: exclusive round (tax at subtotal level)', { tag: ['@lite'] }, async () => {
        // set order condition
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.exclusive);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });

    test('tax test: inclusive (tax at subtotal level)', { tag: ['@lite'] }, async () => {
        // set order condition
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.inclusive);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order, { percentage: '10', flat: '0' });
    });
});
