import fs from 'fs';
import { execSync } from 'child_process';
import { Browser, BrowserContextOptions, Page } from '@playwright/test';
import open from 'open';

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

    getRandomNumber: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,

    // random number between 0 and 1000
    randomNumber: () => Math.floor(Math.random() * 1000),

    // random array element
    randomItem: (arr: string | any[]) => arr[Math.floor(Math.random() * arr.length)],

    // remove array element
    removeItem: (arr: any[], removeItem: any) => arr.filter(item => item !== removeItem),

    // get count in array
    getCount: (array: any[], element: any) => array.filter(n => n === element).length,

    // is sub array
    isSubArray: (parentArray: any[], subArray: any[]) => subArray.every(el => parentArray.includes(el)),

    // check if object is empty
    isObjEmpty: (obj: object) => Object.keys(obj).length === 0,

    // opens the url in the default browser
    openUrl: (url: string) => open(url),

    // opens test report in the default browser
    openReport: () => open('playwright-report/html-report/index.html'),

    // snakecase to camelcase
    toCamelCase: (str: string): string => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),

    // string between two tags
    stringBetweenTags: (str: string): string => {
        const res = str.split(/<p>(.*?)<\/p>/g);
        return res[1] as string;
    },

    // escape regex
    escapeRegex: (str: string): string => {
        const escapePatten = /[.*+\-?^$|(){}[\]\\]/g; // Special Regex Characters: ., *, +,-, ?, ^, $, |, (, ), {, }, [, ], \, ],
        return str.replace(escapePatten, '\\$&'); // $& means the whole matched string
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

    // dateFormat // todo: remove all date-time , and update date to return date as required formate // also method to return as site date format
    dateFormatFYJ: (date: string) => new Date(date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),

    // current year
    currentYear: new Date().getFullYear(),

    // current day [2023-06-02]
    currentDate: new Date().toLocaleDateString('en-CA'),

    // current day [August 22, 2023]
    currentDateFJY: new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),

    // current date-time [2023-06-02 00:33]
    currentDateTime: new Date().toLocaleString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric' }).replace(',', ''),

    // current date-time [2023-06-02 00:46:11]
    currentDateTimeFullFormat: new Date().toLocaleString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric' }).replace(',', ''),

    currentDateTime2: () => new Date().toLocaleString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric' }).replace(',', ''),

    // add two input days
    addDays(date: string | number | Date | null, days: number, format: string): string {
        const result = date ? new Date(date) : new Date();
        result.setDate(result.getDate() + days);

        if (format === 'full') {
            // [2023-06-02, 00:33]
            return result.toLocaleDateString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric' }).replace(/,/g, '');
        } else if (format === 'complete') {
            // [2023-06-02 00:46:11]
            return result.toLocaleDateString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric' }).replace(/,/g, '');
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
        return number * (percentage / 100);
    },

    percentageWithRound(number: number, percentage: number) {
        return this.roundToTwo(number * (percentage / 100));
    },

    // subtotal
    subtotal(price: number[], quantity: number[]) {
        const subtotal = price.map((e, index) => e * quantity[index]!);
        return subtotal.reduce((a, b) => a + b, 0);
    },

    lineItemsToSubtotal(lineItems: { price: number; quantity: number }[]) {
        const subtotal = lineItems.reduce((sum: number, { price, quantity }) => sum + price * quantity, 0);
        return this.roundToTwo(subtotal);
    },

    lineItemsToSubtotalWithoutDiscount(lineItems: { subtotal: number }[]) {
        const subtotalWithoutDiscount = lineItems.reduce((sum: number, { subtotal }) => sum + subtotal, 0);
        return this.roundToTwo(subtotalWithoutDiscount);
    },

    lineItemsToCartTax(taxRate: number, lineItems: { price: number; quantity: number }[]) {
        const totalTax = lineItems.reduce((sum: number, { price, quantity }) => sum + this.tax(taxRate, price * quantity), 0);
        return this.roundToTwo(totalTax);
    },

    lineItemsToSalesMetrics(lineItems: any, taxRate: number): number[] {
        let subtotal = 0;
        let subtotalTax = 0;
        let subtotalCommission = 0;
        let subtotalEarning = 0;

        for (const { price, quantity, meta_data } of lineItems) {
            const commissionRate = meta_data.find((item: { key: string }) => item.key === '_dokan_commission_rate').value;
            const additionalFee = meta_data.find((item: { key: string }) => item.key === '_dokan_additional_fee').value;

            const lineItemTotal = price * quantity;
            const commission = this.percentage(Number(lineItemTotal), Number(commissionRate)) + Number(additionalFee);
            subtotal += lineItemTotal;
            subtotalTax += this.tax(taxRate, lineItemTotal);
            subtotalCommission += commission;
            subtotalEarning += lineItemTotal - commission;
        }

        // console.log('subtotal:', subtotal, 'subtotalTax:', subtotalTax, 'subtotalCommission:', subtotalCommission, 'subtotalEarning:', subtotalEarning);

        const results = [subtotal, subtotalTax, subtotalCommission, subtotalEarning].map(this.roundToTwo);
        return results;
    },

    lineItemsToSubtotalAndTax(taxRate: number, lineItems: { price: number; quantity: number; subtotal: number }[]) {
        let subtotal = 0;
        let totalTax = 0;

        for (const { price, quantity } of lineItems) {
            const lineItemTotal = price * quantity;
            subtotal += lineItemTotal;
            totalTax += this.tax(taxRate, lineItemTotal);
        }

        const results = [subtotal, totalTax].map(this.roundToTwo);
        return results;
    },

    lineItemsToSubtotalAndTaxAndDiscount(taxRate: number, lineItems: { price: number; quantity: number; subtotal: number }[]) {
        let subtotalWithDiscount = 0;
        let subtotalWithoutDiscount = 0;
        let totalTax = 0;

        for (const { price, quantity, subtotal } of lineItems) {
            const lineItemTotal = price * quantity;
            subtotalWithDiscount += lineItemTotal;
            totalTax += this.tax(taxRate, lineItemTotal);
            subtotalWithoutDiscount += subtotal;
        }

        const results = [subtotalWithDiscount, totalTax, subtotalWithoutDiscount].map(this.roundToTwo);
        return results;
    },

    lineItemsToCommissionAndEarning(lineItems: any) {
        let totalAdminCommission = 0;
        let totalVendorEarning = 0;

        lineItems.forEach((item: any) => {
            item.meta_data.forEach((meta: any) => {
                if (meta.key === 'dokan_commission_meta') {
                    totalAdminCommission += meta.value.admin_commission;
                    totalVendorEarning += meta.value.vendor_earning;
                }
            });
        });

        const results = [totalAdminCommission, totalVendorEarning].map(this.roundToTwo);
        return results;
    },

    // tax
    tax(rate: number, amount: number) {
        const tax = this.percentage(Number(rate), Number(amount));
        return this.roundToTwo(tax);
    },

    // gateway details
    getGatewayDetails(responseBody: any) {
        const gatewayFee = responseBody.meta_data.find((item: { key: string }) => item.key === 'dokan_gateway_fee')?.value ?? 0;
        const gatewayFeeGiver = responseBody.meta_data.find((item: { key: string }) => item.key === 'dokan_gateway_fee_paid_by')?.value ?? 'seller';
        return { gatewayFee: Number(gatewayFee), gatewayFeeGiver: gatewayFeeGiver };
    },

    // calculate discount
    calculateDiscount(subtotal: number, couponLines: any[], applySequentially: boolean) {
        let totalDiscount = 0;

        if (!couponLines) {
            return totalDiscount;
        }

        couponLines.forEach(coupon => {
            // only for debuging
            if (!coupon.discount_type) {
                //get coupon details from single order
                const couponMeta = JSON.parse(coupon.meta_data[0].value);
                coupon.discount_type = couponMeta[2];
                coupon.nominal_amount = couponMeta[3];
            }

            const discountAmount = coupon.discount_type === 'percent' ? this.percentage(Number(subtotal), Number(coupon.nominal_amount)) : Number(coupon.nominal_amount);
            totalDiscount = this.roundToTwo(totalDiscount + discountAmount);
            if (applySequentially) {
                subtotal = this.roundToTwo(subtotal - discountAmount);
            }
        });

        return this.roundToTwo(totalDiscount);
    },

    // calculate commission or earning
    commissionOrEarning(type: string, productcommissionOrEarning: number = 0, productTax: number = 0, shippingTax: number = 0, shippingFee: number = 0, gatewayDetails: any, feeRecipient: any) {
        if (type === 'commission') {
            if (feeRecipient.taxFeeRecipient === 'seller') productTax = 0;
            if (feeRecipient.shippingTaxFeeRecipient === 'seller') shippingTax = 0;
            if (feeRecipient.shippingFeeRecipient === 'seller') shippingFee = 0;
            if (gatewayDetails.gatewayFeeGiver === 'seller') gatewayDetails.gatewayFee = 0;
        } else if (type === 'earning') {
            if (feeRecipient.taxFeeRecipient === 'admin') productTax = 0;
            if (feeRecipient.shippingTaxFeeRecipient === 'admin') shippingTax = 0;
            if (feeRecipient.shippingFeeRecipient === 'admin') shippingFee = 0;
            if (gatewayDetails.gatewayFeeGiver === 'admin') gatewayDetails.gatewayFee = 0;
        }

        // console.log('productcommissionOrEarning', productcommissionOrEarning, 'productTax', productTax, 'shippingTax', shippingTax, 'shippingFee', shippingFee);

        let commissionOrEarning = Number(productcommissionOrEarning) - Number(gatewayDetails.gatewayFee) + Number(productTax) + Number(shippingTax) + Number(shippingFee);
        commissionOrEarning = this.roundToTwo(commissionOrEarning);
        return commissionOrEarning;
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

    // check file existence
    fileExists(filePath: string) {
        return fs.existsSync(filePath);
    },

    // read file
    readFile(filePath: string) {
        return fs.readFileSync(filePath, 'utf8');
    },

    // read json
    readJson(filePath: string) {
        if (fs.existsSync(filePath)) {
            return JSON.parse(this.readFile(filePath));
        }
    },

    // read a single json data
    readJsonData(filePath: string, propertyName: string) {
        const data = this.readJson(filePath);
        return data[propertyName];
    },

    // write a single json data
    writeJsonData(filePath: string, property: string, value: string) {
        const jsonData = this.readJson(filePath);
        jsonData[property] = value;
        this.writeFile(filePath, JSON.stringify(jsonData, null, 2));
    },

    // write file
    writeFile(filePath: string, content: string) {
        fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    },

    // delete file
    deleteFile(filePath: string) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    },

    // append file
    appendFile(filePath: string, content: string) {
        fs.appendFileSync(filePath, content, { encoding: 'utf8' });
    },

    // rename file
    renameFile(newFilePath: string, oldFilePath: string) {
        fs.renameSync(newFilePath, oldFilePath);
    },

    // replace data in file
    replaceData(filePath: string, data: string, replaceData: string) {
        const fileData = this.readFile(filePath);
        const updatedData = fileData.replace(data, replaceData);
        this.writeFile(filePath, updatedData);
    },

    // create env
    createEnvVar(key: string, value: string) {
        console.log(`${key}=${value}`);
        const content = '\n' + `${key}=${value}`;
        process.env[key] = value;
        this.appendFile('.env', content); // for local testing
    },

    // append content to .env file
    appendEnv(content: string) {
        content += '\n';
        this.appendFile('.env', content);
    },

    // write env json
    writeEnvJson(property: string, value: string) {
        const filePath = 'utils/data.json';
        let envData: { [key: string]: string } = {};
        if (fs.existsSync(filePath)) {
            envData = this.readJson(filePath);
        }
        envData[property] = value;
        this.writeFile(filePath, JSON.stringify(envData, null, 2));
    },

    async createFolder(folderName: string) {
        try {
            fs.mkdirSync(folderName);
            console.log(`Folder '${folderName}' created successfully.`);
        } catch (error: any) {
            if (error.code === 'EEXIST') {
                console.log(`Folder '${folderName}' already exists.`);
                return;
            } else {
                console.error(`Error creating folder '${folderName}':`, error);
            }
        }
    },

    // execute command
    async exeCommand(command: string, directoryPath = process.cwd()) {
        process.chdir(directoryPath);

        const output = execSync(command, { encoding: 'utf-8' });
        console.log(output);
    },

    // create a new page
    async createPage(browser: Browser, options?: BrowserContextOptions | undefined) {
        const browserContext = await browser.newContext(options);
        return browserContext.newPage();
    },

    // close pages
    async closePages(pages: Page[]): Promise<void> {
        for (const page of pages) {
            await page.close();
        }
    },

    // rgb (rgb(r, g, b)) to hex (#rrggbb) color
    rgbToHex(rgb: string): string {
        const [r, g, b]: number[] = rgb.match(/\d+/g)!.map(Number);
        return `#${((1 << 24) + (r! << 16) + (g! << 8) + b!).toString(16).slice(1).toUpperCase()}`;
    },

    // hex (#rrggbb) to rgb (rgb(r, g, b)) color
    hexToRgb(hex: string): string {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    },
};
