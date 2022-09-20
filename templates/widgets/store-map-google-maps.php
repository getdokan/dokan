<script type="text/javascript">
    jQuery( document ).ready( function ( $ ) {
        try {
            var location = <?php echo wp_json_encode( $location ); ?>;

            var curpoint = new google.maps.LatLng( location.latitude, location.longitude ),
                $map_area = $( '#dokan-store-location' );

            var gmap = new google.maps.Map( $map_area[0], {
                center: curpoint,
                zoom: location.zoom,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            });

            new window.google.maps.Marker({
                position: curpoint,
                map: gmap
            });
        } catch( error ) {
            console.log( error );
        }
    } );
</script>
