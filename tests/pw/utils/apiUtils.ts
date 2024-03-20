import { expect, Request, APIRequestContext, APIResponse } from '@playwright/test';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { helpers } from '@utils/helpers';
import fs from 'fs';
import { auth, user_api, taxRate, coupon_api, marketPlaceCoupon, reqOptions, params, headers, storageState, responseBody } from '@utils/interfaces';

const { VENDOR_ID, CUSTOMER_ID } = process.env;

export class ApiUtils {
    readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    /**
     * Authentication methods
     */

    // get basic auth
    getBasicAuth(user: user_api): string {
        const basicAuth = 'Basic ' + Buffer.from(user.username + ':' + user.password).toString('base64');
        return basicAuth;
    }

    /**
     * request methods
     */

    // get request
    async get(url: string, options?: reqOptions | undefined, ...args: any[]): Promise<[APIResponse, responseBody]> {
        const assert = args.length ? Boolean(args[0]) : true;
        const response = await this.request.get(url, options);
        const responseBody = await this.getResponseBody(response, assert);
        return [response, responseBody];
    }

    // post request
    async post(url: string, options?: reqOptions | undefined, ...args: any[]): Promise<[APIResponse, responseBody]> {
        const assert = args.length ? Boolean(args[0]) : true;
        const response = await this.request.post(url, options);
        const responseBody = await this.getResponseBody(response, assert);
        return [response, responseBody];
    }

    // put request
    async put(url: string, options?: reqOptions | undefined, ...args: any[]): Promise<[APIResponse, responseBody]> {
        const assert = args.length ? Boolean(args[0]) : true;
        const response = await this.request.put(url, options);
        const responseBody = await this.getResponseBody(response, assert);
        return [response, responseBody];
    }

    // patch request
    async patch(url: string, options?: reqOptions | undefined, ...args: any[]): Promise<[APIResponse, responseBody]> {
        const assert = args.length ? Boolean(args[0]) : true;
        const response = await this.request.patch(url, options);
        const responseBody = await this.getResponseBody(response, assert);
        return [response, responseBody];
    }

    // delete request
    async delete(url: string, options?: reqOptions | undefined, ...args: any[]): Promise<[APIResponse, responseBody]> {
        const assert = args.length ? Boolean(args[0]) : true;
        const response = await this.request.delete(url, options);
        const responseBody = await this.getResponseBody(response, assert);
        return [response, responseBody];
    }

    // fetch request
    async fetch(urlOrRequest: string | Request, options?: reqOptions | undefined, ...args: any[]): Promise<[APIResponse, responseBody]> {
        const assert = args.length ? Boolean(args[0]) : true;
        const response = await this.request.fetch(urlOrRequest, options);
        const responseBody = await this.getResponseBody(response, assert);
        return [response, responseBody];
    }

    // head request
    async head(url: string, options?: reqOptions | undefined): Promise<APIResponse> {
        const response = await this.request.head(url, options);
        return response;
    }

    // dispose api request context
    async dispose(): Promise<void> {
        await this.request.dispose();
    }

    // get storageState
    async storageState(path?: string | undefined): Promise<storageState> {
        return await this.request.storageState({ path: path });
    }

    // get responseBody
    async getResponseBody(response: APIResponse, assert = true): Promise<responseBody> {
        try {
            assert && expect(response.ok()).toBeTruthy();
            const responseBody = response.status() !== 204 && (await response.json()); // 204 is for No Content

            // console log responseBody if response code is not between 200-299
            String(response.status())[0] != '2' && console.log('ResponseBody: ', responseBody);
            return responseBody;
        } catch (err: any) {
            console.log('End-point: ', response.url());
            console.log('Status Code: ', response.status());
            console.log('Response text: ', await response.text());
            console.log('Error: ', err.message); // todo: showing playwright error message instead of api error message
            // console.log('header:', response.headers());
            // console.log('header:', response.headersArray());
        }
    }

    // get site headers
    async getSiteHeaders(url: string): Promise<headers> {
        const response = await this.head(url);
        const headers = response.headers();
        return headers;
    }

    /**
     * dokan api utility methods
     */

    /**
     * dummy data api methods
     */

    // import dummy data
    async importDummyData(payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.importDummyData, { data: payload, headers: auth });
        return responseBody;
    }

    // clear dummy data
    async clearDummyData(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.clearDummyData, { headers: auth });
        return responseBody;
    }

    /**
     * store api methods
     */

    // get all stores
    async getAllStores(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllStores, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single store
    async getSingleStore(sellerId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getSingleStore(sellerId), { headers: auth });
        return responseBody;
    }

    // get sellerId
    async getSellerId(storeName?: string, auth?: auth): Promise<string> {
        if (arguments.length === 1 && typeof storeName === 'object') {
            auth = storeName as auth;
            storeName = undefined;
        }

        const allStores = await this.getAllStores(auth);
        const sellerId = storeName ? allStores.find((o: { store_name: string }) => o.store_name.toLowerCase() === storeName!.toLowerCase())?.id : allStores[0]?.id;
        return sellerId;
    }

    // create store
    async createStore(payload: any, auth?: auth, addUserAddress: boolean = false): Promise<[responseBody, string, string]> {
        const [response, responseBody] = await this.post(endPoints.createStore, { data: payload, headers: auth }, false);
        let sellerId: string;
        let storeName: string;
        if (responseBody.code) {
            expect(response.status()).toBe(500);

            // get store id if already exists
            sellerId = await this.getSellerId(payload.store_name, auth);
            storeName = payload.store_name;

            // update store if already exists
            await this.updateStore(sellerId, payload, auth);
        } else {
            expect(response.ok()).toBeTruthy();
            sellerId = String(responseBody?.id);
            storeName = String(responseBody?.store_name);
        }

        // add vendor user address
        addUserAddress && (await this.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth));

        return [responseBody, sellerId, storeName];
    }

    // update store
    async updateStore(storeId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.updateStore(storeId), { data: payload, headers: auth });
        return responseBody;
    }

    // delete all stores
    async deleteAllStores(auth?: auth): Promise<responseBody> {
        // todo: apply multiple optional parameter (implement from deleteAllProducts)
        const allStores = await this.getAllStores(auth);
        if (!allStores?.length) {
            console.log('No store exists');
            return;
        }
        const allStoreIds = allStores.map((o: { id: unknown }) => o.id);
        const [, responseBody] = await this.put(endPoints.updateBatchStores, { data: { delete: allStoreIds }, headers: payloads.adminAuth });
        return responseBody;
    }

    // create store review
    async createStoreReview(sellerId: string, payload: object, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.createStoreReview(sellerId), { data: payload, headers: auth });
        const reviewId = String(responseBody?.id);
        return [responseBody, reviewId];
    }

    /**
     * follow store methods
     */

    // follow un-follow store
    async followUnfollowStore(sellerId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.followUnfollowStore, { data: { vendor_id: Number(sellerId) }, headers: auth });
        return responseBody;
    }

    /**
     * product api methods
     */

    // get all products
    async getAllProducts(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllProducts, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single product
    async getSingleProduct(productId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getSingleProduct(productId), { headers: auth });
        return responseBody;
    }

    // get productId
    async getProductId(productName?: string, auth?: auth): Promise<string> {
        if (arguments.length === 1 && typeof productName === 'object') {
            auth = productName as auth;
            productName = undefined;
        }

        const allProducts = await this.getAllProducts(auth);
        const productId = productName ? allProducts.find((o: { name: string }) => o.name.toLowerCase() === productName!.toLowerCase())?.id : allProducts[0]?.id;
        return productId;
    }

    // create product
    async createProduct(payload: object, auth?: auth): Promise<[responseBody, string, string]> {
        const [, responseBody] = await this.post(endPoints.createProduct, { data: payload, headers: auth });
        const productId = String(responseBody?.id);
        const productName = String(responseBody?.name);
        return [responseBody, productId, productName];
    }

    // delete product
    async deleteProduct(productId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.deleteProduct(productId), { headers: auth });
        return responseBody;
    }

    // delete all products
    async deleteAllProducts(productName?: any, auth?: auth): Promise<responseBody> {
        if (arguments.length === 1 && typeof productName === 'object') {
            auth = productName as auth;
            productName = undefined;
        }
        const allProducts = await this.getAllProducts(auth);
        if (!allProducts?.length) {
            console.log('No product exists');
            return;
        }

        let allProductIds: string[];
        if (productName) {
            // get all product ids with same name
            allProductIds = allProducts.filter((o: { name: unknown }) => o.name === productName).map((o: { id: unknown }) => o.id);
        } else {
            // get all product ids
            allProductIds = allProducts.map((o: { id: unknown }) => o.id);
        }
        const [, responseBody] = await this.put(endPoints.wc.updateBatchProducts, { data: { delete: allProductIds }, headers: payloads.adminAuth });
        return responseBody;
    }

    // get product exists or not
    async checkProductExistence(productName: string, auth?: auth): Promise<string | boolean> {
        const allProducts = await this.getAllProductsWc(auth);
        const res = allProducts.find((o: { name: string }) => o.name.toLowerCase() === productName.toLowerCase())?.id ?? false;
        return res;
    }

    /**
     * product variation api methods
     */

    // get variationIds
    async getVariationIds(productId: string, auth?: auth): Promise<string[]> {
        const [, responseBody] = await this.get(endPoints.getAllProductVariations(productId), { headers: auth });
        const variationIds = responseBody.map((o: { id: unknown }) => o.id);
        console.log(variationIds);
        return variationIds;
    }

    // create product variation
    async createProductVariation(productId: string, payload: object, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.createProductVariation(productId), { data: payload, headers: auth });
        const variationId = String(responseBody?.id);
        return [responseBody, variationId];
    }

    // get variationId
    async createVariableProductWithVariation(attribute: object, attributeTerm: object, product: any, auth?: auth): Promise<[string, string]> {
        const [, productId] = await this.createProduct(product, auth);
        const [body, attributeId] = await this.createAttributeTerm(attribute, attributeTerm, auth);
        const payload = { ...product, attributes: [{ id: attributeId, visible: true, variation: true, option: body.name }] }; // todo: need to fix
        const [, variationId] = await this.createProductVariation(productId, payload, auth);
        return [productId, variationId];
    }

    /**
     * attribute api methods
     */

    // get all attributes
    async getAllAttributes(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllAttributes, { headers: auth });
        return responseBody;
    }

    // get single attribute
    async getSingleAttribute(attributeId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getSingleAttribute(attributeId), { headers: auth });
        return responseBody;
    }

    // get attributeId
    async getAttributeId(auth?: auth): Promise<string> {
        const allAttributes = await this.getAllAttributes(auth);
        const attributeId = allAttributes[0]?.id;
        return attributeId;
    }

    // create attribute
    async createAttribute(payload: object, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.createAttribute, { data: payload, headers: auth });
        const attributeId = String(responseBody?.id);
        return [responseBody, attributeId];
    }

    // update batch attributes
    async updateBatchAttributes(action: string, allIds: string[], auth?: auth): Promise<[APIResponse, responseBody]> {
        if (!allIds?.length) {
            allIds = (await this.getAllAttributes(auth)).map((a: { id: unknown }) => a.id);
        }
        const [response, responseBody] = await this.post(endPoints.wc.updateBatchAttributes, { data: { [action]: allIds }, headers: auth });
        return [response, responseBody];
    }

    /**
     * attribute term api methods
     */

    // get all attribute terms
    async getAllAttributeTerms(attributeId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllAttributeTerms(attributeId), { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single attribute term
    async getSingleAttributeTerm(attributeId: string, attributeTermId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId), { headers: auth });
        return responseBody;
    }

    // create attribute term
    async createAttributeTerm(attribute: any, attributeTerm: object, auth?: auth): Promise<[responseBody, string, string]> {
        let attributeId: string;
        typeof attribute === 'object' ? ([, attributeId] = await this.createAttribute(attribute, auth)) : (attributeId = attribute);
        const [, responseBody] = await this.post(endPoints.createAttributeTerm(attributeId), { data: attributeTerm, headers: auth });
        const attributeTermId = String(responseBody?.id);
        return [responseBody, attributeId, attributeTermId];
    }

    /**
     * coupon api methods
     */

    // get all coupons
    async getAllCoupons(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllCoupons, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get couponId
    async getCouponId(couponCode?: string, auth?: auth): Promise<string> {
        if (arguments.length === 1 && typeof couponCode === 'object') {
            auth = couponCode as auth;
            couponCode = undefined;
        }

        const allCoupons = await this.getAllCoupons(auth);
        const couponId = couponCode ? allCoupons.find((o: { code: string }) => o.code.toLowerCase() === couponCode!.toLowerCase())?.id : allCoupons[0]?.id;
        return couponId;
    }

    // create coupon
    async createCoupon(productIds: (string | undefined)[], coupon: coupon_api, auth?: auth): Promise<[responseBody, string, string]> {
        // create product if invalid productId exists
        if (productIds.includes(undefined)) {
            const [, productId] = await this.createProduct(payloads.createProduct(), auth);
            productIds = [productId];
        }
        const [response, responseBody] = await this.post(endPoints.createCoupon, { data: { ...coupon, product_ids: productIds }, headers: auth }, false);
        let couponId: string;
        let couponCode: string;
        if (responseBody.code === 'woocommerce_rest_coupon_code_already_exists') {
            expect(response.status()).toBe(400);

            // get coupon id if already exists
            couponId = await this.getCouponId(coupon.code, auth);
            couponCode = coupon.code;

            // update coupon if already exists
            await this.updateCoupon(couponId, { ...coupon, product_ids: productIds }, auth);
        } else {
            expect(response.ok()).toBeTruthy();
            couponId = String(responseBody?.id);
            couponCode = String(responseBody?.code);
        }
        return [responseBody, couponId, couponCode];
    }

    // update coupon
    async updateCoupon(couponId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.updateCoupon(couponId), { data: payload, headers: auth });
        return responseBody;
    }

    // get marketplace couponId
    async getMarketPlaceCouponId(couponCode?: string, auth?: auth): Promise<string> {
        if (arguments.length === 1 && typeof couponCode === 'object') {
            auth = couponCode as auth;
            couponCode = undefined;
        }

        const [, allCoupons] = await this.get(endPoints.wc.getAllCoupons, { params: { per_page: 100 }, headers: auth });
        const couponId = couponCode ? allCoupons.find((o: { code: string }) => o.code.toLowerCase() === couponCode!.toLowerCase())?.id : allCoupons[0]?.id;
        return couponId;
    }

    // create marketplace coupon
    async createMarketPlaceCoupon(coupon: marketPlaceCoupon, auth?: auth): Promise<[responseBody, string, string, string]> {
        const [response, responseBody] = await this.post(endPoints.wc.createCoupon, { data: coupon, headers: auth }, false);
        let couponId: string;
        let couponCode: string;
        if (responseBody.code === 'woocommerce_rest_coupon_code_already_exists') {
            expect(response.status()).toBe(400);
            // get coupon id if already exists
            couponId = await this.getMarketPlaceCouponId(coupon.code, auth);
            couponCode = coupon.code;

            // update coupon if already exists
            await this.updateCoupon(couponId, coupon, auth);
        } else {
            expect(response.ok()).toBeTruthy();
            couponId = String(responseBody?.id);
            couponCode = String(responseBody?.code);
        }
        return [responseBody, couponId, couponCode, coupon.amount];
    }

    // update marketplace coupon
    async updateMarketPlaceCoupon(couponId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.wc.updateCoupon(couponId), { data: payload, headers: auth });
        return responseBody;
    }

    /**
     * withdraw api methods
     */

    // get balance and minimum withdraw limit
    async getMinimumWithdrawLimit(auth?: auth): Promise<[string, string]> {
        const [, responseBody] = await this.get(endPoints.getBalanceDetails, { headers: auth });
        const currentBalance = String(Math.abs(responseBody.current_balance));
        const minimumWithdrawLimit = String(Math.abs(responseBody.withdraw_limit));
        return [currentBalance, minimumWithdrawLimit];
    }

    // get all withdraws
    async getAllWithdraws(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllWithdraws, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get all withdraws by status
    async getAllWithdrawsByStatus(status: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllWithdraws, { params: { per_page: 100, status: status }, headers: auth });
        return responseBody;
    }

    // get withdrawId
    async getWithdrawId(auth?: auth): Promise<string> {
        const allWithdraws = await this.getAllWithdrawsByStatus('pending', auth);
        const withdrawId = allWithdraws[0]?.id;
        return withdrawId;
    }

    // create withdraw
    async createWithdraw(payload: object, auth?: auth): Promise<[responseBody, string]> {
        const [response, responseBody] = await this.post(endPoints.createWithdraw, { data: payload, headers: auth }, false);
        let withdrawId: string;
        if (responseBody.code) {
            expect(response.status()).toBe(400);

            // get withdraw id if already exists
            withdrawId = await this.getWithdrawId(auth);
        } else {
            expect(response.ok()).toBeTruthy();
            withdrawId = String(responseBody?.id);
        }
        return [responseBody, withdrawId];
    }

    // cancel withdraw
    async cancelWithdraw(withdrawId: string, auth?: auth): Promise<responseBody> {
        if (!withdrawId) {
            withdrawId = await this.getWithdrawId(auth);
            if (!withdrawId) {
                console.log('No withdraw id exists');
                return;
            }
        }
        const [, responseBody] = await this.delete(endPoints.cancelWithdraw(withdrawId), { headers: payloads.adminAuth });
        return responseBody;
    }

    /**
     * order api methods
     */

    // get all orders [of a vendor]
    async getAllOrders(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllOrders, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single order
    async getSingleOrder(orderId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getSingleOrder(orderId), { headers: auth });
        return responseBody;
    }

    // get orderId
    async getOrderId(auth?: auth): Promise<string> {
        const allOrders = await this.getAllOrders(auth);
        const orderId = allOrders[0]?.id;
        return orderId;
    }

    // update order status
    async updateOrderStatus(orderId: string, orderStatus: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.updateOrder(orderId), { data: { status: orderStatus }, headers: auth });
        return responseBody;
    }

    // get order key
    async getOrderKey(orderId: string): Promise<string> {
        const [, responseBody] = await this.getSingleOrder(orderId, payloads.adminAuth);
        const orderKey = responseBody?.order_key;
        return orderKey;
    }

    /**
     * order notes api methods
     */

    // create order note
    async createOrderNote(product: string | object, order: object | string, orderNote: object, auth?: auth): Promise<[responseBody, string, string]> {
        let orderId: string;
        typeof order === 'object' ? ([, , orderId] = await this.createOrder(product, order, auth)) : (orderId = order);
        const [, responseBody] = await this.post(endPoints.createOrderNote(orderId), { data: orderNote, headers: auth });
        const orderNoteId = String(responseBody?.id);
        return [responseBody, orderId, orderNoteId];
    }

    /**
     * admin api methods
     */

    // get admin report summary
    async getAdminReportSummary(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAdminReportSummary, { headers: auth });
        return responseBody;
    }

    // get all order logs
    async getAllOrderLogs(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAdminLogs, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single order log
    async getSingleOrderLog(orderId: string, auth?: auth) {
        const allOrderLogs = await this.getAllOrderLogs(auth);
        const singleOrderLog = allOrderLogs.find((o: { order_id: string }) => o.order_id.toLowerCase() === orderId.toLowerCase());
        return singleOrderLog;
    }

    /**
     * refund api methods
     */

    // get all refunds
    async getAllRefunds(status: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllRefunds, { params: { per_page: 100, status: status }, headers: auth });
        return responseBody;
    }

    // get refundId
    async getRefundId(status: string, auth?: auth): Promise<string> {
        const allRefunds = await this.getAllRefunds(status, auth);
        const refundId = allRefunds[0]?.id;
        return refundId;
    }

    /**
     * dokan settings api methods
     */

    // get store settings
    async getStoreSettings(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getSettings, { headers: auth });
        return responseBody;
    }

    // set store settings
    async setStoreSettings(payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.updateSettings, { data: payload, headers: auth });
        return responseBody;
    }

    /**
     * support ticket api methods
     */

    // get all support tickets
    async getAllSupportTickets(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllSupportTickets, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get support ticket Id
    async getSupportTicketId(auth?: auth): Promise<[string, string]> {
        const allSupportTickets = await this.getAllSupportTickets(auth);
        const supportTicketId = allSupportTickets[0]?.id;
        const sellerId = allSupportTickets[0]?.vendor_id;
        return [supportTicketId, sellerId];
    }

    // create support ticket
    async createSupportTicket(payload: object): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.wp.createCustomPost('dokan_store_support'), { data: payload, headers: payloads.adminAuth });
        const supportTicketId = String(responseBody?.id);
        return [responseBody, supportTicketId];
    }

    // create support ticket comment
    async createSupportTicketComment(supportTicketId: string, payload: object, auth?: auth): Promise<responseBody> {
        if (!supportTicketId) {
            [supportTicketId] = await this.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, store_id: VENDOR_ID });
        }
        const [, responseBody] = await this.post(endPoints.createSupportTicketComment(supportTicketId), { data: payload, headers: auth });
        return responseBody;
    }

    // update support ticket status
    async updateSupportTicketStatus(supportTicketId: string, status: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: { status }, headers: auth });
        return responseBody;
    }

    // update support ticket email notification
    async updateSupportTicketEmailNotification(supportTicketId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.updateSupportTicketEmailNotification(supportTicketId), { data: payload, headers: auth });
        return responseBody;
    }

    /**
     * reverse withdrawal api methods
     */

    // get all reverse withdrawal stores
    async getAllReverseWithdrawalStores(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllReverseWithdrawalStores, { headers: auth });
        return responseBody;
    }

    // get reverse withdrawal storeId
    async getReverseWithdrawalStoreId(auth?: auth): Promise<string> {
        const allReverseWithdrawalStores = await this.getAllReverseWithdrawalStores(auth);
        const reverseWithdrawalStoreId = allReverseWithdrawalStores[0]?.id;
        return reverseWithdrawalStoreId;
    }

    // get reverseWithdrawal payment productId
    async getReverseWithdrawalProductId(auth?: auth): Promise<string> {
        const productId = await this.getProductId('Reverse Withdrawal Payment', auth);
        return productId;
    }

    /**
     * module  api methods
     */

    // get all modules
    async getAllModules(params = {}, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllModules, { params: params, headers: auth });
        return responseBody;
    }

    // get all moduleIds
    async getAllModuleIds(params = {}, auth?: auth): Promise<string[]> {
        const allModules = await this.getAllModules(params, auth);
        const allModuleIds = allModules.map((o: { id: unknown }) => o.id);
        return allModuleIds;
    }

    // get activate modules
    async activateModules(moduleIds: string[], auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.activateModule, { data: { module: moduleIds }, headers: auth });
        return responseBody;
    }

    // get deactivated modules
    async deactivateModules(moduleIds: string[], auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.deactivateModule, { data: { module: moduleIds }, headers: auth });
        return responseBody;
    }

    /**
     * customers api methods [woocommerce endpoint used instead of request-for-quote/customer ]
     */

    // get all customers
    async getAllCustomers(auth?: auth): Promise<responseBody> {
        const [, responseBody1] = await this.get(endPoints.wc.getAllCustomers, { params: { per_page: 100 }, headers: auth });
        const [, responseBody2] = await this.get(endPoints.wc.getAllCustomers, { params: { per_page: 100, role: 'subscriber' }, headers: auth }); // todo: those customers who is currently subscriber: remove after dokan fix
        const responseBody = [...responseBody1, ...responseBody2];
        return responseBody;
    }

    // get customerId
    async getCustomerId(username?: string, auth?: auth): Promise<string> {
        if (arguments.length === 1 && typeof username === 'object') {
            auth = username as auth;
            username = undefined;
        }

        const allCustomers = await this.getAllCustomers(auth);
        const customerId = username ? allCustomers.find((o: { username: string }) => o.username.toLowerCase() === username!.toLowerCase())?.id : allCustomers[0]?.id;
        return customerId;
    }

    // create customer
    async createCustomer(payload: any, auth?: auth): Promise<[responseBody, string]> {
        const [response, responseBody] = await this.post(endPoints.wc.createCustomer, { data: payload, headers: auth }, false);
        let customerId: string;
        if (responseBody.code) {
            expect(response.status()).toBe(400);

            // get customer id if already exists
            customerId = await this.getCustomerId(payload.username, auth);

            // update customer if already exists
            await this.updateCustomer(customerId, payload, auth);
        } else {
            expect(response.ok()).toBeTruthy();
            customerId = String(responseBody?.id);
        }
        return [responseBody, customerId];
    }

    // update customer
    async updateCustomer(customerId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.wc.updateCustomer(customerId), { data: payload, headers: auth });
        return responseBody;
    }

    // delete customer
    async deleteCustomer(userId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.wc.deleteCustomer(userId), { headers: auth });
        return responseBody;
    }

    // delete all customers
    async deleteAllCustomers(auth?: auth): Promise<responseBody> {
        // todo: apply multiple optional parameter
        const allCustomers = await this.getAllCustomers(auth);
        if (!allCustomers?.length) {
            console.log('No customer exists');
            return;
        }
        const allCustomersIds = allCustomers.map((o: { id: unknown }) => o.id);
        const [, responseBody] = await this.put(endPoints.updateBatchCustomers, { data: { delete: allCustomersIds }, headers: payloads.adminAuth });
        return responseBody;
    }

    /**
     * wholesale customers api methods
     */

    // get all wholesale customers
    async getAllWholesaleCustomers(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllWholesaleCustomers, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // create a wholesale customer
    async createWholesaleCustomer(payload: string | object, auth?: auth): Promise<[responseBody, string]> {
        let customerId: string;
        typeof payload === 'object' ? ([, customerId] = await this.createCustomer(payload, auth)) : (customerId = payload);
        const [, responseBody] = await this.post(endPoints.createWholesaleCustomer, { data: { id: String(customerId) }, headers: auth });
        return [responseBody, customerId];
    }

    /**
     * product advertisement api methods
     */

    // get all product advertisements
    async getAllProductAdvertisements(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllProductAdvertisements, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // create a product advertisement
    async createProductAdvertisement(product: object, auth?: auth): Promise<[responseBody, string, string]> {
        const [body, productId] = await this.createProduct(product, auth);
        const sellerId = body.store.id;
        const [, responseBody] = await this.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId }, headers: payloads.adminAuth });
        const advertisementId = String(responseBody?.id);
        const advertisedProduct = responseBody?.product_title;
        return [responseBody, advertisementId, advertisedProduct];
    }

    /**
     * abuse report api methods
     */

    // get all abuse reports
    async getAllAbuseReports(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllAbuseReports, { headers: auth });
        return responseBody;
    }

    // get abuse report Id
    async getAbuseReportId(auth?: auth): Promise<string> {
        const allAbuseReports = await this.getAllAbuseReports(auth);
        const abuseReportId = allAbuseReports[0]?.id;
        return abuseReportId;
    }

    // delete all abuse reports
    async deleteAllAbuseReports(auth?: auth): Promise<responseBody> {
        const allAbuseReports = await this.getAllAbuseReports(auth);
        if (!allAbuseReports?.length) {
            console.log('No abuse report exists');
            return;
        }
        const allAbuseReportIds = allAbuseReports.map((o: { id: unknown }) => o.id);
        const [, responseBody] = await this.delete(endPoints.deleteBatchAbuseReports, { data: { items: allAbuseReportIds }, headers: auth });
        return responseBody;
    }

    /**
     * announcements api methods
     */

    // get all announcements
    async getAllAnnouncements(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllAnnouncements, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single announcement
    async getSingleAnnouncement(announcementId: string, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.get(endPoints.getSingleAnnouncement(announcementId), { headers: auth });
        const noticeId = responseBody?.notice_id;
        return [responseBody, noticeId];
    }

    // get announcement notice Id
    async getAnnouncementNoticeId(auth?: auth): Promise<string> {
        const allAnnouncements = await this.getAllAnnouncements(auth);
        const noticeId = allAnnouncements[0]?.notice_id;
        return noticeId;
    }

    // create announcement
    async createAnnouncement(payload: object, auth?: auth): Promise<[responseBody, string, string]> {
        const [, responseBody] = await this.post(endPoints.createAnnouncement, { data: payload, headers: auth });
        const announcementId = String(responseBody?.id);
        const announcementTitle = String(responseBody?.title);
        return [responseBody, announcementId, announcementTitle];
    }

    // delete announcement
    async deleteAnnouncement(announcementId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.deleteAnnouncement(announcementId), { headers: auth });
        return responseBody;
    }

    // update batch announcements
    async updateBatchAnnouncements(action: string, allIds: string[], auth?: auth): Promise<responseBody> {
        if (!allIds?.length) {
            allIds = (await this.getAllAnnouncements(auth)).map((a: { id: unknown }) => a.id);
        }
        const [, responseBody] = await this.put(endPoints.updateBatchAnnouncements, { data: { [action]: allIds }, headers: auth });
        return responseBody;
    }

    // delete all announcements
    async deleteAllAnnouncements(auth?: auth): Promise<responseBody> {
        const allAnnouncemens = await this.getAllAnnouncements(auth);
        if (!allAnnouncemens?.length) {
            console.log('No announcement exists');
            return;
        }
        const allAnnouncementIds = allAnnouncemens.map((o: { id: unknown }) => o.id);
        await this.updateBatchAnnouncements('delete', allAnnouncementIds, auth);
    }

    /**
     * product reviews api methods
     */

    // get all product reviews
    async getAllProductReviews(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllProductReviews, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get product review id
    async getProductReviewId(auth?: auth): Promise<string> {
        const allProductReviews = await this.getAllProductReviews(auth);
        const reviewId = allProductReviews[0]?.id;
        return reviewId;
    }

    /**
     * store reviews api methods
     */

    // get all store reviews
    async getAllStoreReviews(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllStoreReviews, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get store review id
    async getStoreReviewId(auth?: auth): Promise<string> {
        const allStoreReviews = await this.getAllStoreReviews(auth);
        const reviewId = allStoreReviews[0]?.id;
        return reviewId;
    }

    // delete store review
    async deleteStoreReview(reviewId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.deleteStoreReview(reviewId), { headers: auth });
        return responseBody;
    }

    // update batch store reviews
    async updateBatchStoreReviews(action: string, allIds: string[], auth?: auth): Promise<responseBody> {
        if (!allIds?.length) {
            allIds = (await this.getAllStoreReviews(auth)).map((a: { id: unknown }) => a.id);
        }
        const [, responseBody] = await this.put(endPoints.updateBatchStoreReviews, { data: { [action]: allIds }, headers: auth });
        return responseBody;
    }

    /**
     * store categories api methods
     */

    // get all store categories
    async getAllStoreCategories(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllStoreCategories, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get store category Id
    async getStoreCategoryId(StoreCategoryName?: string, auth?: auth): Promise<string> {
        if (arguments.length === 1 && typeof StoreCategoryName === 'object') {
            auth = StoreCategoryName as auth;
            StoreCategoryName = undefined;
        }

        const allStoreCategories = await this.getAllStoreCategories(auth);
        const storeCategoryId = StoreCategoryName ? allStoreCategories.find((o: { name: string }) => o.name.toLowerCase() === StoreCategoryName!.toLowerCase())?.id : allStoreCategories[0]?.id;
        return storeCategoryId;
    }

    // create store category
    async createStoreCategory(payload: object, auth?: auth): Promise<[responseBody, string, string]> {
        const [, responseBody] = await this.post(endPoints.createStoreCategory, { data: payload, headers: auth });
        const categoryId = String(responseBody?.id);
        const categoryName = String(responseBody?.name);
        return [responseBody, categoryId, categoryName];
    }

    // get default store category
    async getDefaultStoreCategory(auth?: auth): Promise<[responseBody, number]> {
        const [, responseBody] = await this.get(endPoints.getDefaultStoreCategory, { headers: auth });
        const categoryId = responseBody?.id;
        return [responseBody, categoryId];
    }

    // set default store category
    async setDefaultStoreCategory(category: string | number, auth?: auth): Promise<responseBody> {
        const categoryId = typeof category === 'string' ? await this.getStoreCategoryId(category, auth) : category;
        const [, responseBody] = await this.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId }, headers: auth });
        return responseBody;
    }

    /**
     * quote rules api methods
     */

    // get all quote rules
    async getAllQuoteRules(params: params = { per_page: 100 }, auth?: auth): Promise<responseBody> {
        if (arguments.length === 1 && 'Authorization' in params) {
            auth = params as auth;
            params = undefined;
        }
        const [, responseBody] = await this.get(endPoints.getAllQuoteRules, { params, headers: auth });
        return responseBody;
    }

    // create quote rule
    async createQuoteRule(payload: object, auth?: auth): Promise<[responseBody, string, string]> {
        const [, responseBody] = await this.post(endPoints.createQuoteRule, { data: payload, headers: auth });
        const quoteRuleId = String(responseBody?.id);
        const quoteRuleName = responseBody?.rule_name;
        return [responseBody, quoteRuleId, quoteRuleName];
    }

    // delete quote rule
    async deleteQuoteRule(quoteRuleId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.deleteQuoteRule(quoteRuleId), { headers: auth });
        return responseBody;
    }

    // delete all quote rules
    async deleteAllQuoteRules(auth?: auth): Promise<responseBody> {
        const allQuoteRules = await this.getAllQuoteRules(auth);
        if (!allQuoteRules?.length) {
            console.log('No quote rule exists');
            return;
        }
        const allQuoteRuleIds = allQuoteRules.map((o: { id: unknown }) => o.id);
        const [, responseBody] = await this.put(endPoints.updateBatchQuoteRules, { data: { trash: allQuoteRuleIds }, headers: auth });
        return responseBody;
    }

    // delete all quote rules trashed
    async deleteAllQuoteRulesTrashed(auth?: auth): Promise<responseBody> {
        const allQuoteRules = await this.getAllQuoteRules({ status: 'trash', per_page: 100 }, auth);
        if (!allQuoteRules?.length) {
            console.log('No quote rule exists');
            return;
        }
        const allQuoteRuleIds = allQuoteRules.map((o: { id: unknown }) => o.id);
        const [, responseBody] = await this.put(endPoints.updateBatchQuoteRules, { data: { delete: allQuoteRuleIds }, headers: auth });
        return responseBody;
    }

    /**
     * quote requests api methods
     */

    // get all quote requests
    async getAllQuoteRequests(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllQuoteRequests, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // create quote request
    async createQuoteRequest(payload: object, auth?: auth): Promise<[responseBody, string, string]> {
        const [, responseBody] = await this.post(endPoints.createQuoteRequest, { data: payload, headers: auth });
        const quoteId = String(responseBody[0]?.data?.id);
        const quoteTitle = String(responseBody[0]?.data?.title);
        return [responseBody, quoteId, quoteTitle];
    }

    // delete quote request
    async deleteQuoteRequest(quoteRuleId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.deleteQuoteRequest(quoteRuleId), { headers: auth });
        return responseBody;
    }

    // delete all quote requests
    async deleteAllQuoteRequests(auth?: auth): Promise<responseBody> {
        const allQuotes = await this.getAllQuoteRequests(auth);
        if (!allQuotes?.length) {
            console.log('No quote request exists');
            return;
        }
        const allQuoteIds = allQuotes.map((o: { id: unknown }) => o.id);
        const [, responseBody] = await this.put(endPoints.updateBatchRequestQuotes, { data: { trash: allQuoteIds }, headers: auth });
        return responseBody;
    }

    // convert quote to order
    async convertQuoteToOrder(quoteId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.convertRequestQuoteToOrder, { data: { status: 'converted', quote_id: quoteId }, headers: auth });
        return responseBody;
    }

    /**
     * order downloads api methods
     */

    // get all order download
    async getAllOrderDownloads(orderId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllOrderDownloads(orderId), { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // create order download
    async createOrderDownload(orderId: string, downloadableProducts: string[], auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.createOrderDownload(orderId), { data: { ids: downloadableProducts }, headers: auth });
        const downloadId = String(Object.keys(responseBody)[0]);
        return [responseBody, downloadId];
    }

    /**
     * seller badge api methods
     */

    // get all seller badges
    async getAllSellerBadges(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllSellerBadges, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get seller badgeId
    async getSellerBadgeId(eventType: string, auth?: auth): Promise<string> {
        const allBadges = await this.getAllSellerBadges(auth);
        const badgeId = allBadges.find((o: { event_type: string }) => o.event_type.toLowerCase() === eventType.toLowerCase())?.id;
        return badgeId;
    }

    // create seller badge
    async createSellerBadge(payload: any, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.createSellerBadge, { data: payload, headers: auth }, false);
        const badgeId = responseBody.code === 'invalid-event-type' ? await this.getSellerBadgeId(payload.event_type, auth) : responseBody?.id;
        return [responseBody, badgeId];
    }

    // update batch seller badges
    async updateBatchSellerBadges(action: string, allIds: string[], auth?: auth): Promise<responseBody> {
        if (!allIds?.length) {
            allIds = (await this.getAllSellerBadges(auth)).map((a: { id: unknown }) => a.id);
        }
        const [, responseBody] = await this.put(endPoints.updateBatchSellerBadges, { data: { ids: allIds, action: action }, headers: auth });
        return responseBody;
    }

    // delete seller badge
    async deleteSellerBadge(badgeId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.deleteSellerBadge(badgeId), { headers: auth });
        return responseBody;
    }

    // delete all seller badges
    async deleteAllSellerBadges(auth?: auth): Promise<void> {
        const allBadges = await this.getAllSellerBadges(auth);
        if (!allBadges?.length) {
            console.log('No seller badge exists');
            return;
        }
        const allBadgeIds = allBadges.map((o: { id: unknown }) => o.id);
        await this.updateBatchSellerBadges('delete', allBadgeIds, auth);
    }

    /**
     * vendor staff api methods
     */

    // get all vendor staffs
    async getAllVendorStaffs(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllVendorStaffs, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get staffId
    async getStaffId(username: string, auth?: auth): Promise<string> {
        const allStaffs = await this.getAllVendorStaffs(auth);
        const staffId = allStaffs.find((o: { user_login: string }) => o.user_login.toLowerCase() === username.toLowerCase())?.id;
        return staffId;
    }

    // create vendor staff
    async createVendorStaff(payload: any, auth?: auth): Promise<[responseBody, string]> {
        const [response, responseBody] = await this.post(endPoints.createVendorStaff, { data: payload, headers: auth }, false);
        let staffId: string;
        if (responseBody.code) {
            expect(response.status()).toBe(500);
            // get staff id if already exists
            staffId = await this.getStaffId(payload.username, auth);

            // update staff if already exists
            await this.updateStaff(staffId, payload, auth);
        } else {
            expect(response.ok()).toBeTruthy();
            staffId = String(responseBody?.ID);
        }
        return [responseBody, staffId];
    }

    // update staff
    async updateStaff(staffId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.updateVendorStaff(staffId), { data: payload, headers: auth });
        return responseBody;
    }

    /**
     * spmv api methods
     */

    // add spmv product to store
    async addSpmvProductToStore(productId: string, auth?: auth): Promise<[APIResponse, responseBody]> {
        const [response, responseBody] = await this.post(endPoints.addToStore, { data: { product_id: productId }, headers: auth }, false);
        if (responseBody.code) {
            expect(response.status()).toBe(500);
        } else {
            expect(response.ok()).toBeTruthy();
        }
        return [response, responseBody];
    }

    /**
     * product questions answers
     */

    // get all product questions
    async getAllProductQuestions(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.getAllProductQuestions, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // create product question
    async createProductQuestion(payload: object, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.createProductQuestion, { data: payload, headers: auth });
        const questionId = String(responseBody?.id);
        return [responseBody, questionId];
    }

    // update product question
    async updateProductQuestion(questionId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.updateProductQuestion(questionId), { data: payload, headers: auth });
        return responseBody;
    }

    // delete all product questions
    async deleteAllProductQuestions(auth?: auth): Promise<responseBody> {
        const allProductQuestions = await this.getAllProductQuestions();
        if (!allProductQuestions?.length) {
            console.log('No product question exists');
            return;
        }
        const allProductQuestionIds = allProductQuestions.map((o: { id: unknown }) => o.id);
        // console.log(allProductQuestionIds);
        const [, responseBody] = await this.put(endPoints.updateBatchProductQuestions, { data: { action: 'delete', ids: allProductQuestionIds }, headers: auth });
        return responseBody;
    }

    // create product question answer
    async createProductQuestionAnswer(payload: object, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.createProductQuestionAnswer, { data: payload, headers: auth });
        const answerId = String(responseBody?.id);
        return [responseBody, answerId];
    }

    /**
     * wp api methods
     */

    // settings

    // get site settings
    async getSiteSettings(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wp.getSiteSettings, { headers: auth });
        return responseBody;
    }

    // set site settings
    async setSiteSettings(payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.wp.setSiteSettings, { data: payload, headers: auth });
        return responseBody;
    }

    // wp users

    // get all users
    async getAllUsers(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wp.getAllUsers, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get user by role
    async getAllUsersByRole(roles: string[], auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wp.getAllUsers, { params: { per_page: 100, roles: roles }, headers: auth });
        return responseBody;
    }

    // get current user
    async getCurrentUser(auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.get(endPoints.wp.getCurrentUser, { headers: auth });
        const userId = String(responseBody?.id);
        return [responseBody, userId];
    }

    // get user by-id
    async getUserById(userId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wp.getUserById(userId), { headers: auth });
        return responseBody;
    }

    // get user id
    async getUserId(fullName: string, auth?: auth): Promise<responseBody> {
        const allUsers = await this.getAllUsers(auth);
        const userId = allUsers.find((o: { name: string }) => o.name.toLowerCase() === fullName!.toLowerCase())?.id;
        return userId;
    }

    // create user
    async createUser(payload: object, auth?: auth): Promise<responseBody> {
        // administrator,  customer, seller
        const [, responseBody] = await this.post(endPoints.wp.createUser, { data: payload, headers: auth });
        return responseBody;
    }

    // update user
    async updateUser(userId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.wp.updateUser(userId), { data: payload, headers: auth });
        return responseBody;
    }

    // delete user
    async deleteUser(userId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.wp.deleteUser(userId), { headers: auth });
        return responseBody;
    }

    // plugins

    // get all plugins
    async getAllPlugins(params = {}, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wp.getAllPlugins, { params: { ...params, per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single plugin
    async getSinglePlugin(plugin: string, auth?: auth): Promise<[responseBody, string, string]> {
        const [response, responseBody] = await this.get(endPoints.wp.getSinglePlugin(plugin), { headers: auth }, false);
        if (responseBody.code) {
            expect(response.status()).toBe(404);
            return [responseBody, plugin, 'not exists'];
        }
        const name = String(responseBody.name);
        const status = String(responseBody.status);
        return [responseBody, name, status];
    }

    // update plugin
    async updatePlugin(plugin: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.wp.updatePlugin(plugin), { data: payload, headers: auth });
        return responseBody;
    }

    // delete plugin
    async deletePlugin(plugin: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.wp.deletePlugin(plugin), { headers: auth });
        return responseBody;
    }

    // get plugin active or not
    async checkPluginsExistence(plugins: string[], auth?: auth): Promise<boolean> {
        const existingPlugins = (await this.getAllPlugins({}, auth)).map((a: { plugin: string }) => a.plugin.split('/')[1]);
        return helpers.isSubArray(existingPlugins, plugins);
    }

    // get plugin active or not
    async pluginsActiveOrNot(plugins: string[], auth?: auth): Promise<boolean> {
        const activePlugins = (await this.getAllPlugins({ status: 'active' }, auth)).map((a: { plugin: string }) => a.plugin.split('/')[1]);
        return helpers.isSubArray(activePlugins, plugins);
    }

    // media

    // upload media
    async uploadMedia(filePath: string, mimeType: string, auth: auth): Promise<[responseBody, string]> {
        const payload = {
            headers: {
                Accept: '*/*',
                ContentType: 'multipart/form-data',
                Authorization: auth.Authorization,
            },
            multipart: {
                file: {
                    name: String(filePath.split('/').pop()),
                    mimeType: mimeType,
                    buffer: fs.readFileSync(filePath),
                },
            },
        };
        const [, responseBody] = await this.post(endPoints.wp.createMediaItem, payload);
        const mediaId = String(responseBody?.id);
        return [responseBody, mediaId];
    }

    // upload file
    async uploadFile(filePath: string, auth: auth): Promise<[responseBody, string]> {
        const payload = fs.readFileSync(filePath);
        const headers = {
            'content-disposition': `attachment; filename=${String(filePath.split('/').pop())}`,
            Authorization: auth.Authorization,
        };
        const [, responseBody] = await this.post(endPoints.wp.createMediaItem, { data: payload, headers: headers });
        const mediaId = String(responseBody?.id);
        return [responseBody, mediaId];
    }

    // get all mediaItems
    async getAllMediaItems(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wp.getAllMediaItems, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get mediaItemId
    async getMediaItemId(auth?: auth): Promise<string> {
        const getAllMediaItems = await this.getAllMediaItems(auth);
        const mediaId = getAllMediaItems[0]?.id;
        return mediaId;
    }

    // delete all media items
    async deleteAllMediaItems(auth?: auth) {
        const allMediaItems = await this.getAllMediaItems(auth);
        if (!allMediaItems?.length) {
            console.log('No media item exists');
            return;
        }
        const allMediaItemIds = allMediaItems.map((o: { id: unknown }) => o.id);
        for (const mediaId of allMediaItemIds) {
            await this.delete(endPoints.wp.deleteMediaItem(mediaId), { params: payloads.paramsForceDelete, headers: auth });
        }
    }

    // create post
    async createPost(payload: object, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.wp.createPost, { data: payload, headers: auth });
        const postId = String(responseBody?.id);
        return [responseBody, postId];
    }

    // get all pages
    async getAllPages(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wp.getAllPages, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single page
    async getSinglePage(pageId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wp.getSinglePage(pageId), { headers: auth });
        return responseBody;
    }

    // get pageId
    async getPageId(pageSlug: string, auth?: auth): Promise<string> {
        const allPages = await this.getAllPages(auth);
        const pageId = allPages.find((o: { slug: string }) => o.slug.toLowerCase() === pageSlug.toLowerCase())?.id;
        return pageId;
    }

    // create page
    async createPage(payload: object, auth?: auth): Promise<[responseBody, string]> {
        let pageId = await this.getPageId(helpers.slugify(payloads.tocPage.title), payloads.adminAuth);
        let responseBody;
        if (!pageId) {
            [, responseBody] = await this.post(endPoints.wp.createPage, { data: payload, headers: auth });
            pageId = String(responseBody?.id);
        } else {
            responseBody = await this.getSinglePage(pageId, auth);
        }
        return [responseBody, pageId];
    }

    /**
     * woocommerce  api methods
     */

    // settings

    // get all woocommerce setting options
    async getAllWcSettings(groupId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllSettingOptions(groupId), { headers: auth });
        return responseBody;
    }

    // get single woocommerce setting options
    async getSingleWcSettingOptions(groupId: string, optionId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getSingleSettingOption(groupId, optionId), { headers: auth });
        return responseBody;
    }

    // update single woocommerce setting options
    async updateSingleWcSettingOptions(groupId: string, optionId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.wc.updateSingleSettingOption(groupId, optionId), { data: payload, headers: auth });
        return responseBody;
    }

    // update batch woocommerce settings options
    async updateBatchWcSettingsOptions(groupId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.wc.updateBatchSettingOptions(groupId), { data: payload, headers: auth });
        return responseBody;
    }

    // reviews

    // create product review
    async createProductReview(payload: string | object, review: object, auth?: auth): Promise<[responseBody, string, string]> {
        let productId: string;
        typeof payload === 'object' ? ([, productId] = await this.createProduct(payload, auth)) : (productId = payload);
        //todo: check if product exists with that id follow: createOrder
        const [, responseBody] = await this.post(endPoints.wc.createReview, { data: { ...review, product_id: productId }, headers: auth });
        const reviewId = String(responseBody?.id);
        const reviewMessage = String(responseBody?.review);
        return [responseBody, reviewId, reviewMessage];
    }

    // categories

    // get all categories
    async getAllCategories(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllCategories, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // get single category
    async getSingleCategory(categoryId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getSingleCategory(categoryId), { headers: auth });
        return responseBody;
    }

    // get categoryId
    async getCategoryId(categoryName: string, auth?: auth): Promise<string> {
        const allCategories = await this.getAllCategories(auth);
        const categoryId = categoryName ? allCategories.find((o: { name: string }) => o.name === categoryName.toLowerCase())?.id : allCategories[0]?.id;
        return categoryId;
    }

    // create category
    async createCategory(payload: object, auth?: auth): Promise<[responseBody, string, string]> {
        const [, responseBody] = await this.post(endPoints.wc.createCategory, { data: payload, headers: auth });
        const categoryId = String(responseBody?.id);
        const categoryName = String(responseBody?.name);
        return [responseBody, categoryId, categoryName];
    }

    // update category
    async updateCategory(categoryId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.wc.updateCategory(categoryId), { data: payload, headers: auth });
        return responseBody;
    }

    // delete category
    async deleteCategory(categoryId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.wc.deleteCategory(categoryId), { headers: auth });
        return responseBody;
    }

    // update batch categories
    async updateBatchCategories(action: string, allIds: string[], auth?: auth): Promise<[APIResponse, responseBody]> {
        if (!allIds?.length) {
            allIds = (await this.getAllCategories(auth)).map((a: { id: unknown }) => a.id);
        }
        const [response, responseBody] = await this.post(endPoints.wc.updateBatchCategories, { data: { [action]: allIds }, headers: auth });
        return [response, responseBody];
    }

    // product

    // get all products
    async getAllProductsWc(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllProducts, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // order

    // get all site orders
    async getAllOrdersSite(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllOrders, { params: { per_page: 100 }, headers: auth });
        return responseBody;
    }

    // create order
    async createOrder(product: string | object, orderPayload: any, auth?: auth): Promise<[APIResponse, responseBody, string, string]> {
        let productId: string;
        // if (!product) {
        //     [, productId] = await this.createProduct(payloads.createProduct(), auth);
        // } else {
        //     typeof product === 'object' ? ([, productId] = await this.createProduct(product, auth)) : (productId = product);
        // } //todo: have to resolve invalid id form env issue

        if (!product) {
            [, productId] = await this.createProduct(payloads.createProduct(), auth);
        } else {
            if (typeof product === 'object') {
                [, productId] = await this.createProduct(product, auth);
            } else {
                const responseBody = await this.getSingleProduct(product, payloads.adminAuth);
                if (responseBody.code === 'dokan_rest_invalid_product_id') {
                    [, productId] = await this.createProduct(payloads.createProduct(), auth);
                } else {
                    productId = product;
                }
            }
        }
        // Set the product ID in the order payload
        const payload = orderPayload;
        payload.line_items[0].product_id = productId;

        // Post the order and return the results // Todo: add comment for all methods
        const [response, responseBody] = await this.post(endPoints.wc.createOrder, { data: payload, headers: payloads.adminAuth }, false);
        const orderId = String(responseBody?.id);
        return [response, responseBody, orderId, productId];
    }

    // create order with status
    async createOrderWithStatus(product: string | object, order: any, status: string, auth?: auth): Promise<[APIResponse, responseBody, string, string]> {
        const [response, responseBody, orderId, productId] = await this.createOrder(product, order, auth);
        await this.updateOrderStatus(orderId, status, auth);
        return [response, responseBody, orderId, productId];
    }

    // refund

    // create refund
    async createRefund(orderId: string, refund: object, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.wc.createRefund(orderId), { data: refund, headers: auth });
        const refundId = String(responseBody?.id);
        return [responseBody, refundId];
    }

    // tax

    // get all tax rate
    async getAllTaxRates(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllTaxRates, { headers: auth });
        return responseBody;
    }

    // create tax rate
    async createTaxRate(payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.wc.createTaxRate, { data: payload, headers: auth });
        return responseBody;
    }

    // update batch tax rates
    async updateBatchTaxRates(action: string, allIds: string[], auth?: auth): Promise<responseBody> {
        if (!allIds?.length) {
            allIds = (await this.getAllTaxRates(auth)).map((a: { id: unknown }) => a.id);
        }
        const [, responseBody] = await this.put(endPoints.wc.updateBatchTaxRates, { data: { [action]: allIds }, headers: auth });
        return responseBody;
    }

    // setup tax
    async setUpTaxRate(enableTaxPayload: object, taxPayload: taxRate, auth?: auth): Promise<number> {
        // enable tax rate
        await this.updateBatchWcSettingsOptions('general', enableTaxPayload, auth);

        // delete previous tax rates
        const allTaxRateIds = (await this.getAllTaxRates(auth)).map((o: { id: unknown }) => o.id);
        if (allTaxRateIds.length) {
            await this.updateBatchTaxRates('delete', allTaxRateIds, auth);
        }

        // create tax rate
        const taxRateResponse = await this.createTaxRate(taxPayload, auth);
        expect(parseInt(taxRateResponse.rate)).toBe(parseInt(taxPayload.rate));
        return Number(taxPayload.rate);
    }

    // shipping

    // get all shipping zones
    async getAllShippingZones(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllShippingZones, { headers: auth });
        return responseBody;
    }

    // get zoneId
    async getZoneId(zoneName: string, auth?: auth): Promise<string> {
        const allZones = await this.getAllShippingZones(auth);
        const zoneId = allZones.find((o: { name: string }) => o.name.toLowerCase() === zoneName.toLowerCase())?.id;
        return zoneId;
    }

    // create shipping zone
    async createShippingZone(payload: object, auth?: auth): Promise<[responseBody, string]> {
        const [, responseBody] = await this.post(endPoints.wc.createShippingZone, { data: payload, headers: auth });
        const shippingZoneId = String(responseBody?.id);
        return [responseBody, shippingZoneId];
    }

    // delete shipping zone
    async deleteShippingZone(zoneId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.wc.deleteShippingZone(zoneId), { params: { force: true }, headers: auth });
        return responseBody;
    }

    // get all shipping zone locations
    async getAllShippingZoneLocations(zoneId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllShippingZoneLocations(zoneId), { headers: auth });
        return responseBody;
    }

    // add shipping zone location
    async addShippingZoneLocation(zoneId: string, zoneLocation: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.wc.addShippingZoneLocation(zoneId), { data: zoneLocation, headers: auth });
        return responseBody;
    }

    // get all shipping zone methods
    async getAllShippingZoneMethods(zoneId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllShippingZoneMethods(zoneId), { headers: auth });
        return responseBody;
    }

    // add shipping zone method
    async addShippingZoneMethod(zoneId: string, zoneMethod: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.post(endPoints.wc.addShippingZoneMethod(zoneId), { data: zoneMethod, headers: auth });
        return responseBody;
    }

    // payment

    // get all payment gateway
    async getAllPaymentGateways(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getAllPaymentGateways, { headers: auth });
        return responseBody;
    }

    // get single payment gateway
    async getSinglePaymentGateway(paymentGatewayId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.getSinglePaymentGateway(paymentGatewayId), { headers: auth });
        return responseBody;
    }

    // update payment gateway
    async updatePaymentGateway(paymentGatewayId: string, payload: object, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.put(endPoints.wc.updatePaymentGateway(paymentGatewayId), { data: payload, headers: auth });
        return responseBody;
    }

    /**
     * woocommerce booking  api methods
     */

    // create product
    async createBookableProduct(payload: object, auth?: auth): Promise<[responseBody, string, string]> {
        const [, responseBody] = await this.post(endPoints.wc.booking.createBookableProduct, { data: payload, headers: auth });
        const productId = String(responseBody?.id);
        const productName = String(responseBody.name);
        return [responseBody, productId, productName];
    }

    // get system status
    async getSystemStatus(auth?: auth): Promise<[responseBody, object]> {
        const [, responseBody] = await this.get(endPoints.wc.getAllSystemStatus, { headers: auth });
        const activePlugins = responseBody.active_plugins.map((a: { plugin: string; version: string }) => a.plugin.split('/')[0] + ' v' + a.version);
        activePlugins.sort();
        const compactInfo = {
            wpVersion: 'WordPress Version: ' + responseBody?.environment.wp_version,
            phpVersion: 'PHP Version: ' + responseBody?.environment.php_version,
            mysqlVersion: 'MySql Version: ' + responseBody?.environment.mysql_version,
            theme: 'Theme: ' + responseBody?.theme.name + ' v' + responseBody?.theme.version,
            wpDebugMode: 'Debug Mode: ' + responseBody?.environment.wp_debug_mode,
            activePlugins: activePlugins,
        };
        return [responseBody, compactInfo];
    }

    // get order details
    orderDetails(responseBody: responseBody) {
        const orderDetails = {
            id: responseBody.id,
            status: responseBody.status,
            order: {
                total: responseBody.total,
            },
            tax: {
                prices_include_tax: responseBody.prices_include_tax,
                cart_tax: responseBody.cart_tax,
                shipping_tax: responseBody.shipping_tax,
                discount_tax: responseBody.discount_tax,
                total_tax: responseBody.total_tax,
                // tax_total: responseBody.tax_lines.tax_total,
                // shipping_tax_total: responseBody.tax_lines.shipping_tax_total,
            },
            shipping: {
                shipping_total: responseBody.shipping_total,
                shipping_tax: responseBody.shipping_tax,
                // total: responseBody.shipping_lines.total,
                // total_tax: responseBody.shipping_lines.total_tax,
            },
            discount: {
                discount_total: responseBody.discount_total,
                discount_tax: responseBody.discount_tax,
            },
            line_items: {
                subtotal: responseBody.line_items.subtotal,
                subtotal_tax: responseBody.line_items.subtotal_tax,
                total: responseBody.line_items.total,
                total_tax: responseBody.line_items.total_tax,
                price: responseBody.line_items.price,
            },
        };

        return orderDetails;
    }

    /**
     * woocommerce product addon api methods
     */

    // get all product addons
    async getAllProductAddons(auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.get(endPoints.wc.productAddons.getAllProductAddons, { headers: auth });
        return responseBody;
    }

    // create product addon
    async createProductAddon(payload: object, auth?: auth): Promise<[responseBody, string, string, string]> {
        const [, responseBody] = await this.post(endPoints.wc.productAddons.createProductAddon, { data: payload, headers: auth });
        const productAddonId = String(responseBody?.id);
        const addonName = responseBody.name;
        const addonFieldTitle = responseBody.fields[0].name;
        return [responseBody, productAddonId, addonName, addonFieldTitle];
    }

    // delete product addon
    async deleteProductAddon(productAddonId: string, auth?: auth): Promise<responseBody> {
        const [, responseBody] = await this.delete(endPoints.wc.productAddons.deleteProductAddon(productAddonId), { headers: auth });
        return responseBody;
    }

    // delete all product addons
    async deleteAllProductAddons(auth?: auth): Promise<responseBody> {
        const allProductAddons = await this.getAllProductAddons(auth);
        if (!allProductAddons?.length) {
            console.log('No product addon exists');
            return;
        }
        const allProductAddonIds = allProductAddons.map((o: { id: unknown }) => o.id);
        for (const productAddonId of allProductAddonIds) {
            await this.deleteProductAddon(productAddonId, auth);
        }
    }
}
