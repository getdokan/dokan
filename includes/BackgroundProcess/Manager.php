<?php

namespace WeDevs\Dokan\BackgroundProcess;

defined( 'ABSPATH' ) || exit;

use Wedevs\Dokan\Traits\ChainableContainer;
use WeDevs\Dokan\Vendor\ChangeProductStatus as ChangeVendorProductStatus;

/**
 * Background Process Manager Class.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @property ChangeVendorProductStatus $change_vendor_product_status Instance of WeDevs\Dokan\Vendor\ChangeProductStatus class
 */
class Manager {

    use ChainableContainer;

    /**
     * Class constructor.
     */
    public function __construct() {
        $this->init_classes();
        $this->init_hooks();
    }

    /**
     * Initialize classes to chainable container.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_classes() {
        $this->container['rewrite_variable_products_author'] = new RewriteVariableProductsAuthor();
        $this->container['change_vendor_product_status']     = new ChangeVendorProductStatus();

        $this->container = apply_filters( 'dokan_background_process_container', $this->container );
    }

    /**
     * Initialize hooks.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_hooks() {
        add_filter( 'dokan_admin_notices', [ $this, 'show_variable_products_author_updated_notice' ], 10, 1 );
    }

    /**
     * Show variable products author updated notice.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param array $notices
     *
     * @return array $notices
     */
    public function show_variable_products_author_updated_notice( $notices ) {
        if ( empty( get_transient( 'dokan_variable_products_author_updated' ) ) ) {
            return $notices;
        }

        // Remove the cache for showing the notice only once.
        delete_transient( 'dokan_variable_products_author_updated' );

        $notices[] = [
            'type'        => 'success',
            'title'       => __( 'Dokan Variable Products Updated', 'dokan-lite' ),
            'description' => __( 'Dokan variable products author IDs regenerated successfully!', 'dokan-lite' ),
            'priority'    => 0,
        ];

        return $notices;
    }
}
