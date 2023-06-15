<?php

namespace WeDevs\Dokan\Vendor;

class Hooks {

    /**
     * Class constructor
     *
     * @since 3.3.2 Added Cache
     *
     * @return void
     */
    public function __construct() {
        // Init Vendor Cache Class
        new VendorCache();

        // init Vendor Settings Manager
        new SettingsApi\Manager();
        add_filter('pre_user_query', [ $this, 'wp_user_query_random_enable' ] );
    }

    /**
     * Support for orderby 'rand'
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param \WP_User_Query $query Query passed by reference.
     *
     * @return void
     */
    public function wp_user_query_random_enable( $query ) {
        if ( 'rand' === $query->query_vars['orderby'] ) {
            $query->query_orderby = 'ORDER by RAND()';
        }
    }
}
