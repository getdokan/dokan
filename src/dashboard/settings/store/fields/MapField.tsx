import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';

type MapValue = {
    location: string;
    find_address: string;
};

// Legacy fallback center (same default the PHP templates use) when the vendor
// has no saved coordinates yet.
const DEFAULT_LAT = 23.709921;
const DEFAULT_LNG = 90.407143;

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
    if ( window.google?.maps ) {
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

const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dokan-btn focus:outline-none';

// `vendor_map` variant — search box + draggable pin writing the two legacy
// keys as one composite value: `location` ("lat,lng") and `find_address`.
// Renders Google or Mapbox per the admin `map_api_source`; provider/auth
// failures degrade to plain coordinate inputs so the value stays editable.
const MapField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
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
    // Keeps the latest composite value visible to map-event closures.
    const valueRef = useRef< MapValue >( value );
    valueRef.current = value;

    const commit = ( next: Partial< MapValue > ) => {
        updateValue( fieldKey, { ...valueRef.current, ...next } );
    };

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

                marker.addListener( 'dragend', () => {
                    const position = marker.getPosition();
                    commit( {
                        location: `${ position.lat() },${ position.lng() }`,
                    } );
                } );

                if ( searchInputRef.current ) {
                    const autocomplete =
                        new window.google.maps.places.Autocomplete(
                            searchInputRef.current
                        );
                    autocomplete.addListener( 'place_changed', () => {
                        const place = autocomplete.getPlace();
                        if ( ! place?.geometry?.location ) {
                            return;
                        }

                        const location = place.geometry.location;
                        map.setCenter( location );
                        marker.setPosition( location );
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

    // Mapbox has no Places widget — search through the geocoding REST API.
    const searchMapboxAddress = async ( query: string ) => {
        if ( ! query || 'mapbox' !== provider || ! apiKey ) {
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
                commit( {
                    location: `${ feature.center[ 1 ] },${ feature.center[ 0 ] }`,
                    find_address: feature.place_name || query,
                } );
            }
        } catch ( error ) {
            // Geocoding failure keeps the typed address; coordinates stay editable below.
        }
    };

    const showsCanvas = ! mapFailed && !! apiKey;

    return (
        <div className="dokan-vendor-map-field flex w-full flex-col gap-2 p-4">
            <input
                ref={ searchInputRef }
                type="text"
                className={ inputClass }
                placeholder={ __( 'Search your store address…', 'dokan-lite' ) }
                defaultValue={ value.find_address }
                onBlur={ ( event ) =>
                    commit( { find_address: event.target.value } )
                }
                onKeyDown={ ( event ) => {
                    if ( 'Enter' === event.key ) {
                        event.preventDefault();
                        searchMapboxAddress(
                            ( event.target as HTMLInputElement ).value
                        );
                    }
                } }
            />

            { showsCanvas && (
                <div
                    ref={ mapContainerRef }
                    className="h-72 w-full overflow-hidden rounded-md border border-gray-200"
                />
            ) }

            { ( mapFailed || ! apiKey ) && (
                <label
                    htmlFor={ `${ fieldKey }-location` }
                    className="flex flex-col gap-1 text-xs text-gray-600"
                >
                    { __( 'Coordinates (latitude,longitude)', 'dokan-lite' ) }
                    <input
                        id={ `${ fieldKey }-location` }
                        type="text"
                        className={ inputClass }
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
