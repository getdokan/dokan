import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import type { SettingsElement } from '@wedevs/plugin-ui';

// The schema key a field writes to: its dependency_key when set, else its id.
export const fieldKeyOf = ( element: SettingsElement ): string =>
    ( element.dependency_key as string ) || element.id;

// The red required marker shared by the custom field controls.
export const RequiredMark = () => (
    <span
        className="text-red-500"
        aria-label={ __( 'Required', 'dokan-lite' ) }
        title={ __( 'Required', 'dokan-lite' ) }
    >
        *
    </span>
);

// Chrome shared by the DataViews row-action buttons (edit/delete) across the tables.
export const actionButtonBase =
    'inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50';
// dokan-soft-primary mirrors the delete action's light-tint hover on the brand colour; the tint is mixed in style.scss because the brand token is a CSS var (Tailwind's /alpha modifier can't touch it).
export const editButtonClass = `${ actionButtonBase } dokan-soft-primary`;
export const deleteButtonClass = `${ actionButtonBase } hover:border-dokan-btn-danger hover:bg-dokan-danger hover:text-dokan-btn-danger`;

export type CountryState = { code: string; name: string };
export type CountryData = {
    code: string;
    name: string;
    states?: CountryState[];
};

// Session-cached: the WC country/state list is static, so a single fetch (names
// entity-decoded once) serves every field mount across the engine's save/cancel
// remounts and tab revisits instead of re-hitting the endpoint each time.
let countriesCache: CountryData[] | null = null;
let countriesRequest: Promise< CountryData[] > | null = null;

const loadCountries = (): Promise< CountryData[] > => {
    if ( countriesCache ) {
        return Promise.resolve( countriesCache );
    }
    if ( ! countriesRequest ) {
        countriesRequest = apiFetch< CountryData[] >( {
            path: '/dokan/v1/data/countries',
        } )
            .then( ( response ) => {
                countriesCache = (
                    Array.isArray( response ) ? response : []
                ).map( ( country ) => ( {
                    code: country.code,
                    name: decodeEntities( country.name ),
                    states: ( country.states || [] ).map( ( state ) => ( {
                        code: state.code,
                        name: decodeEntities( state.name ),
                    } ) ),
                } ) );
                return countriesCache;
            } )
            .catch( () => {
                // Let a later mount retry rather than caching the failure.
                countriesRequest = null;
                return [];
            } );
    }
    return countriesRequest;
};

// WC country/state list for the address + store-location cascades.
export const useCountries = (): CountryData[] => {
    const [ countries, setCountries ] = useState< CountryData[] >(
        countriesCache || []
    );

    useEffect( () => {
        let active = true;
        loadCountries().then( ( list ) => {
            if ( active ) {
                setCountries( list );
            }
        } );
        return () => {
            active = false;
        };
    }, [] );

    return countries;
};
