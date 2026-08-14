import { formatSettingsData, type SettingsElement } from '@wedevs/plugin-ui';

type ServerFieldErrors = Record< string, string[] | string >;

/**
 * Map every field's id to the dot-path `dependency_key` the plugin-ui engine
 * actually keys its `errors` state by (e.g. `store_settings.tab_general.branding.store_name`).
 *
 * The REST layer reports validation errors by bare field id, but
 * `field-renderer` only reads `errors[element.dependency_key]` — throwing
 * bare-id keys means no inline error ever renders and `hasScopeErrors`
 * never blocks the save button.
 * @param schema Flat schema exactly as fetched — the same input the engine formats.
 */
export function buildDependencyKeyMap(
    schema: SettingsElement[]
): Map< string, string > {
    const map = new Map< string, string >();

    const walk = ( nodes: SettingsElement[] ): void => {
        for ( const node of nodes ) {
            if ( 'field' === node.type && node.id && node.dependency_key ) {
                map.set( String( node.id ), String( node.dependency_key ) );
            }
            if ( node.children?.length ) {
                walk( node.children );
            }
        }
    };

    // formatSettingsData computes dependency_key exactly as the engine will — same input, same keys.
    walk( formatSettingsData( schema ) );

    return map;
}

/**
 * Rewrite bare-id dependency keys into the engine's dot-path `dependency_key`.
 *
 * plugin-ui v2 evaluates `values[dep.key]` literally against a values map
 * keyed by dot paths (the old engine resolved sibling ids relative to the
 * field), so schema conventions like `key: 'dokan_store_time_enabled'` stopped
 * matching and dependent fields vanished. Unknown ids pass through unchanged.
 * @param schema Flat schema exactly as fetched.
 */
export function qualifyDependencyKeys(
    schema: SettingsElement[]
): SettingsElement[] {
    const keyMap = buildDependencyKeyMap( schema );

    return schema.map( ( element ) => {
        const dependencies = element.dependencies as
            | Array< Record< string, unknown > >
            | undefined;

        if ( ! Array.isArray( dependencies ) || ! dependencies.length ) {
            return element;
        }

        return {
            ...element,
            dependencies: dependencies.map( ( dependency ) => ( {
                ...dependency,
                key:
                    keyMap.get( String( dependency.key ) ) ??
                    ( dependency.key as string ),
            } ) ),
        };
    } );
}

/**
 * Re-key `{ field_id: messages }` REST validation errors into the
 * `{ dependency_key: message }` shape the settings engine merges into
 * per-field error state. Unknown ids pass through unchanged.
 * @param schema      Flat schema exactly as fetched.
 * @param fieldErrors REST `data.errors` keyed by bare field id.
 */
export function rekeyServerErrors(
    schema: SettingsElement[],
    fieldErrors: ServerFieldErrors
): Record< string, string > {
    const keyMap = buildDependencyKeyMap( schema );
    const rekeyed: Record< string, string > = {};

    for ( const [ fieldId, messages ] of Object.entries( fieldErrors ) ) {
        const key = keyMap.get( fieldId ) ?? fieldId;
        // Newline-joined so `whitespace-pre-line` renderers stack the messages; HTML collapses it back to a space everywhere else.
        rekeyed[ key ] = Array.isArray( messages )
            ? messages.join( '\n' )
            : String( messages );
    }

    return rekeyed;
}
