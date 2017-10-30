<?php

/**
 * Vendor Manager Class
 *
 * @since 2.6.10
 */
class Dokan_Vendor_Manager {

    public function all( $args = array() ) {
        $defaults = array(

        );
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
    public function featured_vendors() {

    }
}
