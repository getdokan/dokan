<?php

namespace WeDevs\Dokan\Frontend\MyAccount;

/**
 * Dokan Become Vendor Class
 *
 * @since DOKAN_LITE_SINCE
 *
 * @package dokan
 */
class BecomeVendor {
    /**
     * Class Constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        $this->init_hooks();
    }

    /**
     * Init Hooks Method.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_hooks() {
        add_action( 'woocommerce_after_my_account', [ $this, 'render_become_a_vendor_section' ] );
        add_action( 'woocommerce_account_account-migration_endpoint', [ $this, 'load_customer_to_vendor_update_template' ] );
    }

    /**
     * Render Become A Vendor Section.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function render_become_a_vendor_section() {
        dokan_get_template_part( 'account/become-a-vendor-section', '' );
    }

    /**
     * Load Customer to Vendor Update Form Template.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function load_customer_to_vendor_update_template() {
        dokan_get_template_part( 'account/update-customer-to-vendor', '' );
    }
}
