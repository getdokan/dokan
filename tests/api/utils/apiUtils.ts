import { type APIRequestContext } from '@playwright/test'
import { endPoints } from './apiEndPoints'


export class ApiUtils {

    readonly request: APIRequestContext

    constructor(request: APIRequestContext) {
        this.request = request
    }

    // get basic auth
    async getBasicAuth(user: any): Promise<string> {
        const basicAuth = 'Basic ' + Buffer.from(user.username + ':' + user.password).toString('base64');
        return basicAuth
    }

    // get site headers
    async getSiteHeaders() {
        let response = await this.request.head(endPoints.serverUrl)
        let headers = response.headers()
        return headers
    }

    // get responseBody
    async getResponseBody(response: any) {
        let responseBody: any
        try {
            responseBody = await response.json()
            // console.log('Status Code: ', response.status())
            // console.log('ResponseBody: ', responseBody)
        } catch (err) {
            console.log('Status Code: ', response.status())
            console.log('Error: ', err.message)
            console.log('Response text: ', await response.text())
        }
        return responseBody
    }


    /**
     * dummy data api methods
     */

    async importDummyData(payload: object) {
        let response = await this.request.post(endPoints.importDummyData, { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
     * store api methods
     */


    // get all stores
    async getAllStores(auth?: any) {
        let response = await this.request.get(endPoints.getAllStores, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single store
    async getSingleStore(orderId: string, auth?: any) {
        let response = await this.request.get(endPoints.getSingleStore(orderId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get sellerId
    async getSellerId(storeName?: string, auth?: any): Promise<string> {
        let allStores = await this.getAllStores(auth)
        let sellerId = storeName ? (allStores.find((o: { store_name: string; }) => o.store_name === storeName)).id : allStores[0].id
        // console.log(sellerId) 
        return sellerId
    }

    // create store
    async createStore(payload: object, auth?: any) {
        let response = await this.request.post(endPoints.createStore, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let sellerId = responseBody.id
        // console.log(sellerId)
        return [responseBody, sellerId]
    }

    // create store review
    async createStoreReview(sellerId: string, payload: object, auth?: any) {
        let response = await this.request.post(endPoints.createStoreReview(sellerId), { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let reviewId = responseBody.id
        return [responseBody, reviewId]
    }


    /**
     * follow store methods
     */


    // follow unfollow store
    async followUnfollowStore(sellerId: string, auth?: any) {
        let response = await this.request.post(endPoints.followUnfollowStore, { data: { vendor_id: Number(sellerId) }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
     * product api methods
     */


    // get all products
    async getAllProducts(auth?: any) {
        let response = await this.request.get(endPoints.getAllProducts, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get productId
    async getProductId(productName: string, auth?: any) {
        let allProducts = await this.getAllProducts(auth)
        let productId = productName ? (allProducts.find((o: { name: string; }) => o.name === productName)).id : allProducts[0].id
        // console.log(productId)
        return productId
    }

    // create product
    async createProduct(payload: object, auth?: any) {
        let response = await this.request.post(endPoints.createProduct, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let productId = responseBody.id
        // console.log(productId)
        return [responseBody, productId]
    }


    /**
     * product variation api methods
     */


    // create product
    async createProductVariation(productId: string, payload: object, auth?: any) {
        let response = await this.request.post(endPoints.createProductVariation(productId), { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let variationId = responseBody.id
        // console.log(variationId)
        return [responseBody, variationId]
    }

    // get variationTd
    async getVariationId(productName: string, auth?: any) {
        let productId = await this.getProductId(productName, auth)
        // console.log(productId)

        let response = await this.request.get(endPoints.getAllProductVariations(productId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        let variationId = responseBody[0].id
        // console.log(variationId)
        return [productId, variationId]
    }

    // get variationTd
    async createVariableProductWithVariation(attribute: object, attributeTerm: object, product: object, auth?: any) {
        let [, productId] = await this.createProduct(product)
        let [body, attributeId,] = await this.createAttributeTerm(attribute, attributeTerm)
        let payload = {
            ...product, attributes: [{
                id: attributeId,
                option: body.name
            }],
        }
        let [responseBody, variationId] = await this.createProductVariation(productId, payload)
        // console.log(productId, variationId)
        return [productId, variationId]
    }


    /**
     * attribute api methods
     */


    // get all attributes
    async getAllAttributes(auth?: any) {
        let response = await this.request.get(endPoints.getAllAttributes, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single attribute
    async getSingleAttribute(attributeId: string, auth?: any) {
        let response = await this.request.get(endPoints.getSingleAttribute(attributeId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get attributeId
    async getAttributeId(auth?: any) {
        let allAttributes = await this.getAllAttributes(auth)
        let attributeId = allAttributes[0].id
        // console.log(attributeId)
        return attributeId
    }

    // create attribute
    async createAttribute(payload: object, auth?: any) {
        let response = await this.request.post(endPoints.createAttribute, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let attributeId = responseBody.id
        // console.log(attributeId)
        return [responseBody, attributeId]
    }


    /**
     * attribute term api methods
     */


    // get all attribute terms
    async getAllAttributeTerms(attributeId: string, auth?: any) {
        let response = await this.request.get(endPoints.getAllAttributeTerms(attributeId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single attribute term
    async getSingleAttributeTerm(attributeId: string, attributeTermId: string, auth?: any) {
        let response = await this.request.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create attribute term
    async createAttributeTerm(attribute: object, attributeTerm: object, auth?: any) {
        let [, attributeId] = await this.createAttribute(attribute)
        let response = await this.request.post(endPoints.createAttributeTerm(attributeId), { data: attributeTerm, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let attributeTermId = responseBody.id
        // console.log(attributeTermId)
        return [responseBody, attributeId, attributeTermId]
    }


    /**
     * coupon api methods
     */


    // get all coupons
    async getAllCoupons(auth?: any) {
        let response = await this.request.get(endPoints.getAllCoupons, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get couponId
    async getCouponId(couponCode: string, auth?: any) {
        let allCoupons = await this.getAllCoupons(auth)
        let couponId = couponCode ? (couponCode = allCoupons.find((o: { code: string; }) => o.code === couponCode)).id : allCoupons[0].id
        // console.log(couponId)
        return couponId
    }

    // create coupon
    async createCoupon(productId: string, coupon: any, auth?: any): Promise<[object, string]> {
        let response = await this.request.post(endPoints.createCoupon, { data: { ...coupon, product_ids: productId }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let couponId = responseBody.id
        // console.log(couponId)
        return [responseBody, couponId]
    }


    /**
     * withdraw api methods
     */


    // get all withdraws
    async getMinimumWithdrawLimit(auth?: any) {
        let response = await this.request.get(endPoints.getBalanceDetails, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        let minimumWithdrawLimit = String(Math.abs(responseBody.withdraw_limit))
        return minimumWithdrawLimit
    }

    // get all withdraws
    async getAllWithdraws(auth?: any) {
        let response = await this.request.get(endPoints.getAllWithdraws, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all withdraws by status
    async getAllWithdrawsByStatus(status: string, auth?: any) {
        let response = await this.request.get(endPoints.getAllWithdrawsByStatus(status), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get withdrawId
    async getPendingWithdrawId(auth?: any) {
        let withdraw = await this.getAllWithdrawsByStatus('pending')
        let withdrawId = withdraw[0].id
        // console.log(withdrawId)
        return withdrawId
    }

    // create withdraw
    async createWithdraw(payload: object, auth?: any): Promise<[object, string]> {
        let response = await this.request.post(endPoints.createWithdraw, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let withdrawId = responseBody.id
        // console.log(couponId)
        return [responseBody, withdrawId]
    }

    // cancel withdraw
    async cancelWithdraw(withdrawId: string) {
        let response = await this.request.delete(endPoints.cancelAWithdraw(withdrawId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
     * order api methods
     */


    // get all orders
    async getAllOrders(auth?: any) {
        let response = await this.request.get(endPoints.getAllOrders, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single order
    async getSingleOrder(orderId: string, auth?: any) {
        let response = await this.request.get(endPoints.getSingleOrder(orderId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get orderId
    async getOrderId(auth?: any) {
        let allOrders = await this.getAllOrders(auth)
        let orderId = allOrders[0].id
        // console.log(orderId)
        return orderId
    }

    // update order status
    async updateOrderStatus(orderId: string, orderStatus: string, auth?: any) {
        let response = await this.request.put(endPoints.updateOrder(orderId), { data: { status: orderStatus }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * order notes api methods
    */


    // create attribute term
    async createOrderNote(product: object, order: object, orderNote: object, auth?: any) {
        let [, orderId] = await this.createOrder(product, order, auth)
        let response = await this.request.post(endPoints.createOrderNote(orderId), { data: orderNote, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let orderNoteId = responseBody.id
        // console.log(orderNoteId)
        return [responseBody, orderId, orderNoteId]
    }

    /**
    * refund api methods
    */

    // get all orders
    async getAllRefunds(auth?: any) {
        let response = await this.request.get(endPoints.getAllRefunds, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get orderId
    async getRefundId(auth?: any) {
        let allRefunds = await this.getAllRefunds(auth)
        let refundId = allRefunds[0].id
        // console.log(refundId)
        return refundId
    }


    /**
    * dokan settings  api methods
    */


    // get store settings
    async getStoreSettings(auth?: any) {
        let response = await this.request.get(endPoints.getSettings, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // set store settings
    async setStoreSettings(payload: object, auth?: any) {
        let response = await this.request.put(endPoints.updateSettings, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * support ticket  api methods
    */


    // get all support tickets
    async getAllSupportTickets(auth?: any) {
        let response = await this.request.get(endPoints.getAllSupportTickets, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get support ticket id
    async getSupportTicketId(auth?: any): Promise<[string, string]> {
        let allSupportTickets = await this.getAllSupportTickets(auth)
        let supportTicketId = allSupportTickets[0].ID
        let sellerId = allSupportTickets[0].vendor_id
        // console.log(supportTicketId)
        // console.log(sellerId)
        return [supportTicketId, sellerId]
    }

    // create support ticket comment
    async createSupportTicketComment(payload: object, auth?: any) {
        let [supportTicketId,] = await this.getSupportTicketId(auth)
        let response = await this.request.post(endPoints.createSupportTicketComment(supportTicketId), { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update support ticket status
    async updateSupportTicketStatus(supportTicketId: string, status: string, auth?: any) {
        let response = await this.request.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: { status: status }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * reverse withdrawal  api methods
    */


    // get all reverse withdrawal stores
    async getAllReverseWithdrawalStores(auth?: any) {
        let response = await this.request.get(endPoints.getAllReverseWithdrawalStores, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get orderId
    async getReverseWithdrawalStoreId(auth?: any) {
        let allReverseWithdrawalStores = await this.getAllReverseWithdrawalStores(auth)
        let reverseWithdrawalStoreId = allReverseWithdrawalStores[0].id
        // console.log(reverseWithdrawalStoreId)
        return reverseWithdrawalStoreId
    }


    /**
    * module  api methods
    */

    // get all modules
    async getAllModules(auth?: any) {
        let response = await this.request.get(endPoints.getAllModules, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all modules ids
    async getAllModuleIds(auth?: any) {
        let allModuleIds = (await this.getAllModules(auth)).map((a: { id: any; }) => a.id)
        // console.log(allModuleIds)
        return allModuleIds
    }

    // activate modules
    async activateModules(moduleIds: string, auth?: any) {
        let response = await this.request.put(endPoints.activateModule, { data: { module: [moduleIds] }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let activeStatus = responseBody.active
        return responseBody
    }

    // deactivate modules
    async deactivateModules(moduleIds: string, auth?: any) {
        let response = await this.request.put(endPoints.deactivateModule, { data: { module: [moduleIds] }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * customers  api methods
    */


    // get all customers
    async getAllCustomers(auth?: any) {
        let response = await this.request.get(endPoints.getAllCustomers, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get customerId
    async getCustomerId(username: string, auth?: any) {
        let allCustomers = await this.getAllCustomers(auth)
        let customerId = (allCustomers.find((o: { username: string; }) => o.username === username)).id
        // console.log(customerId)
        return customerId
    }

    // create customer
    async createCustomer(payload: object, auth?: any): Promise<[object, string]> {
        let response = await this.request.post(endPoints.createCustomer, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let customerId = String(responseBody.id)
        return [responseBody, customerId]
    }

    // delete customer
    async deleteCustomer(userId: string, auth?: any) {
        let response = await this.request.delete(endPoints.deleteCustomer(userId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * wholesale customers  api methods
    */


    // get all wholesale customers
    async getAllWholesaleCustomers(auth?: any) {
        let response = await this.request.get(endPoints.getAllWholesaleCustomers, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    // create a wholesale customer
    async createWholesaleCustomer(payload: object, auth?: any) {
        let [, customerId] = await this.createCustomer(payload, auth)

        let response = await this.request.post(endPoints.createWholesaleCustomer, { data: { id: customerId }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        // console.log(customerId)
        return [responseBody, customerId]
    }


    /**
    * product advertisement  api methods
    */


    // get all product advertisements
    async getAllProductAdvertisements(auth?: any) {
        let response = await this.request.get(endPoints.getAllProductAdvertisements, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create a product advertisement
    async createProductAdvertisement(product: object, auth?: any) {
        let [body, productId] = await this.createProduct(product, auth)
        let sellerId = body.store.id

        let response = await this.request.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let productAdvertisementId = responseBody.id
        // console.log(productAdvertisementId)
        return [responseBody, productAdvertisementId]
    }


    /**
     * abuse report api methods
     */


    // get all abuse reports
    async getAllAbuseReports(auth?: any) {
        let response = await this.request.get(endPoints.getAllAbuseReports, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get abuse reportIa
    async getAbuseReportId(auth?: any) {
        let allAbuseReports = await this.getAllAbuseReports(auth)
        let abuseReportId = allAbuseReports[0].id
        // console.log(abuseReportId)
        return abuseReportId
    }


    /**
     * announcements api methods
     */


    // get all announcements
    async getAllAnnouncements(auth?: any) {
        let response = await this.request.get(endPoints.getAllAnnouncements, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create announcement
    async createAnnouncement(payload: object, auth?: any): Promise<[object, string]> {
        let response = await this.request.post(endPoints.createAnnouncement, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let announcementId = responseBody.id
        // console.log(announcementId)
        return [responseBody, announcementId]
    }

    // delete announcement
    async deleteAnnouncement(announcementId: string, auth?: any) {
        let response = await this.request.delete(endPoints.deleteAnnouncement(announcementId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update batch announcements
    async updateBatchAnnouncements(action: string, allIds: string[], auth?: any) {
        let response = await this.request.put(endPoints.updateBatchAnnouncements, { data: { [action]: allIds }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
     * product reviews api methods
     */


    // get all product reviews
    async getAllProductReviews(auth?: any) {
        let response = await this.request.get(endPoints.getAllProductReviews, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get product review id
    async getProductReviewId(auth?: any) {
        let allProductReviews = await this.getAllProductReviews(auth)
        let reviewId = allProductReviews[0].id
        // console.log(reviewId)
        return reviewId
    }


    /**
     * store reviews api methods
     */


    // get all store reviews
    async getAllStoreReviews(auth?: any) {
        let response = await this.request.get(endPoints.getAllStoreReviews, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get store review id
    async getStoreReviewId(auth?: any) {
        let allStoreReviews = await this.getAllStoreReviews(auth)
        let reviewId = allStoreReviews[0].id
        // console.log(reviewId)
        return reviewId
    }

    // delete store review 
    async deleteStoreReview(reviewId: string, auth?: any) {
        let response = await this.request.delete(endPoints.deleteStoreReview(reviewId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update batch store reviews 
    async updateBatchStoreReviews(action: string, allIds: string[], auth?: any) {
        let response = await this.request.put(endPoints.updateBatchStoreReviews, { data: { [action]: allIds }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
     * store categories api methods
    */


    // create store category
    async createStoreCategory(payload: object, auth?: any): Promise<[object, string]> {
        let response = await this.request.post(endPoints.createStoreCategory, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let categoryId = responseBody.id
        // console.log(categoryId)
        return [responseBody, categoryId]
    }

    // get default store category
    async getDefaultStoreCategory(auth?: any) {
        let response = await this.request.get(endPoints.getDefaultStoreCategory, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        let categoryId = responseBody.id
        // console.log(categoryId)
        return [responseBody, categoryId]
    }

    // get default store category
    async setDefaultStoreCategory(categoryId: string, auth?: any) {
        let response = await this.request.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    /**
    * quote rules api methods
    */

    // get all quote rules
    async getAllQuoteRules(auth?: any) {
        let response = await this.request.get(endPoints.getAllQuoteRules, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create quote rule
    async createQuoteRule(payload: object, auth?: any) {
        // console.log(payload)
        let response = await this.request.post(endPoints.createQuoteRule, { data: payload, headers: auth })
        // console.log(response.status())
        let responseBody = await this.getResponseBody(response)
        let quoteRuleId = responseBody.id
        // console.log(responseBody)
        // console.log(quoteRuleId)
        return [responseBody, quoteRuleId]
    }

    // delete store review 
    async deleteQuoteRule(quoteRuleId: string, auth?: any) {
        let response = await this.request.delete(endPoints.deleteQuoteRule(quoteRuleId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * request quote api methods
    */


    // get all quote rules
    async getAllRequestQuotes(auth?: any) {
        let response = await this.request.get(endPoints.getAllRequestQuotes, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create quote rule
    async createRequestQuote(payload: object, auth?: any): Promise<[object, string]> {
        let response = await this.request.post(endPoints.createRequestQuote, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let quoteRuleId = responseBody[0].data.id
        // console.log(quoteRuleId)
        return [responseBody, quoteRuleId]
    }

    // delete store review 
    async deleteRequestQuote(quoteRuleId: string, auth?: any) {
        let response = await this.request.delete(endPoints.deleteRequestQuote(quoteRuleId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * order downloads  api methods
    */


    // get all order download
    async getAllOrderDownloads(orderId: string, auth?: any) {
        let response = await this.request.get(endPoints.getAllOrderDownloads(orderId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create order download
    // async createOrderDownload(orderId: string, downloadableProducts: string[], auth?: any): Promise<[object, string]> {
    async createOrderDownload(orderId: string, downloadableProducts: string[], auth?: any) {
        let response = await this.request.post(endPoints.createOrderDownload(orderId), { data: { ids: downloadableProducts } })
        let responseBody = await this.getResponseBody(response)
        // let downloadId = responseBody[0].data.id
        // console.log(downloadId)
        // return [responseBody, downloadId]
    }





    /**
    * wp  api methods
    */


    // settings

    // get site settings
    async getSiteSettings(auth?: any) {
        let response = await this.request.get(endPoints.wp.getSiteSettings, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // set site settings 
    async setSiteSettings(payload: object, auth?: any) {
        let response = await this.request.post(endPoints.wp.setSiteSettings, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // wp users

    // get all users
    async getAllUsers(auth?: any) {
        let response = await this.request.get(endPoints.wp.getAllUsers, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get user by role
    async getAllUsersByRole(role: string, auth?: any) {
        let response = await this.request.get(endPoints.wp.getAllUsersByRole(role), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get current user
    async getCurrentUser(auth?: any): Promise<[object, string]> {
        let response = await this.request.get(endPoints.wp.getCurrentUser, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        let userId = responseBody.id
        // console.log(userId)
        return [responseBody, userId]
    }

    // get user by Id
    async getUserById(userId: string, auth?: any) {
        let response = await this.request.get(endPoints.wp.getUserById(userId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create user
    async createUser(payload: object, auth?: any) {   // administrator,  customer, seller
        let response = await this.request.post(endPoints.wp.createUser, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update user
    async updateUser(payload: object, auth?: any) {
        let response = await this.request.put(endPoints.wp.createUser, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // delete user
    async deleteUser(userId: string, auth?: any) {
        let response = await this.request.delete(endPoints.wp.deleteUser(userId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // plugins

    // get all plugins
    async getAllPlugins(auth?: any) {
        let response = await this.request.get(endPoints.wp.getAllPlugins, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all plugins by status
    async getAllPluginByStatus(status: string, auth?: any) {
        let response = await this.request.get(endPoints.wp.getAllPluginsByStatus(status), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single plugin
    async getSinglePlugin(plugin: string, auth?: any) {
        let response = await this.request.get(endPoints.wp.getSinglePlugin(plugin), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update plugin
    async updatePlugin(plugin: string, payload: object, auth?: any) {
        let response = await this.request.put(endPoints.wp.updatePlugin(plugin), { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // delete plugin
    async deletePlugin(plugin: string, auth?: any) {
        let response = await this.request.delete(endPoints.wp.deletePlugin(plugin), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }





    /**
    * woocommerce  api methods
    */

    // settings

    // get all wc setting options
    async getAllWcSettings(groupId: string, auth?: any) {
        let response = await this.request.get(endPoints.wc.getAllSettingOptions(groupId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all single wc settings option
    async getSingleWcSettingsOption(groupId: string, optionId: string, auth?: any) {
        let response = await this.request.get(endPoints.wc.getSingleSettingOption(groupId, optionId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // set single wc settings option
    async updateSingleWcSettingsOption(groupId: string, optionId: string, payload: object, auth?: any) {
        let response = await this.request.post(endPoints.wc.updateSettingOption(groupId, optionId), { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update single wc settings option
    async updateBatchWcSettingsOptions(groupId: string, payload: object, auth?: any) {
        let response = await this.request.post(endPoints.wc.updateBatchSettingOptions(groupId), { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // reviews

    //create product review
    async createProductReview(product: object, review: object, auth?: any) {
        let [, productId] = await this.createProduct(product)
        let response = await this.request.post(endPoints.wc.createReview, { data: { ...review, product_id: productId }, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let reviewId = responseBody.id
        // console.log(reviewId)
        return [responseBody, reviewId]
    }

    // categories

    // get all categories
    async getAllCategories(auth?: any) {
        let response = await this.request.get(endPoints.wc.getAllCategories, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single category
    async getSingleCategory(categoryId: string, auth?: any) {
        let response = await this.request.get(endPoints.wc.getSingleCategory(categoryId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get categoryId
    async getCategoryId(categoryName: string, auth?: any) {
        let allCustomers = await this.getAllCustomers()
        let customerId = (allCustomers.find(o => o.name === categoryName)).id
        // console.log(customerId)
        return customerId
    }

    // create category
    async createCategory(payload: object, auth?: any) {
        let response = await this.request.post(endPoints.wc.createCategory, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let categoryId = responseBody.id
        // console.log(categoryId)
        return [responseBody, categoryId]
    }

    // update category
    async updateCategory(categoryId: string, payload: object, auth?: any) {
        let response = await this.request.put(endPoints.wc.updateCategory(categoryId), { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // delete category
    async deleteCategory(categoryId: string, auth?: any) {
        let response = await this.request.delete(endPoints.wc.deleteCategory(categoryId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    // order

    // create order
    async createOrder(product: object, order: any, auth?: any): Promise<[object, string]> {
        let [, productId] = await this.createProduct(product, auth)
        // let productId = product
        let payload = order
        payload.line_items[0].product_id = productId
        let response = await this.request.post(endPoints.wc.createOrder, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let orderId = responseBody.id
        // console.log(orderId)
        return [responseBody, orderId]
    }

    // create complete order
    async createOrderWithStatus(product: object, order: any, status: string, auth?: any) {
        let [, orderId] = await this.createOrder(product, order, auth)
        await this.updateOrderStatus(orderId, status)
        // console.log(orderId)
        return orderId
    }

    // refund

    // create refund
    async createRefund(orderId: string, refund: object, auth?: any): Promise<[object, string]> {

        let response = await this.request.post(endPoints.wc.createRefund(orderId), { data: refund, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let refundId = responseBody.id
        // console.log(refundId)
        return [responseBody, refundId]
    }



    // tax


    // create tax rate
    async createTaxRate(payload: object, auth?: any) {
        let response = await this.request.post(endPoints.wc.createTaxRate, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    // shipping

    // get all shipping zones
    async getAllShippingZones(auth?: any) {
        let response = await this.request.get(endPoints.wc.getAllShippingZones, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get zoneId
    async getZoneId(zoneName: string, auth?: any) {
        let allZones = await this.getAllShippingZones()
        let zoneId = (allZones.find((o: { name: string; }) => o.name === zoneName)).id
        // console.log(zoneId)
        return zoneId
    }

    // create shipping zone 
    async createShippingZone(payload: object, auth?: any): Promise<[object, string]> {
        let response = await this.request.post(endPoints.wc.createShippingZone, { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let shippingZoneId = responseBody.id
        // console.log(shippingZoneId)
        return [responseBody, shippingZoneId]
    }

    // get all shipping zone locations
    async getAllShippingZoneLocations(zoneId: string, auth?: any) {
        let response = await this.request.get(endPoints.wc.getAllShippingZoneLocations(zoneId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // add shipping zone location
    async addShippingZoneLocation(zoneId: string, zoneLocation: object, auth?: any) {
        let response = await this.request.put(endPoints.wc.addShippingZoneLocation(zoneId), { data: zoneLocation })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all shipping zone methods
    async getAllShippingZoneMethods(zoneId: string, auth?: any) {
        let response = await this.request.get(endPoints.wc.getAllShippingZoneMethods(zoneId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // add shipping method
    async addShippingZoneMethod(zoneId: string, zoneMethod: object, auth?: any) {
        let response = await this.request.post(endPoints.wc.addShippingZoneMethod(zoneId), { data: zoneMethod, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // payment

    // get all payment gateway
    async getAllPaymentGateways(auth?: any): Promise<object> {
        let response = await this.request.get(endPoints.wc.getAllPaymentGateways, { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single payment gateway
    async getSinglePaymentGateway(paymentGatewayId: string, auth?: any): Promise<object> {
        let response = await this.request.get(endPoints.wc.getSinglePaymentGateway(paymentGatewayId), { headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update payment gateway
    async updatePaymentGateway(paymentGatewayId: string, payload: object, auth?: any): Promise<object> {
        let response = await this.request.put(endPoints.wc.updatePaymentGateway(paymentGatewayId), { data: payload, headers: auth })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }
}