import { type APIRequestContext } from '@playwright/test'
import { endPoints } from './apiEndPoints'
import { payloads } from './payloads'

//TODO: update all predefine payload to function argument

export class ApiUtils {
    readonly request: APIRequestContext

    constructor(request: APIRequestContext) {
        this.request = request
    }


    /**
     * store api methods
     */


    // get all stores
    async getAllStores() {
        let response = await this.request.get(endPoints.getAllStores)
        let responseBody = await response.json()
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
        let responseBody = await response.json()
        let sellerId = responseBody.id
        // console.log(responseBody)
        // console.log(sellerId)
        return [responseBody, sellerId]
    }

    // create store review
    async createStoreReview(sellerId: string, payload: object) {
        let response = await this.request.post(endPoints.createStoreReview(sellerId), { data: payloads.createStoreReview })
        let responseBody = await response.json()
        let reviewId = responseBody.id
        // console.log(responseBody)
        // console.log(reviewId)
        return [responseBody, reviewId]
    }


    /**
     * product api methods
     */


    // get all coupons
    async getAllProducts() {
        let response = await this.request.get(endPoints.getAllProducts)
        let responseBody = await response.json()
        // console.log(responseBody)
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
    async createProduct(payload: object) {
        let response = await this.request.post(endPoints.createProduct, { data: payload })
        let responseBody = await response.json()
        let productId = responseBody.id
        // console.log(responseBody)
        // console.log(productId)
        return [responseBody, productId]
    }

    /**
     * product variation api methods
     */

    // create product
    async createProductVariation(productId: string, payload: object) {
        let response = await this.request.post(endPoints.createProductVariation(productId), { data: payload })
        let responseBody = await response.json()
        let variationId = responseBody.id
        // console.log(responseBody)
        // console.log(variationId)
        return [responseBody, variationId]
    }

    // get variationTd
    async getVariationId(productName: string) {
        let productId = await this.getProductId(productName)
        // console.log(productId)

        let response = await this.request.get(endPoints.getAllProductVariations(productId))
        let responseBody = await response.json()
        let variationId = responseBody[0].id
        // console.log(responseBody)
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
        // console.log(responseBody)
        // console.log(productId, variationId)
        return [productId, variationId]
    }

    /**
     * attribute api methods
     */

    // get all attributes
    async getAllAttributes() {
        let response = await this.request.get(endPoints.getAllAttributes)
        let responseBody = await response.json()
        // console.log(responseBody)
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
        let responseBody = await response.json()
        let attributeId = responseBody.id
        // console.log(responseBody)
        // console.log(attributeId)
        return [responseBody, attributeId]
    }

    /**
     * attribute term api methods
     */

    // create attribute term
    async createAttributeTerm(attribute: object, attributeTerm: object) {
        let [, attributeId] = await this.createAttribute(attribute)
        let response = await this.request.post(endPoints.createAttributeTerm(attributeId), { data: attributeTerm })
        let responseBody = await response.json()
        let attributeTermId = responseBody.id
        // console.log(responseBody)
        // console.log(attributeTermId)
        return [responseBody, attributeId, attributeTermId]
    }


    /**
     * coupon api methods
     */

    // get all coupons
    async getAllCoupons() {
        let response = await this.request.get(endPoints.getAllCoupons)
        let responseBody = await response.json()
        // console.log(responseBody)
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
    async createCoupon(product: object) {
        let [, productId] = await this.createProduct(product) // TODO: might need to seperate createProduct from createCoupon,product review,....
        let payloadCoupon = payloads.createCoupon()
        payloadCoupon.product_ids = [productId]
        // console.log(payloadCoupon)

        let response = await this.request.post(endPoints.createCoupon, { data: payloadCoupon })
        let responseBody = await response.json()
        let couponId = responseBody.id
        // console.log(responseBody)
        // console.log(couponId)
        return [responseBody, couponId]
    }


    /**
     * withdraw api methods
     */

    // get all withdraws
    async getAllWithdraws() {
        let response = await this.request.get(endPoints.getAllWithdraws)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get all withdraws by status
    async getAllWithdrawsbyStatus(status: string) {
        let response = await this.request.get(endPoints.getAllWithdrawsbyStatus(status))
        let responseBody = await response.json()
        // console.log(responseBody)
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
    async createWithdraw() {
        let response = await this.request.post(endPoints.createWithdraw, { data: payloads.createWithdraw })
        let responseBody = await response.json()
        let withdrawId = responseBody.id
        // console.log(responseBody)
        // console.log(couponId)
        return [responseBody, withdrawId]
    }


    /**
     * order api methods
     */

    // get all orders
    async getAllOrders() {
        let response = await this.request.get(endPoints.getAllOrders)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get orderId
    async getOrderId() {
        let allOrders = await this.getAllOrders()  //TODO: replace with place an order and return that order id
        let orderId = allOrders[0].id
        // console.log(orderId)
        return orderId
    }

    /**
    * order notes api methods
    */

    // create attribute term
    async createOrderNote() {
        let orderId = await this.getOrderId()
        let response = await this.request.post(endPoints.createOrderNote(orderId), { data: payloads.createOrderNote })
        let responseBody = await response.json()
        let orderNoteId = responseBody.id
        // console.log(responseBody)
        // console.log(orderNoteId)
        return [responseBody, orderId, orderNoteId]
    }

    /**
    * refund api methods
    */

    // get all orders
    async getAllRefunds() {
        let response = await this.request.get(endPoints.getAllRefunds)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get orderId
    async getRefundId() {
        let allRefunds = await this.getAllRefunds()
        let refundId = allRefunds[0].id
        console.log(refundId)
        return refundId
    }

    /**
    * dokan settings  api methods
    */

    // get store settings
    async getStoreSettings() {
        let response = await this.request.get(endPoints.getSettings)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // set store settings
    async setStoreSettings(payload: object) {
        let response = await this.request.put(endPoints.updateSettings, { data: payload })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }







    /**
    * support ticket  api methods
    */

    // get all support tickets
    async getAllSupportTickets() {
        let response = await this.request.get(endPoints.getAllSupportTickets)
        let responseBody = await response.json()
        // console.log(responseBody)
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
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // update support ticket status
    async updateSupportTicketStatus(supportTicketId: string, status: string) {
        let response = await this.request.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: { status: status } })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    /**
    * reverse withdrawal  api methods
    */

    // get all reverse withdrawal stores
    async getAllReverseWithdrawalStores() {
        let response = await this.request.get(endPoints.getAllReverseWithdrawalStores)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get orderId
    async getReverseWithdrawalStoreId() {
        let allReverseWithdrawalStores = await this.getAllReverseWithdrawalStores()
        let reverseWithdrawalStoreId = allReverseWithdrawalStores[0].id
        console.log(reverseWithdrawalStoreId)
        return reverseWithdrawalStoreId
    }


    /**
    * module  api methods
    */

    // get all modules
    async getAllModules() {
        let response = await this.request.get(endPoints.getAllModules)
        let responseBody = await response.json()
        // console.log(responseBody)
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
        let responseBody = await response.json()
        // let activeStatus = responseBody.active
        // console.log(responseBody)
        // console.log(activeStatus)
        // return [responseBody, activeStatus]
        return responseBody
    }
    // deactivate modules
    async deactivateModules(moduleIds: string) {
        let response = await this.request.put(endPoints.deactivateModule, { data: { module: [moduleIds] } })
        let responseBody = await response.json()
        // let activeStatus = responseBody.active
        // console.log(responseBody)
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
        let responseBody = await response.json()
        // console.log(responseBody)
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
        let responseBody = await response.json()
        let customerId = responseBody.id
        // console.log(responseBody)
        return [responseBody, customerId]
    }

    // delete customer
    async deleteCustomer(userId: string) {
        let response = await this.request.delete(endPoints.deleteCustomer(userId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }


    /**
    * wholesale customers  api methods
    */

    // get all whosale customers
    async getAllWholesaleCustomers() {
        let response = await this.request.get(endPoints.getAllCustomers)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }


    // create a wholesale customer
    async createWholesaleCustomer() {
        let [, customerId] = await this.createCustomer(payloads.createCustomer())

        let response = await this.request.post(endPoints.createWholesaleCustomer, { data: { id: String(customerId) } })
        let responseBody = await response.json()
        // console.log(responseBody)
        return [responseBody, customerId]
    }

    /**
    * product advertisement  api methods
    */

    // get all product advertisements
    async getAllProductAdvertisements() {
        let response = await this.request.get(endPoints.getAllProductAdvertisements)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // create a product advertisement
    async createProductAdvertisement() {
        let [body, productId] = await this.createProduct(payloads.createProduct())
        console.log(body)
        let sellerId = body.store.id

        let response = await this.request.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId } })
        let responseBody = await response.json()
        let productAdvertisementId = responseBody.id
        // console.log(responseBody)
        // console.log(productAdvertisementId)
        return [responseBody, productAdvertisementId]
    }

    /**
     * abuse report api methods
     */

    // get all abuse reports
    async getAllAbuseReports() {
        let response = await this.request.get(endPoints.getAllAbuseReports)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    /**
     * announcements api methods
     */

    // get all announcements
    async getAllAnnouncements() {
        let response = await this.request.get(endPoints.getAllAnnouncements)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // create announcement
    async createAnnouncement(payload: object) {
        let response = await this.request.post(endPoints.createAnnouncement, { data: payload })
        let responseBody = await response.json()
        let announcementId = responseBody.id
        // console.log(responseBody)
        // console.log(announcementId)
        return [responseBody, announcementId]
    }

    // update batch announcements
    async updateBatchAnnouncements(action: string, allIds: string[]) {
        let response = await this.request.put(endPoints.updateBatchAnnouncements, { data: { [action]: allIds } })
        let responseBody = await response.json()
        console.log(responseBody)
        return responseBody
    }

    /**
     * product reviews api methods
     */

    // get all product reviews
    async getAllProductReviews() {
        let response = await this.request.get(endPoints.getAllProductReviews)
        let responseBody = await response.json()
        // console.log(responseBody)
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
        let responseBody = await response.json()
        // console.log(responseBody)
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
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // update batch store reviews 
    async updateBatchStoreReviews(action: string, allIds: string[]) {
        let response = await this.request.put(endPoints.updateBatchStoreReviews, { data: { [action]: allIds } })
        let responseBody = await response.json()
        console.log(responseBody)
        return responseBody
    }


    /**
     * store categories api methods
    */

    // create store category
    async createStoreCategory(payload: object) {
        let response = await this.request.post(endPoints.createStoreCategory, { data: payload })
        let responseBody = await response.json()
        let categoryId = responseBody.id
        // console.log(responseBody)
        // console.log(categoryId)
        return [responseBody, categoryId]
    }

    // get default store category
    async getDefaultStoreCategory() {
        let response = await this.request.get(endPoints.getDefaultStoreCategory)
        let responseBody = await response.json()
        let categoryId = responseBody.id
        // console.log(responseBody)
        // console.log(categoryId)
        return [responseBody, categoryId]
    }

    // get default store category
    async setDefaultStoreCategory(categoryId: string) {
        let response = await this.request.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId } })
        let responseBody = await response.json()
        // console.log(responseBody)

        return responseBody
    }















    /**
    * wp  api methods
    */

    // settings

    // get site settings
    async getSiteSettings() {
        let response = await this.request.get(endPoints.wp.getSiteSettings)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // set site settings 
    async setSiteSettings(payload: object) {
        let response = await this.request.post(endPoints.wp.setSiteSetiings, { data: payload })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // wp users

    // get all users
    async getAllUsers() {
        let response = await this.request.get(endPoints.wp.getAllUsers)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get user by role
    async getAllUsersByRole(role: string) {
        let response = await this.request.get(endPoints.wp.getAllUsersByRole(role))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get current user
    async getCurrentUser() {
        let response = await this.request.get(endPoints.wp.getcurrentUser)
        let responseBody = await response.json()
        let userId = responseBody[0].id
        // console.log(responseBody)
        // console.log(userId)
        return [responseBody, userId]
    }

    // get user by Id
    async getUserById(userId: string) {
        let response = await this.request.get(endPoints.wp.getUserById(userId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // create user
    async createUser(payload: object) {  // administrator,  customer, seller
        let response = await this.request.post(endPoints.wp.createUser, { data: payload })
        let responseBody = await response.json()
        console.log(responseBody)
        return responseBody
    }

    // update user
    async updateUser(payload: object) {
        let response = await this.request.put(endPoints.wp.createUser, { data: payload })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // delete user
    async deleteUser(userId: string) {
        let response = await this.request.delete(endPoints.wp.deleteUser(userId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // plugins

    // get all plugins
    async getAllPlugins() {
        let response = await this.request.get(endPoints.wp.getAllPlugins)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get all plugins by status
    async getAllPluginByStatus(status: string) {
        let response = await this.request.get(endPoints.wp.getAllPluginsByStatus(status))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get single plugin
    async getSinglePlugin(plugin: string) {
        let response = await this.request.get(endPoints.wp.getSinglePlugin(plugin))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // update plugin
    async updatePlugin(plugin: string) {
        let response = await this.request.put(endPoints.wp.updatePlugin(plugin), { data: payloads.updatePlugin })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // delete plugin
    async deletePlugin(plugin: string) {
        let response = await this.request.delete(endPoints.wp.deletePlugin(plugin))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }











    /**
    * woocommerce  api methods
    */

    // settings

    // get all wc setting options
    async getAllWcSettings(groupId: string) {
        let response = await this.request.get(endPoints.wc.getAllSettingOptions(groupId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get all single wc settings option
    async getSingleWcSettingsOption(groupId: string, optionId: string) {
        let response = await this.request.get(endPoints.wc.getSingleSettingOption(groupId, optionId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // set single wc settings option
    async updateSingleWcSettingsOption(groupId: string, optionId: string, payload: object) {
        let response = await this.request.post(endPoints.wc.updateSettingOption(groupId, optionId), { data: payload })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // update single wc settings option
    async updateBatchWcSettingsOptions(groupId: string, payload: object) {
        let response = await this.request.post(endPoints.wc.updateBatchSettingOptions(groupId), { data: payload })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }


    // reviews

    //create product review
    async createProductReview(product: object,review: object) {
        let [, productId] = await this.createProduct(product)
        let response = await this.request.post(endPoints.wc.createReview, { data: {...review, product_id: productId} })
        let responseBody = await response.json()
        let reviewId = responseBody.id
        // console.log(responseBody)
        // console.log(reviewId)
        return [responseBody, reviewId]
    }


    // categories

    // get all categories
    async getAllCategories() {
        let response = await this.request.get(endPoints.wc.getAllCategories)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get single category
    async getSingleCategory(categoryId: string) {
        let response = await this.request.get(endPoints.wc.getSingleCategory(categoryId))
        let responseBody = await response.json()
        // console.log(responseBody)
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
        let responseBody = await response.json()
        let categoryId = responseBody.id
        // console.log(responseBody)
        return [responseBody, categoryId]
    }

    // update category
    async updateCategory(categoryId: string, payload: object) {
        let response = await this.request.put(endPoints.wc.updateCategory(categoryId), { data: payload })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // delete category
    async deleteCategory(categoryId: string) {
        let response = await this.request.delete(endPoints.wc.deleteCategory(categoryId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // tax


    // create tax rate
    async createTaxRate(payload: object) {
        let response = await this.request.post(endPoints.wc.createTaxRate, { data: payload })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }


    // shipping

    // get all shipping zones
    async getAllShippingZones() {
        let response = await this.request.get(endPoints.wc.getAllShippingZones)
        let responseBody = await response.json()
        // console.log(responseBody)
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
        let responseBody = await response.json()
        let shippingZoneId = responseBody.id
        // console.log(responseBody)
        // console.log(shippingZoneId)
        return [responseBody, shippingZoneId]
    }

    // get all shipping zone locations
    async getAllShippingZoneLocations(zoneId: string) {
        let response = await this.request.get(endPoints.wc.getAllShippingZoneLocations(zoneId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // add shipping zone location
    async addShippingZoneLoation(zoneId: string, zoneLocation: object) {
        let response = await this.request.put(endPoints.wc.addShippingZoneLocation(zoneId), { data: zoneLocation })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get all shipping zone methods
    async getAllShippingZoneMethods(zoneId: string) {
        let response = await this.request.get(endPoints.wc.getAllShippingZoneMethods(zoneId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // add shipping method
    async addShippingZoneMethod(zoneId: string, zoneMethod: object) {
        let response = await this.request.post(endPoints.wc.addShippingZoneMethod(zoneId), { data: zoneMethod })
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // payment

    // get all payment gateway
    async getAllPaymentGatways() {
        let response = await this.request.get(endPoints.wc.getAllPaymentGatways)
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get single payment gateway
    async getSinglePaymentGatway(paymentGatewayId: string) {
        let response = await this.request.get(endPoints.wc.getSinglePaymentGatway(paymentGatewayId))
        let responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // update payment gateway
    async updatePaymentGateway(paymentGatewayId: string, payload: object) {
        let response = await this.request.put(endPoints.wc.updatePaymentGatway(paymentGatewayId), { data: payload })
        let responseBody = await response.json()
        console.log(responseBody)
        return responseBody
    }




}





