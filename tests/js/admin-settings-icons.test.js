'use strict';

/**
 * Tests for admin settings icon SVG files added in this PR.
 *
 * Validates that each new SVG file:
 *  - exists at the expected path
 *  - is non-empty
 *  - contains a valid <svg> root element
 *  - has the required xmlns attribute (SVG namespace)
 *  - has a viewBox attribute
 *  - has width and height attributes
 *  - contains at least one visible drawing element
 */

const { test, describe } = require( 'node:test' );
const assert = require( 'node:assert/strict' );
const { readFileSync, existsSync } = require( 'node:fs' );
const { join } = require( 'node:path' );

const REPO_ROOT = join( __dirname, '..', '..' );
const ICONS_ROOT = join( REPO_ROOT, 'assets', 'images', 'admin-settings-icons' );

/**
 * New SVG files added in this PR, grouped by subdirectory.
 */
const NEW_SVG_FILES = [
    // AI-assist icons
    'ai-assist/chat-gpt-open-ai.svg',
    'ai-assist/gemini-ai.svg',

    // General icons
    'general/live-search-content.svg',
    'general/suggestion-box.svg',

    // Moderation › live-chat icons
    'moderation/live-chat/chat-button-above.svg',
    'moderation/live-chat/chat-button-hide.svg',
    'moderation/live-chat/chat-button-inside.svg',
    'moderation/live-chat/talkjs-thumb.svg',
    'moderation/live-chat/tawk-thumb.svg',
    'moderation/live-chat/whatsapp-thumb.svg',

    // Product icons
    'product/printful-thumb.svg',

    // Social-onboarding icons
    'social-onboarding/apple.svg',
    'social-onboarding/facebook.svg',
    'social-onboarding/google.svg',
    'social-onboarding/linkedin.svg',
    'social-onboarding/x-twitter.svg',

    // SPMV (Sell Products on Multiple Vendors) icons
    'spmv/bottom-product-tab.svg',
    'spmv/inside-product-tab.svg',
    'spmv/top-product-tab.svg',

    // Store template icons
    'store/store-page-template-four.svg',
];

/**
 * Reads an SVG file relative to ICONS_ROOT and returns the raw string.
 *
 * @param {string} relativePath - Path relative to ICONS_ROOT.
 * @returns {string}
 */
function readSvg( relativePath ) {
    const fullPath = join( ICONS_ROOT, relativePath );
    return readFileSync( fullPath, 'utf8' );
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the opening <svg …> tag from an SVG string.
 *
 * @param {string} content
 * @returns {string|null}
 */
function extractSvgOpenTag( content ) {
    const match = content.match( /<svg(\s[^>]*)?>/ );
    return match ? match[ 0 ] : null;
}

/**
 * Returns the value of a named attribute from an SVG open tag, or null.
 *
 * @param {string} openTag
 * @param {string} attr
 * @returns {string|null}
 */
function getAttr( openTag, attr ) {
    const re = new RegExp( attr + '\\s*=\\s*["\']([^"\']*)["\']', 'i' );
    const match = openTag.match( re );
    return match ? match[ 1 ] : null;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe( 'Admin Settings Icon SVG Files', () => {

    describe( 'File existence', () => {
        for ( const svgPath of NEW_SVG_FILES ) {
            test( `exists: ${ svgPath }`, () => {
                const fullPath = join( ICONS_ROOT, svgPath );
                assert.ok(
                    existsSync( fullPath ),
                    `Expected SVG file to exist at: ${ fullPath }`
                );
            } );
        }
    } );

    describe( 'Non-empty content', () => {
        for ( const svgPath of NEW_SVG_FILES ) {
            test( `non-empty: ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                assert.ok(
                    content.trim().length > 0,
                    `Expected SVG file to be non-empty: ${ svgPath }`
                );
            } );
        }
    } );

    describe( 'SVG root element', () => {
        for ( const svgPath of NEW_SVG_FILES ) {
            test( `has <svg> root element: ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                assert.ok(
                    content.includes( '<svg' ),
                    `Expected SVG file to contain <svg> element: ${ svgPath }`
                );
            } );
        }

        for ( const svgPath of NEW_SVG_FILES ) {
            test( `has closing </svg> tag: ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                assert.ok(
                    content.includes( '</svg>' ),
                    `Expected SVG file to contain </svg> closing tag: ${ svgPath }`
                );
            } );
        }
    } );

    describe( 'Required SVG attributes', () => {
        for ( const svgPath of NEW_SVG_FILES ) {
            test( `has xmlns attribute: ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                const openTag = extractSvgOpenTag( content );
                assert.ok( openTag, `Could not find <svg> open tag in ${ svgPath }` );

                const xmlns = getAttr( openTag, 'xmlns' );
                assert.ok(
                    xmlns !== null,
                    `Expected xmlns attribute in <svg> of ${ svgPath }`
                );
                assert.strictEqual(
                    xmlns,
                    'http://www.w3.org/2000/svg',
                    `Expected xmlns="http://www.w3.org/2000/svg" in ${ svgPath }, got "${ xmlns }"`
                );
            } );
        }

        for ( const svgPath of NEW_SVG_FILES ) {
            test( `has viewBox attribute: ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                const openTag = extractSvgOpenTag( content );
                assert.ok( openTag, `Could not find <svg> open tag in ${ svgPath }` );

                const viewBox = getAttr( openTag, 'viewBox' );
                assert.ok(
                    viewBox !== null,
                    `Expected viewBox attribute in <svg> of ${ svgPath }`
                );
                // viewBox must be 4 numbers: min-x min-y width height
                const parts = viewBox.trim().split( /\s+/ );
                assert.strictEqual(
                    parts.length,
                    4,
                    `Expected viewBox to have 4 values in ${ svgPath }, got: "${ viewBox }"`
                );
                for ( const part of parts ) {
                    assert.ok(
                        ! isNaN( parseFloat( part ) ),
                        `Expected viewBox values to be numeric in ${ svgPath }, got: "${ part }"`
                    );
                }
            } );
        }

        for ( const svgPath of NEW_SVG_FILES ) {
            test( `has positive width attribute: ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                const openTag = extractSvgOpenTag( content );
                assert.ok( openTag, `Could not find <svg> open tag in ${ svgPath }` );

                const width = getAttr( openTag, 'width' );
                assert.ok(
                    width !== null,
                    `Expected width attribute in <svg> of ${ svgPath }`
                );
                const numericWidth = parseFloat( width );
                assert.ok(
                    ! isNaN( numericWidth ) && numericWidth > 0,
                    `Expected width to be a positive number in ${ svgPath }, got: "${ width }"`
                );
            } );
        }

        for ( const svgPath of NEW_SVG_FILES ) {
            test( `has positive height attribute: ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                const openTag = extractSvgOpenTag( content );
                assert.ok( openTag, `Could not find <svg> open tag in ${ svgPath }` );

                const height = getAttr( openTag, 'height' );
                assert.ok(
                    height !== null,
                    `Expected height attribute in <svg> of ${ svgPath }`
                );
                const numericHeight = parseFloat( height );
                assert.ok(
                    ! isNaN( numericHeight ) && numericHeight > 0,
                    `Expected height to be a positive number in ${ svgPath }, got: "${ height }"`
                );
            } );
        }
    } );

    describe( 'Fill attribute', () => {
        for ( const svgPath of NEW_SVG_FILES ) {
            test( `has fill="none" on root svg (design convention): ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                const openTag = extractSvgOpenTag( content );
                assert.ok( openTag, `Could not find <svg> open tag in ${ svgPath }` );

                const fill = getAttr( openTag, 'fill' );
                assert.strictEqual(
                    fill,
                    'none',
                    `Expected fill="none" on root <svg> of ${ svgPath } (design uses path-level fill), got: "${ fill }"`
                );
            } );
        }
    } );

    describe( 'Drawing content', () => {
        const DRAWING_TAGS = [ '<path', '<rect', '<circle', '<ellipse', '<line', '<polygon', '<polyline', '<g ', '<use' ];

        for ( const svgPath of NEW_SVG_FILES ) {
            test( `contains at least one drawing element: ${ svgPath }`, () => {
                const content = readSvg( svgPath );
                const hasDrawing = DRAWING_TAGS.some( ( tag ) => content.includes( tag ) );
                assert.ok(
                    hasDrawing,
                    `Expected at least one drawing element (${ DRAWING_TAGS.join( ', ' ) }) in ${ svgPath }`
                );
            } );
        }
    } );

    // ---------------------------------------------------------------------------
    // Per-group dimension sanity checks
    // ---------------------------------------------------------------------------

    describe( 'Dimension sanity — ai-assist icons (28×28)', () => {
        const AI_ASSIST_ICONS = [
            'ai-assist/chat-gpt-open-ai.svg',
            'ai-assist/gemini-ai.svg',
        ];

        for ( const svgPath of AI_ASSIST_ICONS ) {
            test( `${ svgPath } has width=28`, () => {
                const openTag = extractSvgOpenTag( readSvg( svgPath ) );
                assert.strictEqual( getAttr( openTag, 'width' ), '28' );
            } );

            test( `${ svgPath } has height=28`, () => {
                const openTag = extractSvgOpenTag( readSvg( svgPath ) );
                assert.strictEqual( getAttr( openTag, 'height' ), '28' );
            } );
        }
    } );

    describe( 'Dimension sanity — social-onboarding icons (44×44)', () => {
        const SOCIAL_ONBOARDING_ICONS = [
            'social-onboarding/apple.svg',
            'social-onboarding/facebook.svg',
            'social-onboarding/google.svg',
            'social-onboarding/linkedin.svg',
            'social-onboarding/x-twitter.svg',
        ];

        for ( const svgPath of SOCIAL_ONBOARDING_ICONS ) {
            test( `${ svgPath } has width=44`, () => {
                const openTag = extractSvgOpenTag( readSvg( svgPath ) );
                assert.strictEqual( getAttr( openTag, 'width' ), '44' );
            } );

            test( `${ svgPath } has height=44`, () => {
                const openTag = extractSvgOpenTag( readSvg( svgPath ) );
                assert.strictEqual( getAttr( openTag, 'height' ), '44' );
            } );
        }
    } );

    describe( 'Negative / boundary cases', () => {
        test( 'SVG xmlns must not be empty string', () => {
            // Regression: ensure no SVG slipped through with xmlns=""
            for ( const svgPath of NEW_SVG_FILES ) {
                const content = readSvg( svgPath );
                assert.ok(
                    ! content.includes( 'xmlns=""' ),
                    `Found empty xmlns="" in ${ svgPath }`
                );
            }
        } );

        test( 'SVG files must not contain inline JavaScript', () => {
            // Security check: SVG files should not embed script elements.
            for ( const svgPath of NEW_SVG_FILES ) {
                const content = readSvg( svgPath ).toLowerCase();
                assert.ok(
                    ! content.includes( '<script' ),
                    `Found <script> element in ${ svgPath } — SVG icons must not contain JavaScript`
                );
            }
        } );

        test( 'SVG files must not contain event handler attributes', () => {
            // Security check: no onclick/onload etc. in SVG assets.
            const eventHandlerPattern = /\bon[a-z]+\s*=/i;
            for ( const svgPath of NEW_SVG_FILES ) {
                const content = readSvg( svgPath );
                assert.ok(
                    ! eventHandlerPattern.test( content ),
                    `Found inline event handler in ${ svgPath } — SVG icons must not contain event handlers`
                );
            }
        } );

        test( 'viewBox origin must start at 0 0 for icon-sized SVGs', () => {
            // Icon SVGs (width/height <= 28) conventionally start viewBox at "0 0".
            const ICON_MAX_SIZE = 28;
            for ( const svgPath of NEW_SVG_FILES ) {
                const content = readSvg( svgPath );
                const openTag = extractSvgOpenTag( content );
                if ( ! openTag ) continue;

                const width = parseFloat( getAttr( openTag, 'width' ) || '0' );
                const height = parseFloat( getAttr( openTag, 'height' ) || '0' );

                if ( width > ICON_MAX_SIZE || height > ICON_MAX_SIZE ) {
                    // Skip larger preview/illustration SVGs.
                    continue;
                }

                const viewBox = getAttr( openTag, 'viewBox' ) || '';
                const [ minX, minY ] = viewBox.trim().split( /\s+/ );
                assert.strictEqual(
                    minX,
                    '0',
                    `Expected viewBox min-x to be 0 for icon ${ svgPath }, got ${ minX }`
                );
                assert.strictEqual(
                    minY,
                    '0',
                    `Expected viewBox min-y to be 0 for icon ${ svgPath }, got ${ minY }`
                );
            }
        } );
    } );
} );