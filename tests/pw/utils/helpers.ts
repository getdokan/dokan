// const open = require( 'open' );
import fs from 'fs';
import { Browser, BrowserContextOptions } from '@playwright/test';

export const helpers = {
    // replace '_' to space & capitalize first letter of string
    replaceAndCapitalize: (str: string) =>
        str
            .replace('dokan', 'vendor')
            .replace('_', ' ')
            .replace(/^\w{1}/, letter => letter.toUpperCase()),

    // replace '_' to space & capitalize first letter of each word
    replaceAndCapitalizeEachWord: (str: string) => str.replace('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase()),

    // capitalize
    capitalize: (word: string) => word[0]?.toUpperCase() + word.substring(1).toLowerCase(),

    // returns a random number between min (inclusive) and max (exclusive)
    getRandomArbitrary: (min: number, max: number) => Math.random() * (max - min) + min,

    // returns a random integer number between min (inclusive) and max (exclusive)
    getRandomArbitraryInteger: (min: number, max: number) => Math.floor(Math.random() * (max - min) + min),

    // random number between 0 and 1000
    randomNumber: () => Math.floor(Math.random() * 1000),

    // random array element
    randomItem: (arr: string | any[]) => arr[Math.floor(Math.random() * arr.length)],

    // remove array element
    removeItem: (arr: any[], removeItem: any) => arr.filter(item => item !== removeItem),

    // is sub array
    isSubArray: (parentArray: any[], subArray: any[]) => subArray.every(el => parentArray.includes(el)),

    // check if object is empty
    isObjEmpty: (obj: object) => Object.keys(obj).length === 0,

    // opens the url in the default browser
    openUrl: (url: string) => open(url),

    // opens test report in the default browser
    openReport: () => open('playwright-report/html-report/index.html'),

    // string between two tags
    stringBetweenTags: (str: string): string => {
        const res = str.split(/<p>(.*?)<\/p>/g);
        return res[1] as string;
    },

    // convert string to regex
    stringToRegex: (str: string): RegExp => new RegExp(str), // todo: need to update, multiple cases unhandled

    // convert string to price format
    price: (str: string): number =>
        parseFloat(
            str
                .replace(/[^\d\-.,\\s]/g, '')
                .replace(/,/g, '.')
                .replace(/\.(?=.*\.)/g, ''),
        ),

    // price as string
    priceString: (num: number, choice: string): string => (choice === 'US' ? Number(num).toLocaleString('es-US') : Number(num).toLocaleString('es-ES')),

    // remove dollar sign
    removeCurrencySign: (str: string): string => str.replace(/[^\d\-.,\\s]/g, ''),

    // dateFormat // todo: remove all datetime , and update date to return date as required formate // also method to return as site date format
    dateFormatFYJ: (date: string) =>
        new Date(date).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),

    // current year
    currentYear: new Date().getFullYear(),

    // current day [2023-06-02]
    currentDate: new Date().toLocaleDateString('en-CA'),

    // current day [August 22, 2023]
    currentDateFJY: new Date().toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }),

    // current date-time [2023-06-02 00:33]
    currentDateTime: new Date()
        .toLocaleString('en-CA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hourCycle: 'h23',
            hour: 'numeric',
            minute: 'numeric',
        })
        .replace(',', ''),

    // current date-time [2023-06-02 00:46:11]
    currentDateTimeFullFormat: new Date()
        .toLocaleString('en-CA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hourCycle: 'h23',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        })
        .replace(',', ''),

    currentDateTime2: () =>
        new Date()
            .toLocaleString('en-CA', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hourCycle: 'h23',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            })
            .replace(',', ''),

    // add two input days
    addDays(date: string | number | Date | null, days: number, format: string): string {
        const result = date ? new Date(date) : new Date();
        result.setDate(result.getDate() + days);

        if (format === 'full') {
            // [2023-06-02, 00:33]
            return result
                .toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hourCycle: 'h23',
                    hour: 'numeric',
                    minute: 'numeric',
                })
                .replace(/,/g, '');
        } else if (format === 'complete') {
            // [2023-06-02 00:46:11]
            return result
                .toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hourCycle: 'h23',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                })
                .replace(/,/g, '');
        } else {
            // [2023-06-02]
            return result.toLocaleDateString('en-CA');
        }
    },

    // future date
    futureDate(date: string | number | Date | null, days: number): Date {
        const result = date ? new Date(date) : new Date();
        result.setDate(result.getDate() + days);
        return result;
    },

    // round to two decimal
    roundToTwo(num: string | number) {
        return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
    },

    // calculate percentage
    percentage(number: number, percentage: number) {
        return this.roundToTwo(number * (percentage / 100));
    },

    // calculate percentage
    percentage1(number: number, percentage: number) {
        return (number * (percentage / 100)).toFixed(2);
    },

    // subtotal
    subtotal(price: number[], quantity: number[]) {
        const subtotal = price.map((e, index) => e * quantity[index]!);
        return subtotal.reduce((a, b) => a + b, 0);
    },

    // product tax
    productTax(taxRate: number, subtotal: number) {
        const productTax = this.percentage(subtotal, taxRate);
        return this.roundToTwo(productTax);
    },

    // product tax
    shippingTax(taxRate: number, shippingFee = 0) {
        const shippingTax = this.percentage(shippingFee, taxRate);
        return this.roundToTwo(shippingTax);
    },

    // order total
    orderTotal(subtotal: number, productTax = 0, shippingTax = 0, shippingFee = 0) {
        const orderTotal = Number(subtotal) + Number(productTax) + Number(shippingTax) + Number(shippingFee);
        return this.roundToTwo(orderTotal);
    },

    // calculate admin commission
    adminCommission(subTotal: number, commission: any, productTax = 0, shippingTax = 0, shippingFee = 0, gatewayFee = 0, feeRecipient: any, gatewayFeeGiver = 'seller') {
        let subTotalCommission = 0;

        switch (commission.type) {
            case 'percentage':
                subTotalCommission = this.percentage(Number(subTotal), Number(commission.amount));
                break;

            case 'flat':
                subTotalCommission = Number(commission.amount);
                break;

            case 'combine':
                subTotalCommission = this.percentage(Number(subTotal), Number(commission.amount)) + Number(commission.additionalAmount);
                break;

            default:
                break;
        }

        productTax = feeRecipient.taxFeeRecipient === 'seller' ? 0 : productTax;
        shippingTax = feeRecipient.shippingTaxFeeRecipient === 'seller' ? 0 : shippingTax;
        shippingFee = feeRecipient.shippingFeeRecipient === 'seller' ? 0 : shippingFee;
        gatewayFee = gatewayFeeGiver === 'seller' ? 0 : gatewayFee;

        const adminCommission = subTotalCommission - Number(gatewayFee) + Number(productTax) + Number(shippingTax) + Number(shippingFee);
        return this.roundToTwo(adminCommission);
    },

    // calculate vendor earning
    vendorEarning(subTotal: number, commission: number, productTax = 0, shippingTax = 0, shippingFee = 0, gatewayFee = 0, feeRecipient: any, gatewayFeeGiver = 'seller') {
        productTax = feeRecipient.taxFeeRecipient !== 'seller' ? 0 : productTax;
        shippingTax = feeRecipient.shippingTaxFeeRecipient !== 'seller' ? 0 : shippingTax;
        shippingFee = feeRecipient.shippingFeeRecipient !== 'seller' ? 0 : shippingFee;
        gatewayFee = gatewayFeeGiver !== 'seller' ? 0 : gatewayFee;

        const vendorEarning = Number(subTotal) - Number(commission) - Number(gatewayFee) + Number(productTax) + Number(shippingTax) + Number(shippingFee);
        return this.roundToTwo(vendorEarning);
    },

    // string to slug
    slugify(str: string) {
        return (
            str
                .toString() // Cast to string (optional)
                .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase() // Convert the string to lowercase letters
                .trim() // Remove whitespace from both sides of a string (optional)
                .replace(/\s+/g, '-') // Replace spaces with -
                .replace(/[^\w-]+/g, '') // Remove all non-word chars
                // .replace(/\_/g, '-')           		// Replace _ with -
                .replace(/--+/g, '-') // Replace multiple - with single -
                .replace(/-$/g, '')
        ); // Remove trailing -
    },

    // create env
    createEnvVariable(key: string, value: string) {
        const content = '\n' + key + '=' + value;
        fs.appendFile('.env', content, 'utf8', err => {
            if (err) throw err;
        });
    },

    // check file existence
    fileExists(filePath: string) {
        return fs.existsSync(filePath);
    },

    // read file
    readFile(filePath: string) {
        return fs.readFileSync(filePath, 'utf8');
    },

    readJson(filePath: string) {
        return JSON.parse(this.readFile(filePath));
    },

    // write file
    writeFile(filePath: string, content: string) {
        fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    },

    // append file
    appendFile(filePath: string, content: string) {
        fs.appendFileSync(filePath, content, { encoding: 'utf8' });
    },

    // rename file
    renameFile(newFilePath: string, oldFilePath: string) {
        fs.renameSync(newFilePath, oldFilePath);
    },

    // append content to .env file
    appendEnv(content: string) {
        content += '\n';
        this.appendFile('.env', content);
    },

    async createPage(browser: Browser, options?: BrowserContextOptions | undefined) {
        const browserContext = await browser.newContext(options);
        return browserContext.newPage();
    },
};
