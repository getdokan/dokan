<template>
    <p v-if="! accessToken">
        {{ __( 'Please enter Mapbox access token in `Appearance > Mapbox Access Token` settings.', 'dokan-lite' ) }}
    </p>
    <div v-else class="mapbox-wrapper">
        <div class="address-input">
            <label>
                {{ __( 'Address', 'dokan-lite' ) }}
                <input type="text" :value="address" @input="onChangeAddress">
            </label>
        </div>
        <div :id="mapboxId" :style="{ width: width, height: height }"></div>
    </div>
</template>

<script>
    class SearchButtonControl {
        constructor( mapId ) {
            this._mapId = mapId;
        }

        onAdd( map ) {
            this._map = map;

            const icon = document.createElement( 'span' );
            icon.className = 'dashicons dashicons-search';

            const label = document.createTextNode( 'Search Map' );

            const button = document.createElement( 'button' );
            button.type = 'button';
            button.className = 'button';
            button.appendChild( icon );
            button.appendChild( label );
            button.addEventListener( 'click', ( e ) => {
                e.preventDefault();
                const control = document.getElementById( this._mapId ).getElementsByClassName( 'mapboxgl-ctrl-top-left' )[0];
                control.className = control.className + ' ' + 'show-geocoder';
            } );

            const container = document.createElement( 'div' );
            container.className = 'mapboxgl-ctrl dokan-mapboxgl-ctrl';
            container.appendChild( button );

            this._container = container;

            return this._container;
        }

        onRemove() {
            this._container.parentNode.removeChild( this._container );
            this._map = undefined;
        }
    }

    export default {
        name: 'Mapbox',

        props: {
            accessToken: {
                type: String,
                default: null,
            },

            location: {
                type: Object,
                required: true,
            },

            width: {
                type: String,
                required: false,
                default: '100%',
            },

            height: {
                type: String,
                required: false,
                default: '300px',
            }
        },

        data() {
            return {
                dokanMapbox: null,
                dokanGeocoder: null,
                dokanMarker: null,
            };
        },

        computed: {
            mapboxId() {
                return `dokan-mapbox-${this._uid}`;
            },

            address() {
                return this.location.address;
            }
        },

        mounted() {
            if ( ! ( this.accessToken && window.mapboxgl && this.initializeMapbox() ) ) {
                this.$emit( 'hideMap', true );
            }

            window.mapboxgl = mapboxgl;
        },

        beforeDestroy() {
            if ( this.dokanMapbox ) {
                this.dokanMarker.remove();
                this.dokanMapbox.remove();
            }
        },

        methods: {
            initializeMapbox() {
                mapboxgl.accessToken = this.accessToken;

                this.dokanMapbox = new mapboxgl.Map( {
                    container: this.mapboxId,
                    style: 'mapbox://styles/mapbox/streets-v10',
                    center: [ this.location.longitude, this.location.latitude ],
                    zoom: this.location.zoom,
                } );

                this.dokanMapbox.addControl( new mapboxgl.NavigationControl() );
                this.dokanMapbox.addControl( new SearchButtonControl( this.mapboxId ), 'top-left' );

                this.dokanMapbox.on( 'zoomend', ( e ) => {
                    this.setLocation( {
                        zoom: e.target.getZoom(),
                    } );
                } );

                this.dokanMapbox.on( 'load', () => {
                    this.dokanGeocoder = new MapboxGeocoder( {
                        accessToken: mapboxgl.accessToken,
                        mapboxgl: mapboxgl,
                        zoom: this.dokanMapbox.getZoom(),
                        placeholder: this.__( 'Search Address', 'dokan-lite' ),
                        marker: false,
                        reverseGeocode: true,
                    });

                    this.dokanMapbox.addControl( this.dokanGeocoder, 'top-left' );
                    this.dokanGeocoder.setInput( this.location.address );

                    this.dokanGeocoder.on( 'result', ( { result } ) => {
                        const lngLat = result.center;
                        const address = result.place_name;

                        this.dokanMarker.setLngLat( lngLat );

                        this.dokanMapbox.setCenter( [ lngLat[0], lngLat[1] ] );

                        this.setLocation( {
                            address: result.place_name,
                            latitude: lngLat[1],
                            longitude: lngLat[0],
                            zoom: this.dokanMapbox.getZoom(),
                        } );
                    } );
                } );

                this.dokanMarker = new mapboxgl.Marker( {
                    draggable: true
                } )
                    .setLngLat( [ this.location.longitude, this.location.latitude ] )
                    .addTo( this.dokanMapbox )
                    .on( 'dragend', this.onMarkerDragEnd );

                return true;
            },

            onMarkerDragEnd() {
                const urlOrigin = this.dokanGeocoder.geocoderService.client.origin;
                const accessToken = this.dokanGeocoder.geocoderService.client.accessToken;
                const { lng, lat } = this.dokanMarker.getLngLat().wrap();

                this.dokanMapbox.setCenter( [ lng, lat ] );

                this.setLocation( {
                    latitude: lat,
                    longitude: lng,
                } );

                let url = `${urlOrigin}/geocoding/v5/mapbox.places/${lng}%2C${lat}.json?access_token=${accessToken}&cachebuster=${(+new Date())}&autocomplete=true`;

                this.dokanGeocoder._inputEl.disabled = true;
                this.dokanGeocoder._loadingEl.style.display = 'block';

                jQuery.ajax( {
                    url: url,
                    method: 'get',
                } ).done( ( response ) => {
                    this.dokanGeocoder._typeahead.update(response.features);
                } ).fail( () => {
                    //
                } ).always( () => {
                    this.dokanGeocoder._inputEl.disabled = false;
                    this.dokanGeocoder._loadingEl.style.display = '';
                } );
            },

            setLocation( location ) {
                this.$emit( 'updateMap', location );
            },

            onChangeAddress( e ) {
                this.setLocation( {
                    address: e.target.value,
                } );
            }
        }
    };
</script>

<style lang="less">
    .mapbox-wrapper {

        .mapboxgl-ctrl-geocoder--input {
            padding: 6px 35px;
            line-height: 1;
        }

        .mapboxgl-ctrl-top-left {

            .mapboxgl-ctrl-geocoder {
                display: none;
            }

            &.show-geocoder {

                .mapboxgl-ctrl-geocoder {
                    display: block;
                }

                .dokan-mapboxgl-ctrl {
                    display: none;
                }
            }
        }

        .address-input {
            margin-top: 5px;

            label {
                font-weight: 600;
            }

            input {
                width: 100%;
                margin: 1px 0 3px;
                font-weight: 400;
            }
        }
    }
</style>
