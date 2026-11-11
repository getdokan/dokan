import { dateI18n, getSettings } from '@wordpress/date';

// WordPress's own route: it decides who may create, list and revoke, so this field needs no endpoint of ours.
export const PATH = '/wp/v2/users/me/application-passwords';

export type AppPassword = {
    uuid: string;
    name: string;
    created: string;
    last_used: string | null;
    last_ip: string | null;
};

export type CreatedPassword = AppPassword & { password: string };

export const messageOf = ( error: unknown, fallback: string ): string =>
    ( error as { message?: string } )?.message || fallback;

// WordPress reports these times in GMT without a zone marker.
export const formatDate = ( value: string | null ): string => {
    if ( ! value ) {
        return '—';
    }

    const utc = /(?:[zZ]|[+-]\d\d:?\d\d)$/.test( value )
        ? value
        : `${ value }Z`;

    return dateI18n( getSettings().formats.date, utc );
};

// What an HTTP MCP client sends after "Authorization: Basic ": base64 of username:password, as UTF-8 so a non-Latin username survives.
export const basicToken = ( username: string, password: string ): string => {
    // WordPress shows the password in groups of four and ignores the spaces when it signs the user in.
    const bytes = new TextEncoder().encode(
        `${ username }:${ password.replace( /\s+/g, '' ) }`
    );

    return window.btoa(
        Array.from( bytes, ( byte ) => String.fromCharCode( byte ) ).join( '' )
    );
};

export const copyText = async ( text: string ): Promise< boolean > => {
    try {
        if ( window.isSecureContext && window.navigator?.clipboard ) {
            await window.navigator.clipboard.writeText( text );
            return true;
        }
    } catch ( error ) {
        // Fall through to the selection-based copy below.
    }

    // The Clipboard API needs HTTPS; a local http site still copies through a selection.
    const area = document.createElement( 'textarea' );
    area.value = text;
    area.setAttribute( 'readonly', '' );
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild( area );
    area.select();

    let copied = false;
    try {
        copied = document.execCommand( 'copy' );
    } catch ( error ) {
        copied = false;
    }
    document.body.removeChild( area );

    return copied;
};
