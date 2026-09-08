import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export type MapProvider = 'google_maps' | 'mapbox';

export interface MapLocation {
    lat: number;
    lng: number;
    address: string;
}

export interface MapPickerProps {
    /** Current pin location. */
    value: MapLocation;
    /** Fired whenever the pin/address changes (drag, search, autocomplete). */
    onChange: ( next: MapLocation ) => void;
    /** Which map API to render. Defaults to Google Maps. */
    provider?: MapProvider;
    /** Google Maps API key or Mapbox access token, per `provider`. */
    apiKey: string;
    /** Initial zoom level. */
    zoom?: number;
    /** Map canvas height (CSS value). Defaults to 350px. */
    height?: string;
    /** Placeholder for the search box. */
    searchPlaceholder?: string;
}

// Legacy fallback center (Dhaka) — the same default the PHP templates use when
// there are no saved coordinates yet.
const DEFAULT_LAT = 23.709921;
const DEFAULT_LNG = 90.407143;

// Debounce for geocode-as-you-type; long enough to hold off until the user
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

const isFiniteNumber = ( n: unknown ): n is number =>
    typeof n === 'number' && Number.isFinite( n );

const centerOf = ( value: MapLocation ): { lat: number; lng: number } => {
    if ( isFiniteNumber( value.lat ) && isFiniteNumber( value.lng ) ) {
        return { lat: value.lat, lng: value.lng };
    }
    return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
};

// One shared loader per page — repeated mounts reuse the same script promise.
const loadGoogleMaps = ( apiKey: string ): Promise< void > => {
    const maps = window.google?.maps;

    // Another Dokan script often loads Maps first WITHOUT Places; add Places via
    // the modern loader (re-injecting the API <script> trips Google's "included
    // multiple times" break) — if it can't load, the map still renders and the
    // Geocoder covers search.
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

/**
 * Provider-agnostic map location picker.
 *
 * Presentational and storage-agnostic: it speaks a normalized
 * `{ lat, lng, address }` contract via `value`/`onChange`, self-loads the
 * Google Maps (with Places) or Mapbox script, and degrades to a plain
 * coordinate input when no key is present or the provider fails to authorize.
 *
 * Kept in `@dokan/components` so any bundle (Lite settings, Pro settings,
 * product editor) can wrap it with a thin storage adapter.
 * @param root0
 * @param root0.value
 * @param root0.onChange
 * @param root0.provider
 * @param root0.apiKey
 * @param root0.zoom
 * @param root0.height
 * @param root0.searchPlaceholder
 */
const MapPicker = ( {
    value,
    onChange,
    provider = 'google_maps',
    apiKey,
    zoom = 13,
    height = '350px',
    searchPlaceholder,
}: MapPickerProps ) => {
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
    // Keeps the latest value visible to map-event closures.
    const valueRef = useRef< MapLocation >( value );
    valueRef.current = value;

    const placeholder =
        searchPlaceholder || __( 'Search Address', 'dokan-lite' );

    const commit = ( next: Partial< MapLocation > ) => {
        onChange( { ...valueRef.current, ...next } );
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
                commit( { lat, lng, address: query } );
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
                    lat,
                    lng,
                    address: feature.place_name || query,
                } );
            }
        } catch ( error ) {
            // Geocoding failure keeps the typed address; coordinates stay
            // editable via the fallback input.
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
    // input back to the user once Google is done with it.
    useEffect( () => {
        if ( ! mapFailed ) {
            return;
        }

        const timer = setTimeout( () => {
            const input = searchInputRef.current;
            if ( input ) {
                input.disabled = false;
                input.value = valueRef.current.address || '';
                input.placeholder = placeholder;
                input.style.backgroundColor = '';
                // Google also paints its "!" error icon into the input.
                input.style.backgroundImage = '';
            }
        }, 100 );

        return () => clearTimeout( timer );
    }, [ mapFailed ] ); // eslint-disable-line react-hooks/exhaustive-deps

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

                const center = centerOf( valueRef.current );
                const map = new window.google.maps.Map(
                    mapContainerRef.current,
                    {
                        center,
                        zoom,
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
                    commit( { lat: position.lat(), lng: position.lng() } );
                } );

                // Places can still be absent (older loader without
                // importLibrary) — map + Geocoder search work without
                // Autocomplete, so skip instead of throwing.
                if ( searchInputRef.current && window.google.maps.places ) {
                    const autocomplete =
                        new window.google.maps.places.Autocomplete(
                            searchInputRef.current
                        );
                    autocomplete.addListener( 'place_changed', () => {
                        // A concrete pick wins over any pending typed geocode.
                        clearGeocodeTimer();
                        const place = autocomplete.getPlace();
                        if ( ! place?.geometry?.location ) {
                            return;
                        }

                        const location = place.geometry.location;
                        recenterRef.current?.( location.lat(), location.lng() );
                        commit( {
                            lat: location.lat(),
                            lng: location.lng(),
                            address:
                                place.formatted_address || place.name || '',
                        } );
                    } );
                }
            } )
            .catch( () => setMapFailed( true ) );

        return () => {
            cancelled = true;
        };
    }, [ provider, apiKey ] ); // eslint-disable-line react-hooks/exhaustive-deps

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

                const center = centerOf( valueRef.current );
                const map = new window.mapboxgl.Map( {
                    container: mapContainerRef.current,
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [ center.lng, center.lat ],
                    zoom,
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
                    commit( { lat: position.lat, lng: position.lng } );
                } );
            } )
            .catch( () => setMapFailed( true ) );

        return () => {
            cancelled = true;
        };
    }, [ provider, apiKey ] ); // eslint-disable-line react-hooks/exhaustive-deps

    const showsCanvas = ! mapFailed && !! apiKey;

    return (
        <div className="dokan-map-picker flex w-full flex-col gap-2">
            <input
                ref={ searchInputRef }
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder={ placeholder }
                defaultValue={ value.address }
                onChange={ handleSearchChange }
                onBlur={ ( event ) =>
                    commit( { address: event.target.value } )
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
                    className="mt-2 w-full overflow-hidden rounded-md border border-gray-200"
                    style={ { height } }
                />
            ) }

            { ! showsCanvas && (
                <label
                    htmlFor="dokan-map-picker-coordinates"
                    className="flex flex-col gap-1 text-xs text-gray-600"
                >
                    { __( 'Coordinates (latitude,longitude)', 'dokan-lite' ) }
                    <input
                        id="dokan-map-picker-coordinates"
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        placeholder="23.709921,90.407143"
                        defaultValue={
                            isFiniteNumber( value.lat ) &&
                            isFiniteNumber( value.lng )
                                ? `${ value.lat },${ value.lng }`
                                : ''
                        }
                        onChange={ ( event ) => {
                            const [ lat, lng ] = event.target.value
                                .split( ',' )
                                .map( ( part ) => parseFloat( part.trim() ) );
                            if (
                                isFiniteNumber( lat ) &&
                                isFiniteNumber( lng )
                            ) {
                                commit( { lat, lng } );
                            }
                        } }
                    />
                </label>
            ) }
        </div>
    );
};

export default MapPicker;
