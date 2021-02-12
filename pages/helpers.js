var Factory = require('rosie').Factory;
var faker = require('faker');
const locator = require('./product_locator');

const {
    I
} = inject();
module.exports = {

    setregularprice() {
        I.fillField('Price', '20');
        I.fillField('Discounted Price', '15');
        I.click(locator.SaveProduct);
    },

    cancelschedule() {
        I.seeElement(locator.CancelLink);
        I.click(locator.CancelLink);
        I.click(locator.SaveProduct);

    },
    setSchedule() {
        I.click('Schedule');
        I.fillField(locator.CalenderFrom, '2021-01-01');
        I.fillField(locator.CaldenderTO, '2021-12-31');
        I.wait(3);
        I.click(locator.SaveProduct);

    },
    checkVirtual() {
        I.wait(2);
        I.checkOption(locator.Virtual);
        I.wait(3);
        I.dontSeeElement(locator.ShippingDiv);
        I.click(locator.SaveProduct);

    },
    uncheckVirtual() {
        I.wait(2);
        I.uncheckOption(locator.Virtual);
        I.wait(2);
        I.seeElement(locator.ShippingDiv);
        I.click(locator.SaveProduct);

    },


    checkWrongPrice() {
        I.fillField('Price', '12');
        //this.fillField('Discounted Price','15');
        I.click(locator.SaveProduct);
        I.see(locator.SuccessMsg);
        console.log('Price should not be lower than discount price. Validation neededs');
    },
    checkmulticat() {

        I.click(locator.CategoryContainer);
        I.click(locator.CategoryInput);
        I.fillField(locator.CategoryInput, 'For multiple');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.see('For multiple');
    },
    checksinglecat: function() {
        I.click(locator.CategoryContainer);
        I.click(locator.CategoryInput);
        I.fillField(locator.CategoryInput, 'For single');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.see('For single');
    },
    checktags() {
        I.click(locator.TagField);
        I.fillField(locator.TagInput, 'single');
        I.wait(2);
        //I.click('li.select2-results__option.select2-results__option--highlighted');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.wait(2);
        //I.clearField('div:nth-child(6) > span > span.selection > span > ul > li > input');
        I.click(locator.TagField);
        I.fillField(locator.TagInput, 'gadgets');
        I.wait(2);
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    shortDesc() {
        var sdesc = faker.lorem.sentences();
        I.scrollTo(locator.ShortDecLabel);
        within({
            frame: locator.ShortDescFrame
        }, () => {
            I.fillField(locator.ShortDescInput, sdesc);
        });
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    desc() {
        var desc = faker.lorem.text();
        I.scrollTo(locator.DescLabel);
        within({
            frame: locator.DescFrame
        }, () => {
            I.fillField(locator.DescInput, desc);
        });
        I.click(locator.SaveProduct);
        I.wait(4);
    },
    clearDesc() {
        I.scrollTo(locator.ShortDecLabel);
        within({
            frame: locator.ShortDescFrame
        }, () => {
            I.wait(2);
            I.click(locator.ShortDescInput);
            I.pressKey(['CommandOrControl', 'A']);
            I.pressKey('Delete');
            I.wait(2);
        });
        within({
            frame: locator.DescFrame
        }, () => {
            I.wait(2);
            I.click(locator.DescInput);
            I.pressKey(['CommandOrControl', 'A']);
            I.pressKey('Delete');
            I.wait(2);
        });
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    wholesale() {
        I.scrollTo(locator.WholeSaleDiv);
        I.checkOption(locator.WholeSaleCheck);
        I.fillField(locator.WholeSalePrice, faker.random.number(10, 20));
        I.fillField(locator.WholeSaleQty, faker.random.number(5, 10));
        I.click(locator.SaveProduct);
        I.wait(3);
    },
    clearwholesale() {
        I.scrollTo(locator.WholeSaleDiv);
        I.clearField(locator.WholeSalePrice);
        I.clearField(locator.WholeSaleQty);
        I.click(locator.SaveProduct);
        I.wait(2);
    }

}