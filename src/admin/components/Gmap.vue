<template>
    <div v-if="loadMap" class="gmap-wrap regular-text">
        <input ref="searchAddress" class="search-address regular-text" type="text" :placeholder="__( 'Search Address', 'dokan') ">
        <div id="gmap" ref="gmapArea"></div>
    </div>
    <p v-else>
        {{ __( 'Please enter google map API key', 'dokan' ) }}
    </p>
</template>

<script>
export default {
    name: 'Gmap',

    props: {
        gmapKey: {
            type: [String, Function]
        },
        location: {
            type: Object,
            default() {
                return {
                    latitude: 23.709921,
                    longitude: 90.40714300000002,
                    address: 'dhaka',
                    zoom: 10
                }
            }
        }
    },

    data() {
        return {
            gmap: '',
            marker: '',
            loadMap: this.gmapKey.length > 1
        }
    },

    mounted() {
        this.renderMap();
    },

    methods: {
        setMap() {
            this.gmap = new google.maps.Map( this.getMapArea(), {
                center: this.getCenter(),
                zoom: this.location.zoom,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
        },

        setMarker() {
            this.marker = new google.maps.Marker( {
                position: this.getCenter(),
                map: this.gmap
            } );
        },

        GetGeocoder() {
            return new google.maps.Geocoder;
        },

        getSearchAddress() {
            if ( this.location.address ) {
                this.$refs['searchAddress'].value = this.location.address
            }

            return this.$refs['searchAddress'];
        },

        setAutoComplete() {
            let autocomplete = new google.maps.places.Autocomplete( this.getSearchAddress() );

            autocomplete.addListener( 'place_changed', () => {
                let place    = autocomplete.getPlace();
                let location = place.geometry.location;

                this.updateMap( location.lat(), location.lng(), place.formatted_address );
            } );
        },

        updateMap( latitude, longitude, formatted_address ) {
            let curpoint = new google.maps.LatLng( latitude, longitude )

            this.$emit( 'updateGmap', {
                latitude: curpoint.lat(),
                longitude: curpoint.lng(),
                address: formatted_address
            } );

            this.gmap.setCenter( curpoint );
            this.marker.setPosition( curpoint );

            if ( ! formatted_address ) {
                this.GetGeocoder.geocode( {
                    location: {
                        lat: latitude,
                        lng: longitude
                    }
                }, function ( results, status ) {
                    if ( 'OK' === status ) {
                        address.val( results[0].formatted_address );
                    }
                } )
            }
        },

        renderMap() {
            if ( ! this.loadMap ) {
                return;
            }

            this.setMap();
            this.setMarker();
            this.setAutoComplete();
        },

        getCenter() {
            return new google.maps.LatLng( this.location.latitude, this.location.longitude );
        },

        getMapArea() {
            return this.$refs['gmapArea'];
        }
    }
};
</script>

<style scoped>
    .gmap-wrap #gmap {
        width: 100%;
        height: 300px;
    }
    .search-address {
        padding: 5px;
    }
</style>
