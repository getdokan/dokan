/**
 * Format file size in human-readable format.
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places
 */
export function formatFileSize( bytes: number, decimals = 2 ): string {
    if ( bytes === 0 ) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ];

    const i = Math.floor( Math.log( bytes ) / Math.log( k ) );

    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( dm ) ) + ' ' + sizes[ i ];
}

/**
 * Get file extension from filename or URL.
 *
 * @param filename - File name or URL
 */
export function getFileExtension( filename: string ): string {
    const parts = filename.split( '.' );
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Check if file is an image based on extension.
 *
 * @param filename - File name or URL
 */
export function isImageFile( filename: string ): boolean {
    const imageExtensions = [ 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico' ];
    const extension = getFileExtension( filename );
    return imageExtensions.includes( extension );
}

