'use strict';

/**
 * Tests for .github/workflows/e2e_api_tests.yml changes in this PR.
 *
 * This PR reduced two timeout values to prevent runaway CI jobs:
 *  - e2e_tests job-level timeout: 45 → 30 minutes
 *  - "Run e2e tests" step timeout:  30 → 20 minutes
 *
 * The step timeout (20 min) is intentionally shorter than the job timeout
 * (30 min) to leave headroom for post-test reporting/cleanup steps.
 */

const { test, describe } = require( 'node:test' );
const assert = require( 'node:assert/strict' );
const { readFileSync, existsSync } = require( 'node:fs' );
const { join } = require( 'node:path' );

const REPO_ROOT = join( __dirname, '..', '..' );
const WORKFLOW_PATH = join( REPO_ROOT, '.github', 'workflows', 'e2e_api_tests.yml' );

/**
 * Reads the workflow YAML as a raw string.
 *
 * @returns {string}
 */
function readWorkflow() {
    return readFileSync( WORKFLOW_PATH, 'utf8' );
}

/**
 * Extracts all occurrences of `timeout-minutes: <value>` from the YAML.
 * Returns an array of numeric values in document order.
 *
 * @param {string} yaml
 * @returns {number[]}
 */
function extractTimeouts( yaml ) {
    const re = /timeout-minutes:\s*(\d+)/g;
    const results = [];
    let match;
    while ( ( match = re.exec( yaml ) ) !== null ) {
        results.push( parseInt( match[ 1 ], 10 ) );
    }
    return results;
}

/**
 * Returns the line number (1-based) and surrounding context of a pattern match.
 *
 * @param {string} yaml
 * @param {RegExp} pattern
 * @returns {{ lineNumber: number, line: string }[]}
 */
function findLines( yaml, pattern ) {
    const lines = yaml.split( '\n' );
    return lines.reduce( ( acc, line, idx ) => {
        if ( pattern.test( line ) ) {
            acc.push( { lineNumber: idx + 1, line: line.trim() } );
        }
        return acc;
    }, [] );
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe( 'e2e_api_tests.yml — Workflow Timeouts', () => {

    test( 'workflow file exists', () => {
        assert.ok(
            existsSync( WORKFLOW_PATH ),
            `Expected workflow file to exist at: ${ WORKFLOW_PATH }`
        );
    } );

    test( 'workflow file is non-empty', () => {
        const content = readWorkflow();
        assert.ok( content.trim().length > 0, 'Expected workflow file to be non-empty' );
    } );

    describe( 'e2e_tests job-level timeout', () => {

        test( 'e2e_tests job has timeout-minutes: 30', () => {
            const yaml = readWorkflow();

            // Find the e2e_tests job block and its timeout-minutes value.
            // We look for the job definition followed by its timeout field.
            const e2eJobMatch = yaml.match(
                /e2e_tests:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+timeout-minutes:\s*(\d+)/
            );

            assert.ok(
                e2eJobMatch,
                'Could not find timeout-minutes under the e2e_tests job definition'
            );

            const jobTimeout = parseInt( e2eJobMatch[ 1 ], 10 );
            assert.strictEqual(
                jobTimeout,
                30,
                `Expected e2e_tests job timeout-minutes to be 30, got ${ jobTimeout }`
            );
        } );

        test( 'e2e_tests job timeout is NOT the old value (45)', () => {
            const yaml = readWorkflow();
            const e2eJobMatch = yaml.match(
                /e2e_tests:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+timeout-minutes:\s*(\d+)/
            );
            if ( e2eJobMatch ) {
                const jobTimeout = parseInt( e2eJobMatch[ 1 ], 10 );
                assert.notEqual(
                    jobTimeout,
                    45,
                    'e2e_tests job timeout-minutes should have been reduced from 45 to 30'
                );
            }
        } );
    } );

    describe( '"Run e2e tests" step timeout', () => {

        test( 'run-e2e-tests step has timeout-minutes: 20', () => {
            const yaml = readWorkflow();

            // The step is identified by its id `e2e-test` and has a timeout-minutes field.
            const stepMatch = yaml.match(
                /id:\s*e2e-test\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+timeout-minutes:\s*(\d+)/
            );

            assert.ok(
                stepMatch,
                'Could not find timeout-minutes under the e2e-test step (id: e2e-test)'
            );

            const stepTimeout = parseInt( stepMatch[ 1 ], 10 );
            assert.strictEqual(
                stepTimeout,
                20,
                `Expected e2e-test step timeout-minutes to be 20, got ${ stepTimeout }`
            );
        } );

        test( 'run-e2e-tests step timeout is NOT the old value (30)', () => {
            const yaml = readWorkflow();
            const stepMatch = yaml.match(
                /id:\s*e2e-test\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+timeout-minutes:\s*(\d+)/
            );
            if ( stepMatch ) {
                const stepTimeout = parseInt( stepMatch[ 1 ], 10 );
                assert.notEqual(
                    stepTimeout,
                    30,
                    'e2e-test step timeout-minutes should have been reduced from 30 to 20'
                );
            }
        } );
    } );

    describe( 'Timeout relationship invariants', () => {

        test( 'step timeout (20) is shorter than job timeout (30)', () => {
            // The step must finish (and leave room for post-step work)
            // before the job-level timeout fires.
            const yaml = readWorkflow();

            const jobMatch = yaml.match(
                /e2e_tests:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+timeout-minutes:\s*(\d+)/
            );
            const stepMatch = yaml.match(
                /id:\s*e2e-test\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+timeout-minutes:\s*(\d+)/
            );

            if ( jobMatch && stepMatch ) {
                const jobTimeout  = parseInt( jobMatch[ 1 ], 10 );
                const stepTimeout = parseInt( stepMatch[ 1 ], 10 );
                assert.ok(
                    stepTimeout < jobTimeout,
                    `Step timeout (${ stepTimeout }) must be less than job timeout (${ jobTimeout })`
                );
            }
        } );

        test( 'all timeout-minutes values are positive integers', () => {
            const yaml = readWorkflow();
            const timeouts = extractTimeouts( yaml );
            assert.ok( timeouts.length > 0, 'Expected at least one timeout-minutes in the workflow' );
            for ( const t of timeouts ) {
                assert.ok(
                    Number.isInteger( t ) && t > 0,
                    `Expected all timeout-minutes to be positive integers, got: ${ t }`
                );
            }
        } );

        test( 'e2e_tests job timeout (30) is within reasonable CI bounds [1, 60]', () => {
            const yaml = readWorkflow();
            const jobMatch = yaml.match(
                /e2e_tests:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+timeout-minutes:\s*(\d+)/
            );
            if ( jobMatch ) {
                const jobTimeout = parseInt( jobMatch[ 1 ], 10 );
                assert.ok(
                    jobTimeout >= 1 && jobTimeout <= 60,
                    `e2e_tests job timeout ${ jobTimeout } is outside the expected [1, 60] minute range`
                );
            }
        } );

        test( 'run-e2e-tests step timeout (20) is within reasonable CI bounds [1, 60]', () => {
            const yaml = readWorkflow();
            const stepMatch = yaml.match(
                /id:\s*e2e-test\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+timeout-minutes:\s*(\d+)/
            );
            if ( stepMatch ) {
                const stepTimeout = parseInt( stepMatch[ 1 ], 10 );
                assert.ok(
                    stepTimeout >= 1 && stepTimeout <= 60,
                    `e2e-test step timeout ${ stepTimeout } is outside the expected [1, 60] minute range`
                );
            }
        } );
    } );

    describe( 'Workflow structural integrity', () => {

        test( 'workflow has a jobs section', () => {
            const yaml = readWorkflow();
            assert.ok(
                /^jobs:/m.test( yaml ),
                'Expected workflow to contain a top-level "jobs:" key'
            );
        } );

        test( 'e2e_tests job is defined', () => {
            const yaml = readWorkflow();
            assert.ok(
                yaml.includes( 'e2e_tests:' ),
                'Expected "e2e_tests:" job to be present in the workflow'
            );
        } );

        test( 'workflow references the e2e-test step id', () => {
            const yaml = readWorkflow();
            assert.ok(
                yaml.includes( 'id: e2e-test' ),
                'Expected step with id "e2e-test" to be present'
            );
        } );
    } );
} );
