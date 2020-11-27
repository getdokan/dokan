<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Dokan 2.9.4 updater class
 *
 * @since 2.9.4
 */
class V_2_9_4_OrderPostAuthor extends DokanBackgroundProcesses {

    /**
     * Perform updates
     *
     * @since 2.9.4
     *
     * @param mixed $item
     *
     * @return mixed
     */
    public function task( $item ) {
        if ( empty( $item ) ) {
            return false;
        }

        if ( 'shop_order_post_author' === $item['updating'] ) {
            return $this->update_shop_order_post_author( $item['paged'] );
        }

        return false;
    }

    /**
     * Update shop_order post author
     *
     * @since 2.9.4
     *
     * @return void
     */
    private function update_shop_order_post_author( $paged ) {
        global $wpdb;

        $limit  = 100;
        $count  = $limit * $paged;
        $orders = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT `id`, `post_author` FROM {$wpdb->posts} WHERE `post_type` = 'shop_order' LIMIT %d OFFSET %d",
                $limit, $count
            )
        );

        if ( empty( $orders ) ) {
            return;
        }

        foreach ( $orders as $key => $order ) {
            $customer_id = get_post_meta( $order->id, '_customer_user', true );

            if ( $order->post_author != $customer_id ) {
                wp_update_post(
                    array(
						'ID'          => $order->id,
						'post_type'   => 'shop_order',
						'post_author' => $customer_id,
                    )
                );
            }
        }

        return array(
            'updating' => 'shop_order_post_author',
            'paged'    => ++$paged,
        );
    }
}
