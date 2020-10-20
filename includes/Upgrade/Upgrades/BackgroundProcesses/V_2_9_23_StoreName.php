<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Dokan store name updater class
 *
 * @since 2.9.23
 */
class V_2_9_23_StoreName extends DokanBackgroundProcesses {

    /**
     * Perform updates
     *
     * @since 2.9.23
     *
     * @param mixed $item
     *
     * @return mixed
     */
    public function task( $item ) {
        if ( empty( $item ) ) {
            return false;
        }

        if ( 'store_name' === $item['updating'] ) {
            return $this->update_store_name( $item['paged'] );
        }

        return false;
    }

    /**
     * Update store settings
     *
     * @since 2.9.23
     *
     * @return void
     */
    private function update_store_name( $paged ) {
        $limit = 50;
        $count = $limit * $paged;

        $query_args = [
            'status' => '',
            'number' => $limit,
            'offset' => $count,
        ];

        $vendors = dokan()->vendor->all( $query_args );

        if ( ! $vendors ) {
            return;
        }

        foreach ( $vendors as $vendor ) {
            if ( $vendor->get_meta( 'dokan_store_name' ) ) {
                continue;
            }

            $vendor->update_meta( 'dokan_store_name', $vendor->get_shop_name() );
        }

        return array(
            'updating' => 'store_name',
            'paged'    => ++$paged,
        );
    }
}
