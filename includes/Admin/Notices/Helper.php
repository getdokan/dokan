<?php

namespace WeDevs\Dokan\Admin\Notices;

use WeDevs\Dokan\Cache;

/**
 * Dokan Admin notices helper methods
 *
 * @sience 3.3.3
 */
class Helper {

    /**
     * This method will display notices only under Dokan menu and all of its sub-menu pages
     *
     * @since 3.3.3
     *
     * @return array | void
     */
    public static function dokan_get_admin_notices() {
        $notices = apply_filters( 'dokan_admin_notices', [] );

        if ( empty( $notices ) ) {
            return $notices;
        }

        uasort( $notices, [ self::class, 'dokan_sort_notices_by_priority' ] );

        return array_values( $notices );
    }

    /**
     * This method will display notices under all pages including Dokan menu and sub-menu pages
     *
     * @since 3.3.3
     *
     * @return array
     */
    public static function dokan_get_global_admin_notices() {
        $notices = apply_filters( 'dokan_global_admin_notices', [] );

        if ( empty( $notices ) ) {
            return $notices;
        }

        uasort( $notices, [ self::class, 'dokan_sort_notices_by_priority' ] );

        return array_values( $notices );
    }

    /**
     * Dokan promotional notices
     *
     * @since 3.3.3
     *
     * @return array
     */
    public static function dokan_get_promo_notices() {
        $promos = Cache::get_transient( 'promo_notices' );

        if ( false === $promos ) {
            $promo_notice_url = 'https://raw.githubusercontent.com/weDevsOfficial/dokan-util/master/promotions.json';
            $response         = wp_remote_get( $promo_notice_url, array( 'timeout' => 15 ) );
            $promos           = wp_remote_retrieve_body( $response );

            if ( is_wp_error( $response ) || $response['response']['code'] !== 200 ) {
                $promos = '[]';
            }

            Cache::set_transient( 'dokan_promo_notices', $promos, DAY_IN_SECONDS );
        }

        $promos  = json_decode( $promos, true );
        $notices = [];
        // check if api data is valid
        if ( empty( $promos ) || ! is_array( $promos ) ) {
            return $notices;
        }

        $est_timestamp           = dokan_current_datetime()->setTimezone( new \DateTimeZone( 'EST' ) )->getTimestamp();
        $already_displayed_promo = get_option( '_dokan_limited_time_promo', [] );

        foreach ( $promos as $promo ) {
            if ( in_array( $promo['key'], $already_displayed_promo, true ) ) {
                continue;
            }

            if ( $est_timestamp < strtotime( $promo['start_date'] ) || $est_timestamp > strtotime( $promo['end_date'] ) ) {
                continue;
            }

            $notices[] = [
                'type'              => 'promotion',
                'title'             => $promo['title'],
                'description'       => $promo['content'],
                'priority'          => 10,
                'show_close_button' => true,
                'ajax_data'         => [
                    'dokan_limited_time_promotion_dismissed' => true,
                    'action'                                 => 'dokan_dismiss_limited_time_promotional_notice',
                    'nonce'                                  => wp_create_nonce( 'dokan_admin' ),
                    'key'                                    => $promo['key'],
                ],
                'actions'           => [
                    [
                        'type'   => 'primary',
                        'text'   => $promo['action_title'],
                        'action' => $promo['action_url'],
                        'target' => '_blank',
                    ],
                ],
            ];
        }

        if ( empty( $notices ) ) {
            return $notices;
        }

        uasort( $notices, [ self::class, 'dokan_sort_notices_by_priority' ] );

        return array_values( $notices );
    }

    /**
     * Sort all notices depends on priority key
     *
     * @param array $current_notice
     * @param array $next_notice
     *
     * @since 3.3.3
     *
     * @return integer
     */
    private static function dokan_sort_notices_by_priority( $current_notice, $next_notice ) {
        if ( isset( $current_notice['priority'] ) && isset( $next_notice['priority'] ) ) {
            return $current_notice['priority'] - $next_notice['priority'];
        }

        return -1;
    }
}
