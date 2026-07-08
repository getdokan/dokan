import { useEffect, useRef } from '@wordpress/element';
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

declare global {
    interface Window {
        google?: any;
        __dokanGoogleMapsLoader?: Promise< void >;
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

const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dokan-btn focus:outline-none';

// `vendor_map` variant — search box + draggable pin writing the two legacy
// keys as one composite value: `location` ("lat,lng") and `find_address`.
// Google Maps renders inline; the Mapbox provider currently falls back to
// plain address/coordinate inputs (both providers persist identically).
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

    const mapContainerRef = useRef< HTMLDivElement | null >( null );
    const searchInputRef = useRef< HTMLInputElement | null >( null );
    const markerRef = useRef< any >( null );
    // Keeps the latest composite value visible to map-event closures.
    const valueRef = useRef< MapValue >( value );
    valueRef.current = value;

    const commit = ( next: Partial< MapValue > ) => {
        updateValue( fieldKey, { ...valueRef.current, ...next } );
    };

    useEffect( () => {
        if ( 'google_maps' !== provider || ! apiKey ) {
            return;
        }

        let cancelled = false;

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
                markerRef.current = marker;

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
            .catch( () => {
                // Loader failure leaves the plain inputs below fully functional.
            } );

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ provider, apiKey ] );

    const showsCanvas = 'google_maps' === provider && !! apiKey;

    return (
        <div className="dokan-vendor-map-field flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-900">
                { element.title }
            </span>

            <input
                ref={ searchInputRef }
                type="text"
                className={ inputClass }
                placeholder={ __( 'Search your store address…', 'dokan-lite' ) }
                defaultValue={ value.find_address }
                onBlur={ ( event ) =>
                    commit( { find_address: event.target.value } )
                }
            />

            { showsCanvas ? (
                <div
                    ref={ mapContainerRef }
                    className="h-72 w-full overflow-hidden rounded-md border border-gray-200"
                />
            ) : (
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
                        value={ value.location }
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
