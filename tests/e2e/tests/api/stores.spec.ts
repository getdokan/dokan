import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


test('get all stores', async ({ request }) => {
    const response = await request.get(endPoints.getAllStores)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    // expect(responseBody[0]).toContainEqual(expect.objectContaining(
    //     {
    //         id: expect.any(Number),
    //         store_name: expect.any(String),
    //         first_name: expect.any(String),
    //         last_name: expect.any(String),
    //         email: expect.any(String),
    //         social: expect.any(Array),
    //         phone: expect.any(String),
    //         show_email: expect.any(Boolean),
    //         address: expect.any(Array),
    //         location: expect.any(String),
    //         banner: expect.any(String),
    //         banner_id: expect.any(Number),
    //         gravatar: expect.any(String),
    //         gravatar_id: expect.any(Number),
    //         shop_url: expect.any(String),
    //         products_per_page: expect.any(Number),
    //         show_more_product_tab: expect.any(Boolean),
    //         toc_enabled: expect.any(Boolean),
    //         store_toc: expect.any(String),
    //         featured: expect.any(Boolean),
    //         rating: expect.objectContaining({
    //             rating: expect.any(String),
    //             count: expect.any(Number),
    //         }),
    //         enabled: expect.any(Boolean),
    //         registered: expect.any(String),
    //         payment: expect.any(Object),
    //         trusted: expect.any(Boolean),
    //         store_open_close: {
    //             enabled: expect.any(Boolean),
    //             time: expect.any(Array),
    //             open_notice: expect.any(String),
    //             close_notice: expect.any(String),
    //         },
    //         company_name: expect.any(String),
    //         vat_number: expect.any(String),
    //         company_id_number: expect.any(String),
    //         bank_name: expect.any(String),
    //         bank_iban: expect.any(String),
    //         switch_url: expect.any(String),
    //         admin_commission: expect.any(String),
    //         admin_additional_fee: expect.any(String),
    //         admin_commission_type: expect.any(String),
    //         _links: expect.objectContaining({
    //             self: expect.any(Array),
    //             collection: expect.any(Array),
    //         }),
    //     }))
});



test('get single store info', async ({ request }) => {
    const response = await request.get(endPoints.getAllStores)
    const responseBody = await response.json()
    let sellerId = (responseBody.find(o => o.first_name === 'vendor1')).id

    const response1 = await request.get(endPoints.getSingleStoreInfo(sellerId))
    const responseBody1 = await response1.json()
    console.log(responseBody1)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    // expect(responseBody1).toEqual(expect.objectContaining(
    //     {
    //         id: expect.any(Number),
    //         store_name: expect.any(String),
    //         first_name: expect.any(String),
    //         last_name: expect.any(String),
    //         email: expect.any(String),
    //         social: expect.any(Array),
    //         phone: expect.any(String),
    //         show_email: expect.any(Boolean),
    //         address: expect.any(Array),
    //         location: expect.any(String),
    //         banner: expect.any(String),
    //         banner_id: expect.any(Number),
    //         gravatar: expect.any(String),
    //         gravatar_id: expect.any(Number),
    //         shop_url: expect.any(String),
    //         products_per_page: expect.any(Number),
    //         show_more_product_tab: expect.any(Boolean),
    //         toc_enabled: expect.any(Boolean),
    //         store_toc: expect.any(String),
    //         featured: expect.any(Boolean),
    //         rating: expect.objectContaining({
    //             rating: expect.any(String),
    //             count: expect.any(Number),
    //         }),
    //         enabled: expect.any(Boolean),
    //         registered: expect.any(String),
    //         payment: expect.any(Object),
    //         trusted: expect.any(Boolean),
    //         store_open_close: {
    //             enabled: expect.any(Boolean),
    //             time: expect.any(Array),
    //             open_notice: expect.any(String),
    //             close_notice: expect.any(String),
    //         },
    //         company_name: expect.any(String),
    //         vat_number: expect.any(String),
    //         company_id_number: expect.any(String),
    //         bank_name: expect.any(String),
    //         bank_iban: expect.any(String),
    //         switch_url: expect.any(String),
    //         admin_commission: expect.any(String),
    //         admin_additional_fee: expect.any(String),
    //         admin_commission_type: expect.any(String),
    //         _links: expect.any(Object),
    //     }))
});



test('get single store products', async ({ request }) => {
    const response = await request.get(endPoints.getAllStores)
    const responseBody = await response.json()
    let sellerId = (responseBody.find(o => o.first_name === 'vendor1')).id

    const response1 = await request.get(endPoints.getSingleStoreProducts(sellerId))
    const responseBody1 = await response1.json()
    console.log(responseBody1)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)


});

test.only('get single store reviews', async ({ request }) => {
    const response = await request.get(endPoints.getAllStores)
    const responseBody = await response.json()
    let sellerId = (responseBody.find(o => o.first_name === 'vendor1')).id

    const response1 = await request.get(endPoints.getSingleStoreReviews(sellerId))
    const responseBody1 = await response1.json()
    console.log(responseBody1)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});
