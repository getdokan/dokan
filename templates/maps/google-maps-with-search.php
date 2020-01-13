<input id="dokan-map-lat" type="hidden" name="location" value="<?php echo esc_attr( $map_location ); ?>" size="30" />

<div class="dokan-map-wrap">
    <div class="dokan-map-search-bar">
        <input id="dokan-map-add" type="text" class="dokan-map-search" value="<?php echo esc_attr( $map_address ); ?>" name="find_address" placeholder="<?php esc_attr_e( 'Type an address to find', 'dokan-lite' ); ?>" size="30" />
        <a href="#" class="dokan-map-find-btn" id="dokan-location-find-btn" type="button"><?php esc_html_e( 'Find Address', 'dokan-lite' ); ?></a>
    </div>

    <div class="dokan-google-map" id="dokan-map"></div>
</div>

<script>
    jQuery(document).ready(function ($) {
        'use strict';

        var location = <?php echo json_encode( $location ); ?>

        try {
            var curpoint = new google.maps.LatLng( location.latitude, location.longitude ),
                geocoder   = new window.google.maps.Geocoder(),
                $map_area = $('#dokan-map'),
                $input_area = $( '#dokan-map-lat' ),
                $input_add = $( '#dokan-map-add' ),
                $find_btn = $( '#dokan-location-find-btn' );

            $find_btn.on('click', function(e) {
                e.preventDefault();

                geocodeAddress( $input_add.val() );
            });

            var gmap = new google.maps.Map( $map_area[0], {
                center: curpoint,
                zoom: location.zoom,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP
            });

            var marker = new window.google.maps.Marker({
                position: curpoint,
                map: gmap,
                draggable: true
            });

            window.google.maps.event.addListener( gmap, 'click', function ( event ) {
                marker.setPosition( event.latLng );
                updatePositionInput( event.latLng );
            } );

            window.google.maps.event.addListener( marker, 'drag', function ( event ) {
                updatePositionInput(event.latLng );
            } );

        } catch( e ) {
            console.log( 'Google API not found.' );
        }

        autoCompleteAddress();

        function updatePositionInput( latLng ) {
            $input_area.val( latLng.lat() + ',' + latLng.lng() );
        }

        function updatePositionMarker() {
            var coord = $input_area.val(),
                pos, zoom;

            if ( coord ) {
                pos = coord.split( ',' );
                marker.setPosition( new window.google.maps.LatLng( pos[0], pos[1] ) );

                zoom = pos.length > 2 ? parseInt( pos[2], 10 ) : 12;

                gmap.setCenter( marker.position );
                gmap.setZoom( zoom );
            }
        }

        function geocodeAddress( address ) {
            geocoder.geocode( {'address': address}, function ( results, status ) {
                if ( status == window.google.maps.GeocoderStatus.OK ) {
                    updatePositionInput( results[0].geometry.location );
                    marker.setPosition( results[0].geometry.location );
                    gmap.setCenter( marker.position );
                    gmap.setZoom( 15 );
                }
            } );
        }

        function autoCompleteAddress(){
            if (!$input_add) return null;

            $input_add.autocomplete({
                source: function(request, response) {
                    // TODO: add 'region' option, to help bias geocoder.
                    geocoder.geocode( {'address': request.term }, function(results, status) {
                        response(jQuery.map(results, function(item) {
                            return {
                                label     : item.formatted_address,
                                value     : item.formatted_address,
                                latitude  : item.geometry.location.lat(),
                                longitude : item.geometry.location.lng()
                            };
                        }));
                    });
                },
                select: function(event, ui) {

                    $input_area.val(ui.item.latitude + ',' + ui.item.longitude );

                    var location = new window.google.maps.LatLng(ui.item.latitude, ui.item.longitude);

                    gmap.setCenter(location);
                    // Drop the Marker
                    setTimeout( function(){
                        marker.setValues({
                            position    : location,
                            animation   : window.google.maps.Animation.DROP
                        });
                    }, 1500);
                }
            });
        }
    });
</script>
