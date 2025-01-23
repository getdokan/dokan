import { QueryParams } from './types';

export const getQueryId = ( query: QueryParams ): string => {
    const orderedQuery: Record< string, any > = {};
    Object.keys( query )
        .sort()
        .forEach( ( key ) => {
            orderedQuery[ key ] = query[ key ];
        } );
    return JSON.stringify( orderedQuery || {} );
};
