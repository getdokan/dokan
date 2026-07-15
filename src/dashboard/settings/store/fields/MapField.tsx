import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSettings, Input, type SettingsElement } from '@wedevs/plugin-ui';
import { fieldKeyOf } from './shared';

type MapValue = {
    location: string;
    find_address: string;
};

// Legacy fallback center (same default the PHP templates use) when the vendor
// has no saved coordinates yet.
const DEFAULT_LAT = 23.709921;
const DEFAULT_LNG = 90.407143;

// Debounce for geocode-as-you-type; long enough to hold off until the vendor
// pauses, short enough that the map still feels live.
const GEOCODE_DEBOUNCE_MS = 700;
const MIN_QUERY_LENGTH = 3;

const MAPBOX_GL_JS = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
const MAPBOX_GL_CSS =
    'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';

declare global {
    interface Window {
        google?: any;
        mapboxgl?: any;
        gm_authFailure?: () => void;
        __dokanGoogleMapsLoader?: Promise< void >;
        __dokanMapboxLoader?: Promise< void >;
    }
}

const parseLocation = ( location: string ): { lat: number; lng: number } => {
    const [ lat, lng ] = ( location || '' ).split( ',' ).map( parseFloat );

    if ( Number.isFinite( lat ) && Number.isFinite( lng ) ) {
        return { lat, lng };
    }

    return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
};

// One shared loader per page — repeated mounts reuse the same script promise.
const loadGoogleMaps = ( apiKey: string ): Promise< void > => {
    const maps = window.google?.maps;

    // Another Dokan script often loads Maps first WITHOUT Places; add Places via the modern loader (re-injecting the API <script> trips Google's "included multiple times" break) — if it can't load, the map still renders and the Geocoder covers search.
    if ( maps ) {
        if ( maps.places ) {
            return Promise.resolve();
        }
        if ( maps.importLibrary ) {
            return Promise.resolve( maps.importLibrary( 'places' ) ).then(
                () => undefined
            );
        }
        return Promise.resolve();
    }

    if ( ! window.__dokanGoogleMapsLoader ) {
        window.__dokanGoogleMapsLoader = new Promise( ( resolve, reject ) => {
            const script = document.createElement( 'script' );
            script.src = `https://maps.googleapis.com/maps/api/js?key=${ encodeURIComponent(
                apiKey
            ) }&libraries=places`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () =>
                reject( new Error( 'Google Maps failed to load' ) );
            document.head.appendChild( script );
        } );
    }

    return window.__dokanGoogleMapsLoader;
};

const loadMapbox = (): Promise< void > => {
    if ( window.mapboxgl ) {
        return Promise.resolve();
    }

    if ( ! window.__dokanMapboxLoader ) {
        window.__dokanMapboxLoader = new Promise( ( resolve, reject ) => {
            const link = document.createElement( 'link' );
            link.rel = 'stylesheet';
            link.href = MAPBOX_GL_CSS;
            document.head.appendChild( link );

            const script = document.createElement( 'script' );
            script.src = MAPBOX_GL_JS;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () =>
                reject( new Error( 'Mapbox GL failed to load' ) );
            document.head.appendChild( script );
        } );
    }

    return window.__dokanMapboxLoader;
};

// `vendor_map` variant — the shared text Input drives a draggable pin: typing
// re-geocodes the map on the fly (debounced), Google Places suggestions and
// pin drags feed the same composite value — `location` ("lat,lng") and
// `find_address`. Renders Google or Mapbox per the admin `map_api_source`;
// provider/auth failures degrade to a plain coordinate input so the value stays
// editable.
const MapField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = fieldKeyOf( element );
    const value: MapValue = {
        location: '',
        find_address: '',
        ...( ( element.value as Partial< MapValue > ) || {} ),
    };
    const provider = ( element.provider as string ) || 'google_maps';
    const apiKey = ( element.api_key as string ) || '';
    const [ mapFailed, setMapFailed ] = useState< boolean >( false );

    const mapContainerRef = useRef< HTMLDivElement | null >( null );
    const searchInputRef = useRef< HTMLInputElement | null >( null );
    // Provider-agnostic "move the pin here" handle, set once the map is live so
    // geocode-as-you-type can drive it without re-reading provider internals.
    const recenterRef = useRef<
        ( ( lat: number, lng: number ) => void ) | null
    >( null );
    const debounceRef = useRef< ReturnType< typeof setTimeout > | null >(
        null
    );
    // Keeps the latest composite value visible to map-event closures.
    const valueRef = useRef< MapValue >( value );
    valueRef.current = value;

    const commit = ( next: Partial< MapValue > ) => {
        updateValue( fieldKey, { ...valueRef.current, ...next } );
    };

    // Google geocoder: turn typed text into a point, move the pin, keep the value.
    const geocodeGoogle = ( query: string ) => {
        if ( ! window.google?.maps || ! recenterRef.current ) {
            return;
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            { address: query },
            ( results: any[], status: string ) => {
                if ( 'OK' !== status || ! results?.[ 0 ]?.geometry?.location ) {
                    return;
                }
                const location = results[ 0 ].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                recenterRef.current?.( lat, lng );
                commit( {
                    location: `${ lat },${ lng }`,
                    find_address: query,
                } );
            }
        );
    };

    // Mapbox has no Places widget — geocode through the REST API, then recenter.
    const geocodeMapbox = async ( query: string ) => {
        if ( ! apiKey || ! recenterRef.current ) {
            return;
        }
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${ encodeURIComponent(
                    query
                ) }.json?access_token=${ encodeURIComponent( apiKey ) }&limit=1`
            );
            const data = await response.json();
            const feature = data?.features?.[ 0 ];

            if ( feature?.center ) {
                const [ lng, lat ] = feature.center;
                recenterRef.current?.( lat, lng );
                commit( {
                    location: `${ lat },${ lng }`,
                    find_address: feature.place_name || query,
                } );
            }
        } catch ( error ) {
            // Geocoding failure keeps the typed address; coordinates stay editable below.
        }
    };

    const runGeocode = ( query: string ) => {
        const trimmed = query.trim();
        if ( trimmed.length < MIN_QUERY_LENGTH ) {
            return;
        }
        if ( 'mapbox' === provider ) {
            geocodeMapbox( trimmed );
        } else {
            geocodeGoogle( trimmed );
        }
    };

    const clearGeocodeTimer = () => {
        if ( debounceRef.current ) {
            clearTimeout( debounceRef.current );
            debounceRef.current = null;
        }
    };

    const handleSearchChange = (
        event: React.ChangeEvent< HTMLInputElement >
    ) => {
        const query = event.target.value;
        clearGeocodeTimer();
        debounceRef.current = setTimeout(
            () => runGeocode( query ),
            GEOCODE_DEBOUNCE_MS
        );
    };

    // Drop any pending geocode on unmount.
    useEffect( () => clearGeocodeTimer, [] );

    // On auth failure Google disables the attached Autocomplete input and
    // stuffs an error string into it AFTER gm_authFailure fires — hand the
    // input back to the vendor once Google is done with it.
    useEffect( () => {
        if ( ! mapFailed ) {
            return;
        }

        const timer = setTimeout( () => {
            const input = searchInputRef.current;
            if ( input ) {
                input.disabled = false;
                input.value = valueRef.current.find_address || '';
                input.placeholder = __(
                    'Search your store address…',
                    'dokan-lite'
                );
                input.style.backgroundColor = '';
                // Google also paints its "!" error icon into the input.
                input.style.backgroundImage = '';
            }
        }, 100 );

        return () => clearTimeout( timer );
    }, [ mapFailed ] );

    // Google provider.
    useEffect( () => {
        if ( 'google_maps' !== provider || ! apiKey ) {
            return;
        }

        let cancelled = false;

        // Google reports invalid keys through this global instead of onerror.
        window.gm_authFailure = () => setMapFailed( true );

        loadGoogleMaps( apiKey )
            .then( () => {
                if (
                    cancelled ||
                    ! mapContainerRef.current ||
                    ! window.google?.maps
                ) {
                    return;
                }

                const center = parseLocation( valueRef.current.location );
                const map = new window.google.maps.Map(
                    mapContainerRef.current,
                    {
                        center,
                        zoom: 13,
                        mapTypeControl: false,
                        streetViewControl: false,
                    }
                );
                const marker = new window.google.maps.Marker( {
                    position: center,
                    map,
                    draggable: true,
                } );

                recenterRef.current = ( lat: number, lng: number ) => {
                    const position = new window.google.maps.LatLng( lat, lng );
                    map.setCenter( position );
                    marker.setPosition( position );
                };

                marker.addListener( 'dragend', () => {
                    const position = marker.getPosition();
                    commit( {
                        location: `${ position.lat() },${ position.lng() }`,
                    } );
                } );

                // Places can still be absent (older loader without importLibrary) — map + Geocoder search work without Autocomplete, so skip instead of throwing.
                if ( searchInputRef.current && window.google.maps.places ) {
                    const autocomplete =
                        new window.google.maps.places.Autocomplete(
                            searchInputRef.current
                        );
                    autocomplete.addListener( 'place_changed', () => {
                        // A concrete pick wins over any still-pending typed geocode.
                        clearGeocodeTimer();
                        const place = autocomplete.getPlace();
                        if ( ! place?.geometry?.location ) {
                            return;
                        }

                        const location = place.geometry.location;
                        recenterRef.current?.( location.lat(), location.lng() );
                        commit( {
                            location: `${ location.lat() },${ location.lng() }`,
                            find_address:
                                place.formatted_address || place.name || '',
                        } );
                    } );
                }
            } )
            .catch( () => setMapFailed( true ) );

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ provider, apiKey ] );

    // Mapbox provider.
    useEffect( () => {
        if ( 'mapbox' !== provider || ! apiKey ) {
            return;
        }

        let cancelled = false;

        loadMapbox()
            .then( () => {
                if (
                    cancelled ||
                    ! mapContainerRef.current ||
                    ! window.mapboxgl
                ) {
                    return;
                }

                window.mapboxgl.accessToken = apiKey;

                const center = parseLocation( valueRef.current.location );
                const map = new window.mapboxgl.Map( {
                    container: mapContainerRef.current,
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [ center.lng, center.lat ],
                    zoom: 12,
                } );
                const marker = new window.mapboxgl.Marker( {
                    draggable: true,
                } )
                    .setLngLat( [ center.lng, center.lat ] )
                    .addTo( map );

                recenterRef.current = ( lat: number, lng: number ) => {
                    map.setCenter( [ lng, lat ] );
                    marker.setLngLat( [ lng, lat ] );
                };

                map.on( 'error', () => setMapFailed( true ) );
                marker.on( 'dragend', () => {
                    const position = marker.getLngLat();
                    commit( {
                        location: `${ position.lat },${ position.lng }`,
                    } );
                } );
            } )
            .catch( () => setMapFailed( true ) );

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ provider, apiKey ] );

    const showsCanvas = ! mapFailed && !! apiKey;

    return (
        <div className="dokan-vendor-map-field flex w-full flex-col gap-2 p-4">
            { element.title && (
                <span className="text-sm font-semibold text-gray-900">
                    { String( element.title ) }
                </span>
            ) }
            <Input
                ref={ searchInputRef }
                type="text"
                placeholder={ __( 'Search your store address…', 'dokan-lite' ) }
                defaultValue={ value.find_address }
                onChange={ handleSearchChange }
                onBlur={ ( event ) =>
                    commit( { find_address: event.target.value } )
                }
                onKeyDown={ ( event ) => {
                    if ( 'Enter' === event.key ) {
                        event.preventDefault();
                        clearGeocodeTimer();
                        runGeocode(
                            ( event.target as HTMLInputElement ).value
                        );
                    }
                } }
            />

            { showsCanvas && (
                <div
                    ref={ mapContainerRef }
                    // mt-2 doubles the column gap so the canvas doesn't crowd the search box.
                    className="mt-2 h-72 w-full overflow-hidden rounded-md border border-gray-200"
                />
            ) }

            { ! showsCanvas && (
                <label
                    htmlFor={ `${ fieldKey }-location` }
                    className="flex flex-col gap-1 text-xs text-gray-600"
                >
                    { __( 'Coordinates (latitude,longitude)', 'dokan-lite' ) }
                    <Input
                        id={ `${ fieldKey }-location` }
                        type="text"
                        placeholder="23.709921,90.407143"
                        value={
                            ',' === value.location.trim() ? '' : value.location
                        }
                        onChange={ ( event ) =>
                            commit( { location: event.target.value } )
                        }
                    />
                </label>
            ) }
        </div>
    );
};

export default MapField;
