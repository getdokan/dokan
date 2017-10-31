<?php

/**
 * Vendor Manager Class
 *
 * @since 2.6.10
 */
class Dokan_Vendor_Manager {

    private $total_users;

    /**
     * Get all vendor
     *
     * @param array $args
     *
     * @return array
     */
    public function all( $args = array() ) {
        $vendors = array();

        $defaults = array(
            'role'       => 'seller',
            'number'     => 10,
            'offset'     => 0,
            'orderby'    => 'registered',
            'order'      => 'ASC',
            'meta_query' => array(
                array(
                    'key'     => 'dokan_enable_selling',
                    'value'   => 'yes',
                    'compare' => '='
                )
            )
        );

        $args = wp_parse_args( $args, $defaults );

        $user_query = new WP_User_Query( $args );
        $results    = $user_query->get_results();

        $this->total_users = $user_query->total_users;

        foreach ( $results as $key => $result ) {
            $vendors[] = $this->get( $result );
        }

        return $vendors;
    }

    /**
     * Get total user according to query
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_total() {
        return $this->total_users;
    }

    /**
     * Get single vendor data
     *
     * @param object|integer $vendor
     *
     * @return object|vednor instance
     */
    public function get( $vendor ) {
        return new Dokan_Vendor( $vendor );
    }

    /**
     * Get all featured Vendor
     *
     * @return object
     */
    public function get_featured( $args = array() ) {

        $defaults = array(
            'number'     => 10,
            'offset'     => 0,
            'meta_query' => array(
                array(
                    'key'     => 'dokan_enable_selling',
                    'value'   => 'yes',
                    'compare' => '='
                ),

                array(
                    'key'     => 'dokan_feature_seller',
                    'value'   => 'yes',
                    'compare' => '='
                ),
            )
        );

        $args = wp_parse_args( $args, $defaults );

        return $this->all( $args );
    }
}
