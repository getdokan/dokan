<?php
namespace WeDevs\Dokan\Utilities;

class MapUtil {

    /**
     * Parses a stored map location string into usable coordinates.
     *
     * A location is only meaningful when it holds both a latitude and a longitude.
     * Values such as an empty string or a bare `,` separator mean "no location",
     * so callers can fall back to their own default instead of a hardcoded one.
     *
     * @since DOKAN_SINCE
     *
     * @param string $map_location Comma separated latitude, longitude pair.
     *
     * @return array|false Trimmed `latitude` and `longitude`, or false when unusable.
     */
    public static function parse_location( $map_location ) {
        if ( ! is_string( $map_location ) || '' === trim( $map_location ) ) {
            return false;
        }

        $coordinates = array_map( 'trim', explode( ',', $map_location ) );

        if ( count( $coordinates ) < 2 || ! is_numeric( $coordinates[0] ) || ! is_numeric( $coordinates[1] ) ) {
            return false;
        }

        return [
            'latitude'  => $coordinates[0],
            'longitude' => $coordinates[1],
        ];
    }
}
