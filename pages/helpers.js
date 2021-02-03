var Factory = require('rosie').Factory;
var faker = require('faker');

const {
    I
} = inject();
module.exports = {

    setregularprice() {
        I.fillField('Price', '20');
        I.fillField('Discounted Price', '15');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
    },

    cancelschedule() {
        I.seeElement('a.cancel_sale_schedule');
        I.click('a.cancel_sale_schedule');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');

    },
    setSchedule() {
        I.click('Schedule');
        I.fillField('_sale_price_dates_from', '2021-01-01');
        I.fillField('_sale_price_dates_to', '2021-12-31');
        I.wait(3);
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');

    },
    checkVirtual() {
        I.wait(2);
        I.checkOption('#_virtual');
        I.wait(3);
        I.dontSeeElement('[data-togglehandler] .hide_if_virtual:nth-child(1)');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');

    },
    uncheckVirtual() {
        I.wait(2);
        I.uncheckOption('#_virtual');
        I.wait(2);
        I.seeElement('[data-togglehandler] .hide_if_virtual:nth-child(1)');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');

    },


    checkWrongPrice() {
        I.fillField('Price', '12');
        //this.fillField('Discounted Price','15');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.see('Success! The product has been saved successfully.');
        console.log('Price should not be lower than discount price. Validation neededs');
    },
    checkmulticat() {

        I.click('#select2-product_cat-container');
        I.click('span > span.select2-search.select2-search--dropdown > input');
        I.fillField(' span > span.select2-search.select2-search--dropdown > input', 'For multiple');
        I.pressKey('Enter');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.see('For multiple');
    },
    checksinglecat: function() {
        I.click('#select2-product_cat-container');
        I.click('span > span.select2-search.select2-search--dropdown > input');
        I.fillField('span > span.select2-search.select2-search--dropdown > input', 'For single');
        I.pressKey('Enter');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.see('For single');
    },
    checktags() {
        I.click('div:nth-child(6) > span > span.selection > span');
        I.fillField('div:nth-child(6) > span > span.selection > span > ul > li > input', 'single');
        I.wait(2);
        //I.click('li.select2-results__option.select2-results__option--highlighted');
        I.pressKey('Enter');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.wait(3);
        //I.clearField('div:nth-child(6) > span > span.selection > span > ul > li > input');
        I.click('div:nth-child(6) > span > span.selection > span');
        I.fillField('div:nth-child(6) > span > span.selection > span > ul > li > input', 'gadgets');
        I.wait(2);
        I.pressKey('Enter');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.wait(5);
    },
    shortDesc() {
        var sdesc = faker.lorem.sentences();
        I.scrollTo('div > form > div.dokan-product-short-description > label');
        within({
            frame: '#post_excerpt_ifr'
        }, () => {
            I.fillField('//body[@id="tinymce" and @data-id="post_excerpt"]', sdesc);
        });
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.wait(4);
    },
    desc() {
        var desc = faker.lorem.text();
        I.scrollTo('div.dokan-product-description > label');
        within({
            frame: '#post_content_ifr'
        }, () => {
            I.fillField('//body[@id="tinymce" and @data-id="post_content"]', desc);
        });
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.wait(4);
    },
    clearDesc() {
        I.scrollTo('div > form > div.dokan-product-short-description > label');
        within({
            frame: '#post_excerpt_ifr'
        }, () => {
            I.wait(2);
            I.click('//body[@id="tinymce" and @data-id="post_excerpt"]');
            I.pressKey(['CommandOrControl', 'A']);
            I.pressKey('Delete');
            I.wait(2);
        });
        within({
            frame: '#post_content_ifr'
        }, () => {
            I.wait(2);
            I.click('//body[@id="tinymce" and @data-id="post_content"]');
            I.pressKey(['CommandOrControl', 'A']);
            I.pressKey('Delete');
            I.wait(2);
        });
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.wait(3);
    },
    wholesale() {
        I.scrollTo('div.dokan-wholesale-options.dokan-edit-row.dokan-clearfix.show_if_simple');
        I.checkOption('//*[@id="wholesale[enable_wholesale]"]');
        I.fillField('#dokan-wholesale-price', faker.random.number(10, 20));
        I.fillField('#dokan-wholesale-qty', faker.random.number(5, 10));
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.wait(3);
    },
    clearwholesale() {
        I.scrollTo('div.dokan-wholesale-options.dokan-edit-row.dokan-clearfix.show_if_simple');
        I.clearField('#dokan-wholesale-price');
        I.clearField('#dokan-wholesale-qty');
        I.click('input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right');
        I.wait(2);
    }

}