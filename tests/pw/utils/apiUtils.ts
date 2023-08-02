import { expect, type APIRequestContext, APIResponse, Request } from '@playwright/test';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';
import { helpers } from 'utils/helpers';
import fs from 'fs';
// import FormData from 'form-data';

interface auth {
	[key: string]: string;
 }

 interface user {
	username: string;
	password: string;
}

 interface taxRate {
	// [key: string]: string | number | boolean | string [];
	country: string,
	state: string,
	postcode: string,
	city: string,
	rate: string,
	name: string,
	priority: number,
	compound: boolean,
	shipping: boolean,
	order: number,
	class: string,
	postcodes: string[],
	cities: string[],
}

interface coupon {
		code: string,
		amount: string,
		discount_type: string,
		product_ids: number[],
		individual_use?: boolean,
		meta_data?: { key: string; value: string; }[]
}

interface marketPlaceCoupon {
	code: string,
	amount: string,
	discount_type: string,
	individual_use?: boolean,
	meta_data?: { key: string; value: string; }[]
}

interface reqOptions {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any;
	failOnStatusCode?: boolean | undefined;
	form?: { [key: string]: string | number | boolean; } | undefined;
	headers?: { [key: string]: string; } | undefined;
	ignoreHTTPSErrors?: boolean | undefined;
	maxRedirects?: number | undefined;
	multipart?: { [key: string]: string | number | boolean | fs.ReadStream | { name: string; mimeType: string; buffer: Buffer; }; } | undefined;
	params?: { [key: string]: string | number | boolean; } | undefined;
	timeout?: number | undefined;
}

interface headers { [key: string]: string; }

interface storageState {
    cookies: Array<{
      name: string;
      value: string;
      domain: string;
      path: string;
      expires: number;
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'Strict'|'Lax'|'None';
    }>;
	origins: Array<{
		origin: string;
		localStorage: Array<{
		name: string;
		value: string;
		}>;
	}>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type responseBody = any;

export class ApiUtils {
	readonly request: APIRequestContext;

	constructor(request: APIRequestContext) {
		this.request = request;
	}

	// get basic auth
	getBasicAuth(user: user): string {
		const basicAuth = 'Basic ' + Buffer.from(user.username + ':' + user.password).toString('base64');
		return basicAuth;
	}

	/**
	 * request methods
	 */

	async get(url: string, options?: reqOptions | undefined): Promise<[APIResponse, responseBody]> {
		const response = await this.request.get(url, options);
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	async post(url: string, options?: reqOptions | undefined): Promise<[APIResponse, responseBody]> {
		const response = await this.request.post(url, options);
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	async put (url: string, options?: reqOptions | undefined): Promise<[APIResponse, responseBody]> {
		const response = await this.request.put(url, options);
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	async patch(url: string, options?: reqOptions | undefined): Promise<[APIResponse, responseBody]> {
		const response = await this.request.patch(url, options);
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	async delete(url: string, options?: reqOptions | undefined): Promise<[APIResponse, responseBody]> {
		const response = await this.request.delete(url, options);
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	async head(url: string, options?: reqOptions | undefined): Promise<APIResponse> {
		const response = await this.request.head(url, options);
		return response;
	}

	async fetch(urlOrRequest: string | Request, options?: reqOptions | undefined): Promise<[APIResponse, responseBody]> {
		const response = await this.request.fetch(urlOrRequest, options);
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	async storageState(path?: string | undefined): Promise<storageState> {
		return await this.request.storageState({ path: path });
	}

	async disposeApiRequestContext(): Promise<void>{
		await this.request.dispose();
	}

	// get responseBody
	async getResponseBody(response: APIResponse, assert = true): Promise<responseBody> {
		try {
			assert && expect(response.ok()).toBeTruthy();
			const responseBody = await response.json();
			// console.log('ResponseBody: ', responseBody);
			String(response.status())[0] != '2' && console.log('ResponseBody: ', responseBody);
			return responseBody;
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		catch (err: any) {
			console.log('End-point: ', response.url());
			console.log('Status Code: ', response.status());
			console.log('Error: ', err.message);  //todo:  showing playwright error instead of api error
			console.log('Response text: ', await response.text());
			return false; //todo:  WHY FALSE
		}
	}

	// get site headers
	async getSiteHeaders(url: string = endPoints.serverUrl ): Promise<headers> {
		const response= await this.head(url);
		const headers = response.headers();
		return headers;
	}

	/**
	 * dummy data api methods
	 */

	async importDummyData(payload: object, auth? : auth): Promise<responseBody>  {
		const [, responseBody] = await this.post(endPoints.importDummyData, { data: payload, headers: auth });
		return responseBody;
	}

	/**
	 * store api methods
	 */

	// get all stores
	async getAllStores(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllStores, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get single store
	async getSingleStore(sellerId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getSingleStore(sellerId), { headers: auth });
		return responseBody;
	}

	// get sellerId
	async getSellerId(storeName?: string, auth? : auth): Promise<string> {
		const allStores = await this.getAllStores(auth);
		const sellerId = storeName ? (allStores.find((o: { store_name: unknown; }) => o.store_name === storeName)).id : allStores[0].id;
		return sellerId;
	}

	// create store
	async createStore(payload: any, auth? : auth): Promise<[responseBody, string, string]> {
		const response = await this.request.post(endPoints.createStore, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response, false);   //todo:  convert to this.get , implement multiple optional function parameter to pass false to response-body
		let sellerId :string;
		let storeName :string;
		if(responseBody.code){
			expect(response.status()).toBe(500);
			sellerId = await this.getSellerId(payload.store_name, auth);
			storeName = payload.store_name;
		} else {
			expect(response.ok()).toBeTruthy();
			sellerId = responseBody.id;
			storeName = responseBody.store_name;
		}
		return [responseBody, sellerId, storeName];
	}

	// create store review
	async createStoreReview(sellerId: string, payload: object, auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.createStoreReview(sellerId), { data: payload, headers: auth });
		const reviewId = responseBody.id;
		return [responseBody, reviewId];
	}

	/**
	 * follow store methods
	 */

	// follow unfollow store
	async followUnfollowStore(sellerId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.post(endPoints.followUnfollowStore, { data: { vendor_id: Number(sellerId) }, headers: auth });
		return responseBody;
	}

	/**
	 * product api methods
	 */


	// get all products
	async getAllProducts(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllProducts, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get productId
	async getProductId(productName: string, auth? : auth): Promise<string> {
		const allProducts = await this.getAllProducts(auth);
		const productId = productName ? (allProducts.find((o: { name: unknown; }) => o.name === productName)).id : allProducts[0].id;
		return productId;
	}

	// create product
	async createProduct(payload: object, auth? : auth): Promise<[responseBody, string, string]> {
		const [, responseBody] = await this.post(endPoints.createProduct, { data: payload, headers: auth });
		const productId = responseBody.id;
		const productName = responseBody.name;
		return [responseBody, productId, productName];
	}

	// delete product
	async deleteProduct(productId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.deleteProduct(productId), { headers: auth });
		return responseBody;
	}

	// delete all products
	async deleteAllProducts( productName = '', auth? : auth): Promise<responseBody> { //todo:  update handle first parameter
		const allProducts = await this.getAllProducts(auth);
		let allProductIds: any;
		// delete all products with same name
		if (productName){
			allProductIds = (allProducts.filter((o: { name: unknown; }) => o.name === productName)).map((o: { id: unknown; }) => o.id);
		}
		else {
			allProductIds = (await this.getAllProducts(auth)).map((o: { id: unknown; }) => o.id);
		}
		const [, responseBody] = await this.put(endPoints.wc.updateBatchProducts, { data: { delete: allProductIds }, headers: payloads.adminAuth });
		return responseBody;
	}

	// get product exists or not
	async productExistsOrNot(productName: string, auth? : auth): Promise<boolean> {
		const allProducts = await this.getAllProducts(auth);
		const res = allProducts.find((o: { name: unknown; }) => o.name === productName);
		return res ? res.id : false;
	}

	/**
	 * product variation api methods
	 */

	// create product
	async createProductVariation(productId: string, payload: object, auth? : auth) : Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.createProductVariation(productId), { data: payload, headers: auth });
		const variationId = responseBody.id;
		return [responseBody, variationId];
	}

	// get variationTd
	async getVariationId(productName: string, auth? : auth): Promise<[string, string]> {
		const productId = await this.getProductId(productName, auth);
		const [, responseBody] = await this.get(endPoints.getAllProductVariations(productId), { headers: auth });
		const variationId = responseBody[0].id;
		return [productId, variationId];
	}

	// get variationTd
	async createVariableProductWithVariation(attribute: object, attributeTerm: object, product: object, auth? : auth): Promise<[string, string]> {
		const [, productId] = await this.createProduct(product, auth);
		const [body, attributeId] = await this.createAttributeTerm(attribute, attributeTerm, auth);
		const payload = { ...product, attributes: [{ id: attributeId, option: body.name, }], };
		const [, variationId] = await this.createProductVariation(productId, payload);
		return [productId, variationId];
	}

	/**
	 * attribute api methods
	 */

	// get all attributes
	async getAllAttributes(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllAttributes, { headers: auth });
		return responseBody;
	}

	// get single attribute
	async getSingleAttribute(attributeId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getSingleAttribute(attributeId), { headers: auth });
		return responseBody;
	}

	// get attributeId
	async getAttributeId(auth? : auth): Promise<string> {
		const allAttributes = await this.getAllAttributes(auth);
		const attributeId = allAttributes[0].id;
		return attributeId;
	}

	// create attribute
	async createAttribute(payload: object, auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.createAttribute, { data: payload, headers: auth });
		const attributeId = responseBody.id;
		return [responseBody, attributeId];
	}

	// update batch attributes
	async updateBatchAttributes(action: string, allIds: string[], auth? : auth): Promise<[APIResponse, responseBody]> {
		const [response, responseBody] = await this.post(endPoints.wc.updateBatchAttributes, { data: { [action]: allIds }, headers: auth });
		return [response, responseBody];
	}

	/**
	 * attribute term api methods
	 */

	// get all attribute terms
	async getAllAttributeTerms(attributeId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllAttributeTerms(attributeId), { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get single attribute term
	async getSingleAttributeTerm(attributeId: string, attributeTermId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId), { headers: auth });
		return responseBody;
	}

	// create attribute term
	async createAttributeTerm(attribute: any, attributeTerm: object, auth? : auth): Promise<[responseBody, string, string]> {
		let attributeId: string;
		typeof (attribute) === 'object' ? [, attributeId] = await this.createAttribute(attribute, auth) : attributeId = attribute;
		const [, responseBody] = await this.post(endPoints.createAttributeTerm(attributeId), { data: attributeTerm, headers: auth });
		const attributeTermId = responseBody.id;
		return [responseBody, attributeId, attributeTermId];
	}

	/**
	 * coupon api methods
	 */

	// get all coupons
	async getAllCoupons(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllCoupons, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get couponId
	async getCouponId(couponCode: string, auth? : auth): Promise<string> {
		const allCoupons = await this.getAllCoupons(auth);
		const couponId = couponCode ? (allCoupons.find((o: { code: unknown; }) => o.code === couponCode)).id : allCoupons[0].id;
		return couponId;
	}

	// create coupon
	async createCoupon(productIds: string[], coupon: coupon, auth?: auth ): Promise<[responseBody, string, string]> { //todo:  need to update; handle productIds can be empty
		const response = await this.request.post(endPoints.createCoupon, { data: { ...coupon, product_ids: productIds }, headers: auth });
		const responseBody = await this.getResponseBody(response, false);
		let couponId: string;
		let couponCode: string;
		if (responseBody.code === 'woocommerce_rest_coupon_code_already_exists'){
			expect(response.status()).toBe(400);
			couponId = await this.getCouponId(coupon.code, auth);
			couponCode = coupon.code;
		} else {
			expect(response.ok()).toBeTruthy();
			couponId = responseBody.id;
			couponCode = responseBody.code;
		}
		return [responseBody, couponId, couponCode];
	}


	// get market couponId
	async getMarketPlaceCouponId(couponCode: string, auth? : auth): Promise<string> {
		const [, allCoupons] = await this.get(endPoints.wc.getAllCoupons, { params: { per_page:100 }, headers: auth });
		const couponId = couponCode ? (allCoupons.find((o: { code: unknown; }) => o.code === couponCode)).id : allCoupons[0].id;
		return couponId;
	}


	// create market coupon
	async createMarketPlaceCoupon(coupon: marketPlaceCoupon, auth?: auth ): Promise<[responseBody, string, string]> {
		const response = await this.request.post(endPoints.wc.createCoupon, { data: coupon, headers: payloads.adminAuth });
		const responseBody = await this.getResponseBody(response, false);
		let couponId: string;
		let couponCode: string;
		if (responseBody.code === 'woocommerce_rest_coupon_code_already_exists'){
			expect(response.status()).toBe(400);
			couponId = await this.getMarketPlaceCouponId(coupon.code, auth);
			couponCode = coupon.code;
		} else {
			expect(response.ok()).toBeTruthy();
			couponId = responseBody.id;
			couponCode = responseBody.code;
		}
		return [responseBody, couponId, couponCode];
	}

	// update coupon
	async updateCoupon(couponId: string, payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.updateCoupon(couponId), { data: payload, headers: auth });
		return responseBody;
	}

	/**
	 * withdraw api methods
	 */

	// get all withdraws
	async getMinimumWithdrawLimit(auth? : auth): Promise<[string, string]> {
		const [, responseBody] = await this.get(endPoints.getBalanceDetails, { headers: auth });
		const currentBalance = String(Math.abs(responseBody.current_balance));
		const minimumWithdrawLimit = String(Math.abs(responseBody.withdraw_limit));
		return [currentBalance, minimumWithdrawLimit];
	}

	// get all withdraws
	async getAllWithdraws(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllWithdraws, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get all withdraws by status
	async getAllWithdrawsByStatus(status: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllWithdraws, { params: { per_page:100, status: status }, headers: auth });
		return responseBody;
	}

	// get withdrawId
	async getWithdrawId(auth? : auth): Promise<string> {
		const allWithdraws = await this.getAllWithdrawsByStatus('pending', auth);
		if(!allWithdraws?.length){ return ''; } //todo:  apply this to all get id method
		const withdrawId = allWithdraws[0].id;
		return withdrawId;
	}

	// create withdraw
	async createWithdraw(payload: object, auth? : auth): Promise<[responseBody, string]> {
		const response = await this.request.post(endPoints.createWithdraw, { data: payload, headers: auth }); //todo: return withdrawid if already exists
		const responseBody = await this.getResponseBody(response, false); //todo:  test if false is necessary there was false which is removed for testing
		const withdrawId = responseBody.id;
		return [responseBody, withdrawId];
	}

	// cancel withdraw
	async cancelWithdraw(withdrawId: string, auth? : auth): Promise<responseBody> {
		if(!withdrawId){
			withdrawId = await this.getWithdrawId(auth);
			if (!withdrawId) { return;} //todo:  apply this to all where get id method is called
		}
		const [, responseBody] = await this.delete(endPoints.cancelWithdraw(withdrawId), { headers: payloads.adminAuth });
		return responseBody;
	}

	/**
	 * order api methods
	 */

	// get all orders
	async getAllOrders(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllOrders, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get single order
	async getSingleOrder(orderId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getSingleOrder(orderId), { headers: auth });
		return responseBody;
	}

	// get orderId
	async getOrderId(auth? : auth): Promise<string> {
		const allOrders = await this.getAllOrders(auth);
		console.log(allOrders);
		const orderId = allOrders[0].id;
		return orderId;
	}

	// update order status
	async updateOrderStatus(orderId: string, orderStatus: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.updateOrder(orderId), { data: { status: orderStatus }, headers: auth });
		return responseBody;
	}

	/**
	 * order notes api methods
	 */

	// create attribute term
	async createOrderNote(product: object, order: object, orderNote: object, auth? : auth): Promise<[responseBody, string, string]> {
		const [,, orderId] = await this.createOrder(product, order, auth);
		const [, responseBody] = await this.post(endPoints.createOrderNote(orderId), { data: orderNote, headers: auth });
		const orderNoteId = responseBody.id;
		return [responseBody, orderId, orderNoteId];
	}

	/**
	 * admin api methods
	*/


	// get admin report summary
	async getAdminReportSummary(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAdminReportSummary, { headers: auth });
		return responseBody;
	}

	// get all order logs
	async getAllOrderLogs(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAdminLogs, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get single order log
	async getSingleOrderLog(orderId: string, auth? : auth) {
		const allOrderLogs = await this.getAllOrderLogs(auth);
		const singleOrderLog = (allOrderLogs.find((o: { order_id: unknown; }) => o.order_id === orderId));
		return singleOrderLog;
	}

	/**
	 * refund api methods
	 */

	// get all orders
	async getAllRefunds(status: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllRefunds, { params: { per_page:100, status: status }, headers: auth });
		return responseBody;
	}

	// get refundId
	async getRefundId(status: string, auth? : auth): Promise<string> {
		const allRefunds = await this.getAllRefunds(status, auth);
		const refundId = allRefunds[0].id;
		return refundId;
	}

	/**
	 * dokan settings  api methods
	 */

	// get store settings
	async getStoreSettings(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getSettings, { headers: auth });
		return responseBody;
	}

	// set store settings
	async setStoreSettings(payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.updateSettings, { data: payload, headers: auth });
		return responseBody;
	}

	/**
	 * support ticket  api methods
	 */

	// get all support tickets
	async getAllSupportTickets(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllSupportTickets, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get support ticket id
	async getSupportTicketId(auth? : auth): Promise<[string, string]> {
		const allSupportTickets = await this.getAllSupportTickets(auth);
		console.log(allSupportTickets);
		const supportTicketId = allSupportTickets[0].ID;
		const sellerId = allSupportTickets[0].vendor_id;
		return [supportTicketId, sellerId];
	}

	// create support ticket comment
	async createSupportTicketComment( supportTicketId = '', payload: object, auth? : auth): Promise<responseBody> { //todo:  update handle first parameter
		if(!supportTicketId){
			[supportTicketId,] = await this.getSupportTicketId(auth);
		}
		const [, responseBody] = await this.post(endPoints.createSupportTicketComment(supportTicketId), { data: payload, headers: auth });
		return responseBody;

	}

	// update support ticket status
	async updateSupportTicketStatus(supportTicketId: string, status: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: { status }, headers: auth });
		return responseBody;
	}

	async createSupportTicket(payload: object): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.wp.createCustomPost('dokan_store_support'), { data: payload, headers: payloads.adminAuth });
		const supportTicketId = String(responseBody.id);
		return [responseBody, supportTicketId];
	}

	/**
	 * reverse withdrawal  api methods
	 */

	// get all reverse withdrawal stores
	async getAllReverseWithdrawalStores(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllReverseWithdrawalStores, { headers: auth });
		return responseBody;
	}

	// get orderId
	async getReverseWithdrawalStoreId(auth? : auth): Promise<string> {
		const allReverseWithdrawalStores = await this.getAllReverseWithdrawalStores(auth);
		const reverseWithdrawalStoreId = allReverseWithdrawalStores[0].id;
		return reverseWithdrawalStoreId;
	}

	// get reverseWithdrawal payment productId
	async getReverseWithdrawalProductId(auth? : auth): Promise<string> {
		const productId = await this.getProductId('Reverse Withdrawal Payment', auth);
		return productId;
	}

	/**
	 * module  api methods
	 */

	// get all modules
	async getAllModules(params = {}, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllModules, { params: params, headers: auth  });
		return responseBody;
	}

	// get all modules ids
	async getAllModuleIds(params = {}, auth? : auth) {
		const allModules = await this.getAllModules(params, auth);
		const allModuleIds = allModules.map((o: { id: unknown; }) => o.id);
		return allModuleIds;
	}

	// activate modules
	async activateModules(moduleIds: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.activateModule, { data: { module: [moduleIds] }, headers: auth });
		return responseBody;
	}

	// deactivate modules
	async deactivateModules(moduleIds: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.deactivateModule, { data: { module: [moduleIds] }, headers: auth });
		return responseBody;
	}

	/**
	 * customers  api methods [woocommerce endpoint used instead of request-for-quote/customer ]
	 */

	// get all customers
	async getAllCustomers(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getAllCustomers, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get customerId
	async getCustomerId(username: string, auth? : auth): Promise<string> {
		const allCustomers = await this.getAllCustomers(auth);
		const customerId = (allCustomers.find((o: { username: unknown; }) => o.username === username)).id;
		return customerId;
	}

	// create customer
	async createCustomer(payload: any, auth? : auth): Promise<[responseBody, string]> {
		const response = await this.request.post(endPoints.wc.createCustomer, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response, false);
		let customerId: string;
		if(responseBody.code){
			expect(response.status()).toBe(400);
			customerId = await this.getCustomerId(payload.username, auth);
		} else {
			expect(response.ok()).toBeTruthy();
			customerId = responseBody.id;
		}
		return [responseBody, customerId];
	}

	// delete customer
	async deleteCustomer(userId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.wc.deleteCustomer(userId), { headers: auth });
		return responseBody;
	}

	/**
	 * wholesale customers  api methods
	 */

	// get all wholesale customers
	async getAllWholesaleCustomers(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllWholesaleCustomers, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// create a wholesale customer
	async createWholesaleCustomer(payload: object, auth? : auth): Promise<[responseBody, string]> {
		const [, customerId] = await this.createCustomer(payload, auth);
		const [, responseBody] = await this.post(endPoints.createWholesaleCustomer, { data: { id: String(customerId) }, headers: auth });
		return [responseBody, customerId];
	}

	/**
	 * product advertisement  api methods
	 */

	// get all product advertisements
	async getAllProductAdvertisements(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllProductAdvertisements, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// create a product advertisement
	async createProductAdvertisement(product: object, auth? : auth): Promise<[responseBody, string]> {
		const [body, productId] = await this.createProduct(product, auth);
		const sellerId = body.store.id;									//todo:  hardcoding admin auth will hinder negative testing : test with invalid user
		const [, responseBody] = await this.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId }, headers: payloads.adminAuth });
		const productAdvertisementId = responseBody.id;
		return [responseBody, productAdvertisementId];
	}

	/**
	 * abuse report api methods
	 */

	// get all abuse reports
	async getAllAbuseReports(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllAbuseReports, { headers: auth });
		return responseBody;
	}

	// get abuse reportIa
	async getAbuseReportId(auth? : auth): Promise<string> {
		const allAbuseReports = await this.getAllAbuseReports(auth);
		const abuseReportId = allAbuseReports[0].id;
		return abuseReportId;
	}

	/**
	 * announcements api methods
	 */

	// get all announcements
	async getAllAnnouncements(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllAnnouncements, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// create announcement
	async createAnnouncement(payload: object, auth? : auth): Promise<[responseBody, string, string]> {
		const [, responseBody] = await this.post(endPoints.createAnnouncement, { data: payload, headers: auth });
		const announcementId = responseBody.id;
		const announcementTitle = responseBody.title;
		return [responseBody, announcementId, announcementTitle];
	}

	// delete announcement
	async deleteAnnouncement(announcementId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.deleteAnnouncement(announcementId), { headers: auth });
		return responseBody;
	}

	// update batch announcements
	async updateBatchAnnouncements(action: string, allIds: string[], auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.updateBatchAnnouncements, { data: { [action]: allIds }, headers: auth });
		return responseBody;
	}

	/**
	 * product reviews api methods
	 */

	// get all product reviews
	async getAllProductReviews(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllProductReviews, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get product review id
	async getProductReviewId(auth? : auth): Promise<string> {
		const allProductReviews = await this.getAllProductReviews(auth);
		const reviewId = allProductReviews[0].id;
		return reviewId;
	}

	/**
	 * store reviews api methods
	 */

	// get all store reviews
	async getAllStoreReviews(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllStoreReviews, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get store review id
	async getStoreReviewId(auth? : auth): Promise<string> {
		const allStoreReviews = await this.getAllStoreReviews(auth);
		const reviewId = allStoreReviews[0].id;
		return reviewId;
	}

	// delete store review
	async deleteStoreReview(reviewId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.deleteStoreReview(reviewId), { headers: auth });
		return responseBody;
	}

	// update batch store reviews
	async updateBatchStoreReviews(action: string, allIds: string[], auth? : auth): Promise<responseBody> {
		if(!allIds?.length) {
			allIds = (await this.getAllStoreReviews()).map((a: { id: unknown }) => a.id);
		}
		const [, responseBody] = await this.put(endPoints.updateBatchStoreReviews, { data: { [action]: allIds }, headers: auth });
		return responseBody;
	}

	/**
	 * store categories api methods
	 */

	// get all store categories
	async getAllStoreCategories(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllStoreCategories, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get sellerId
	async getStoreCategoryId(StoreCategoryName?: string, auth? : auth): Promise<string> {
		const allStoreCategories = await this.getAllStoreCategories(auth);
		const storeCategoryId = StoreCategoryName ? (allStoreCategories.find((o: { name: unknown; }) => o.name === StoreCategoryName)).id : allStoreCategories[0].id;
		return storeCategoryId;
	}

	// create store category
	async createStoreCategory(payload: object, auth? : auth): Promise<[responseBody, string, string]> {
		const [, responseBody] = await this.post(endPoints.createStoreCategory, { data: payload, headers: auth });
		const categoryId = responseBody.id;
		const categoryName = responseBody.name;
		return [responseBody, categoryId, categoryName];
	}

	// get default store category
	async getDefaultStoreCategory(auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.get(endPoints.getDefaultStoreCategory, { headers: auth });
		const categoryId = responseBody.id;
		return [responseBody, categoryId];
	}

	// set default store category
	async setDefaultStoreCategory(categoryId: string, auth? : auth): Promise<responseBody> {
		if (isNaN(Number(categoryId))){
			categoryId = await this.getStoreCategoryId(categoryId, auth);
		}
		const [, responseBody] = await this.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId }, headers: auth });
		return responseBody;
	}

	/**
	 * quote rules api methods
	 */

	// get all quote rules
	async getAllQuoteRules(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllQuoteRules, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// create quote rule
	async createQuoteRule(payload: object, auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.createQuoteRule, { data: payload, headers: auth });
		const quoteRuleId = responseBody.id;
		return [responseBody, quoteRuleId];
	}

	// delete store review
	async deleteQuoteRule(quoteRuleId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.deleteQuoteRule(quoteRuleId), { headers: auth });
		return responseBody;
	}

	// delete all quote rules
	async deleteAllQuoteRules(auth? : auth): Promise<responseBody> {
		const allQuoteRuleIds = (await this.getAllQuoteRules(auth)).map((o: { id: unknown; }) => o.id);
		const [, responseBody] = await this.put(endPoints.updateBatchQuoteRules, { data: { trash: allQuoteRuleIds }, headers : auth });
		return responseBody;
	}


	/**
	 * request quote api methods
	 */

	// get all quote rules
	async getAllRequestQuotes(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllRequestQuotes, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// create quote rule
	async createRequestQuote(payload: object, auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.createRequestQuote, { data: payload, headers: auth });
		const quoteRuleId = responseBody[0].data.id;
		return [responseBody, quoteRuleId];
	}

	// delete store review
	async deleteRequestQuote(quoteRuleId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.deleteRequestQuote(quoteRuleId), { headers: auth });
		return responseBody;
	}

	// delete all quotes
	async deleteAllQuotes(auth? : auth): Promise<responseBody> {
		const allQuoteIds = (await this.getAllRequestQuotes(auth)).map((o: { id: unknown; }) => o.id);
		const [, responseBody] = await this.put(endPoints.updateBatchRequestQuotes, { data: { trash: allQuoteIds }, headers : auth });
		return responseBody;
	}

	/**
	 * order downloads  api methods
	 */

	// get all order download
	async getAllOrderDownloads(orderId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllOrderDownloads(orderId), { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// create order download
	async createOrderDownload(orderId: string, downloadableProducts: string[], auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.createOrderDownload(orderId), { data: { ids: downloadableProducts }, headers: auth });
		const downloadId = String((Object.keys(responseBody))[0]);
		return [responseBody, downloadId];
	}

	/**
	 * seller badge  api methods
	 */

	// get all seller badges
	async getAllSellerBadges(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.getAllSellerBadges, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get all seller badges
	async getSellerBadgeId(eventType: string, auth? : auth): Promise<string> {
		const allBadges = await this.getAllSellerBadges(auth);
		const badgeId = allBadges.find((o: { event_type: unknown; }) => o.event_type === eventType).id;
		return badgeId;
	}

	// create seller badge
	async createSellerBadge(payload: any, auth? : auth): Promise<[responseBody, string]> {
		const response = await this.request.post(endPoints.createSellerBadge, { data: payload, headers: auth }); //todo:  remove this.request from everywhere
		const responseBody = await this.getResponseBody(response, false);
		const badgeId = responseBody.code === 'invalid-event-type' ? await this.getSellerBadgeId(payload.event_type, auth) : responseBody.id;
		return [responseBody, badgeId];
	}

	// update batch seller badges
	async updateBatchSellerBadges(action: string, allIds: string[], auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.updateBatchSellerBadges, { data: { ids: allIds, action: action }, headers: auth });
		return responseBody;
	}

	// delete seller badge
	async deleteSellerBadge(badgeId: string, auth? : auth): Promise<responseBody>{
		const [, responseBody] = await this.delete(endPoints.deleteSellerBadge(badgeId), { headers: auth });
		return responseBody;
	}

	// delete all seller badges
	async deleteAllSellerBadges(auth? : auth): Promise<void> {
		const allBadges = await this.getAllSellerBadges(auth);
		if(!allBadges?.length){return;} //todo:  apply this to all batch update/ anywhere a action can be lessened
		const allBadgeIds = (await this.getAllSellerBadges(auth)).map((o: { id: unknown; }) => o.id);
		await this.updateBatchSellerBadges('delete', allBadgeIds, auth);
	}

	/**
	 * wp  api methods
	 */

	// settings

	// get site settings
	async getSiteSettings(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wp.getSiteSettings, { headers: auth });
		return responseBody;
	}

	// set site settings
	async setSiteSettings(payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.post(endPoints.wp.setSiteSettings, { data: payload, headers: auth });
		return responseBody;
	}

	// wp users

	// get all users
	async getAllUsers(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wp.getAllUsers, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get user by role
	async getAllUsersByRole(role: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wp.getAllUsers, { params: { per_page:100, role: role }, headers: auth });
		return responseBody;
	}

	// get current user
	async getCurrentUser(auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.get(endPoints.wp.getCurrentUser, { headers: auth });
		const userId = responseBody.id;
		return [responseBody, userId];
	}

	// get user by Id
	async getUserById(userId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wp.getUserById(userId), { headers: auth });
		return responseBody;
	}

	// create user
	async createUser(payload: object, auth? : auth): Promise<responseBody> { // administrator,  customer, seller
		const [, responseBody] = await this.post(endPoints.wp.createUser, { data: payload, headers: auth });
		return responseBody;
	}

	// update user
	async updateUser(payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.wp.createUser, { data: payload, headers: auth });
		return responseBody;
	}

	// delete user
	async deleteUser(userId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.wp.deleteUser(userId), { headers: auth });
		return responseBody;
	}

	// plugins

	// get all plugins
	async getAllPlugins(params = {}, auth? : auth): Promise<responseBody> { //todo:  run loop & increment page to grab all plugins/products/...
		const [, responseBody] = await this.get(endPoints.wp.getAllPlugins, { params: { ...params, per_page:100 }, headers: auth });
		return responseBody;
	}

	// get single plugin
	async getSinglePlugin(plugin: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wp.getSinglePlugin(plugin), { headers: auth });
		return responseBody;
	}

	// update plugin
	async updatePlugin(plugin: string, payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.wp.updatePlugin(plugin), { data: payload, headers: auth });
		return responseBody;
	}

	// delete plugin
	async deletePlugin(plugin: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.wp.deletePlugin(plugin), { headers: auth });
		return responseBody;
	}

	// get plugin active or not
	async pluginsActiveOrNot(plugins: string[], auth? : auth): Promise<boolean> {
		const activePlugins = (await this.getAllPlugins({ status:'active' }, auth)).map((a: { plugin: string }) => (a.plugin).split('/')[1]);
		return helpers.isSubArray(activePlugins, plugins );
	}


	// media

	// upload media
	async uploadMedia(filePath: string, auth?: auth): Promise<[responseBody, string]> { //todo:  handle different file upload, hardcoded: image
		const payload = {
			headers: {
				Accept: '*/*',
				ContentType: 'multipart/form-data',
				// Authorization: auth.Authorization  //todo:  handle authorization
			},
			multipart: {
				file: {
					name: String((filePath.split('/')).pop()),
					mimeType: 'image/' + (filePath.split('.')).pop(),
					buffer: fs.readFileSync(filePath),
					// buffer: Buffer.from(filePath),  //todo:  test then use it instead of previous, not working debug why
				},
			},
		};
		const response = await this.request.post(endPoints.wp.createMediaItem, payload);
		const responseBody = await this.getResponseBody(response);
		const mediaId = responseBody.id;
		return [responseBody, mediaId];
	}

	// upload media
	async uploadMedia2(filePath: string, attributes: any, auth?: auth): Promise<[responseBody, string]> { //todo:  handle different file upload, hardcoded: image
		const form: any = new FormData();
		// form.append("file", fs.createReadStream(filePath));
		// const base64 = { 'base64': fs.readFileSync(filePath) }
		// function base64_encode(file) {
		// 	const body = fs.readFileSync(file);
		// 	return body.toString('base64');
		// }

		form.append('file',
			// fs.readFileSync(filePath, { encoding: 'base64' }),

			// base64_encode(filePath),
			fs.createReadStream(filePath),
			{
				name: String((filePath.split('/')).pop()),
				type: 'image/' + (filePath.split('.')).pop(),
			}

		);

		form.append('title', attributes.title);
		form.append('caption', attributes.caption);
		form.append('caption', attributes.description);
		form.append('alt_text', attributes.alt_text);

		// const payload = {
		// 	headers: {
		// 		Accept: '*/*',
		// 		ContentType: 'multipart/form-data',
		// 		// ContentType: 'image/png',
		// 		'content-disposition': `attachment; filename=${String((filePath.split('/')).pop())}`
		// 		// Authorization: auth.Authorization  //todo:  handle authorization
		// 	},
		// 	form: form
		// }
		const headers = {
			Accept: '*/*',
			ContentType: 'multipart/form-data',
			// ContentType: 'image/png',
			'content-disposition': `attachment; filename=${String((filePath.split('/')).pop())}`
			// Authorization: auth.Authorization  //todo:  handle authorization
		};

		// const response = await this.request.post(endPoints.wp.createMediaItem, payload);
		const response = await this.request.post(endPoints.wp.createMediaItem, { form: form, headers: headers });  //todo:  update all request.post to this.post/get/put/delete
		const responseBody = await this.getResponseBody(response);
		const mediaId = responseBody.id;
		return [responseBody, mediaId];
	}

	// upload media
	async uploadMedia3(filePath: string): Promise<[responseBody, string]> {
		// const payload = fs.readFileSync(filePath);
		const payload = Buffer.from(filePath);  //todo:  test then use it instead of previous , Add auth
		const headers = { 'content-disposition': `attachment; filename=${String((filePath.split('/')).pop())}` };
		const response = await this.request.post(endPoints.wp.createMediaItem, { data: payload, headers });
		const responseBody = await this.getResponseBody(response);
		const mediaId = responseBody.id;
		return [responseBody, mediaId];
	}

	// get all mediaItems
	async getAllMediaItems(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wp.getAllMediaItems, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get mediaItemId
	async getMediaItemId(auth? : auth): Promise<string> {
		const getAllMediaItems = await this.getAllMediaItems(auth);
		const mediaId = getAllMediaItems[0].id;
		return mediaId;
	}

	// create post
	async createPost(payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.wp.createPost, { data: payload, headers: auth });
		return responseBody;
	}

	/**
	 * woocommerce  api methods
	 */

	// settings

	// get all wc setting options
	async getAllWcSettings(groupId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getAllSettingOptions(groupId), { headers: auth });
		return responseBody;
	}

	// get all single wc settings option
	async getSingleWcSettingsOption(groupId: string, optionId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getSingleSettingOption(groupId, optionId), { headers: auth });
		return responseBody;
	}

	// set single wc settings option
	async updateSingleWcSettingsOption(groupId: string, optionId: string, payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.post(endPoints.wc.updateSettingOption(groupId, optionId), { data: payload, headers: auth });
		return responseBody;
	}

	// update single wc settings option
	async updateBatchWcSettingsOptions(groupId: string, payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.post(endPoints.wc.updateBatchSettingOptions(groupId), { data: payload, headers: auth });
		return responseBody;
	}

	// reviews

	//create product review
	async createProductReview(product: object, review: object, auth? : auth): Promise<[responseBody, string]> {
		const [, productId] = await this.createProduct(product, auth);
		const [, responseBody] = await this.post(endPoints.wc.createReview, { data: { ...review, product_id: productId }, headers: auth });
		const reviewId = responseBody.id;
		return [responseBody, reviewId];
	}

	// categories

	// get all categories
	async getAllCategories(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getAllCategories, { params: { per_page:100 }, headers: auth });
		return responseBody;
	}

	// get single category
	async getSingleCategory(categoryId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getSingleCategory(categoryId), { headers: auth });
		return responseBody;
	}

	// get categoryId
	async getCategoryId(categoryName: string, auth? : auth): Promise<string> {
		const allCustomers = await this.getAllCustomers(auth);
		const customerId = (allCustomers.find((o: { name: unknown; }) => o.name === categoryName)).id;
		return customerId;
	}

	// create category
	async createCategory(payload: object, auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.wc.createCategory, { data: payload, headers: auth });
		const categoryId = responseBody.id;
		return [responseBody, categoryId];
	}

	// update category
	async updateCategory(categoryId: string, payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.wc.updateCategory(categoryId), { data: payload, headers: auth });
		return responseBody;
	}

	// delete category
	async deleteCategory(categoryId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.wc.deleteCategory(categoryId), { headers: auth });
		return responseBody;
	}

	// update batch categories
	async updateBatchCategories(action: string, allIds: string[], auth? : auth): Promise<[APIResponse, responseBody]> {
		const [response, responseBody] = await this.post(endPoints.wc.updateBatchCategories, { data: { [action]: allIds }, headers: auth });
		return [response, responseBody];
	}

	// order

	// create order
	async createOrder(product: string | object, orderPayload: any, auth?: auth): Promise<[APIResponse, responseBody, string, string]> {
		let productId: string;
		if (typeof(product) != 'string'){
			[, productId] = await this.createProduct(product, auth);
		} else {
			productId = product;
		}
		const payload = orderPayload;
		payload.line_items[0].product_id = productId;
		const response = await this.request.post(endPoints.wc.createOrder, { data: payload, headers: payloads.adminAuth });
		const responseBody = await this.getResponseBody(response);
		const orderId = String(responseBody.id); //todo:  need to cast everywhere [any values assigned from type any, here responseBody type is any, sending order-id as string, but actually it sending it as number], some test might need it to be number look for it and update accordingly
		return [response, responseBody, orderId, productId];
	}

	// create complete order
	async createOrderWithStatus(product: string | object, order: any, status: string, auth?: auth): Promise<[APIResponse, responseBody, string, string]> {
		//todo:  add feature for productID, creator of product(who will be the owner), create order auth, update order auth
		const [response, responseBody, orderId, productId] = await this.createOrder(product, order, auth);
		await this.updateOrderStatus(orderId, status, auth);
		return [response, responseBody, orderId, productId];
	}

	// refund

	// create refund
	async createRefund(orderId: string, refund: object, auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.wc.createRefund(orderId), { data: refund, headers: auth });
		const refundId = responseBody.id;
		return [responseBody, refundId];
	}

	// tax

	// get all tax rate
	async getAllTaxRates(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getAllTaxRates, { headers: auth });
		return responseBody;
	}

	// create tax rate
	async createTaxRate(payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.post(endPoints.wc.createTaxRate, { data: payload, headers: auth });
		return responseBody;
	}

	// update batch tax rates
	async updateBatchTaxRates(action: string, allIds: string[], auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.wc.updateBatchTaxRates, { data: { [action]: allIds }, headers: auth });
		return responseBody;
	}

	// setup tax
	async setUpTaxRate(enableTaxPayload: object, taxPayload: taxRate, auth? : auth): Promise<number> {
		// enable tax rate
		await this.updateBatchWcSettingsOptions('general', enableTaxPayload, auth);

		// delete previous tax rates
		const allTaxRateIds = (await this.getAllTaxRates(auth)).map((o: { id: unknown; }) => o.id);
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
	async getAllShippingZones(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getAllShippingZones, { headers: auth });
		return responseBody;
	}

	// get zoneId
	async getZoneId(zoneName: string, auth? : auth): Promise<string> {
		const allZones = await this.getAllShippingZones(auth);
		const zoneId = ((allZones).find((o: { name: unknown; }) => o.name === zoneName)).id;
		return zoneId;
	}

	// create shipping zone
	async createShippingZone(payload: object, auth? : auth): Promise<[responseBody, string]> {
		const [, responseBody] = await this.post(endPoints.wc.createShippingZone, { data: payload, headers: auth });
		const shippingZoneId = responseBody.id;
		return [responseBody, shippingZoneId];
	}

	// delete shipping zone
	async deleteShippingZone(zoneId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.delete(endPoints.wc.deleteShippingZone(zoneId), {  params: { force: true }, headers: auth });
		return responseBody;
	}

	// get all shipping zone locations
	async getAllShippingZoneLocations(zoneId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getAllShippingZoneLocations(zoneId), { headers: auth });
		return responseBody;
	}

	// add shipping zone location
	async addShippingZoneLocation(zoneId: string, zoneLocation: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.wc.addShippingZoneLocation(zoneId), { data: zoneLocation, headers: auth });
		return responseBody;
	}

	// get all shipping zone methods
	async getAllShippingZoneMethods(zoneId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getAllShippingZoneMethods(zoneId), { headers: auth });
		return responseBody;
	}

	// add shipping method
	async addShippingZoneMethod(zoneId: string, zoneMethod: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.post(endPoints.wc.addShippingZoneMethod(zoneId), { data: zoneMethod, headers: auth });
		return responseBody;
	}

	// payment

	// get all payment gateway
	async getAllPaymentGateways(auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getAllPaymentGateways, { headers: auth });
		return responseBody;
	}

	// get single payment gateway
	async getSinglePaymentGateway(paymentGatewayId: string, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.get(endPoints.wc.getSinglePaymentGateway(paymentGatewayId), { headers: auth });
		return responseBody;
	}

	// update payment gateway
	async updatePaymentGateway(paymentGatewayId: string, payload: object, auth? : auth): Promise<responseBody> {
		const [, responseBody] = await this.put(endPoints.wc.updatePaymentGateway(paymentGatewayId), { data: payload, headers: auth });
		return responseBody;
	}

	// get system status
	async getSystemStatus(auth? : auth): Promise<[responseBody, object]> {
		const [, responseBody] = await this.get(endPoints.wc.getAllSystemStatus, { headers: auth });
		let activePlugins = (responseBody.active_plugins).map((a: { plugin: string; version: string; }) => (a.plugin).split('/')[0] + ' v' + a.version );
		activePlugins.sort();
		const conditions = ['Basic-Auth', 'bookings', 'addons', 'auctions', 'subscriptions', 'ba', 'wa', 'wb', 'ws', 'wps' ];
		activePlugins = activePlugins.filter((e: string | string[]) => !conditions.some(el => e.includes(el)));
		// activePlugins = activePlugins.slice(1, -4);
		const compactInfo = {
			wpVersion: 'WordPress Version: ' + responseBody.environment.wp_version,
			phpVersion: 'PHP Version: ' + responseBody.environment.php_version,
			mysqlVersion: 'MySql Version: ' + responseBody.environment.mysql_version,
			theme: 'Theme: ' + responseBody.theme.name + ' v' + responseBody.theme.version,
			wpDebugMode: 'Debug Mode: ' + responseBody.environment.wp_debug_mode,
			activePlugins:  activePlugins
		};
		return [responseBody, compactInfo];
	}
}
