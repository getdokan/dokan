<?php

/**
 * Vendor Manager Class
 *
 * @since 2.6.10
 */
class Dokan_Vendor_Manager {

    /**
     * Total vendors found
     *
     * @var integer
     */
    private $total_users;

    /**
     * Get all vendors
     *
     * @since 2.8.0
     *
     * @param  array  $args
     *
     * @return array
     */
    public function all( $args = array() ) {
        return $this->get_vendors( $args );
    }

    /**
     * Get vendors
     *
     * @param array $args
     *
     * @return array
     */
    public function get_vendors( $args = array() ) {
        $vendors = array();

        $defaults = array(
            'role'       => 'seller',
            'number'     => 10,
            'offset'     => 0,
            'orderby'    => 'registered',
            'order'      => 'ASC',
            'status'     => 'approved',
            'featured'   => '', // yes or no
            'meta_query' => array(),
        );

        $args   = wp_parse_args( $args, $defaults );
        $status = $args['status'];

        // check if the user has permission to see pending vendors
        if ( 'approved' != $args['status'] && current_user_can( 'manage_options' ) ) {
            $status = $args['status'];
        }

        if ( in_array( $status, array( 'approved', 'pending' ) ) ) {
            $operator = ( $status == 'approved' ) ? '=' : '!=';

            $args['meta_query'][] = array(
                'key'     => 'dokan_enable_selling',
                'value'   => 'yes',
                'compare' => $operator
            );
        }

        // if featured
        if ( 'yes' == $args['featured'] ) {
            $args['meta_query'][] = array(
                'key'     => 'dokan_feature_seller',
                'value'   => 'yes',
                'compare' => '='
            );
        }

        unset( $args['status'] );
        unset( $args['featured'] );

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
            'number'   => 10,
            'offset'   => 0,
            'featured' => 'yes',
        );

        $args = wp_parse_args( $args, $defaults );

        return $this->get_vendors( $args );
    }
}
