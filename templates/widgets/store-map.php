<?php
/**
 * Dokan Seller Widget Map Content
 *
 * @since   2.4
 *
 * @package dokan
 */

if ( empty( $map_location ) ) {
    return;
}

?>
    <div class="location-container">
        <div id="dokan-store-location"></div>
    </div>
<?php

$source = dokan_get_option( 'map_api_source', 'dokan_appearance', 'google_maps' );

$location  = explode( ',', $map_location );
$longitude = ! empty( $location[1] ) ? $location[1] : 90.40714300000002;
$latitude  = ! empty( $location[0] ) ? $location[0] : 23.709921;

if ( 'mapbox' === $source ) {
    $access_token = dokan_get_option( 'mapbox_access_token', 'dokan_appearance', null );

    if ( ! $access_token ) {
        esc_html_e( 'Mapbox Access Token not found', 'dokan-lite' );

        return;
    }

    dokan_get_template_part(
        'widgets/store-map-mapbox', '', [
            'map_location' => $map_location,
            'access_token' => $access_token,
            'location'     => [
                'longitude' => $longitude,
                'latitude'  => $latitude,
                'zoom'      => 10,
            ],
        ]
    );
} else {
    dokan_get_template_part(
        'widgets/store-map-google-maps', '', [
            'map_location' => $map_location,
            'location'     => [
                'longitude' => $longitude,
                'latitude'  => $latitude,
                'zoom'      => 15,
            ],
        ]
    );
}
