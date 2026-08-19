import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DokanAlert } from '@dokan/components';
import {
    ORDER_DETAILS_LOADED,
    ORDER_DETAILS_RENDERED,
    emitOrderDetailsEvent,
} from './events';
import type { OrderDetailsFragment, OrderDetailsInlineScript } from './types';
import './order-details-fragment.scss';

/**
 * Inline script elements this route currently has live in the document.
 *
 * Keyed by handle + position + code, so re-rendering the same order reuses the
 * elements already executing instead of appending duplicates, and opening a different
 * order drops the ones that are no longer part of the render.
 */
const liveInlineScripts = new Map< string, HTMLScriptElement >();

const inlineScriptKey = ( script: OrderDetailsInlineScript ) =>
    `${ script.handle }|${ script.position }|${ script.code }`;

/**
 * Top-level lexical declarations found in a payload, e.g. `let vendorInfo = {…}`.
 */
const TOP_LEVEL_DECLARATION = /(?:^|\n)\s*(?:let|const)\s+([A-Za-z_$][\w$]*)/g;

const topLevelBindings = ( code: string ): string[] => {
    const names: string[] = [];
    let match: RegExpExecArray | null;

    TOP_LEVEL_DECLARATION.lastIndex = 0;

    // eslint-disable-next-line no-cond-assign
    while ( ( match = TOP_LEVEL_DECLARATION.exec( code ) ) !== null ) {
        names.push( match[ 1 ] );
    }

    return names;
};

/**
 * Warn when a payload cannot take effect because of a binding it already created.
 *
 * A top-level `let`/`const` executed at global scope lives in the global lexical
 * environment and outlives the element that declared it. If a later order ships a
 * different value under the same name, the browser refuses the whole script with a
 * redeclaration `SyntaxError` and the consumer silently keeps reading the previous
 * order's data. Nothing here can undo that binding — but a named warning turns a
 * silent stale-data bug into one an extension author can act on.
 *
 * The fix is theirs: assign to `window`, or use `var`.
 */
const warnOnRedeclaration = (
    handle: string,
    previousCode: string,
    nextCode: string
) => {
    const clashing = topLevelBindings( previousCode ).filter( ( name ) =>
        topLevelBindings( nextCode ).includes( name )
    );

    if ( ! clashing.length || ! window.console?.warn ) {
        return;
    }

    window.console.warn(
        `[dokan] Inline data for "${ handle }" redeclares ${ clashing
            .map( ( name ) => `\`${ name }\`` )
            .join( ', ' ) } at global scope, so this order's value cannot replace the previous one. Assign to \`window\` or use \`var\` instead. See docs/frontend/order-details-fragment.md.`
    );
};

/**
 * Put render-time inline data on the page as real script elements.
 *
 * Deliberately not `eval`: the known payloads declare top-level `let` bindings, which
 * are only globally visible when executed at global scope. Evaluating them inside a
 * closure would scope them to that closure and the consuming script would still find
 * nothing.
 *
 * Note for extension authors: a top-level `let` or `const` cannot be redeclared, so a
 * payload that changes between orders should use `var` or assign to `window`.
 */
const syncInlineScripts = ( scripts: OrderDetailsInlineScript[] ) => {
    const wanted = new Map< string, OrderDetailsInlineScript >();

    scripts.forEach( ( script ) => {
        if ( script?.code ) {
            wanted.set( inlineScriptKey( script ), script );
        }
    } );

    liveInlineScripts.forEach( ( element, key ) => {
        if ( wanted.has( key ) ) {
            // Already executing with exactly this code — leave it alone.
            wanted.delete( key );
            return;
        }

        const [ handle ] = key.split( '|' );
        const replacement = Array.from( wanted.values() ).find(
            ( script ) => script.handle === handle
        );

        if ( replacement ) {
            warnOnRedeclaration(
                handle,
                element.textContent ?? '',
                replacement.code
            );
        }

        element.remove();
        liveInlineScripts.delete( key );
    } );

    wanted.forEach( ( script, key ) => {
        const element = document.createElement( 'script' );

        element.setAttribute( 'data-dokan-order-details-handle', script.handle );
        element.textContent = script.code;

        document.head.appendChild( element );
        liveInlineScripts.set( key, element );
    } );
};

/**
 * Re-create script tags found inside the inserted markup.
 *
 * HTML assigned as a string never executes its scripts. Nothing in the current render
 * path emits one, but third-party templates may.
 */
const executeEmbeddedScripts = ( container: HTMLElement ) => {
    container.querySelectorAll( 'script' ).forEach( ( original ) => {
        const replacement = document.createElement( 'script' );

        Array.from( original.attributes ).forEach( ( attribute ) => {
            replacement.setAttribute( attribute.name, attribute.value );
        } );
        replacement.textContent = original.textContent;

        original.parentNode?.replaceChild( replacement, original );
    } );
};

/**
 * Vendor order details, rendered by PHP and bridged into the Vendor panel.
 *
 * The details view is not a React component and deliberately never becomes one: the
 * template fires eleven extension hooks plus WooCommerce's item hooks, and Pro injects
 * shipments, delivery time, store pickup and the whole item/refund table into it.
 * Rewriting it in React would delete all of that silently. Instead the server renders
 * the same template it renders for the legacy page, and this component asks for the
 * resulting HTML and puts it on screen.
 */
const OrderDetails = ( { params }: { params?: { orderId?: string } } ) => {
    const orderId = Number( params?.orderId ?? 0 );
    const containerRef = useRef< HTMLDivElement >( null );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ error, setError ] = useState< string >( '' );

    useEffect( () => {
        if ( ! orderId ) {
            setIsLoading( false );
            setError( __( 'No order was requested.', 'dokan-lite' ) );
            return;
        }

        let cancelled = false;

        setIsLoading( true );
        setError( '' );

        apiFetch< OrderDetailsFragment >( {
            path: `/dokan/v1/orders/${ orderId }/details-html`,
        } )
            .then( ( fragment ) => {
                const container = containerRef.current;

                if ( cancelled || ! container ) {
                    return;
                }

                // Order matters and is not obvious. Inline data has to be executing
                // before the markup that depends on it exists, and everything has to
                // be in place before anyone is told to re-initialise against it.
                syncInlineScripts( fragment?.inline_scripts ?? [] );

                // Announced before the markup lands so the panel header can show the
                // order number and status while the fragment is still being inserted.
                if ( fragment?.order ) {
                    emitOrderDetailsEvent( ORDER_DETAILS_LOADED, [
                        fragment.order,
                    ] );
                }

                // Assigning server-rendered markup is the whole point of this
                // component, not an oversight. The HTML comes from Dokan's own REST
                // endpoint, which requires `dokan_view_order` plus ownership before it
                // renders anything, and the template escapes its own output with the
                // WordPress escaping API. Sanitising here would strip exactly the
                // markup Pro and third-party hooks contribute.
                container.innerHTML = fragment?.html ?? '';

                executeEmbeddedScripts( container );

                emitOrderDetailsEvent( ORDER_DETAILS_RENDERED, [
                    container,
                    orderId,
                ] );
            } )
            .catch( ( fetchError ) => {
                if ( cancelled ) {
                    return;
                }

                setError(
                    fetchError?.message ||
                        sprintf(
                            /* translators: %d: order number */
                            __( 'Order #%d could not be loaded.', 'dokan-lite' ),
                            orderId
                        )
                );
            } )
            .finally( () => {
                if ( ! cancelled ) {
                    setIsLoading( false );
                }
            } );

        return () => {
            cancelled = true;
        };
    }, [ orderId ] );

    // Leaving the route entirely takes the render's inline data with it, so a later
    // visit cannot read a global belonging to an order the Vendor is no longer on.
    useEffect( () => {
        return () => {
            syncInlineScripts( [] );
        };
    }, [] );

    if ( error ) {
        return (
            <DokanAlert
                variant="danger"
                label={ __( 'Order details unavailable', 'dokan-lite' ) }
            >
                { error }
            </DokanAlert>
        );
    }

    return (
        <div className="dokan-order-details-wrapper dokan-react-order-details">
            { isLoading && (
                // Mirrors the rendered layout — two columns, 24px gaps, 320px sidebar —
                // so the page does not visibly reflow once the fragment lands.
                <div
                    className="flex flex-col gap-6 lg:flex-row"
                    aria-label={ __( 'Loading order details', 'dokan-lite' ) }
                >
                    <div className="flex flex-1 flex-col gap-6">
                        <div className="h-72 animate-pulse rounded-md bg-gray-200" />
                        <div className="h-40 animate-pulse rounded-md bg-gray-200" />
                    </div>
                    <div className="flex w-full flex-col gap-6 lg:w-80">
                        <div className="h-52 animate-pulse rounded-md bg-gray-200" />
                        <div className="h-64 animate-pulse rounded-md bg-gray-200" />
                    </div>
                </div>
            ) }
            <div ref={ containerRef } />
        </div>
    );
};

export default OrderDetails;
