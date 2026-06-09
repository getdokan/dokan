'use strict';

/**
 * Tests for the .gitignore additions in this PR.
 *
 * This PR added two categories of ignore patterns:
 *
 * 1. Planning/design scaffolding (local-only design docs):
 *    - /docs/superpowers/
 *    - /openspec/
 *
 * 2. Personal tooling configs (Claude Code opsx / openspec workflow):
 *    - /.claude/commands/opsx/
 *    - /.claude/skills/openspec-apply-change/
 *    - /.claude/skills/openspec-archive-change/
 *    - /.claude/skills/openspec-explore/
 *    - /.claude/skills/openspec-propose/
 *
 * 3. Personal GitHub Copilot configs (opsx / openspec workflow):
 *    - /.github/prompts/opsx-*.prompt.md
 *    - /.github/skills/openspec-apply-change/
 *    - /.github/skills/openspec-archive-change/
 *    - /.github/skills/openspec-explore/
 *    - /.github/skills/openspec-propose/
 */

const { test, describe } = require( 'node:test' );
const assert = require( 'node:assert/strict' );
const { readFileSync, existsSync } = require( 'node:fs' );
const { join } = require( 'node:path' );

const REPO_ROOT = join( __dirname, '..', '..' );
const GITIGNORE_PATH = join( REPO_ROOT, '.gitignore' );

/**
 * Reads and parses .gitignore into an array of trimmed, non-empty, non-comment lines.
 *
 * @returns {string[]}
 */
function readIgnorePatterns() {
    const content = readFileSync( GITIGNORE_PATH, 'utf8' );
    return content
        .split( '\n' )
        .map( ( l ) => l.trim() )
        .filter( ( l ) => l.length > 0 && ! l.startsWith( '#' ) );
}

/**
 * Returns true if the given pattern string is found verbatim in the .gitignore file.
 *
 * @param {string} pattern
 * @returns {boolean}
 */
function hasPattern( pattern ) {
    const content = readFileSync( GITIGNORE_PATH, 'utf8' );
    return content.split( '\n' ).some( ( line ) => line.trim() === pattern );
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe( '.gitignore — PR Additions', () => {

    test( '.gitignore file exists', () => {
        assert.ok(
            existsSync( GITIGNORE_PATH ),
            `Expected .gitignore to exist at: ${ GITIGNORE_PATH }`
        );
    } );

    test( '.gitignore file is non-empty', () => {
        const patterns = readIgnorePatterns();
        assert.ok( patterns.length > 0, 'Expected .gitignore to contain at least one pattern' );
    } );

    // -------------------------------------------------------------------------
    // Planning / design scaffolding patterns
    // -------------------------------------------------------------------------

    describe( 'Planning/design scaffolding patterns', () => {

        test( 'ignores /docs/superpowers/', () => {
            assert.ok(
                hasPattern( '/docs/superpowers/' ),
                'Expected /docs/superpowers/ to be in .gitignore'
            );
        } );

        test( 'ignores /openspec/', () => {
            assert.ok(
                hasPattern( '/openspec/' ),
                'Expected /openspec/ to be in .gitignore'
            );
        } );
    } );

    // -------------------------------------------------------------------------
    // Claude Code personal configs
    // -------------------------------------------------------------------------

    describe( 'Claude Code personal config patterns', () => {

        test( 'ignores /.claude/commands/opsx/', () => {
            assert.ok(
                hasPattern( '/.claude/commands/opsx/' ),
                'Expected /.claude/commands/opsx/ to be in .gitignore'
            );
        } );

        test( 'ignores /.claude/skills/openspec-apply-change/', () => {
            assert.ok(
                hasPattern( '/.claude/skills/openspec-apply-change/' ),
                'Expected /.claude/skills/openspec-apply-change/ to be in .gitignore'
            );
        } );

        test( 'ignores /.claude/skills/openspec-archive-change/', () => {
            assert.ok(
                hasPattern( '/.claude/skills/openspec-archive-change/' ),
                'Expected /.claude/skills/openspec-archive-change/ to be in .gitignore'
            );
        } );

        test( 'ignores /.claude/skills/openspec-explore/', () => {
            assert.ok(
                hasPattern( '/.claude/skills/openspec-explore/' ),
                'Expected /.claude/skills/openspec-explore/ to be in .gitignore'
            );
        } );

        test( 'ignores /.claude/skills/openspec-propose/', () => {
            assert.ok(
                hasPattern( '/.claude/skills/openspec-propose/' ),
                'Expected /.claude/skills/openspec-propose/ to be in .gitignore'
            );
        } );
    } );

    // -------------------------------------------------------------------------
    // GitHub Copilot personal configs
    // -------------------------------------------------------------------------

    describe( 'GitHub Copilot personal config patterns', () => {

        test( 'ignores /.github/prompts/opsx-*.prompt.md (glob pattern)', () => {
            assert.ok(
                hasPattern( '/.github/prompts/opsx-*.prompt.md' ),
                'Expected /.github/prompts/opsx-*.prompt.md to be in .gitignore'
            );
        } );

        test( 'ignores /.github/skills/openspec-apply-change/', () => {
            assert.ok(
                hasPattern( '/.github/skills/openspec-apply-change/' ),
                'Expected /.github/skills/openspec-apply-change/ to be in .gitignore'
            );
        } );

        test( 'ignores /.github/skills/openspec-archive-change/', () => {
            assert.ok(
                hasPattern( '/.github/skills/openspec-archive-change/' ),
                'Expected /.github/skills/openspec-archive-change/ to be in .gitignore'
            );
        } );

        test( 'ignores /.github/skills/openspec-explore/', () => {
            assert.ok(
                hasPattern( '/.github/skills/openspec-explore/' ),
                'Expected /.github/skills/openspec-explore/ to be in .gitignore'
            );
        } );

        test( 'ignores /.github/skills/openspec-propose/', () => {
            assert.ok(
                hasPattern( '/.github/skills/openspec-propose/' ),
                'Expected /.github/skills/openspec-propose/ to be in .gitignore'
            );
        } );
    } );

    // -------------------------------------------------------------------------
    // Pre-existing patterns must still be present (regression)
    // -------------------------------------------------------------------------

    describe( 'Pre-existing patterns still present (regression)', () => {

        test( 'still ignores node_modules', () => {
            assert.ok(
                hasPattern( 'node_modules' ),
                'Expected "node_modules" to still be in .gitignore'
            );
        } );

        test( 'still ignores .env', () => {
            assert.ok(
                hasPattern( '.env' ),
                'Expected ".env" to still be in .gitignore'
            );
        } );

        test( 'still ignores /vendor/', () => {
            assert.ok(
                hasPattern( '/vendor/' ),
                'Expected "/vendor/" to still be in .gitignore'
            );
        } );

        test( 'still ignores .vscode', () => {
            assert.ok(
                hasPattern( '.vscode' ),
                'Expected ".vscode" to still be in .gitignore'
            );
        } );
    } );

    // -------------------------------------------------------------------------
    // Team-shared paths must NOT be ignored (scope guard)
    // -------------------------------------------------------------------------

    describe( 'Team-shared paths are NOT ignored', () => {

        test( 'does not ignore .claude/skills/dokan-settings/ (team-shared skill)', () => {
            // The PR comment says "Team-shared skills under .claude/skills/dokan-*
            // remain tracked." Verify no overly-broad pattern would exclude them.
            const content = readFileSync( GITIGNORE_PATH, 'utf8' );

            // A pattern like "/.claude/" or "/.claude/skills/" would accidentally
            // suppress the team-shared skill added in this very PR.
            const overly_broad = [
                '/.claude/',
                '/.claude/skills/',
            ];

            for ( const pattern of overly_broad ) {
                const found = content
                    .split( '\n' )
                    .some( ( line ) => line.trim() === pattern );
                assert.ok(
                    ! found,
                    `Found overly-broad pattern "${ pattern }" in .gitignore which would suppress team-shared .claude/skills/dokan-* assets`
                );
            }
        } );

        test( 'does not ignore .github/ broadly (team-shared workflows must remain tracked)', () => {
            const content = readFileSync( GITIGNORE_PATH, 'utf8' );
            const overly_broad = [
                '/.github/',
                '/.github/workflows/',
            ];

            for ( const pattern of overly_broad ) {
                const found = content
                    .split( '\n' )
                    .some( ( line ) => line.trim() === pattern );
                assert.ok(
                    ! found,
                    `Found overly-broad pattern "${ pattern }" in .gitignore which would suppress team-shared .github files`
                );
            }
        } );
    } );

    // -------------------------------------------------------------------------
    // Pattern format invariants
    // -------------------------------------------------------------------------

    describe( 'Pattern format invariants', () => {

        test( 'new PR patterns are not duplicated among themselves', () => {
            // Validate that the patterns this PR introduced are unique within
            // themselves (not repeated twice in the new additions).
            const NEW_PR_PATTERNS = [
                '/docs/superpowers/',
                '/openspec/',
                '/.claude/commands/opsx/',
                '/.claude/skills/openspec-apply-change/',
                '/.claude/skills/openspec-archive-change/',
                '/.claude/skills/openspec-explore/',
                '/.claude/skills/openspec-propose/',
                '/.github/prompts/opsx-*.prompt.md',
                '/.github/skills/openspec-apply-change/',
                '/.github/skills/openspec-archive-change/',
                '/.github/skills/openspec-explore/',
                '/.github/skills/openspec-propose/',
            ];

            const seen = new Set();
            const duplicates = [];
            for ( const p of NEW_PR_PATTERNS ) {
                if ( seen.has( p ) ) {
                    duplicates.push( p );
                } else {
                    seen.add( p );
                }
            }
            assert.deepStrictEqual(
                duplicates,
                [],
                `New PR patterns contain duplicates: ${ duplicates.join( ', ' ) }`
            );
        } );

        test( 'all new directory patterns end with a trailing slash', () => {
            // Directory patterns added in this PR should all end with `/` to be unambiguous.
            const NEW_DIRECTORY_PATTERNS = [
                '/docs/superpowers/',
                '/openspec/',
                '/.claude/commands/opsx/',
                '/.claude/skills/openspec-apply-change/',
                '/.claude/skills/openspec-archive-change/',
                '/.claude/skills/openspec-explore/',
                '/.claude/skills/openspec-propose/',
                '/.github/skills/openspec-apply-change/',
                '/.github/skills/openspec-archive-change/',
                '/.github/skills/openspec-explore/',
                '/.github/skills/openspec-propose/',
            ];

            for ( const pattern of NEW_DIRECTORY_PATTERNS ) {
                assert.ok(
                    pattern.endsWith( '/' ),
                    `Expected directory pattern "${ pattern }" to end with /`
                );
            }
        } );
    } );
} );