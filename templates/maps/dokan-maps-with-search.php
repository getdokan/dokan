<?php

$source = dokan_get_option( 'map_api_source', 'dokan_appearance', 'google_maps' );

if ( 'mapbox' === $source ) {
    $access_token = dokan_get_option( 'mapbox_access_token', 'dokan_appearance', null );

    if ( ! $access_token ) {
        esc_html_e( 'Mapbox Access Token not found', 'dokan-lite' );
        return;
    }

    $map_id   = 'dokan-maps-' . wp_rand();
    $location = explode( ',', $map_location );

    $map_address = ! empty( $map_address ) ? $map_address : 'Dhaka';

    if ( empty( $map_location ) && function_exists( 'dokan_geo_get_default_location' ) && ! empty( dokan_geo_get_default_location() ) ) {
        $default_location = dokan_geo_get_default_location();

        $map_address  = ! empty( $default_location['address'] ) ? $default_location['address'] : 'Dhaka';
        $longitude    = ! empty( $default_location['longitude'] ) ? $default_location['longitude'] : 90.40714300000002;
        $latitude     = ! empty( $default_location['latitude'] ) ? $default_location['latitude'] : 23.709921;
        $map_location = $latitude . ',' . $longitude;
    } else {
        $longitude   = ! empty( $location[1] ) ? $location[1] : 90.40714300000002;
        $latitude    = ! empty( $location[0] ) ? $location[0] : 23.709921;
    }

    dokan_get_template(
        'maps/mapbox-with-search.php', array(
            'map_location' => $map_location,
            'map_address'  => $map_address,
            'access_token' => $access_token,
            'map_id'       => $map_id,
            'location'     => array(
                'address'   => $map_address,
                'longitude' => $longitude,
                'latitude'  => $latitude,
                'zoom'      => 12,
            ),
        )
    );
} else {
    $location    = explode( ',', $map_location );
    $map_address = ! empty( $map_address ) ? $map_address : 'Dhaka';

    if ( empty( $map_location ) && function_exists( 'dokan_geo_get_default_location' ) && ! empty( dokan_geo_get_default_location() ) ) {
        $default_location = dokan_geo_get_default_location();

        $map_address  = ! empty( $default_location['address'] ) ? $default_location['address'] : 'Dhaka';
        $longitude    = ! empty( $default_location['longitude'] ) ? $default_location['longitude'] : 90.40714300000002;
        $latitude     = ! empty( $default_location['latitude'] ) ? $default_location['latitude'] : 23.709921;
        $map_location = $latitude . ',' . $longitude;
    } else {
        $longitude   = ! empty( $location[1] ) ? $location[1] : 90.40714300000002;
        $latitude    = ! empty( $location[0] ) ? $location[0] : 23.709921;
    }

    dokan_get_template(
        'maps/google-maps-with-search.php', array(
            'map_location' => $map_location,
            'map_address'  => $map_address,
            'location'     => array(
                'address'   => $map_address,
                'longitude' => $longitude,
                'latitude'  => $latitude,
                'zoom'      => 12,
            ),
        )
    );
}
