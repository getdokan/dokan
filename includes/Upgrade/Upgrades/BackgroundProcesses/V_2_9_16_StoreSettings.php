<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Dokan 2.9.16 updater class
 *
 * @since 2.9.16
 */
class V_2_9_16_StoreSettings extends DokanBackgroundProcesses {

    /**
     * Perform updates
     *
     * @since 2.9.16
     *
     * @param mixed $item
     *
     * @return mixed
     */
    public function task( $item ) {
        if ( empty( $item ) ) {
            return false;
        }

        if ( 'store_settings' === $item['updating'] ) {
            return $this->update_store_settings( $item['paged'] );
        }

        return false;
    }

    /**
     * Update store settings
     *
     * @since 2.9.16
     *
     * @return void
     */
    private function update_store_settings( $paged ) {
        $limit = 50;
        $count = $limit * $paged;

        $query_args = [
            'status' => '',
            'number' => $limit,
            'offset' => $count
        ];

        $vendors = dokan()->vendor->all( $query_args );

        if ( ! $vendors ) {
            return;
        }

        foreach ( $vendors as $vendor ) {
            $old_banner_id = $vendor->get_info_part( 'banner' );
            $new_banner_id = $vendor->get_info_part( 'banner_id' );

            if ( $new_banner_id ) {
                $banner_id = $new_banner_id;
            } else {
                $banner_id = $old_banner_id;
            }

            if ( $banner_id ) {
                $vendor->set_banner_id( $banner_id );
            }

            $old_gravatar_id = $vendor->get_info_part( 'gravatar' );
            $new_gravatar_id = $vendor->get_info_part( 'gravatar_id' );

            if ( $new_gravatar_id ) {
                $gravatar_id = $new_gravatar_id;
            } else {
                $gravatar_id = $old_gravatar_id;
            }

            if ( $gravatar_id ) {
                $vendor->set_gravatar_id( $gravatar_id );
            }

            $vendor->save();
        }

        return array(
            'updating' => 'store_settings',
            'paged'    => ++$paged
        );
    }
}
