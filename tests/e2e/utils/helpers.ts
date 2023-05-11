// const open = require( 'open' );
export const helpers = {

	// replace '_' to space & capitalize first letter of string
	replaceAndCapitalize: (str: string) => str.replace('dokan', 'vendor').replace('_', ' ').replace(/^\w{1}/, (letter) => letter.toUpperCase()),

	// replace '_' to space & capitalize first letter of each word
	replaceAndCapitalizeEachWord: (str: string) => str.replace('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase()),

	// returns a random number between min (inclusive) and max (exclusive)
	getRandomArbitrary: (min: number, max: number) => Math.random() * (max - min) + min,

	// returns a random integer number between min (inclusive) and max (exclusive)
	getRandomArbitraryInteger: (min: number, max: number) => Math.floor(Math.random() * (max - min) + min),

	//random number between 0 and 1000
	randomNumber: () => Math.floor(Math.random() * 1000),

	// random array element
	randomItem: (array: string | any[]) => array[Math.floor(Math.random() * array.length)],

	// remove array element
	removeItem: (arr: any[], removeItem: any) => arr.filter((item) => item !== removeItem),

	// string to slug
	slugify: (str: string) => {
		return str
			.toString() 							// Cast to string (optional)
			.normalize('NFKD') 						// The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase() 							// Convert the string to lowercase letters
			.trim()									// Remove whitespace from both sides of a string (optional)
			.replace(/\s+/g, '-') 					// Replace spaces with -
			.replace(/[^\w\-]+/g, '') 				// Remove all non-word chars
			// .replace(/\_/g, '-')           		// Replace _ with -
			.replace(/\-\-+/g, '-') 				// Replace multiple - with single -
			.replace(/\-$/g, ''); 					// Remove trailing -
	}, // TODO: might fail sometimes, need to update with string-to-slug see google

	// opens the url in the default browser
	openUrl: (url: string) => open(url),

	// opens test report in the default browser
	openReport: () => open('./artifacts/jest-stare/index.html'),

	// convert string to price format
	price: (str: string) => parseFloat(str.replace(/[^\d\-.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, '')),

	// current year
	currentYear: new Date().getFullYear(),

	// current day
	currentDate: new Date().toLocaleDateString('en-CA'),

	// current date-time
	currentDateTime: new Date().toLocaleString('en-CA', {
		year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric',
	}),

	// add two input days
	addDays(date: string | number | Date, days: number) {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result.toLocaleDateString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric' });
	},

	// add two days
	addDays1(date: string | number | Date, days: number) {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result.toLocaleDateString('en-CA');
	},

	// round to two decimal places
	// roundToTwo(num: string | number) { return +(Math.round(num + 'e+2') + 'e-2') },  //TODO: update this number + string

	roundToTwo(num: string | number) {
		return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
	},

	//calculate percentage
	percentage(number: number, percentage: number) {
		return this.roundToTwo(number * (percentage / 100));
	},

	//calculate percentage
	percentage1(number: number, percentage: number) {
		return ((number * (percentage / 100)).toFixed(2));
	},

	//subtotal
	subtotal(price: number[], quantity: number[]) {
		const subtotal = price.map((e, index) => e * quantity[index]);
		return subtotal.reduce((a, b) => a + b, 0);
	},

	//tax
	tax(taxRate: any, subtotal: any, shipping = 0) {
		const tax = this.percentage(subtotal, taxRate) + this.percentage(shipping, taxRate);
		return this.roundToTwo(tax);
	},

	//order total
	orderTotal(subtotal: number, tax = 0, shipping = 0) {
		const orderTotal = subtotal + tax + shipping;
		return this.roundToTwo(orderTotal);
	},

	//calculate admin commission
	adminCommission(subTotal: any, commissionRate: any, tax = 0, shipping = 0, gatewayFee = 0, taxReceiver = 'vendor', shippingReceiver = 'vendor', gatewayFeeGiver = 'vendor') {
		if (taxReceiver === 'vendor') {
			tax = 0;
		}
		if (shippingReceiver === 'vendor') {
			shipping = 0;
		}
		if (gatewayFeeGiver === 'vendor') {
			gatewayFee = 0;
		}

		const adminCommission = this.percentage(subTotal, commissionRate) - gatewayFee + tax + shipping;
		return this.roundToTwo(adminCommission);
	},

	//calculate vendor earning
	vendorEarning(subTotal: number, commission: number, tax = 0, shipping = 0, gatewayFee = 0, taxReceiver = 'vendor', shippingReceiver = 'vendor', gatewayFeeGiver = 'vendor') {
		if (taxReceiver !== 'vendor') {
			tax = 0;
		}
		if (shippingReceiver !== 'vendor') {
			shipping = 0;
		}
		if (gatewayFeeGiver !== 'vendor') {
			gatewayFee = 0;
		}

		const vendorEarning = subTotal - commission - gatewayFee + tax + shipping;
		return this.roundToTwo(vendorEarning);
	},

};
