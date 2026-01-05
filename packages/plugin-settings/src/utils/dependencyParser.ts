import type { SettingsElement, SettingsElementDependency } from '../types';

/**
 * Parse dependencies from settings elements.
 *
 * @param settings - Array of settings elements.
 * @returns Array of parsed dependencies.
 */
function parseDependencies( settings: SettingsElement[] ): SettingsElementDependency[] {
    const dependencies: SettingsElementDependency[] = [];

    const parseElement = ( element: SettingsElement ): void => {
        if ( element.dependencies && element.dependencies.length > 0 ) {
            element.dependencies.forEach( ( dep ) => {
                dependencies.push( {
                    ...dep,
                    currentValue: findValueByKey( settings, dep.key || '' ),
                } );
            } );
        }

        if ( element.children && element.children.length > 0 ) {
            element.children.forEach( parseElement );
        }
    };

    settings.forEach( parseElement );

    return dependencies;
}

/**
 * Find a value by its dependency key in the settings tree.
 *
 * @param settings - Array of settings elements.
 * @param key      - Dot-separated key string.
 * @returns The value at the given key path.
 */
function findValueByKey( settings: SettingsElement[], key: string ): unknown {
    if ( ! key ) {
        return undefined;
    }

    const keys = key.split( '.' );
    let current: SettingsElement[] | SettingsElement | undefined = settings;

    for ( const k of keys ) {
        if ( Array.isArray( current ) ) {
            const found = current.find( ( el ) => el.id === k );
            if ( ! found ) {
                return undefined;
            }
            current = found;
        } else if ( current && typeof current === 'object' ) {
            if ( current.children ) {
                const found = current.children.find( ( el ) => el.id === k );
                if ( found ) {
                    current = found;
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    if ( current && typeof current === 'object' && 'value' in current ) {
        return current.value;
    }

    return undefined;
}

export default parseDependencies;

