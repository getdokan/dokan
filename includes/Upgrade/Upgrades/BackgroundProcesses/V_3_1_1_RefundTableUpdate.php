<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Dokan Product attribute author id updater class
 *
 * @since DOKAN_LITE_SINCE
 */
class V_3_1_1_RefundTableUpdate extends DokanBackgroundProcesses {

    /**
     * Perform updates
     *
     * @param mixed $item
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return mixed
     */
    public function task( $item ) {
        if ( empty( $item ) ) {
            return false;
        }

        if ( 'dokan_refund_table_updated_tax_and_item_total_id' === $item['updating'] ) {
            return $this->update_dokan_refund_table( $item['paged'] );
        }

        return false;
    }

    /**
     * Update dokan refund table fields item_totals
     * and item_tax_totals
     *
     * @param $paged
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array|boolean
     */
    private function update_dokan_refund_table( $paged ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'dokan_refund';

        if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) !== $table_name ) {
            return;
        }

        $columns = [ 'item_totals', 'item_tax_totals' ];

        foreach ( $columns as $column ) {
            $wpdb->query( "ALTER TABLE `{$wpdb->prefix}dokan_refund` MODIFY COLUMN `{$column}` TEXT" );
        }

        return [
            'updating' => 'dokan_refund_table_updated_tax_and_item_total_id',
            'paged'    => 0,
        ];
    }
}
