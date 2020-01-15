<?php

$source = dokan_get_option( 'map_api_source', 'dokan_appearance', 'google_maps' );

if ( 'mapbox' === $source ) {
    $access_token = dokan_get_option( 'mapbox_access_token', 'dokan_appearance', null );

    if ( ! $access_token ) {
        esc_html_e( 'Mapbox Access Token not found', 'dokan-lite' );
        return;
    }

    $map_id   = 'dokan-maps-' . rand();
    $location = explode( ',', $map_location );

    $map_address = ! empty( $map_address ) ? $map_address : 'Dhaka';

    dokan_get_template( 'maps/mapbox-with-search.php', array(
        'map_location' => $map_location,
        'map_address'  => $map_address,
        'access_token' => $access_token,
        'map_id'       => $map_id,
        'location'     => array(
            'address'   => $map_address,
            'longitude' => ! empty( $location[1] ) ? $location[1] : 90.40714300000002,
            'latitude'  => ! empty( $location[0] ) ? $location[0] : 23.709921,
            'zoom'      => 10,
        ),
    ) );
} else {
    $location = explode( ',', $map_location );
    $map_address = ! empty( $map_address ) ? $map_address : 'Dhaka';

    dokan_get_template( 'maps/google-maps-with-search.php', array(
        'map_location' => $map_location,
        'map_address'  => $map_address,
        'location'     => array(
            'address'   => $map_address,
            'longitude' => ! empty( $location[1] ) ? $location[1] : 90.40714300000002,
            'latitude'  => ! empty( $location[0] ) ? $location[0] : 23.709921,
            'zoom'      => 12,
        ),
    ) );
}
