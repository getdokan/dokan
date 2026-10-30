// Meta keys of custom fields: generated from the label, never typed, never clashing with a saved key.
import type { EditorData, Setup } from './types';

export interface SavedField {
    key: string;
    label: string;
    type: string;
    options: { label: string; value: string }[];
    pages: { id: number; title: string }[];
    answers: number;
    removed: boolean;
}

const MAX_LENGTH = 50;

// Same characters sanitize_key() keeps; anything else becomes an underscore.
export const slugify = ( label: string ): string =>
    label
        .toLowerCase()
        .normalize( 'NFKD' )
        .replace( /[̀-ͯ]/g, '' )
        .replace( /[^a-z0-9]+/g, '_' )
        .replace( /^_+|_+$/g, '' );

// A saved key only this page uses, never answered: free to reuse while the label changes.
export const isFreeKey = ( field: SavedField, postId: string ): boolean =>
    0 === field.answers &&
    field.pages.every( ( page ) => String( page.id ) === postId );

// Keys already used: in this form (other rows) and anywhere else they were saved.
export const takenKeys = (
    setup: Setup,
    saved: SavedField[],
    exceptRowId: string | undefined,
    postId: string
): Set< string > => {
    const keys = new Set(
        saved
            .filter( ( field ) => ! isFreeKey( field, postId ) )
            .map( ( field ) => field.key )
    );

    setup.sections.forEach( ( section ) =>
        section.rows.forEach( ( row ) => {
            if ( row.custom && row.id !== exceptRowId ) {
                keys.add( row.metaKey );
            }
        } )
    );

    return keys;
};

// A fresh key from the label: on a clash it gets a numeric suffix.
export const keyFromLabel = (
    label: string,
    taken: Set< string >,
    data: EditorData
): string => {
    const base = ( data.metaPrefix + ( slugify( label ) || 'field' ) ).slice(
        0,
        MAX_LENGTH
    );
    let key = base;
    let suffix = 2;

    while ( taken.has( key ) || data.reservedKeys.includes( key ) ) {
        key =
            base.slice( 0, MAX_LENGTH - String( suffix ).length - 1 ) +
            '_' +
            suffix;
        suffix++;
    }

    return key;
};

// Saved fields to offer under the label: matching label or key, 2+ letters, not in this form.
export const suggestions = (
    query: string,
    saved: SavedField[],
    setup: Setup
): SavedField[] => {
    const term = query.trim().toLowerCase();

    if ( term.length < 2 ) {
        return [];
    }

    const inForm = new Set(
        setup.sections.flatMap( ( section ) =>
            section.rows
                .filter( ( row ) => row.custom )
                .map( ( row ) => row.metaKey )
        )
    );
    const slug = slugify( term );

    return saved
        .filter( ( field ) => ! inForm.has( field.key ) )
        .filter(
            ( field ) =>
                field.label.toLowerCase().includes( term ) ||
                ( slug && field.key.includes( slug ) )
        )
        .slice( 0, 5 );
};
