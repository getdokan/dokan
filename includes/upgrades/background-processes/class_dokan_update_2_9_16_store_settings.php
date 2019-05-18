<?php

defined( 'ABSPATH' ) || exit;

/**
 * Dokan DOKAN_LITE_SINCE updater class
 *
 * @since DOKAN_LITE_SINCE
 */
class Dokan_Update_2_9_16_Store_Settings extends Abstract_Dokan_Background_Processes {

    /**
     * Action
     *
     * @since DOKAN_LITE_SINCE
     *
     * @var string
     */
    protected $action = 'dokan_update_2_9_16_store_settings';

    /**
     * Perform updates
     *
     * @since DOKAN_LITE_SINCE
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
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    private function update_store_settings( $paged ) {
        $limit = 10;
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
