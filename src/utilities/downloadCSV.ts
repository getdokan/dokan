/**
 * Generic CSV Download Utility
 *
 * Provides a simple, reusable way to directly download data as a CSV file
 * in the browser. Can be used by any component across dokan-lite or dokan-pro.
 *
 * @example
 * import { directDownloadCSV } from '@utils/download-csv';
 *
 * const headers = [
 *   { key: 'id', label: 'ID' },
 *   { key: 'name', label: 'Name' },
 * ];
 * const data = [
 *   { id: 1, name: 'John' },
 *   { id: 2, name: 'Jane' },
 * ];
 * directDownloadCSV( 'users', headers, data );
 */

import {
    downloadCSVFile,
    generateCSVDataFromTable,
    generateCSVFileName,
} from '@woocommerce/csv-export';

/**
 * Convert an array of objects into CSV-compatible row arrays,
 * based on the header keys.
 *
 * @param {Array<Object>} data    - Array of data objects.
 * @param {Array<{key: string, label: string}>} headers - Header definitions (key + label).
 * @return {Array<Array<{display: string, value: string | number}>>} Rows suitable for CSV generation.
 */
export const objectToCSVRows = ( data, headers ) => {
    return data.map( ( item ) =>
        headers.map( ( header ) => {
            const value = item[ header.key ];

            let stringValue = '';
            if ( value !== null && value !== undefined ) {
                stringValue =
                    typeof value === 'object'
                        ? JSON.stringify( value )
                        : String( value );
            }

            return { display: stringValue, value: stringValue };
        } )
    );
};

/**
 * Directly download data as a CSV file in the browser.
 *
 * @param {string} filename - Base name for the CSV file (without extension).
 * @param {Array<{key: string, label: string}>} headers - Column header definitions.
 * @param {Array<Object>} data - Array of data objects to export.
 * @param {Object} [params={}] - Optional query params to include in the filename.
 */
export const directDownloadCSV = ( filename, headers, data, params = {} ) => {
    const rows = objectToCSVRows( data, headers );

    downloadCSVFile(
        generateCSVFileName( filename, params ),
        generateCSVDataFromTable( headers, rows )
    );
};
