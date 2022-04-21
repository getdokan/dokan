<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class MyOrders extends DokanShortcode {

    protected $shortcode = 'dokan-my-orders';

    /**
     * Render my orders page
     *
     * @return string
     */
    public function render_shortcode( $atts ) {
        if ( ! is_user_logged_in() ) {
            return;
        }

        wp_enqueue_style( 'dokan-my-orders-style', DOKAN_PLUGIN_ASSEST . '/css/my-orders-styles.css', [], DOKAN_PLUGIN_VERSION );
        wp_enqueue_script( 'dokan-script' );
        wp_enqueue_style( 'dokan-select2-css' );
        wp_enqueue_script( 'dokan-select2-js' );
        wp_enqueue_style( 'dokan-date-range-picker' );
        wp_enqueue_script( 'dokan-date-range-picker' );

        $page       = empty( $_GET['pagenum'] ) ? 1 : (int) sanitize_text_field( wp_unslash( $_GET['pagenum'] ) );
        $limit      = 20;
        $start_date = empty( $_GET['start_date'] ) ? null : sanitize_text_field( wp_unslash( $_GET['start_date'] ) );
        $end_date   = empty( $_GET['end_date'] ) ? null : sanitize_text_field( wp_unslash( $_GET['end_date'] ) );
        $sort_order = empty( $_GET['sort_order'] ) ? 'DESC' : sanitize_text_field( wp_unslash( $_GET['sort_order'] ) );
        $vendor_id  = empty( $_GET['vendor'] ) ? '' : sanitize_text_field( wp_unslash( $_GET['vendor'] ) );

        $statuses = wc_get_order_statuses();
        $vendors  = dokan()->vendor->get_vendors( [ 'number' => -1 ] );

        $vendor_info = [];

        foreach ( $vendors as $vendor ) {
            $shop_info = dokan_get_store_info( $vendor->id );
            $vendor_info[ $vendor->id ] = [
                'store_name' => $shop_info['store_name'],
                'store_url'  => dokan_get_store_url( $vendor->id ),
            ];
        }

        list( $customer_orders, $total_pages ) = dokan_get_orders(
            [
                'start_date' => $start_date,
                'end_date'   => $end_date,
                'vendor_id'  => $vendor_id,
                'sort_order' => $sort_order,
                'limit'      => $limit,
                'page'       => $page,
            ]
        );

        $base_url   = dokan_get_page_url( 'my-order' );
        $page_links = paginate_links(
            [
                'current'   => $page,
                'total'     => $total_pages,
                'base'      => $base_url . '%_%',
                'format'    => '?pagenum=%#%',
                'add_args'  => false,
                'type'      => 'array',
            ]
        );

        ob_start();

        dokan_get_template_part(
            'my-orders',
            '',
            [
                'page'        => $page,
                'limit'       => $limit,
                'start_date'  => $start_date,
                'end_date'    => $end_date,
                'sort_order'  => $sort_order,
                'vendor_id'   => $vendor_id,
                'statuses'    => $statuses,
                'vendors'     => $vendor_info,
                'orders'      => $customer_orders,
                'total_pages' => $total_pages,
                'page_links'  => $page_links,
            ]
        );

        return ob_get_clean();
    }
}
