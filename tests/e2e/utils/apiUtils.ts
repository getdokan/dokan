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
        const response = await this.request.get(endPoints.getAllStores)
        const responseBody = await response.json()
        return responseBody
    }

    /**
     * product api methods
     */

    // get all coupons
    async getAllProducts() {
        const response = await this.request.get(endPoints.getAllProducts)
        const responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }
    // get productId
    // let productId = (responseBody1.find(o => o.name === 'p1_v1')).id
    async getProductId(productName: String) {
        const getAllProducts = await this.getAllProducts()

        // let productId = ''
        // if (couponCode) {
        //     productId = (getAllProducts.find(o => o.name === productName)).id
        // } else {
        //     productId = getAllProducts[0].id
        // }

        let productId = (getAllProducts.find(o => o.name === productName)).id
        // console.log(productId)
        return productId
    }

    // create product
    async createProduct() {
        const response = await this.request.post(endPoints.postCreateProduct, { data: payloads.createProduct() })
        const responseBody = await response.json()
        let productId = responseBody.id
        // console.log(responseBody)
        // console.log(productId)
        return [responseBody, productId]
    }

    /**
     * coupon api methods
     */

    // get all coupons
    async getAllCoupons() {
        const response = await this.request.get(endPoints.getGetAllCoupons)
        const responseBody = await response.json()
        // console.log(responseBody)
        return responseBody
    }

    // get couponId
    // let couponId = await apiUtils.getCouponId('c1_v1')
    async getCouponId(couponCode: String) {
        const getAllCoupons = await this.getAllCoupons()

        // let couponId = ''
        // if (couponCode) {
        //     couponCode = (getGetAllCoupons.find(o => o.code === couponCode)).id
        // } else {
        //     couponCode = getGetAllCoupons[0].id
        // }

        let couponId = (couponCode = getAllCoupons.find(o => o.code === couponCode)).id
        // console.log(couponId)
        return couponId
    }

    // create coupon
    async createCoupon() {
        const response = await this.request.post(endPoints.postCreateCoupon, { data: payloads.createCoupon() })
        const responseBody = await response.json()
        let couponId = responseBody.id
        // console.log(responseBody)
        // console.log(couponId)
        return [responseBody, couponId]
    }




    /**
     * coupon api methods
     */


    /**
     * coupon api methods
     */




}