Feature('API');
Scenario('API Get request', async({ I }) => {
    const res = await I.sendGetRequest('http://dokan-pro.test/wp-json/dokan/v1/products/');
    I.assertEqual(res.status, 200);
    console.log(res);

})