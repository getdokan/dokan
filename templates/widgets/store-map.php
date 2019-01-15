<?php
/**
 * Dokan Seller Widget Map Content
 *
 * @since 2.4
 *
 * @package dokan
 */
?>

<div class="location-container">

    <?php if ( ! empty( $map_location ) ) { ?>
        <div id="dokan-store-location"></div>

        <script type="text/javascript">
            jQuery(function($) {
                <?php
                $locations = explode( ',', $map_location );
                $def_lat   = isset( $locations[0] ) ? $locations[0] : 23.709921;
                $def_long  = isset( $locations[1] ) ? $locations[1] : 90.40714300000002;
                ?>

                var def_longval = <?php echo esc_attr( $def_long ); ?>;
                var def_latval = <?php echo esc_attr( $def_lat ); ?>;

                var curpoint = new google.maps.LatLng(def_latval, def_longval),
                    $map_area = $('#dokan-store-location');

                var gmap = new google.maps.Map( $map_area[0], {
                    center: curpoint,
                    zoom: 15,
                    mapTypeId: window.google.maps.MapTypeId.ROADMAP
                });

                var marker = new window.google.maps.Marker({
                    position: curpoint,
                    map: gmap
                });
            })

        </script>
    <?php } ?>

</div>
