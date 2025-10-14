// Frontend sorting utilities for dashboard components

export const sortByPosition = < T extends { position?: number } >(
    data: Record< string, T >
): Array< [ string, T ] > => {
    return Object.entries( data ).sort( ( [ , a ], [ , b ] ) => {
        const positionA = a.position ?? 999;
        const positionB = b.position ?? 999;
        return positionA - positionB;
    } );
};
