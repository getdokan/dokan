<?php

use WeDevs\Dokan\Utilities\MapUtil;

$source = dokan_get_option( 'map_api_source', 'dokan_appearance', 'google_maps' );

if ( 'mapbox' === $source ) {
    $access_token = dokan_get_option( 'mapbox_access_token', 'dokan_appearance', null );

    if ( ! $access_token ) {
        esc_html_e( 'Mapbox Access Token not found', 'dokan-lite' );
        return;
    }

    $map_id   = 'dokan-maps-' . wp_rand();
    $location = MapUtil::parse_location( $map_location );

    // Discard a stored location that holds no usable coordinates, so it is not echoed back and saved again.
    if ( empty( $location ) ) {
        $map_location = '';
    }

    $map_address = ! empty( $map_address ) ? $map_address : 'Dhaka';

    if ( empty( $map_location ) && function_exists( 'dokan_geo_get_default_location' ) && ! empty( dokan_geo_get_default_location() ) ) {
        $default_location = dokan_geo_get_default_location();

        $map_address  = ! empty( $default_location['address'] ) ? $default_location['address'] : 'Dhaka';
        $longitude    = ! empty( $default_location['longitude'] ) ? $default_location['longitude'] : 90.40714300000002;
        $latitude     = ! empty( $default_location['latitude'] ) ? $default_location['latitude'] : 23.709921;
        $map_location = $latitude . ',' . $longitude;
    } else {
        $longitude   = $location ? $location['longitude'] : 90.40714300000002;
        $latitude    = $location ? $location['latitude'] : 23.709921;
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
    $location    = MapUtil::parse_location( $map_location );
    $map_address = ! empty( $map_address ) ? $map_address : 'Dhaka';

    // Discard a stored location that holds no usable coordinates, so it is not echoed back and saved again.
    if ( empty( $location ) ) {
        $map_location = '';
    }

    if ( empty( $map_location ) && function_exists( 'dokan_geo_get_default_location' ) && ! empty( dokan_geo_get_default_location() ) ) {
        $default_location = dokan_geo_get_default_location();

        $map_address  = ! empty( $default_location['address'] ) ? $default_location['address'] : 'Dhaka';
        $longitude    = ! empty( $default_location['longitude'] ) ? $default_location['longitude'] : 90.40714300000002;
        $latitude     = ! empty( $default_location['latitude'] ) ? $default_location['latitude'] : 23.709921;
        $map_location = $latitude . ',' . $longitude;
    } else {
        $longitude   = $location ? $location['longitude'] : 90.40714300000002;
        $latitude    = $location ? $location['latitude'] : 23.709921;
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
