import { __ } from '@wordpress/i18n';
import { CheckCircle, CircleX, LoaderCircle } from 'lucide-react';
import { kebabCase } from '@dokan/utilities';
import { CountryOption, StateOption } from './types';

/**
 * Generate random password
 */
export const makePassword = ( len = 25 ): string => {
    const lowerCaseChars = 'abcdefghijklmnopqurstuvwxyz';
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQURSTUVWXYZ';
    const specialChars = '!@#$%^&*()';
    let randomChars = '';

    for ( let i = 0; i <= len; i++ ) {
        const mixUp =
            lowerCaseChars[ Math.floor( Math.random() * len ) ] +
            upperCaseChars[ Math.floor( Math.random() * 10 ) ] +
            specialChars[ Math.floor( Math.random() * specialChars.length ) ];
        randomChars += mixUp;
    }

    return randomChars.slice( -len );
};

/**
 * Format store URL to kebab case
 */
export const formatStoreUrl = ( storeName: string ): string => {
    return kebabCase( storeName );
};

/**
 * Get all countries as options
 */
export const getCountries = (): CountryOption[] => {
    // @ts-ignore
    const dokanCountries = window?.dokanAdminDashboard?.countries || {};
    return Object.keys( dokanCountries ).map( ( key ) => ( {
        label: dokanCountries[ key ],
        value: key,
    } ) );
};

/**
 * Get country by code
 */
export const getCountry = ( code: string ): CountryOption | string => {
    // @ts-ignore
    const dokanCountries = window?.dokanAdminDashboard?.countries || {};

    if ( ! dokanCountries[ code ] ) {
        return '';
    }

    return {
        label: dokanCountries[ code ],
        value: code,
    };
};

/**
 * Get states from country code
 */
export const getStatesFromCountryCode = ( countryCode: string ): StateOption[] => {
    const states: StateOption[] = [];
    // @ts-ignore
    const statesObject = window?.dokanAdminDashboard?.states;

    if ( ! countryCode || ! statesObject ) {
        return states;
    }

    for ( const state in statesObject ) {
        if ( state !== countryCode ) {
            continue;
        }

        if ( statesObject[ state ] && statesObject[ state ].length < 1 ) {
            continue;
        }

        for ( const name in statesObject[ state ] ) {
            states.push( {
                label: statesObject[ state ][ name ],
                value: name,
            } );
        }
    }

    return states;
};

/**
 * Get state from state code
 */
export const getStateFromStateCode = (
    stateCode: string,
    countryCode: string
): StateOption | string => {
    if ( ! stateCode ) {
        return '';
    }

    // @ts-ignore
    const states = window?.dokanAdminDashboard?.states?.[ countryCode ];
    const state = states && states[ stateCode ];

    if ( ! state ) {
        return '';
    }

    return {
        label: state,
        value: stateCode,
    };
};

/**
 * Get store search text with status indicator
 */
export const getStoreSearchText = ( text: string ): JSX.Element | string => {
    if ( text === 'searching' ) {
        return (
            <span className="flex flex-row gap-1 items-center text-neutral-500">
                <LoaderCircle size={ 13 } className="animate-spin" />
                <span>{ __( 'Searching…', 'dokan-lite' ) }</span>
            </span>
        );
    } else if ( text === 'available' ) {
        return (
            <span className="flex flex-row gap-1 items-center text-green-500">
                <CheckCircle size={ 13 } />
                <span>{ __( 'Available', 'dokan-lite' ) }</span>
            </span>
        );
    } else if ( text === 'not-available' ) {
        return (
            <span className="flex flex-row gap-1 items-center text-red-500">
                <CircleX size={ 13 } />
                <span>{ __( 'Not Available', 'dokan-lite' ) }</span>
            </span>
        );
    }
    return '';
};

/**
 * Get default store URL
 */
export const getDefaultStoreUrl = (): string => {
    // @ts-ignore
    return (
        window?.dokanAdminDashboard?.urls?.siteUrl +
        // @ts-ignore
        window?.dokanAdminDashboard?.urls?.storePrefix +
        '/'
    );
};

