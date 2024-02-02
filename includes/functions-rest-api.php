<?php
if ( ! function_exists( 'dokan_rest_validate_store_id' ) ) {
    /**
     * This method will verify store id, will be used only with rest api validate callback
     *
     * @since 3.8.0
     *
     * @param $value
     * @param $request WP_REST_Request
     * @param $key
     *
     * @return bool|WP_Error
     */
    function dokan_rest_validate_store_id( $value, $request, $key ) {
        $attributes = $request->get_attributes();

        if ( isset( $attributes['args'][ $key ] ) ) {
            $argument = $attributes['args'][ $key ];
            // Check to make sure our argument is an int.
            if ( 'integer' === $argument['type'] && ! is_numeric( $value ) ) {
                // translators: 1) argument name, 2) argument value
                return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%1$s is not of type %2$s', 'dokan-lite' ), $key, 'integer' ), [ 'status' => 400 ] );
            }
        } else {
            // this code won't execute because we have specified this argument as required.
            // if we reused this validation callback and did not have required args then this would fire.
            // translators: 1) argument name
            return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%s was not registered as a request argument.', 'dokan-lite' ), $key ), [ 'status' => 400 ] );
        }

        $vendor = dokan()->vendor->get( intval( $value ) );
        if ( $vendor->get_id() && $vendor->is_vendor() ) {
            return true;
        }

        // translators: 1) rest api endpoint key name
        return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( 'No store found with given store id', 'dokan-lite' ), $key ), [ 'status' => 400 ] );
    }
}

if ( ! function_exists( 'dokan_rest_validate_order_id' ) ) {
    /**
     * This method will verify an order id, will be used only with rest api validate callback
     *
     * @since 3.9.7
     *
     * @param $value
     * @param $request WP_REST_Request
     * @param $key
     *
     * @return bool|WP_Error
     */
    function dokan_rest_validate_order_id( $value, $request, $key ) {
        $attributes = $request->get_attributes();

        if ( isset( $attributes['args'][ $key ] ) ) {
            $argument = $attributes['args'][ $key ];
            // Check to make sure our argument is an int.
            if ( 'integer' === $argument['type'] && ! is_numeric( $value ) ) {
                // translators: 1) argument name, 2) argument value
                return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%1$s is not of type %2$s', 'dokan-lite' ), $key, 'integer' ), [ 'status' => 400 ] );
            }
        } else {
            // this code won't execute because we have specified this argument as required.
            // if we reused this validation callback and did not have required args then this would fire.
            // translators: 1) argument name
            return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%s was not registered as a request argument.', 'dokan-lite' ), $key ), [ 'status' => 400 ] );
        }

        $order = wc_get_order( (int) $value );
        if ( $order ) {
            return true;
        }

        // translators: 1) rest api endpoint key name
        return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( 'No store found with given store id', 'dokan-lite' ), $key ), [ 'status' => 400 ] );
    }
}
