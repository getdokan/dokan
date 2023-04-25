import { expect, type APIRequestContext } from '@playwright/test';
import { endPoints } from './apiEndPoints';

export class ApiUtils {
	readonly request: APIRequestContext;

	constructor(request: APIRequestContext) {
		this.request = request;
	}

	// get basic auth
	async getBasicAuth(user: any): Promise<string> {
		const basicAuth = 'Basic ' + Buffer.from(user.username + ':' + user.password).toString('base64');
		return basicAuth;
	}

	// get site headers
	async getSiteHeaders() {
		const response = await this.request.head(endPoints.serverUrl);
		const headers = response.headers();
		return headers;
	}

	// get responseBody
	async getResponseBody(response: any, assert = true) {
		let responseBody: any;
		try {
			assert && expect(response.ok()).toBeTruthy();
			responseBody = await response.json();
			// console.log('ResponseBody: ', responseBody); 
			String(response.status())[0] != '2' && console.log('ResponseBody: ', responseBody);
			return responseBody;
		} catch (err) {
			console.log('Status Code: ', response.status());
			console.log('Error: ', err.message);
			console.log('Response text: ', await response.text());
			return false
		}
	}

	/**
	 * store api methods
	 */

	// get all stores
	async getAllStores(auth?: any) {
		const response = await this.request.get(endPoints.getAllStores, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get sellerId
	async getSellerId(storeName?: string, auth?: any): Promise<string> {
		const allStores = await this.getAllStores(auth);
		const sellerId = storeName ? (allStores.find((o: { store_name: string; }) => o.store_name === storeName)).id : allStores[0].id;
		return sellerId;
	}

	// create store
	async createStore(payload: object, auth?: any) {
		const response = await this.request.post(endPoints.createStore, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return [responseBody, response.status()];
	}

	// create store review
	async createStoreReview(sellerId: string, payload: object, auth?: any) {
		const response = await this.request.post(endPoints.createStoreReview(sellerId), { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const reviewId = responseBody.id;
		return [responseBody, reviewId];
	}

	/**
	 * follow store methods
	 */

	// follow unfollow store
	async followUnfollowStore(sellerId: string, auth?: any) {
		const response = await this.request.post(endPoints.followUnfollowStore, { data: { vendor_id: Number(sellerId) }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * product api methods
	 */

	// get all products
	async getAllProducts(auth?: any) {
		const response = await this.request.get(endPoints.getAllProducts, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get productId
	async getProductId(productName: string, auth?: any) {
		const allProducts = await this.getAllProducts(auth);
		const productId = productName ? (allProducts.find((o: { name: string; }) => o.name === productName)).id : allProducts[0].id;
		return productId;
	}

	// create product
	async createProduct(payload: object, auth?: any) {
		const response = await this.request.post(endPoints.createProduct, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const productId = responseBody.id;
		return [responseBody, productId];
	}

	/**
	 * product variation api methods
	 */

	// create product
	async createProductVariation(productId: string, payload: object, auth?: any) {
		const response = await this.request.post(endPoints.createProductVariation(productId), { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const variationId = responseBody.id;
		return [responseBody, variationId];
	}

	// get variationTd
	async getVariationId(productName: string, auth?: any) {
		const productId = await this.getProductId(productName, auth);

		const response = await this.request.get(endPoints.getAllProductVariations(productId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		const variationId = responseBody[0].id;
		return [productId, variationId];
	}

	// get variationTd
	async createVariableProductWithVariation(attribute: object, attributeTerm: object, product: object, auth?: any) {
		const [, productId] = await this.createProduct(product);
		const [body, attributeId] = await this.createAttributeTerm(attribute, attributeTerm);
		const payload = {
			...product, attributes: [{
				id: attributeId,
				option: body.name,
			}],
		};
		const [responseBody, variationId] = await this.createProductVariation(productId, payload);
		return [productId, variationId];
	}

	/**
	 * attribute api methods
	 */

	// get all attributes
	async getAllAttributes(auth?: any) {
		const response = await this.request.get(endPoints.getAllAttributes, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get attributeId
	async getAttributeId(auth?: any) {
		const allAttributes = await this.getAllAttributes(auth);
		const attributeId = allAttributes[0].id;
		return attributeId;
	}

	// create attribute
	async createAttribute(payload: object, auth?: any) {
		const response = await this.request.post(endPoints.createAttribute, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const attributeId = responseBody.id;
		return [responseBody, attributeId];
	}

	// update batch attributes
	async updateBatchAttributes(action: string, allIds: string[], auth?: any) {
		const response = await this.request.post(endPoints.wc.updateBatchAttributes, { data: { [action]: allIds }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	/**
	 * attribute term api methods
	 */

	// get all attribute terms
	async getAllAttributeTerms(attributeId: string, auth?: any) {
		const response = await this.request.get(endPoints.getAllAttributeTerms(attributeId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// create attribute term
	async createAttributeTerm(attribute: object | number, attributeTerm: object, auth?: any) {
		let attributeId: number;
		typeof (attribute) === 'object' ? [, attributeId] = await this.createAttribute(attribute) : attributeId = attribute;
		const response = await this.request.post(endPoints.createAttributeTerm(String(attributeId)), { data: attributeTerm, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const attributeTermId = responseBody.id;
		return [response, responseBody, attributeId, attributeTermId];
	}

	/**
	 * coupon api methods
	 */

	// get all coupons
	async getAllCoupons(auth?: any) {
		const response = await this.request.get(endPoints.getAllCoupons, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get couponId
	async getCouponId(couponCode: string, auth?: any) {
		const allCoupons = await this.getAllCoupons(auth);
		const couponId = couponCode ? (couponCode = allCoupons.find((o: { code: string; }) => o.code === couponCode)).id : allCoupons[0].id;
		return couponId;
	}

	// create coupon
	async createCoupon(productId: string, coupon: object, auth?: any) {
		const response = await this.request.post(endPoints.createCoupon, { data: { ...coupon, product_ids: productId }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		// let couponId = responseBody.id
		// // console.log(couponId)
		// return [responseBody, couponId]
		return [responseBody, response.status()];
	}

	/**
	 * withdraw api methods
	 */

	// get all withdraws
	async getMinimumWithdrawLimit(auth?: any) {
		const response = await this.request.get(endPoints.getBalanceDetails, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		const minimumWithdrawLimit = String(Math.abs(responseBody.withdraw_limit));
		return minimumWithdrawLimit;
	}

	// get all withdraws
	async getAllWithdraws(auth?: any) {
		const response = await this.request.get(endPoints.getAllWithdraws, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get all withdraws by status
	async getAllWithdrawsByStatus(status: string, auth?: any) {
		const response = await this.request.get(endPoints.getAllWithdrawsByStatus(status), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get withdrawId
	async getWithdrawId(auth?: any) {
		const allProducts = await this.getAllWithdrawsByStatus('pending');
		const withdrawId = allProducts[0].id;
		return withdrawId;
	}

	// create withdraw
	async createWithdraw(payload: object, auth?: any): Promise<[object, string]> {
		const response = await this.request.post(endPoints.createWithdraw, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const withdrawId = responseBody.id;
		return [responseBody, withdrawId];
	}

	/**
	 * order api methods
	 */

	// get all orders
	async getAllOrders(auth?: any) {
		const response = await this.request.get(endPoints.getAllOrders, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get orderId
	async getOrderId(auth?: any) {
		const allOrders = await this.getAllOrders(auth);
		const orderId = allOrders[0].id;
		return orderId;
	}

	// update order status
	async updateOrderStatus(orderId: string, orderStatus: string, auth?: any) {
		const response = await this.request.put(endPoints.updateOrder(orderId), { data: { status: orderStatus }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * order notes api methods
	 */

	// create attribute term
	async createOrderNote(product: object, order: object, orderNote: object, auth?: any) {
		const [, orderId] = await this.createOrder(product, order, auth);
		const response = await this.request.post(endPoints.createOrderNote(orderId), { data: orderNote, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const orderNoteId = responseBody.id;
		return [responseBody, orderId, orderNoteId];
	}

	/**
	 * refund api methods
	 */

	// get all orders
	async getAllRefunds(auth?: any) {
		const response = await this.request.get(endPoints.getAllRefunds, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get orderId
	async getRefundId(auth?: any) {
		const allRefunds = await this.getAllRefunds(auth);
		const refundId = allRefunds[0].id;
		return refundId;
	}

	/**
	 * dokan settings  api methods
	 */

	// get store settings
	async getStoreSettings(auth?: any) {
		const response = await this.request.get(endPoints.getSettings, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// set store settings
	async setStoreSettings(payload: object, auth?: any) {
		const response = await this.request.put(endPoints.updateSettings, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * support ticket  api methods
	 */

	// get all support tickets
	async getAllSupportTickets(auth?: any) {
		const response = await this.request.get(endPoints.getAllSupportTickets, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get support ticket id
	async getSupportTicketId(auth?: any): Promise<[string, string]> {
		const allSupportTickets = await this.getAllSupportTickets(auth);
		const supportTicketId = allSupportTickets[0].ID;
		const sellerId = allSupportTickets[0].vendor_id;
		return [supportTicketId, sellerId];
	}

	// create support ticket comment
	async createSupportTicketComment(payload: object, auth?: any) {
		const [supportTicketId] = await this.getSupportTicketId(auth);
		const response = await this.request.post(endPoints.createSupportTicketComment(supportTicketId), { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update support ticket status
	async updateSupportTicketStatus(supportTicketId: string, status: string, auth?: any) {
		const response = await this.request.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: { status }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * reverse withdrawal  api methods
	 */

	// get all reverse withdrawal stores
	async getAllReverseWithdrawalStores(auth?: any) {
		const response = await this.request.get(endPoints.getAllReverseWithdrawalStores, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get orderId
	async getReverseWithdrawalStoreId(auth?: any) {
		const allReverseWithdrawalStores = await this.getAllReverseWithdrawalStores(auth);
		const reverseWithdrawalStoreId = allReverseWithdrawalStores[0].id;
		return reverseWithdrawalStoreId;
	}

	/**
	 * module  api methods
	 */

	// get all modules
	async getAllModules(auth?: any) {
		const response = await this.request.get(endPoints.getAllModules, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get all modules ids
	async getAllModuleIds(auth?: any) {
		const allModuleIds = (await this.getAllModules(auth)).map((a: { id: any; }) => a.id);
		return allModuleIds;
	}

	// activate modules
	async activateModules(moduleIds: string, auth?: any) {
		const response = await this.request.put(endPoints.activateModule, { data: { module: [moduleIds] }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const activeStatus = responseBody.active;
		return responseBody;
	}

	// deactivate modules
	async deactivateModules(moduleIds: string, auth?: any) {
		const response = await this.request.put(endPoints.deactivateModule, { data: { module: [moduleIds] }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * customers  api methods
	 */

	// get all customers
	async getAllCustomers(auth?: any) {
		const response = await this.request.get(endPoints.getAllCustomers, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get customerId
	async getCustomerId(username: string, auth?: any) {
		const allCustomers = await this.getAllCustomers(auth);
		const customerId = (allCustomers.find((o: { username: string; }) => o.username === username)).id;
		return customerId;
	}

	// create customer
	async createCustomer(payload: object, auth?: any) {
		const response = await this.request.post(endPoints.createCustomer, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return [responseBody, response.status()];
	}

	// delete customer
	async deleteCustomer(userId: string, auth?: any) {
		const response = await this.request.delete(endPoints.deleteCustomer(userId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * wholesale customers  api methods
	 */

	// get all wholesale customers
	async getAllWholesaleCustomers(auth?: any) {
		const response = await this.request.get(endPoints.getAllWholesaleCustomers, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// create a wholesale customer
	async createWholesaleCustomer(payload: object, auth?: any) {
		const [, customerId] = await this.createCustomer(payload, auth);
		const response = await this.request.post(endPoints.createWholesaleCustomer, { data: { id: customerId }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return [responseBody, customerId];
	}

	/**
	 * product advertisement  api methods
	 */

	// get all product advertisements
	async getAllProductAdvertisements(auth?: any) {
		const response = await this.request.get(endPoints.getAllProductAdvertisements, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// create a product advertisement
	async createProductAdvertisement(product: object, auth?: any) {
		const [body, productId] = await this.createProduct(product, auth);
		const sellerId = body.store.id;

		const response = await this.request.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const productAdvertisementId = responseBody.id;
		return [responseBody, productAdvertisementId];
	}

	/**
	 * abuse report api methods
	 */

	// get all abuse reports
	async getAllAbuseReports(auth?: any) {
		const response = await this.request.get(endPoints.getAllAbuseReports, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get abuse reportIa
	async getAbuseReportId(auth?: any) {
		const allAbuseReports = await this.getAllAbuseReports(auth);
		const abuseReportId = allAbuseReports[0].id;
		return abuseReportId;
	}

	/**
	 * announcements api methods
	 */

	// get all announcements
	async getAllAnnouncements(auth?: any) {
		const response = await this.request.get(endPoints.getAllAnnouncements, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// create announcement
	async createAnnouncement(payload: object, auth?: any): Promise<[object, string]> {
		const response = await this.request.post(endPoints.createAnnouncement, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const announcementId = responseBody.id;
		return [responseBody, announcementId];
	}

	// delete announcement
	async deleteAnnouncement(announcementId: string, auth?: any) {
		const response = await this.request.delete(endPoints.deleteAnnouncement(announcementId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update batch announcements
	async updateBatchAnnouncements(action: string, allIds: string[], auth?: any) {
		const response = await this.request.put(endPoints.updateBatchAnnouncements, { data: { [action]: allIds }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * product reviews api methods
	 */

	// get all product reviews
	async getAllProductReviews(auth?: any) {
		const response = await this.request.get(endPoints.getAllProductReviews, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get product review id
	async getProductReviewId(auth?: any) {
		const allProductReviews = await this.getAllProductReviews(auth);
		const reviewId = allProductReviews[0].id;
		return reviewId;
	}

	/**
	 * store reviews api methods
	 */

	// get all store reviews
	async getAllStoreReviews(auth?: any) {
		const response = await this.request.get(endPoints.getAllStoreReviews, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get store review id
	async getStoreReviewId(auth?: any) {
		const allStoreReviews = await this.getAllStoreReviews(auth);
		const reviewId = allStoreReviews[0].id;
		return reviewId;
	}

	// delete store review
	async deleteStoreReview(reviewId: string, auth?: any) {
		const response = await this.request.delete(endPoints.deleteStoreReview(reviewId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update batch store reviews
	async updateBatchStoreReviews(action: string, allIds: string[], auth?: any) {
		const response = await this.request.put(endPoints.updateBatchStoreReviews, { data: { [action]: allIds }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * store categories api methods
	 */

	// create store category
	async createStoreCategory(payload: object, auth?: any): Promise<[object, string]> {
		const response = await this.request.post(endPoints.createStoreCategory, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const categoryId = responseBody.id;
		return [responseBody, categoryId];
	}

	// get default store category
	async getDefaultStoreCategory(auth?: any) {
		const response = await this.request.get(endPoints.getDefaultStoreCategory, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		const categoryId = responseBody.id;
		return [responseBody, categoryId];
	}

	// get default store category
	async setDefaultStoreCategory(categoryId: string, auth?: any) {
		const response = await this.request.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * quote rules api methods
	 */

	// get all quote rules
	async getAllQuoteRules(auth?: any) {
		const response = await this.request.get(endPoints.getAllQuoteRules, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// create quote rule
	async createQuoteRule(payload: object, auth?: any) {
		const response = await this.request.post(endPoints.createQuoteRule, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const quoteRuleId = responseBody.id;
		return [responseBody, quoteRuleId];
	}

	// delete store review
	async deleteQuoteRule(quoteRuleId: string, auth?: any) {
		const response = await this.request.delete(endPoints.deleteQuoteRule(quoteRuleId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * request quote api methods
	 */

	// get all quote rules
	async getAllRequestQuotes(auth?: any) {
		const response = await this.request.get(endPoints.getAllRequestQuotes, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// create quote rule
	async createRequestQuote(payload: object, auth?: any): Promise<[object, string]> {
		const response = await this.request.post(endPoints.createRequestQuote, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const quoteRuleId = responseBody[0].data.id;
		return [responseBody, quoteRuleId];
	}

	// delete store review
	async deleteRequestQuote(quoteRuleId: string, auth?: any) {
		const response = await this.request.delete(endPoints.deleteRequestQuote(quoteRuleId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * wp  api methods
	 */

	// settings

	// get site settings
	async getSiteSettings(auth?: any) {
		const response = await this.request.get(endPoints.wp.getSiteSettings, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// set site settings
	async setSiteSettings(payload: object, auth?: any) {
		const response = await this.request.post(endPoints.wp.setSiteSettings, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// wp users

	// get all users
	async getAllUsers(auth?: any) {
		const response = await this.request.get(endPoints.wp.getAllUsers, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get user by role
	async getAllUsersByRole(role: string, auth?: any) {
		const response = await this.request.get(endPoints.wp.getAllUsersByRole(role), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get current user
	async getCurrentUser(auth?: any): Promise<[object, string]> {
		const response = await this.request.get(endPoints.wp.getCurrentUser, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		const userId = responseBody.id;
		return [responseBody, userId];
	}

	// get user by Id
	async getUserById(userId: string, auth?: any) {
		const response = await this.request.get(endPoints.wp.getUserById(userId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// create user
	async createUser(payload: object, auth?: any) { // administrator,  customer, seller
		const response = await this.request.post(endPoints.wp.createUser, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update user
	async updateUser(payload: object, auth?: any) {
		const response = await this.request.put(endPoints.wp.createUser, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// delete user
	async deleteUser(userId: string, auth?: any) {
		const response = await this.request.delete(endPoints.wp.deleteUser(userId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// plugins

	// get all plugins
	async getAllPlugins(auth?: any) {
		const response = await this.request.get(endPoints.wp.getAllPlugins, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get all plugins by status
	async getAllPluginByStatus(status: string, auth?: any) {
		const response = await this.request.get(endPoints.wp.getAllPluginsByStatus(status), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get single plugin
	async getSinglePlugin(plugin: string, auth?: any) {
		const response = await this.request.get(endPoints.wp.getSinglePlugin(plugin), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update plugin
	async updatePlugin(plugin: string, payload: object, auth?: any) {
		const response = await this.request.put(endPoints.wp.updatePlugin(plugin), { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// delete plugin
	async deletePlugin(plugin: string, auth?: any) {
		const response = await this.request.delete(endPoints.wp.deletePlugin(plugin), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	/**
	 * woocommerce  api methods
	 */

	// settings

	// get all wc setting options
	async getAllWcSettings(groupId: string, auth?: any) {
		const response = await this.request.get(endPoints.wc.getAllSettingOptions(groupId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get all single wc settings option
	async getSingleWcSettingsOption(groupId: string, optionId: string, auth?: any) {
		const response = await this.request.get(endPoints.wc.getSingleSettingOption(groupId, optionId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// set single wc settings option
	async updateSingleWcSettingsOption(groupId: string, optionId: string, payload: object, auth?: any) {
		const response = await this.request.post(endPoints.wc.updateSettingOption(groupId, optionId), { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update single wc settings option
	async updateBatchWcSettingsOptions(groupId: string, payload: object, auth?: any) {
		const response = await this.request.post(endPoints.wc.updateBatchSettingOptions(groupId), { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	// reviews

	//create product review
	async createProductReview(product: object, review: object, auth?: any) {
		const [, productId] = await this.createProduct(product);
		const response = await this.request.post(endPoints.wc.createReview, { data: { ...review, product_id: productId }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const reviewId = responseBody.id;
		return [responseBody, reviewId];
	}

	// categories

	// get all categories
	async getAllCategories(auth?: any) {
		const response = await this.request.get(endPoints.wc.getAllCategories, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get single category
	async getSingleCategory(categoryId: string, auth?: any) {
		const response = await this.request.get(endPoints.wc.getSingleCategory(categoryId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get categoryId
	async getCategoryId(categoryName: string, auth?: any) {
		const allCustomers = await this.getAllCustomers();
		const customerId = (allCustomers.find((o: { name: string; }) => o.name === categoryName)).id;
		return customerId;
	}

	// create category
	async createCategory(payload: object, auth?: any) {
		const response = await this.request.post(endPoints.wc.createCategory, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const categoryId = responseBody.id;
		return [responseBody, categoryId];
	}

	// update category
	async updateCategory(categoryId: string, payload: object, auth?: any) {
		const response = await this.request.put(endPoints.wc.updateCategory(categoryId), { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// delete category
	async deleteCategory(categoryId: string, auth?: any) {
		const response = await this.request.delete(endPoints.wc.deleteCategory(categoryId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update batch categories
	async updateBatchCategories(action: string, allIds: string[], auth?: any) {
		const response = await this.request.post(endPoints.wc.updateBatchCategories, { data: { [action]: allIds }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}

	// order

	// create order
	async createOrder(product: object, order: any, auth?: any){
		const [, productId] = await this.createProduct(product, auth);
		const payload = order;
		payload.line_items[0].product_id = productId;
		const response = await this.request.post(endPoints.wc.createOrder, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const orderId = responseBody.id;
		return [responseBody, orderId];
	}

	// create complete order
	async createOrderWithStatus(product: object, order: any, status: string, auth?: any) {
		const [, orderId] = await this.createOrder(product, order, auth);
		await this.updateOrderStatus(orderId, status);
		return orderId;
	}

	// refund

	// create refund
	async createRefund(orderId: string, refund: object, auth?: any): Promise<[object, string]> {
		const response = await this.request.post(endPoints.wc.createRefund(orderId), { data: refund, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const refundId = responseBody.id;
		return [responseBody, refundId];
	}

	// tax

	// get all tax rate
	async getAllTaxRates(auth?: any) {
		const response = await this.request.get(endPoints.wc.getAllTaxRates, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// create tax rate
	async createTaxRate(payload: object, auth?: any) {
		const response = await this.request.post(endPoints.wc.createTaxRate, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update batch tax rates
	async updateBatchTaxRates(action: string, allIds: string[], auth?: any) {
		const response = await this.request.put(endPoints.wc.updateBatchTaxRates, { data: { [action]: allIds }, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// setup tax 
	async setUpTaxRate(enableTaxPayload: any, taxPayload: any) {
		// enable tax rate
		await this.updateBatchWcSettingsOptions('general', enableTaxPayload);

		// delete previous tax rates
		const allTaxRateIds = (await this.getAllTaxRates()).map((a: { id: any }) => a.id);
		if (allTaxRateIds.length) {
			await this.updateBatchTaxRates('delete', allTaxRateIds);
		}

		// create tax rate
		const taxRateResponse = await this.createTaxRate(taxPayload);
		expect(parseInt(taxRateResponse.rate)).toBe(parseInt(taxPayload.rate));
		return Number(taxPayload.rate)
	}

	// shipping

	// get all shipping zones
	async getAllShippingZones(auth?: any) {
		const response = await this.request.get(endPoints.wc.getAllShippingZones, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get zoneId
	async getZoneId(zoneName: string, auth?: any) {
		const allZones = await this.getAllShippingZones();
		const zoneId = (allZones.find((o: { name: string; }) => o.name === zoneName)).id;
		return zoneId;
	}

	// create shipping zone
	async createShippingZone(payload: object, auth?: any): Promise<[object, string]> {
		const response = await this.request.post(endPoints.wc.createShippingZone, { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		const shippingZoneId = responseBody.id;
		return [responseBody, shippingZoneId];
	}

	// delete shipping zone
	async deleteShippingZone(zoneId: string, auth?: any) {
		const response = await this.request.delete(endPoints.wc.deleteShippingZone(zoneId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get all shipping zone locations
	async getAllShippingZoneLocations(zoneId: string, auth?: any) {
		const response = await this.request.get(endPoints.wc.getAllShippingZoneLocations(zoneId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// add shipping zone location
	async addShippingZoneLocation(zoneId: string, zoneLocation: object, auth?: any) {
		const response = await this.request.put(endPoints.wc.addShippingZoneLocation(zoneId), { data: zoneLocation });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get all shipping zone methods
	async getAllShippingZoneMethods(zoneId: string, auth?: any) {
		const response = await this.request.get(endPoints.wc.getAllShippingZoneMethods(zoneId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// add shipping method
	async addShippingZoneMethod(zoneId: string, zoneMethod: object, auth?: any) {
		const response = await this.request.post(endPoints.wc.addShippingZoneMethod(zoneId), { data: zoneMethod, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// payment

	// get all payment gateway
	async getAllPaymentGateways(auth?: any): Promise<object> {
		const response = await this.request.get(endPoints.wc.getAllPaymentGateways, { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// get single payment gateway
	async getSinglePaymentGateway(paymentGatewayId: string, auth?: any): Promise<object> {
		const response = await this.request.get(endPoints.wc.getSinglePaymentGateway(paymentGatewayId), { headers: auth });
		const responseBody = await this.getResponseBody(response);
		return responseBody;
	}

	// update payment gateway
	async updatePaymentGateway(paymentGatewayId: string, payload: object, auth?: any) {
		const response = await this.request.put(endPoints.wc.updatePaymentGateway(paymentGatewayId), { data: payload, headers: auth });
		const responseBody = await this.getResponseBody(response);
		return [response, responseBody];
	}
}