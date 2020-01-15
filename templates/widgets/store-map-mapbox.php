<script type="text/javascript">
    jQuery( document ).ready( function ( $ ) {
        var accessToken = '<?php echo $access_token; ?>';
        var location = <?php echo json_encode( $location ); ?>

        mapboxgl.accessToken = accessToken;

        var dokanMapbox = new mapboxgl.Map( {
            container: 'dokan-store-location',
            style: 'mapbox://styles/mapbox/streets-v10',
            center: [ location.longitude, location.latitude ],
            zoom: location.zoom,
        } );

        dokanMapbox.addControl( new mapboxgl.NavigationControl() );

        new mapboxgl.Marker()
            .setLngLat( [ location.longitude, location.latitude ] )
            .addTo( dokanMapbox );
    } );
</script>
