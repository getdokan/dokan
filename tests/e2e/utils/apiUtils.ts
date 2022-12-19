import { type APIRequestContext } from '@playwright/test'
import { endPoints } from './apiEndPoints'
import { payloads } from './payloads'
import * as storageState from '../storageState.json';

//TODO: update all predefine payload to function argument

export class ApiUtils {

    readonly request: APIRequestContext

    constructor(request: APIRequestContext) {
        this.request = request
    }

    // get cookie
    async getCookie() {
        let cookieName = String(storageState.cookies[3].name)
        let cookieValue = String(storageState.cookies[3].value)
        let cookie = cookieName + '=' + cookieValue
        return cookie
    }

    // get basic auth
    async getBasicAuth(user: any): Promise<string> {
        const basicAuth = 'Basic ' + Buffer.from(user.username + ':' + user.password).toString('base64');
        return basicAuth
    }

    // get respondbody
    async getResponseBody(response: any) {
        let responseBody: any
        try {
            responseBody = await response.json()
            // console.log(responseBody)
        } catch (err) {
            console.log('Error: ', err.message)
            console.log('Status Code: ', response.status())
            // console.log('Response text: ', await response.text())
        }
        return responseBody
    }

    // get site headers
    async getSiteHeaders() {
        let response = await this.request.head(endPoints.serverlUrl)
        let headers = response.headers()
        return headers
    }

    async plainPermalink() {
        let headers = await this.getSiteHeaders()
        let link = headers.link
        return link.includes('rest_route')
    }

    /**
     * store api methods
     */


    // get all stores
    async getAllStores() {
        let response = await this.request.get(endPoints.getAllStores)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get sellerId
    async getSellerId(firstName: string) {
        let allStores = await this.getAllStores()

        // let sellerId = ''
        // if (firstName) {
        //     sellerId = (allStores.find(o => o.first_name === firstName)).id
        // } else {
        //     sellerId = allStores[0].id
        // }

        let sellerId = (allStores.find(o => o.first_name === firstName)).id
        // console.log(sellerId)
        return sellerId
    }

    // create store
    async createStore(payload: object) {
        let response = await this.request.post(endPoints.createStore, { data: payload })
        // console.log(response.status())
        let responseBody = await this.getResponseBody(response)
        let sellerId = responseBody.id
        // console.log(sellerId)
        return [responseBody, sellerId]
    }

    // create store review
    async createStoreReview(sellerId: string, payload: object, auth?: any) {  //TODO: implete auth to every function 
        let response = await this.request.post(endPoints.createStoreReview(sellerId), { data: payloads.createStoreReview, headers: auth })
        let responseBody = await this.getResponseBody(response)
        let reviewId = responseBody.id
        // console.log(reviewId)
        return [responseBody, reviewId]
    }


    /**
     * folloew store methods
     */

    // follow unfollow store
    async followUnfollowStore(sellerId: string) {
        let response = await this.request.post(endPoints.followUnfollowStore, { data: { vendor_id: Number(sellerId) } })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    /**
     * product api methods
     */


    // get all products
    async getAllProducts() {
        let response = await this.request.get(endPoints.getAllProducts)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get productId
    // let productId = (responseBody1.find(o => o.name === 'p1_v1')).id
    async getProductId(productName: string) {
        let allProducts = await this.getAllProducts()

        // let productId = ''
        // if (productName) {
        //     productId = (allProducts.find(o => o.name === productName)).id
        // } else {
        //     productId = allProducts[0].id
        // }

        let productId = (allProducts.find(o => o.name === productName)).id
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
    async createProductVariation(productId: string, payload: object) {
        let response = await this.request.post(endPoints.createProductVariation(productId), { data: payload })
        let responseBody = await this.getResponseBody(response)
        let variationId = responseBody.id
        // console.log(variationId)
        return [responseBody, variationId]
    }

    // get variationTd
    async getVariationId(productName: string) {
        let productId = await this.getProductId(productName)
        // console.log(productId)

        let response = await this.request.get(endPoints.getAllProductVariations(productId))
        let responseBody = await this.getResponseBody(response)
        let variationId = responseBody[0].id
        // console.log(variationId)
        return [productId, variationId]
    }

    // get variationTd
    async createVariableProductWithVariation(attribute: object, attributeTerm: object, product: object) {
        let [, productId] = await this.createProduct(product)
        let [body, attributeId,] = await this.createAttributeTerm(attribute, attributeTerm)
        let payload = {
            ...payloads.createProductVariation, attributes: [{
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
    async getAllAttributes() {
        let response = await this.request.get(endPoints.getAllAttributes)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get attributeId
    async getAttributeId() {
        let allAttributes = await this.getAllAttributes()
        let attributeId = allAttributes[0].id
        // console.log(attributeId)
        return attributeId
    }

    // create attribute
    async createAttribute(payload: object) {
        let response = await this.request.post(endPoints.createAttribute, { data: payload })
        let responseBody = await this.getResponseBody(response)
        let attributeId = responseBody.id
        // console.log(attributeId)
        return [responseBody, attributeId]
    }

    /**
     * attribute term api methods
     */

    // get all attribute terms
    async getAllAttributeTerms(attributeId: string) {
        let response = await this.request.get(endPoints.getAllAttributeTerms(attributeId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    // create attribute term
    async createAttributeTerm(attribute: object, attributeTerm: object) {
        let [, attributeId] = await this.createAttribute(attribute)
        let response = await this.request.post(endPoints.createAttributeTerm(attributeId), { data: attributeTerm })
        let responseBody = await this.getResponseBody(response)
        let attributeTermId = responseBody.id
        // console.log(attributeTermId)
        return [responseBody, attributeId, attributeTermId]
    }


    /**
     * coupon api methods
     */

    // get all coupons
    async getAllCoupons() {
        let response = await this.request.get(endPoints.getAllCoupons)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get couponId
    async getCouponId(couponCode: string) {
        let allCoupons = await this.getAllCoupons()

        // let couponId = ''
        // if (couponCode) {
        //     couponCode = (allCoupons.find(o => o.code === couponCode)).id
        // } else {
        //     couponCode = allCoupons[0].id
        // }

        let couponId = (couponCode = allCoupons.find(o => o.code === couponCode)).id
        // console.log(couponId)
        return couponId
    }

    // create coupon
    async createCoupon(product: object, coupon: any): Promise<[object, string]> {
        let [, productId] = await this.createProduct(product) // TODO: might need to seperate createProduct from createCoupon,product review,....
        // let payloadCoupon = payloads.createCoupon()
        // coupon.product_ids = [productId]
        // console.log(payloadCoupon)

        let response = await this.request.post(endPoints.createCoupon, { data: { ...coupon, product_ids: productId } })
        let responseBody = await this.getResponseBody(response)
        let couponId = responseBody.id
        // console.log(couponId)
        return [responseBody, couponId]
    }


    /**
     * withdraw api methods
     */

    // get all withdraws
    async getMinimumWithdrawLimit() {
        let response = await this.request.get(endPoints.getBalanceDetails)
        let responseBody = await this.getResponseBody(response)
        let minimumWithdrawLimit = String(Math.abs(responseBody.withdraw_limit))
        return minimumWithdrawLimit
    }

    // get all withdraws
    async getAllWithdraws() {
        let response = await this.request.get(endPoints.getAllWithdraws)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all withdraws by status
    async getAllWithdrawsbyStatus(status: string) {
        let response = await this.request.get(endPoints.getAllWithdrawsbyStatus(status))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get withdrawId
    async getWithdrawId() {
        let allProducts = await this.getAllWithdrawsbyStatus('pending')
        let withdrawId = allProducts[0].id
        // console.log(withdrawId)
        return withdrawId
    }

    // create withdraw
    async createWithdraw(payload: object) {
        let response = await this.request.post(endPoints.createWithdraw, { data: payload})
        let responseBody = await this.getResponseBody(response)
        let withdrawId = responseBody.id
        // console.log(couponId)
        return [responseBody, withdrawId]
    }


    /**
     * order api methods
     */

    // get all orders
    async getAllOrders() {
        let response = await this.request.get(endPoints.getAllOrders)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get orderId
    async getOrderId() {
        let allOrders = await this.getAllOrders()  //TODO: replace with place an order and return that order id
        let orderId = allOrders[0].id
        // console.log(orderId)
        return orderId
    }

    // update order status
    async updateOrderStatus(orderId: string, orderStatus: string) {
        let response = await this.request.put(endPoints.updateOrder(orderId), { data: { status: orderStatus } })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    /**
    * order notes api methods
    */

    // create attribute term
    async createOrderNote(order: object, orderNote: object) {
        // let orderId = await this.getOrderId()
        let [, orderId] = await this.createOrder(order)
        let response = await this.request.post(endPoints.createOrderNote(orderId), { data: orderNote })
        let responseBody = await this.getResponseBody(response)
        let orderNoteId = responseBody.id
        // console.log(orderNoteId)
        return [responseBody, orderId, orderNoteId]
    }

    /**
    * refund api methods
    */

    // get all orders
    async getAllRefunds() {
        let response = await this.request.get(endPoints.getAllRefunds)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get orderId
    async getRefundId() {
        let allRefunds = await this.getAllRefunds()
        let refundId = allRefunds[0].id
        // console.log(refundId)
        return refundId
    }

    /**
    * dokan settings  api methods
    */

    // get store settings
    async getStoreSettings() {
        let response = await this.request.get(endPoints.getSettings)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // set store settings
    async setStoreSettings(payload: object) {
        let response = await this.request.put(endPoints.updateSettings, { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }







    /**
    * support ticket  api methods
    */

    // get all support tickets
    async getAllSupportTickets() {
        let response = await this.request.get(endPoints.getAllSupportTickets)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get support ticket id
    async getSupportTicketId() {
        let allSuppoertTickets = await this.getAllSupportTickets()
        let supportTicketId = allSuppoertTickets[0].ID
        let sellerId = allSuppoertTickets[0].vendor_id
        // console.log(supportTicketId)
        // console.log(sellerId)
        return [supportTicketId, sellerId]
    }

    // create support ticket comment
    async createSupportTicketComment(payload: object) {
        let [supportTicketId,] = await this.getSupportTicketId()
        let response = await this.request.post(endPoints.createSupportTicketComment(supportTicketId), { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update support ticket status
    async updateSupportTicketStatus(supportTicketId: string, status: string) {
        let response = await this.request.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: { status: status } })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    /**
    * reverse withdrawal  api methods
    */

    // get all reverse withdrawal stores
    async getAllReverseWithdrawalStores() {
        let response = await this.request.get(endPoints.getAllReverseWithdrawalStores)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get orderId
    async getReverseWithdrawalStoreId() {
        let allReverseWithdrawalStores = await this.getAllReverseWithdrawalStores()
        let reverseWithdrawalStoreId = allReverseWithdrawalStores[0].id
        // console.log(reverseWithdrawalStoreId)
        return reverseWithdrawalStoreId
    }


    /**
    * module  api methods
    */

    // get all modules
    async getAllModules() {
        let response = await this.request.get(endPoints.getAllModules)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all modules ids
    async getAllModuleIds() {
        let allModuleIds = (await this.getAllModules()).map(a => a.id)
        // console.log(allModuleIds)
        return allModuleIds
    }

    // activate modules
    async activateModules(moduleIds: string) {
        let response = await this.request.put(endPoints.activateModule, { data: { module: [moduleIds] } })
        let responseBody = await this.getResponseBody(response)
        let activeStatus = responseBody.active
        // console.log(activeStatus)
        // return [responseBody, activeStatus]
        return responseBody
    }
    // deactivate modules
    async deactivateModules(moduleIds: string) {
        let response = await this.request.put(endPoints.deactivateModule, { data: { module: [moduleIds] } })
        let responseBody = await this.getResponseBody(response)
        // let activeStatus = responseBody.active
        // console.log(activeStatus)
        // return [responseBody, activeStatus]
        return responseBody
    }

    /**
    * customers  api methods
    */

    // get all customers
    async getAllCustomers() {
        let response = await this.request.get(endPoints.getAllCustomers)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get customerId
    async getCustomerId(username: string) {
        let allCustomers = await this.getAllCustomers()
        let cutomerId = (allCustomers.find(o => o.username === username)).id
        // console.log(cutomerId)
        return cutomerId
    }

    // create customer
    async createCustomer(payload: object) {
        let response = await this.request.post(endPoints.createCustomer, { data: payload })
        let responseBody = await this.getResponseBody(response)
        let customerId = String(responseBody.id)
        return [responseBody, customerId]
    }

    // delete customer
    async deleteCustomer(userId: string) {
        let response = await this.request.delete(endPoints.deleteCustomer(userId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * wholesale customers  api methods
    */

    // get all whosale customers
    async getAllWholesaleCustomers() {
        let response = await this.request.get(endPoints.getAllWholesaleCustomers)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    // create a wholesale customer
    async createWholesaleCustomer() {
        let [, customerId] = await this.createCustomer(payloads.createCustomer())

        let response = await this.request.post(endPoints.createWholesaleCustomer, { data: { id: customerId } })
        let responseBody = await this.getResponseBody(response)
        // console.log(customerId)
        return [responseBody, customerId]
    }

    /**
    * product advertisement  api methods
    */

    // get all product advertisements
    async getAllProductAdvertisements() {
        let response = await this.request.get(endPoints.getAllProductAdvertisements)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create a product advertisement
    async createProductAdvertisement() {
        let [body, productId] = await this.createProduct(payloads.createProduct())
        // console.log(body)
        let sellerId = body.store.id

        let response = await this.request.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId } })
        let responseBody = await this.getResponseBody(response)
        let productAdvertisementId = responseBody.id
        // console.log(productAdvertisementId)
        return [responseBody, productAdvertisementId]
    }

    /**
     * abuse report api methods
     */

    // get all abuse reports
    async getAllAbuseReports() {
        let response = await this.request.get(endPoints.getAllAbuseReports)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    /**
     * announcements api methods
     */

    // get all announcements
    async getAllAnnouncements() {
        let response = await this.request.get(endPoints.getAllAnnouncements)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create announcement
    async createAnnouncement(payload: object) {
        let response = await this.request.post(endPoints.createAnnouncement, { data: payload })
        let responseBody = await this.getResponseBody(response)
        let announcementId = responseBody.id
        // console.log(announcementId)
        return [responseBody, announcementId]
    }

    // delete announcement
    async deleteAnnouncement(announcementId: string) {
        let response = await this.request.delete(endPoints.deleteAnnouncement(announcementId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update batch announcements
    async updateBatchAnnouncements(action: string, allIds: string[]) {
        let response = await this.request.put(endPoints.updateBatchAnnouncements, { data: { [action]: allIds } })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    /**
     * product reviews api methods
     */

    // get all product reviews
    async getAllProductReviews() {
        let response = await this.request.get(endPoints.getAllProductReviews)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get prodduct review id
    async getProductReviewId() {
        let allProductRevies = await this.getAllProductReviews()
        let reviewId = allProductRevies[0].id
        // console.log(reviewId)
        return reviewId
    }


    /**
     * store reviews api methods
     */

    // get all store reviews
    async getAllStoreReviews() {
        let response = await this.request.get(endPoints.getAllStoreReviews)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get store review id
    async getStoreReviewId() {
        let allStoreRevies = await this.getAllStoreReviews()
        let reviewId = allStoreRevies[0].id
        // console.log(reviewId)
        return reviewId
    }

    // delete store review 
    async deleteStoreReview(reviewId: string) {
        let response = await this.request.delete(endPoints.deleteStoreReview(reviewId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update batch store reviews 
    async updateBatchStoreReviews(action: string, allIds: string[]) {
        let response = await this.request.put(endPoints.updateBatchStoreReviews, { data: { [action]: allIds } })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
     * store categories api methods
    */

    // create store category
    async createStoreCategory(payload: object) {
        let response = await this.request.post(endPoints.createStoreCategory, { data: payload })
        let responseBody = await this.getResponseBody(response)
        let categoryId = responseBody.id
        // console.log(categoryId)
        return [responseBody, categoryId]
    }

    // get default store category
    async getDefaultStoreCategory() {
        let response = await this.request.get(endPoints.getDefaultStoreCategory)
        let responseBody = await this.getResponseBody(response)
        let categoryId = responseBody.id
        // console.log(categoryId)
        return [responseBody, categoryId]
    }

    // get default store category
    async setDefaultStoreCategory(categoryId: string) {
        let response = await this.request.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId } })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    /**
    * quote rules api methods
    */

    // get all quote rules
    async getAllQuoteRules() {
        let response = await this.request.get(endPoints.getAllQuoteRules)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create quote rule
    async createQuoteRule(payload: object) {
        // console.log(payload)
        let response = await this.request.post(endPoints.createQuoteRule, { data: payload })
        // console.log(response.status())
        let responseBody = await this.getResponseBody(response)
        let quoteRuleId = responseBody.id
        // console.log(responseBody)
        // console.log(quoteRuleId)
        return [responseBody, quoteRuleId]
    }

    // delete store review 
    async deleteQuoteRule(quoteRuleId: string) {
        let response = await this.request.delete(endPoints.deleteQuoteRule(quoteRuleId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    /**
    * request quote api methods
    */

    // get all quote rules
    async getAllRequestQuotes() {
        let response = await this.request.get(endPoints.getAllRequestQuotes)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create quote rule
    async createRequestQuote(payload: object) {
        let response = await this.request.post(endPoints.createRequestQuote, { data: payload })
        let responseBody = await this.getResponseBody(response)
        let quoteRuleId = responseBody[0].data.id
        // console.log(quoteRuleId)
        return [responseBody, quoteRuleId]
    }

    // delete store review 
    async deleteRequestQuote(quoteRuleId: string) {
        let response = await this.request.delete(endPoints.deleteRequestQuote(quoteRuleId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }













    /**
    * wp  api methods
    */

    // settings

    // get site settings
    async getSiteSettings() {
        let response = await this.request.get(endPoints.wp.getSiteSettings)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // set site settings 
    async setSiteSettings(payload: object) {
        let response = await this.request.post(endPoints.wp.setSiteSetiings, { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // wp users

    // get all users
    async getAllUsers() {
        let response = await this.request.get(endPoints.wp.getAllUsers)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get user by role
    async getAllUsersByRole(role: string) {
        let response = await this.request.get(endPoints.wp.getAllUsersByRole(role))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get current user
    async getCurrentUser() {
        let response = await this.request.get(endPoints.wp.getcurrentUser)
        let responseBody = await this.getResponseBody(response)
        let userId = responseBody.id
        // console.log(userId)
        return [responseBody, userId]
    }

    // get user by Id
    async getUserById(userId: string) {
        let response = await this.request.get(endPoints.wp.getUserById(userId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // create user
    async createUser(payload: object) {  // administrator,  customer, seller
        let response = await this.request.post(endPoints.wp.createUser, { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update user
    async updateUser(payload: object) {
        let response = await this.request.put(endPoints.wp.createUser, { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // delete user
    async deleteUser(userId: string) {
        let response = await this.request.delete(endPoints.wp.deleteUser(userId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // plugins

    // get all plugins
    async getAllPlugins() {
        let response = await this.request.get(endPoints.wp.getAllPlugins)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all plugins by status
    async getAllPluginByStatus(status: string) {
        let response = await this.request.get(endPoints.wp.getAllPluginsByStatus(status))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single plugin
    async getSinglePlugin(plugin: string) {
        let response = await this.request.get(endPoints.wp.getSinglePlugin(plugin))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update plugin
    async updatePlugin(plugin: string) {
        let response = await this.request.put(endPoints.wp.updatePlugin(plugin), { data: payloads.updatePlugin })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // delete plugin
    async deletePlugin(plugin: string) {
        let response = await this.request.delete(endPoints.wp.deletePlugin(plugin))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }











    /**
    * woocommerce  api methods
    */

    // settings

    // get all wc setting options
    async getAllWcSettings(groupId: string) {
        let response = await this.request.get(endPoints.wc.getAllSettingOptions(groupId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all single wc settings option
    async getSingleWcSettingsOption(groupId: string, optionId: string) {
        let response = await this.request.get(endPoints.wc.getSingleSettingOption(groupId, optionId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // set single wc settings option
    async updateSingleWcSettingsOption(groupId: string, optionId: string, payload: object) {
        let response = await this.request.post(endPoints.wc.updateSettingOption(groupId, optionId), { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update single wc settings option
    async updateBatchWcSettingsOptions(groupId: string, payload: object) {
        let response = await this.request.post(endPoints.wc.updateBatchSettingOptions(groupId), { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    // reviews

    //create product review
    async createProductReview(product: object, review: object) {
        let [, productId] = await this.createProduct(product)
        let response = await this.request.post(endPoints.wc.createReview, { data: { ...review, product_id: productId } })
        let responseBody = await this.getResponseBody(response)
        let reviewId = responseBody.id
        // console.log(reviewId)
        return [responseBody, reviewId]
    }


    // categories

    // get all categories
    async getAllCategories() {
        let response = await this.request.get(endPoints.wc.getAllCategories)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single category
    async getSingleCategory(categoryId: string) {
        let response = await this.request.get(endPoints.wc.getSingleCategory(categoryId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get categoryId
    async getCategoryId(categoryName: string) {
        let allCustomers = await this.getAllCustomers()
        let cutomerId = (allCustomers.find(o => o.name === categoryName)).id
        // console.log(cutomerId)
        return cutomerId
    }

    // create category
    async createCategory(payload: object) {
        let response = await this.request.post(endPoints.wc.createCategory, { data: payload })
        let responseBody = await this.getResponseBody(response)
        let categoryId = responseBody.id

        return [responseBody, categoryId]
    }

    // update category
    async updateCategory(categoryId: string, payload: object) {
        let response = await this.request.put(endPoints.wc.updateCategory(categoryId), { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // delete category
    async deleteCategory(categoryId: string) {
        let response = await this.request.delete(endPoints.wc.deleteCategory(categoryId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    // order

    // create order
    async createOrder(order: any) {
        let [, productId] = await this.createProduct(payloads.createProduct())
        let payload = order
        payload.line_items[0].product_id = productId
        let response = await this.request.post(endPoints.wc.createOrder, { data: payload })
        let responseBody = await this.getResponseBody(response)
        let orderId = responseBody.id

        // console.log(orderId)
        return [responseBody, orderId]
    }

    // create complete order
    async createOrderWithStatus(order: any, status: string) {
        let [, orderId] = await this.createOrder(order)
        await this.updateOrderStatus(orderId, status)
        // console.log(orderId)
        return orderId
    }

    // refund

    // create refund
    async createRefund(order: object, refund: object) {
        let [, orderId] = await this.createOrder(payloads.createOrder)

        let response = await this.request.post(endPoints.wc.createRefund(orderId), { data: refund })
        let responseBody = await this.getResponseBody(response)
        let refundId = responseBody.id

        // console.log(refundId)
        return [responseBody, refundId]
    }



    // tax


    // create tax rate
    async createTaxRate(payload: object) {
        let response = await this.request.post(endPoints.wc.createTaxRate, { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }


    // shipping

    // get all shipping zones
    async getAllShippingZones() {
        let response = await this.request.get(endPoints.wc.getAllShippingZones)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get zoneId
    async getzoneId(zoneName: string) {
        let allZones = await this.getAllShippingZones()
        let zoneId = (allZones.find(o => o.name === zoneName)).id
        // console.log(cutomerId)
        return zoneId
    }

    // create shipping zone 
    async createShippingZone(payload: object) {
        let response = await this.request.post(endPoints.wc.createShippingZone, { data: payload })
        let responseBody = await this.getResponseBody(response)
        let shippingZoneId = responseBody.id

        // console.log(shippingZoneId)
        return [responseBody, shippingZoneId]
    }

    // get all shipping zone locations
    async getAllShippingZoneLocations(zoneId: string) {
        let response = await this.request.get(endPoints.wc.getAllShippingZoneLocations(zoneId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // add shipping zone location
    async addShippingZoneLoation(zoneId: string, zoneLocation: object) {
        let response = await this.request.put(endPoints.wc.addShippingZoneLocation(zoneId), { data: zoneLocation })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get all shipping zone methods
    async getAllShippingZoneMethods(zoneId: string) {
        let response = await this.request.get(endPoints.wc.getAllShippingZoneMethods(zoneId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // add shipping method
    async addShippingZoneMethod(zoneId: string, zoneMethod: object) {
        let response = await this.request.post(endPoints.wc.addShippingZoneMethod(zoneId), { data: zoneMethod })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // payment

    // get all payment gateway
    async getAllPaymentGatways() {
        let response = await this.request.get(endPoints.wc.getAllPaymentGatways)
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // get single payment gateway
    async getSinglePaymentGatway(paymentGatewayId: string) {
        let response = await this.request.get(endPoints.wc.getSinglePaymentGatway(paymentGatewayId))
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }

    // update payment gateway
    async updatePaymentGateway(paymentGatewayId: string, payload: object) {
        let response = await this.request.put(endPoints.wc.updatePaymentGatway(paymentGatewayId), { data: payload })
        let responseBody = await this.getResponseBody(response)
        return responseBody
    }




}





