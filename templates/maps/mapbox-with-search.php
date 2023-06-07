<input id="dokan-map-lat" type="hidden" name="location" value="<?php echo esc_attr( $map_location ); ?>" size="30" />

<div class="dokan-map-wrap">
    <div class="dokan-map-search-bar">
        <input id="dokan-map-add" type="hidden" class="dokan-map-search" value="<?php echo esc_attr( $map_address ); ?>" name="find_address" placeholder="<?php esc_attr_e( 'Address', 'dokan-lite' ); ?>" size="30" />
        <a href="#" class="dokan-map-find-btn" id="dokan-location-find-btn" type="button"><?php esc_html_e( 'Find Address', 'dokan-lite' ); ?></a>
    </div>

    <div class="dokan-maps-container">
        <div id="dokan-geocoder" class="dokan-geocoder"></div>
        <div id="<?php echo esc_attr( $map_id ); ?>"></div>
    </div>
</div>

<script>
    jQuery(document).ready(function ($) {
        'use strict';

        var accessToken = '<?php echo esc_attr( $access_token ); ?>';
        var mapboxId    = '<?php echo esc_attr( $map_id ); ?>';
        var location    = <?php echo wp_json_encode( $location ); ?>

        mapboxgl.accessToken = accessToken;

        var dokanMapbox = new mapboxgl.Map( {
            container: mapboxId,
            style: 'mapbox://styles/mapbox/streets-v10',
            center: [ location.longitude, location.latitude ],
            zoom: location.zoom,
        } );

        var dokanGeocoder = null;
        var dokanMarker = null;

        function SearchButtonControl ( mapId ) {
            this._mapId = mapId;
        }

        SearchButtonControl.prototype.onAdd = function ( map ) {
            var self = this;

            this._map = map;

            var icon = document.createElement( 'span' );
            icon.className = 'dashicons dashicons-search';

            var label = document.createTextNode( 'Search Map' );

            var button = document.createElement( 'button' );
            button.type = 'button';
            // button.className = 'button';
            button.appendChild( icon );
            button.appendChild( label );
            button.addEventListener( 'click', function ( e ) {
                e.preventDefault();
                var control = document.getElementById( self._mapId ).getElementsByClassName( 'mapboxgl-ctrl-top-left' )[0];
                control.className = control.className + ' ' + 'show-geocoder';
            } );

            var container = document.createElement( 'div' );
            container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group dokan-mapboxgl-ctrl';
            container.appendChild( button );

            this._container = container;

            return this._container;
        };

        SearchButtonControl.prototype.onRemove = function () {
            this._container.parentNode.removeChild( this._container );
            this._map = undefined;
        };

        function onMarkerDragEnd () {
            var urlOrigin = dokanGeocoder.geocoderService.client.origin;
            var accessToken = dokanGeocoder.geocoderService.client.accessToken;
            var lng = dokanMarker.getLngLat().wrap().lng;
            var lat = dokanMarker.getLngLat().wrap().lat;

            dokanMapbox.setCenter( [ lng, lat ] );

            setLocation( {
                latitude: lat,
                longitude: lng,
            } );

            var url = urlOrigin + '/geocoding/v5/mapbox.places/' + lng + '%2C' + lat + '.json?access_token=' + accessToken + '&cachebuster=' + +new Date() + '&autocomplete=true';

            dokanGeocoder._inputEl.disabled = true;
            dokanGeocoder._loadingEl.style.display = 'block';

            jQuery.ajax( {
                url: url,
                method: 'get',
            } ).done( function ( response ) {
                if ( response.features ) {
                    dokanGeocoder._typeahead.update( response.features );
                    $( dokanMapbox._controlContainer ).find( '.mapboxgl-ctrl-top-left' ).addClass( 'show-geocoder' );
                }
            } ).always( function () {
                dokanGeocoder._inputEl.disabled = false;
                dokanGeocoder._loadingEl.style.display = '';
            } );
        }

        function setLocation( newLocation ) {
            location = Object.assign( location, newLocation );

            $('[name="location"]').val( location.latitude + ',' + location.longitude );
            $('[name="find_address"]').val( location.address );
        }

        dokanMapbox.addControl( new mapboxgl.NavigationControl() );

        dokanMapbox.on( 'load', function () {
            dokanGeocoder = new MapboxGeocoder( {
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl,
                zoom: dokanMapbox.getZoom(),
                placeholder: '<?php esc_html_e( 'Search Address', 'dokan-lite' ); ?>',
                marker: false,
                reverseGeocode: true,
            });

            document.getElementById('dokan-geocoder').appendChild(dokanGeocoder.onAdd(dokanMapbox));

            dokanGeocoder.setInput( location.address );

            dokanGeocoder.on( 'result', function ( resultData ) {
                var result = resultData.result;
                var lngLat = result.center;
                var address = result.place_name;

                dokanMarker.setLngLat( lngLat );
                dokanMapbox.setCenter( [ lngLat[0], lngLat[1] ] );

                setLocation( {
                    address: address,
                    latitude: lngLat[1],
                    longitude: lngLat[0],
                } );
            } );
        } );

        dokanMarker = new mapboxgl.Marker( {
            draggable: true
        } )
            .setLngLat( [ location.longitude, location.latitude ] )
            .addTo( dokanMapbox )
            .on( 'dragend', onMarkerDragEnd );

        $( '#dokan-map-add' ).on( 'input', function ( e ) {
            setLocation( {
                address: e.target.value
            } );
        } );
    });
</script>

<style>
    #<?php echo esc_js( $map_id ); ?> {
        width: 100%;
        height: 300px;
    }

    .dokan-geocoder {
        z-index: 1;
        width: 100%;
        left: 50%;
        margin-left: 0%;
        margin: 0px auto;
    }

    .mapboxgl-ctrl-geocoder {
        min-width: 100%;
    }

    .mapboxgl-ctrl-geocoder--input{
        padding-left: 30px !important;
    }

    .dokan-mapboxgl-ctrl.mapboxgl-ctrl-group > button {
        width: auto;
        padding: 1px 8px;
    }

    .mapboxgl-ctrl-top-left .mapboxgl-ctrl-geocoder {
        display: none;
    }

    .mapboxgl-ctrl-top-left.show-geocoder .mapboxgl-ctrl-geocoder {
        display: block;
    }

    .mapboxgl-ctrl-top-left.show-geocoder .dokan-mapboxgl-ctrl {
        display: none;
    }
</style>
