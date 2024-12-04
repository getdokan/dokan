import { test, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { assertOrderCalculation, assertParentOrderCalculation } from '@utils/calculationHelpers';

const { VENDOR_ID, VENDOR2_ID, CATEGORY_ID } = process.env;

test.use({ extraHTTPHeaders: payloads.adminAuth });

test.slow(true, 'all calculation tests are slow');

test.describe.serial('commission calculation test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTax, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.skip('calculation (debug)', { tag: ['@lite'] }, async () => {
        const orderId = '4100';
        const [orderResponse, orderResponseBody] = await apiUtils.getSingleOrder(orderId);
        await assertOrderCalculation([orderResponse, orderResponseBody, orderId]);
    });

    test('global commission fixed (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, admin_percentage: '10', additional_fee: '0' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('global commission fixed (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, admin_percentage: '0', additional_fee: '10' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('global commission fixed (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, admin_percentage: '10', additional_fee: '10' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('global commission category based (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '10', flat: '0' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('global commission category based (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '0', flat: '10' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('global commission category based (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '10', flat: '10' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('global commission specific category based (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '10', flat: '0' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('global commission specific category based (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '0', flat: '10' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('global commission specific category based (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, {
            ...dbData.dokan.sellingSettings,
            commission_type: 'category_based',
            commission_category_based_values: { ...dbData.dokan.sellingSettings.commission_category_based_values, items: { [CATEGORY_ID]: { percentage: '10', flat: '10' } } },
        });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), categories: [{ id: CATEGORY_ID }] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('vendorwise commission fixed (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '10', admin_additional_fee: '0' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('vendorwise commission fixed (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '0', admin_additional_fee: '10' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('vendorwise commission fixed (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '10', admin_additional_fee: '10' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('vendorwise commission category based (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '5', flat: '0' } } });
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission_type: 'category_based', admin_category_commission: { all: { percentage: '10', flat: '0' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('vendorwise commission category based (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '0', flat: '5' } } });
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission_type: 'category_based', admin_category_commission: { all: { percentage: '0', flat: '10' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('vendorwise commission category based (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'category_based', commission_category_based_values: { all: { percentage: '5', flat: '5' } } });
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission_type: 'category_based', admin_category_commission: { all: { percentage: '10', flat: '10' } } });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('vendorwise commission specific category based (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, {
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
        await assertOrderCalculation(order);
    });

    test('vendorwise commission specific category based (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, {
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
        await assertOrderCalculation(order);
    });

    test('vendorwise commission specific category based (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, {
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
        await assertOrderCalculation(order);
    });

    test('productwise commission fixed (only percentage)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '5', admin_additional_fee: '0' });
        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), meta_data: [...payloads.createProduct().meta_data, ...payloads.productCommissionOnlyPercent] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('productwise commission fixed (only flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '0', admin_additional_fee: '5' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), meta_data: [...payloads.createProduct().meta_data, ...payloads.productCommissionOnlyFixed] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('productwise commission fixed (both percentage & flat)', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '5', admin_additional_fee: '5' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder({ ...payloads.createProduct(), meta_data: [...payloads.createProduct().meta_data, ...payloads.productCommissionBothPercentageAndFixed] }, payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });
});

test.describe.serial('fee recipient calculation test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTax, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('fee recipient: shippingFee=seller, shippingTax=seller, productTax=seller', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller', tax_fee_recipient: 'seller', shipping_tax_fee_recipient: 'seller' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('fee recipient: shippingFee=seller, shippingTax=seller, productTax=admin', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller', tax_fee_recipient: 'seller', shipping_tax_fee_recipient: 'admin' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('fee recipient: shippingFee=seller, shippingTax=admin, productTax=seller', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller', tax_fee_recipient: 'admin', shipping_tax_fee_recipient: 'seller' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('fee recipient: shippingFee=seller, shippingTax=admin, productTax=admin', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller', tax_fee_recipient: 'admin', shipping_tax_fee_recipient: 'admin' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('fee recipient: shippingFee=admin, shippingTax=seller, productTax=seller', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin', tax_fee_recipient: 'seller', shipping_tax_fee_recipient: 'seller' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('fee recipient: shippingFee=admin, shippingTax=seller, productTax=admin', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin', tax_fee_recipient: 'seller', shipping_tax_fee_recipient: 'admin' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('fee recipient: shippingFee=admin, shippingTax=admin, productTax=seller', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin', tax_fee_recipient: 'admin', shipping_tax_fee_recipient: 'seller' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('fee recipient: shippingFee=admin, shippingTax=admin, productTax=admin', { tag: ['@lite'] }, async () => {
        // set order condition
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin', tax_fee_recipient: 'admin', shipping_tax_fee_recipient: 'admin' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });
});

// todo: vendor coupon tests [skipped wc order api doesn't support vendor coupon]
test.describe.serial('marketplace coupon calculation test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTax, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
        await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'no' });
    });

    test('marketplace coupon: single coupon', { tag: ['@lite'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('marketplace coupon: multiple coupon', { tag: ['@lite'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const [, , code2] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'no' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }, { code: code2 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('marketplace coupon: multiple coupon non-sequential', { tag: ['@lite'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const [, , code2] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'no' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }, { code: code2 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('marketplace coupon: multiple coupon sequential', { tag: ['@lite'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const [, , code2] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'yes' });

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }, { code: code2 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('marketplace coupon: percent coupon', { tag: ['@lite'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('marketplace coupon: fixed_cart coupon', { tag: ['@lite'] }, async () => {
        const [, , code1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'fixed_cart' }, payloads.adminAuth);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }] }, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });
});

test.describe.serial('tax calculation test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTax, { ...payloads.createTaxRate, rate: '10' });
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.exclusive);
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.exclusive);
        await apiUtils.dispose();
    });

    test('tax: exclusive', { tag: ['@lite'] }, async () => {
        // set order condition
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.exclusive);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('tax: inclusive', { tag: ['@lite'] }, async () => {
        // set order condition
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.inclusive);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('tax: exclusive round (tax at subtotal level)', { tag: ['@lite'] }, async () => {
        // set order condition
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.exclusive);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('tax: inclusive (tax at subtotal level)', { tag: ['@lite'] }, async () => {
        // set order condition
        await apiUtils.updateBatchWcSettingsOptions('tax', payloads.tax.inclusive);

        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });
});

test.describe.serial('product quantity calculation test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTax, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('product quantity: single', { tag: ['@lite'] }, async () => {
        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('product quantity: multiple', { tag: ['@lite'] }, async () => {
        // set order condition
        const [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        const lineItems = [{ product_id: productId, quantity: payloads.randomNumber }];

        // place order and assert order calculation
        const order = await apiUtils.createOrderWc({ ...payloads.createOrder, line_items: lineItems });
        await assertOrderCalculation(order);
    });
});

test.describe.serial('product variety calculation test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTax, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('product variety: single', { tag: ['@lite'] }, async () => {
        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('product variety: multiple', { tag: ['@lite'] }, async () => {
        // set order condition
        const lineItems = await apiUtils.createLineItems(2);

        // place order and assert order calculation
        const order = await apiUtils.createOrderWc({ ...payloads.createOrder, line_items: lineItems });
        await assertOrderCalculation(order);
    });
});

test.describe.serial('product owner calculation test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.setUpTaxRate(payloads.enableTax, { ...payloads.createTaxRate, rate: '10' });
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        const store = await apiUtils.getSingleStore(VENDOR_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
        const store2 = await apiUtils.getSingleStore(VENDOR2_ID);
        await apiUtils.updateStore(VENDOR_ID, { ...store2, ...payloads.vendorwiseCommission, admin_commission: '', admin_additional_fee: '' });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('product owner: single vendor', { tag: ['@lite'] }, async () => {
        // place order and assert order calculation
        const order = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        await assertOrderCalculation(order);
    });

    test('product owner: multivendor', { tag: ['@lite'] }, async () => {
        // set order condition
        const lineItems = await apiUtils.createLineItems(2, [1], [payloads.vendorAuth, payloads.vendor2Auth]);

        // place order and assert order calculation
        const [, parentOrder, parentOrderId] = await apiUtils.createOrderWc({ ...payloads.createOrder, line_items: lineItems });

        // get child order ids
        const childOrderIds = await dbUtils.getChildOrderIds(parentOrderId);

        // console.log('parentOrderId:', parentOrderId, 'childOrderIds:', childOrderIds);

        const allChildOrderDetails = [];
        for (const childOrderId of childOrderIds) {
            const [orderResponse, orderResponseBody] = await apiUtils.getSingleOrder(childOrderId);
            const childOrderDetails = await assertOrderCalculation([orderResponse, orderResponseBody, childOrderId]);
            allChildOrderDetails.push(childOrderDetails);
        }

        await assertParentOrderCalculation(parentOrder, allChildOrderDetails, parentOrderId, childOrderIds);
    });
});
