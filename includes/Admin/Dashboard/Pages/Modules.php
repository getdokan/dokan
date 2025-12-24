<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Modules extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since 4.0.0
     *
     * @return string
     */
	public function get_id(): string {
		return 'pro-modules';
	}

	/**
	 * @inheritDoc
	 */
	public function menu( string $capability, string $position ): array {
        $is_pro_exists = dokan()->is_pro_exists();

        if ( $is_pro_exists ) {
            return [];
        }

		return [
            'page_title' => __( 'Dokan Modules', 'dokan-lite' ),
            'menu_title' => __( 'Modules', 'dokan-lite' ),
            'route'      => 'pro-modules',
            'capability' => $capability,
            'position'   => 30,
        ];
	}

	/**
	 * @inheritDoc
	 */
	public function settings(): array {
        $thumbnail_dir = DOKAN_PLUGIN_ASSEST . '/images/modules';
		return [
            'upgrade_url' => 'https://dokan.co/wordpress/upgrade-to-pro/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite',
            'modules' => [
                [
                    'title' => __( 'WooCommerce Booking Integration', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/booking.svg',
                    'description' => __( 'Integrates WooCommerce Booking with Dokan.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/woocommerce-booking-integration/',
                    'tags' => [
                        'Product Management',
                        'Integration',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-bookings/',
                        'video' => 'F5oofXmuUqo',
                    ],
                    'requires' => [
                        __( 'WooCommerce Bookings plugin', 'dokan-lite' ),
                    ],
                ],
                [
                    'title' => __( 'Color Scheme Customizer', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/color-scheme-customizer.svg',
                    'description' => __( 'A Dokan plugin Add-on to Customize Colors of Dokan Dashboard', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/color-scheme-customizer/',
                    'tags' => [
                        'UI & UX',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/color-scheme/',
                        'video' => 'EXaJGzeKWHg',
                    ],
                ],
                [
                    'title' => __( 'Delivery Time', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/delivery-time.svg',
                    'description' => __( 'Let customer choose their order delivery date & time', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/delivery-time',
                    'tags' => [
                        'Shipping',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-delivery-time/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Elementor', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/elementor.svg',
                    'description' => __( 'Elementor Page Builder widgets for Dokan', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/elementor/',
                    'tags' => [
                        'UI & UX',
                        'Integration',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/elementor-dokan/',
                        'video' => '',
                    ],
                    'requires' => [
                        __( 'Elementor Free and Elementor Pro', 'dokan-lite' ),
                    ],
                ],
                [
                    'title' => __( 'Vendor Product Importer and Exporter', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/import-export.svg',
                    'description' => __( 'This is simple product import and export plugin for vendor', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/export-import/',
                    'tags' => [
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/how-to-install-and-use-dokan-exportimport-add/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Follow Store', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/follow-store.svg',
                    'description' => __( 'Send emails to customers when their favorite store updates.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/follow-store/',
                    'tags' => [
                        'Store Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/follow-store/',
                        'video' => 'v76PnEN5ceQ',
                    ],
                ],
                [
                    'title' => __( 'Geolocation', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/geolocation.svg',
                    'description' => __( 'Search Products and Vendors by geolocation.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/geolocation/',
                    'tags' => [
                        'Store Management',
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-geolocation/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'EU Compliance Fields', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/germanized.svg',
                    'description' => __( 'EU Compliance Fields Support for Vendors.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/eu-compliance-fields',
                    'tags' => [
                        'Store Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/eu-compliance-fields/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Live Chat', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/live-chat.svg',
                    'description' => __( 'Live Chat Between Vendor & Customer.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/live-chat/',
                    'tags' => [
                        'Store Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-live-chat/',
                        'video' => 'BHuTLjY78cY',
                    ],
                ],
                [
                    'title' => __( 'Live Search', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/ajax-live-search.svg',
                    'description' => __( 'Live product search for WooCommerce store.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/ajax-live-search/',
                    'tags' => [
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/how-to-install-configure-use-dokan-live-search/',
                        'video' => 'lvuR-QCJDIo',
                    ],
                ],
                [
                    'title' => __( 'Wirecard', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/wirecard-connect.svg',
                    'description' => __( 'Wirecard payment gateway for Dokan.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/moip/',
                    'tags' => [
                        'Payment',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-moip-connect/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'PayPal Marketplace', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/paypal-marketplace.svg',
                    'description' => __( 'Enable Split payments, Multi-seller payments and all PayPal Commerce Platform (PCP) features.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/dokan-paypal-marketplace',
                    'tags' => [
                        'Payment',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/paypal-marketplace/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Product Addon', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/product-addon.svg',
                    'description' => __( 'WooCommerce Product Addon support', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/product-addons/',
                    'tags' => [
                        'Product Management',
                        'Integration',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/product-addon/',
                        'video' => 'goKBE5L-3cg',
                    ],
                    'requires' => [
                        __( 'WooCommerce Product Addon extension', 'dokan-lite' ),
                    ],
                ],
                [
                    'title' => __( 'Product Enquiry', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/product-enquiry.svg',
                    'description' => __( 'Enquiry for a specific product to a seller.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/product-enquiry/',
                    'tags' => [
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/how-to-install-configure-use-dokan-product-enquiry/',
                        'video' => 'edRLlpmOf-E',
                    ],
                ],
                [
                    'title' => __( 'Product Q&A', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/product-qa.svg',
                    'description' => __( 'Enquiry for a specific product to a seller by asking question publicly.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/product-qa/',
                    'tags' => [
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/product-qa/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Printful', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/printful.svg',
                    'description' => __( 'Enable this module to allow vendors to create & sell custom on-demand products with no inventory via PRINTFUL.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/printful-integration/',
                    'tags' => [
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/printful/',
                        'video' => 'yl1-YyUZm68',
                    ],
                ],
                [
                    'title' => __( 'Report Abuse', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/report-abuse.svg',
                    'description' => __( 'Let customers report fraudulent or fake products.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/dokan-report-abuse/',
                    'tags' => [
                        'Store Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-report-abuse/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Return and Warranty Request', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/rma.svg',
                    'description' => __( 'Manage return and warranty from vendor end.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/rma/',
                    'tags' => [
                        'Order Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/vendor-rma/',
                        'video' => 'j0s8d8u6qYs',
                    ],
                ],
                [
                    'title' => __( 'Seller Vacation', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/seller-vacation.svg',
                    'description' => __( 'Using this plugin seller can go to vacation by closing their stores.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/vendor-vacation/',
                    'tags' => [
                        'Store Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-vendor-vacation/',
                        'video' => '6pd7_3ZPKH4',
                    ],
                ],
                [
                    'title' => __( 'ShipStation Integration', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/shipstation.svg',
                    'description' => __( 'Adds ShipStation label printing support to Dokan. Requires server DomDocument support.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/shipstation/',
                    'tags' => [
                        'Shipping',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/shipstation-dokan-wedevs/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Auction Integration', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/auction.svg',
                    'description' => __( 'A plugin that combined WooCommerce simple auction and Dokan plugin.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/dokan-simple-auctions/',
                    'tags' => [
                        'Product Management',
                        'Integration',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/woocommerce-auctions-frontend-multivendor-marketplace/',
                        'video' => 'TvwSvMSu8Rg',
                    ],
                    'requires' => [
                        __( 'WooCommerce Simple Auctions', 'dokan-lite' ),
                    ],
                ],
                [
                    'title' => __( 'Single Product Multiple Vendor', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/single-product-multivendor.svg',
                    'description' => __( 'A module that offers multiple vendor to sell a single product.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/single-product-multivendor/',
                    'tags' => [
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/single-product-multiple-vendor/',
                        'video' => 'ByiWWObvF0c',
                    ],
                ],
                [
                    'title' => __( 'Store Reviews', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/vendor-review.svg',
                    'description' => __( 'A plugin that allows customers to rate the sellers.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/dokan-vendor-review/',
                    'tags' => [
                        'Store Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/vendor-review/',
                        'video' => 'rX7ZTGa3GzI',
                    ],
                ],
				[
					'title' => __( 'Store Support', 'dokan-lite' ),
					'image' => $thumbnail_dir . '/store-support.svg',
					'description' => __( 'Enable vendors to provide support to customers from store page.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/store-support/',
                    'tags' => [
						'Store Management',
					],
					'actions' => [
						'docs' => 'https://dokan.co/docs/wordpress/modules/how-to-install-and-use-store-support/',
						'video' => 'YWnRWIhFlLM',
					],
				],
                [
                    'title' => __( 'Stripe Connect', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/stripe.svg',
                    'description' => __( 'Accept credit card payments and allow your sellers to get automatic split payment in Dokan via Stripe.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/stripe-connect/',
                    'tags' => [
                        'Payment',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/how-to-install-and-configure-dokan-stripe-connect/',
                        'video' => 'SVpRMSXMXtA',
                    ],
                ],
                [
                    'title' => __( 'Product Advertising', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/product-adv.svg',
                    'description' => __( 'Admin can earn more by allowing vendors to advertise their products and give them the right exposure.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/product-advertising/',
                    'tags' => [],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/product-advertising/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Vendor Subscription', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/subscription.svg',
                    'description' => __( 'Subscription pack add-on for Dokan vendors.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/subscription/',
                    'tags' => [
                        'Store Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/how-to-install-use-dokan-subscription/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Vendor Analytics', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/analytics.svg',
                    'description' => __( 'A plugin for store and product analytics for vendor.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/vendor-analytics',
                    'tags' => [],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-vendor-analytics/',
                        'video' => 'IegbUHYA8R4',
                    ],
                ],
                [
                    'title' => __( 'Vendor Staff Manager', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/vendor-staff.svg',
                    'description' => __( 'A plugin for manage store via vendor staffs.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/vendor-staff-manager/',
                    'tags' => [
                        'Store Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-vendor-staff-manager/',
                        'video' => 'z4yinwCxabI',
                    ],
                ],
                [
                    'title' => __( 'Product Subscription', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/vendor-subscription-product.svg',
                    'description' => __( 'WooCommerce Subscription integration for Dokan', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/vendor-subscription-product/',
                    'tags' => [
                        'Product Management',
                        'Integration',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-product-subscription/',
                        'video' => '9fvPywanWfM',
                    ],
                    'requires' => [
                        __( 'WooCommerce Subscription Module', 'dokan-lite' ),
                    ],
                ],
                [
                    'title' => __( 'Vendor Verification', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/vendor-verification.svg',
                    'description' => __( 'Dokan add-on to verify sellers.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/seller-verification/',
                    'tags' => [],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-seller-verification-admin-settings/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Wholesale', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/wholesale.svg',
                    'description' => __( 'Offer any customer to buy product as a wholesale price from any vendors.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/wholesale/',
                    'tags' => [
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-wholesale/',
                        'video' => '',
                    ],
                ],
				[
					'title' => __( 'Rank Math SEO', 'dokan-lite' ),
					'image' => $thumbnail_dir . '/rank-math.svg',
					'description' => __( 'Manage SEO for products with Rank Math', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/rank-math-seo/',
                    'tags' => [
						'Product Management',
						'Integration',
					],
					'actions' => [
						'docs' => 'https://dokan.co/docs/wordpress/modules/rank-math-seo/',
						'video' => 'V7UcyAe7QAs',
					],
					'requires' => [
						__( 'Rank Math SEO (v1.0.80 or Later)', 'dokan-lite' ),
					],
				],
                [
                    'title' => __( 'Table Rate Shipping', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/table-rate-shipping.svg',
                    'description' => __( 'Deliver Products at the Right Time, With the Right Pay.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/table-rate-shipping/',
                    'tags' => [
                        'Shipping',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-table-rate-shipping/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'MangoPay', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/mangopay.svg',
                    'description' => __( 'Enable split payments, multi-seller payments, and other marketplace features given by MangoPay.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/dokan-mangopay/',
                    'tags' => [
                        'Payment',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-mangopay/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Min Max Quantities', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/order-min-max.svg',
                    'description' => __( 'Set a minimum or maximum purchase quantity or amount for the products of your marketplace. ', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/minimum-maximum-order',
                    'tags' => [
                        'Product Management',
                        'Order Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/how-to-enable-minimum-maximum-order-amount-for-dokan/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Razorpay', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/razorpay.svg',
                    'description' => __( 'Accept credit card payments and allow your sellers to get automatic split payment in Dokan via Razorpay.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/dokan-razorpay/',
                    'tags' => [
                        'Payment',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-razorpay/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Seller Badge', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/seller-badge.svg',
                    'description' => __( 'Offer vendors varieties of badges by their performance in your marketplace.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/seller-badge/',
                    'tags' => [
                        'Vendor Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/seller-badge/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Stripe Express', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/stripe-express.svg',
                    'description' => __( 'Enable split payments, multi-seller payments, Apple Pay, Google Pay, iDEAL and other marketplace features available in Stripe Express.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/stripe-express/',
                    'tags' => [
                        'Payment',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-stripe-express-module/',
                        'video' => '',
                    ],
                ],
                [
                    'title' => __( 'Request for Quotation', 'dokan-lite' ),
                    'image' => $thumbnail_dir . '/request-for-quotation.svg',
                    'description' => __( 'Facilitate wholesale orders between merchants and customers with the option for quoted prices.', 'dokan-lite' ),
                    'url' => 'https://dokan.co/wordpress/modules/dokan-request-for-quotation-module/',
                    'tags' => [
                        'Product Management',
                    ],
                    'actions' => [
                        'docs' => 'https://dokan.co/docs/wordpress/modules/dokan-request-for-quotation-module/',
                        'video' => '',
                    ],
                ],
			],
		];
	}

	/**
	 * @inheritDoc
	 */
	public function scripts(): array {
        return [];
	}

    /**
     * Get the styles.
     *
     * @since 4.0.0
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array {
        return [];
    }

    /**
     * Register the page scripts and styles.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function register(): void {}
}
