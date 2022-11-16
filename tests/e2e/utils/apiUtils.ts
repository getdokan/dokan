import { type APIRequestContext } from '@playwright/test'
import { endPoints } from './apiEndPoints'
import { payloads } from './payloads'

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
    async getSellerId(firstName: String) {
        let allStores = await this.getAllStores()

        // let sellerId = ''
        // if (couponCode) {
        //     sellerId = (allStores.find(o => o.first_name === firstName)).id
        // } else {
        //     sellerId = allStores[0].id
        // }

        let sellerId = (allStores.find(o => o.first_name === firstName)).id
        // console.log(sellerId)
        return sellerId
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
    async getProductId(productName: String) {
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
    async createProduct() {
        let response = await this.request.post(endPoints.createProduct, { data: payloads.createProduct() })
        let responseBody = await response.json()
        let productId = responseBody.id
        // console.log(responseBody)
        // console.log(productId)
        return [responseBody, productId]
    }

    /**
     * product variation api methods
     */

    // get variationTd
    async getVariationTd(productName: String) {
        let productId = await this.getProductId(productName)
        // console.log(productId)

        let response = await this.request.get(endPoints.getAllProductVariations(productId))
        let responseBody = await response.json()
        let variationId = responseBody[0].id
        // console.log(responseBody)
        // console.log(variationId)
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
    async createAttribute() {
        let response = await this.request.post(endPoints.createAttribute, { data: payloads.createAttribute() })
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
    async createAttributeTerm() {
        let [, attributeId] = await this.createAttribute()
        let response = await this.request.post(endPoints.createAttributeTerm(attributeId), { data: payloads.createAttributeTerm() })
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
    async getCouponId(couponCode: String) {
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
    async createCoupon() {
        let [, productId] = await this.createProduct()
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
    async getAllWithdrawsbyStatus(status: String) {
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

    // get all withdraws
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


}