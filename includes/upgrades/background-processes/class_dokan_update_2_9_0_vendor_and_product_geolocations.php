<?php

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Dokan_Background_Updater', false ) ) {
    include_once DOKAN_INC_DIR . '/upgrades/background-processes/class-dokan-background-updater.php';
}

/**
 * Update vendor and product geolocation data
 *
 * @since 2.8.6
 */
class dokan_update_2_8_6_vendor_and_product_geolocations extends Dokan_Background_Updater {

    /**
     * Action
     *
     * @since 2.8.6
     *
     * @var string
     */
    protected $action = 'dokan_update_2_8_6_vendor_and_product_geolocations';

    /**
     * Perform updates
     *
     * @since 2.8.6
     *
     * @param mixed $item
     *
     * @return mixed
     */
    public function task( $item ) {
        if ( empty( $item ) ) {
            return false;
        }

        if ( 'vendors' === $item['updating'] ) {
            return $this->update_vendors( $item['paged'] );
        } else if ( 'products' === $item['updating'] ) {
            return $this->update_products( $item['paged'] );
        }

        return false;
    }

    /**
     * Update vendors
     *
     * @since 2.8.6
     *
     * @param int $paged
     *
     * @return array
     */
    private function update_vendors( $paged ) {
        $args = array(
            'role'   => 'seller',
            'number' => 50,
            'paged'  => $paged,
        );

        $query = new WP_User_Query( $args );

        $vendors = $query->get_results();

        if ( empty( $vendors ) ) {
            return array(
                'updating' => 'products',
                'paged'    => 1,
            );
        }

        foreach ( $vendors as $vendor ) {
            $geo_latitude = get_user_meta( $vendor->ID, 'geo_latitude', true );

            if ( ! empty( $geo_latitude ) ) {
                continue;
            }

            $profile_settings = get_user_meta( $vendor->ID, 'dokan_profile_settings', true );

            if ( ! empty( $profile_settings['location'] && ! empty( $profile_settings['find_address'] ) ) ) {
                $location = explode( ',', $profile_settings['location'] );

                if ( 2 !== count( $location ) ) {
                    continue;
                }

                update_usermeta( $vendor->ID, 'geo_latitude', $location[0] );
                update_usermeta( $vendor->ID, 'geo_longitude', $location[1] );
                update_usermeta( $vendor->ID, 'geo_public', 1 );
                update_usermeta( $vendor->ID, 'geo_address', $profile_settings['find_address'] );
            }
        }

        return array(
            'updating' => 'vendors',
            'paged'    => ++$paged,
        );
    }

    /**
     * Update products
     *
     * @since 2.8.6
     *
     * @param int $paged
     *
     * @return array|bool
     */
    private function update_products( $paged ) {
        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => 50,
            'post_status'    => 'any',
            'paged'          => $paged,
        );

        $query = new WP_Query( $args );

        if ( empty( $query->posts ) ) {
            return false;

        } else {
            foreach ( $query->posts as $post ) {
                $geo_latitude = get_post_meta( $post->ID, 'geo_latitude', true );

                if ( empty( $geo_latitude ) ) {
                    $vendor_geo_latitude  = get_user_meta( $post->post_author, 'geo_latitude', true );
                    $vendor_geo_longitude = get_user_meta( $post->post_author, 'geo_longitude', true );
                    $vendor_geo_address   = get_user_meta( $post->post_author, 'geo_address', true );

                    if ( ! empty( $vendor_geo_latitude ) && ! empty( $vendor_geo_longitude ) ) {
                        update_post_meta( $post->ID, 'geo_latitude', $vendor_geo_latitude );
                        update_post_meta( $post->ID, 'geo_longitude', $vendor_geo_longitude );
                        update_post_meta( $post->ID, 'geo_public', 1 );
                        update_post_meta( $post->ID, 'geo_address', $vendor_geo_address );
                    }
                }
            }
        }

        return array(
            'updating' => 'products',
            'paged'    => ++$paged,
        );
    }
}
