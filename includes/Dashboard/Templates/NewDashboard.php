<?php

namespace WeDevs\Dokan\Dashboard\Templates;

use Automattic\WooCommerce\Internal\Admin\WCAdminAssets;

class NewDashboard {

	/**
	 * Class constructor
	 *
	 * @since DOKAN_SINCE
	 */
    public function __construct() {
        add_filter(
            'dokan_query_var_filter',
            [ $this, 'add_query_var' ]
        );

        add_action(
            'dokan_load_custom_template',
            [ $this, 'new_dashboard_content' ]
        );

        add_action(
            'wp_enqueue_scripts',
            [ $this, 'enqueue_scripts' ]
        );
    }

	/**
	 * Add query var for new dashboard.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param array $query_vars
	 *
	 * @return array
	 */
    public function add_query_var( $query_vars ) {
        $query_vars['new'] = 'new';
        return $query_vars;
    }


	/**
	 * Load new dashboard content.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param array $query_vars
	 *
	 * @return void
	 */
    public function new_dashboard_content( $query_vars ) {
        if ( isset( $query_vars['new'] ) ) {
            if ( ! current_user_can( 'dokan_view_overview_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'dashboard/new-dashboard' );
            }
        }
    }

	/**
	 * Enqueue scripts for new dashboard.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @return void
	 */
    public function enqueue_scripts() {
        global $wp;
        if ( ! dokan_is_seller_dashboard() || ! isset( $wp->query_vars['new'] ) ) {
            return;
        }

	    $wc_instance = WCAdminAssets::get_instance();
	    $wc_instance->register_scripts();

        wp_enqueue_script( 'dokan-react-frontend' );
        wp_enqueue_style( 'dokan-react-frontend' );
		wp_localize_script( 'dokan-react-frontend', 'dokanCurrency', dokan_get_container()->get( 'scripts' )->get_localized_price() );
    }
}
