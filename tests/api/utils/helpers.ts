
export const helpers = {
	// current year
	currentYear: new Date().getFullYear(),

	// random array element
	randomItem: ( array: string | any[] ) => array[ Math.floor( Math.random() * array.length ) ],

	// check if object is empty
	isEmpty: ( obj: object ) => Object.keys( obj ).length === 0,

	// round to two decimal places
	roundToTwo( num: number ) {
		return Math.round( ( Number( num ) + Number.EPSILON ) * 100 ) / 100;
	},

	// current date-time [2023-06-02 00:46:11]
	currentDateTime1: new Date().toLocaleString('en-CA', { 
		year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric',}).replace(',', ''),
	

	//calculate percentage
	percentage( number: number, percentage: number ) {
		return this.roundToTwo( Number( number ) * ( percentage / 100 ) );
	},

	//subtotal
	subtotal( price: number[], quantity: number[] ) {
		const subtotal = price.map( ( e, index ) => e * quantity[ index ] );
		return subtotal.reduce( ( a, b ) => a + b, 0 );
	},

	//tax
	tax( taxRate: number, subtotal: number, shipping: number = 0 ) {
		const tax = this.percentage( subtotal, taxRate ) + this.percentage( shipping, taxRate );
		return this.roundToTwo( tax );
	},

	//order total
	orderTotal( subtotal: number, tax: number = 0, shipping: number = 0 ) {
		const orderTotal = Number( subtotal ) + Number( tax ) + Number( shipping );
		return this.roundToTwo( orderTotal );
	},

	//calculate admin commission
	adminCommission( subTotal: number, commissionRate: number, tax: number = 0, shipping: number = 0, gatewayFee: number = 0, taxReceiver: string = 'vendor', shippingReceiver: string = 'vendor', gatewayFeeGiver: string = 'vendor' ) {
		if ( taxReceiver === 'vendor' ) {
			tax = 0;
		}
		if ( shippingReceiver === 'vendor' ) {
			shipping = 0;
		}
		if ( gatewayFeeGiver === 'vendor' ) {
			gatewayFee = 0;
		}

		const adminCommission = this.percentage( Number( subTotal ), Number( commissionRate ) ) - Number( gatewayFee ) + Number( tax ) + Number( shipping );
		return this.roundToTwo( adminCommission );
	},

	//calculate vendor earning
	vendorEarning( subTotal: number, commission: number, tax: number = 0, shipping: number = 0, gatewayFee: number = 0, taxReceiver: string = 'vendor', shippingReceiver: string = 'vendor', gatewayFeeGiver: string = 'vendor' ) {
		if ( taxReceiver !== 'vendor' ) {
			tax = 0;
		}
		if ( shippingReceiver !== 'vendor' ) {
			shipping = 0;
		}
		if ( gatewayFeeGiver !== 'vendor' ) {
			gatewayFee = 0;
		}

		const vendorEarning = Number( subTotal ) - Number( commission ) - Number( gatewayFee ) + Number( tax ) + Number( shipping );
		return this.roundToTwo( vendorEarning );
	},

};
