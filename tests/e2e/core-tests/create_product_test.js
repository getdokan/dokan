Feature('Create product');
const faker = require('faker');
Scenario('create a single product', async({ I, }) => {
    const payload = {
        author_id: 1,
        name: faker.name.firstName(),
        type: "simple",
        regular_price: faker.commerce.price(10, 100),
        description: faker.random.words(5),
        short_description: faker.random.words(5),
        categories: [{

            id: 15
        }, ],
    };
    const res = await I.sendPostRequest('http://dokan-pro.test/wp-json/dokan/v1/products/', payload);
    I.assertEqual(res.status, 200);
    console.log(res.data);




})