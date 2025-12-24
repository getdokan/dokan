/**
 * Convert hex color to HLS
 *
 * @param {string}  hex         - Hex color code (e.g. #ff0000)
 *
 * @param {boolean} returnArray - If true, return an array of [h, s, l]
 * @return {string} - HLS color code (e.g. hsl(0, 100%, 50%))
 */
export const hexToHsl = ( hex: string, returnArray = false ): string => {
    // Remove the hash at the start if it's there
    hex = hex.replace( /^#/, '' );

    // Parse r, g, b values
    const r: number = parseInt( hex.substring( 0, 2 ), 16 );
    const g: number = parseInt( hex.substring( 2, 4 ), 16 );
    const b: number = parseInt( hex.substring( 4, 6 ), 16 );

    // Convert to HLS
    const max = Math.max( r, g, b );
    const min = Math.min( r, g, b );
    const delta = max - min;

    let h: number;
    const l: number = ( max + min ) / 2;
    let s: number;

    if ( delta === 0 ) {
        h = s = 0; // achromatic
    } else {
        s =
            l < 128
                ? ( delta / ( max + min ) ) * 100
                : ( delta / ( 510 - max - min ) ) * 100;

        switch ( max ) {
            case r:
                h = ( ( g - b ) / delta ) % 6;
                break;
            case g:
                h = ( b - r ) / delta + 2;
                break;
            case b:
                h = ( r - g ) / delta + 4;
                break;
        }
        h *= 60; // degrees
        if ( h < 0 ) {
            h += 360;
        }
    }

    if ( returnArray ) {
        return [ Math.round( h ), Math.round( s ), Math.round( l ) ];
    }

    return `hsl(${ Math.round( h ) }, ${ Math.round( s ) }%, ${ Math.round(
        l
    ) }%)`;
};

/**
 * Generate color variants (50, 100, ..., 900) from a hex color.
 *
 * @param {string} hex - The base hex color.
 * @return {Record<string, string>} - An object with color variants.
 */
export const generateColorVariants = (
    hex: string
): Record< string, string > => {
    const hslArray = hexToHsl( hex, true ) as [ number, number, number ];
    const [ h, s ] = hslArray;

    const variants: Record< string, string > = {};
    const lightnessSteps = {
        50: 95,
        100: 90,
        200: 80,
        300: 70,
        400: 60,
        500: 50,
        600: 40,
        700: 30,
        800: 20,
        900: 10,
    };

    for ( const [ key, lightness ] of Object.entries( lightnessSteps ) ) {
        variants[ key ] = `hsl(${ h }, ${ s }%, ${ lightness }%)`;
    }

    return variants;
};
