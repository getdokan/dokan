//COVERAGE_TAG: GET /dokan/v2/orders/(?P<id>[\d]+)/downloads
//COVERAGE_TAG: POST /dokan/v2/orders/(?P<id>[\d]+)/downloads
//COVERAGE_TAG: DELETE /dokan/v2/orders/(?P<id>[\d]+)/downloads

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('order downloads api test', () => {
    let apiUtils: ApiUtils;
    let downloadableProductId: string;
    let orderId: string;
    let downloadId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        const [responseBody] = await apiUtils.uploadMedia('../../tests/pw/utils/sampleData/avatar.png', payloads.mimeTypes.png, payloads.adminAuth); // todo: update image path
        const downloads = [
            {
                id: String(responseBody.id),
                name: responseBody.title.raw,
                file: responseBody.source_url,
            },
        ];
        [, downloadableProductId] = await apiUtils.createProduct({ ...payloads.createDownloadableProduct(), downloads });
        [, , orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
        [, downloadId] = await apiUtils.createOrderDownload(orderId, [downloadableProductId]);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all order downloads', { tag: ['@lite', '@v2'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllOrderDownloads(orderId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create order downloads', { tag: ['@lite', '@v2'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createOrderDownload(orderId), { data: { ids: [downloadableProductId] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete order downloads', { tag: ['@lite', '@v2'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteOrderDownload(orderId), { data: { permission_id: downloadId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
