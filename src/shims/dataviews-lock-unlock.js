/* eslint-disable @wordpress/no-unsafe-wp-apis */
/*
 * Replacement for `@wordpress/dataviews/build-module/lock-unlock.js`.
 *
 * `@wordpress/dataviews@10.x` unlocks Validated* controls from
 * `@wordpress/components` private APIs. Those controls were added in
 * `@wordpress/components@30.x` (WP 6.9). On WP 6.8 they're undefined, so
 * every DataForm field crashes with "Element type is invalid".
 *
 * This shim fills in the missing Validated* keys with public controls
 * (dropping customValidity / onValidate props they don't understand). On
 * WP 6.9+ the real Validated* controls are returned instead. The experimental
 * control imports are required to match the Validated* control APIs.
 */

import { createElement } from '@wordpress/element';
import {
    CheckboxControl,
    ComboboxControl,
    RadioControl,
    SelectControl,
    TextareaControl,
    ToggleControl,
    FormTokenField,
    DateTimePicker,
    __experimentalInputControl as InputControl,
    __experimentalNumberControl as NumberControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
} from '@wordpress/components';
import * as privateApisModule from '@wordpress/private-apis';

const CONSENT =
    'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.';

// Register under a unique Dokan-owned name so no WP core or third-party
// module can ever claim the same slot. Falls back to a list of core names
// only if allowCoreModule is unavailable (older private-apis without an
// expandable allowlist). lock / unlock are module-level singletons, so the
// name we opt-in under doesn't matter — any successful call returns the
// same pair. Cached on window so multiple Dokan bundles on the same page
// share one opt-in.
const DOKAN_MODULE = '@dokan/dataviews-shim';
const FALLBACK_MODULES = [
    '@wordpress/fields',
    '@wordpress/ui',
    '@wordpress/media-utils',
    '@wordpress/upload-media',
    '@wordpress/theme',
    '@wordpress/sync',
    '@wordpress/route',
    '@wordpress/router',
    '@wordpress/views',
    '@wordpress/lazy-editor',
    '@wordpress/font-list-route',
    '@wordpress/global-styles-ui',
    '@wordpress/admin-ui',
    '@wordpress/boot',
    '@wordpress/workflows',
    '@wordpress/connectors',
];
const CACHE_KEY = '__dokanDataviewsLockUnlock';

function acquireLockUnlock() {
    if ( typeof window !== 'undefined' && window[ CACHE_KEY ] ) {
        return window[ CACHE_KEY ];
    }

    const { __dangerousOptInToUnstableAPIsOnlyForCoreModules: optIn, allowCoreModule } =
        privateApisModule;

    let pair;
    if ( typeof allowCoreModule === 'function' ) {
        try {
            allowCoreModule( DOKAN_MODULE );
            pair = optIn( CONSENT, DOKAN_MODULE );
        } catch {
            // Fall through to fallback names.
        }
    }

    if ( ! pair ) {
        for ( const name of FALLBACK_MODULES ) {
            try {
                pair = optIn( CONSENT, name );
                break;
            } catch {
                // Not allowed on this WP version, or already registered.
            }
        }
    }

    if ( ! pair ) {
        pair = { lock: () => {}, unlock: () => ( {} ) };
    }

    if ( typeof window !== 'undefined' ) {
        window[ CACHE_KEY ] = pair;
    }
    return pair;
}

const { lock, unlock: realUnlock } = acquireLockUnlock();

const shimValidated = ( Control ) =>
    function ValidatedShim( { customValidity, onValidate, ...rest } ) {
        return createElement( Control, rest );
    };

const shims = {
    ValidatedCheckboxControl: shimValidated( CheckboxControl ),
    ValidatedComboboxControl: shimValidated( ComboboxControl ),
    ValidatedInputControl: shimValidated( InputControl ),
    ValidatedNumberControl: shimValidated( NumberControl ),
    ValidatedRadioControl: shimValidated( RadioControl ),
    ValidatedSelectControl: shimValidated( SelectControl ),
    ValidatedTextareaControl: shimValidated( TextareaControl ),
    ValidatedToggleControl: shimValidated( ToggleControl ),
    ValidatedToggleGroupControl: shimValidated( ToggleGroupControl ),
    ValidatedFormTokenField: shimValidated( FormTokenField ),
    ValidatedDateControl: shimValidated( DateTimePicker ),
};

function unlock( privateApis ) {
    const real = realUnlock( privateApis );
    return new Proxy( real, {
        get: ( target, prop ) => target[ prop ] ?? shims[ prop ],
    } );
}

export { lock, unlock };
