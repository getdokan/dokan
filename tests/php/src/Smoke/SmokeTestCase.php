<?php

namespace WeDevs\Dokan\Test\Smoke;

use ErrorException;
use Throwable;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Test\Helpers\PoisonWorld;
use WPDieException;

/**
 * Base class for the fatal smoke walkers.
 *
 * A walker runs many probes (one REST request, one page render, one background
 * handler) and must report every fatal in one run, not stop at the first. So a probe
 * never throws: it records the failure and the walk continues. The test then fails
 * once, with the full list.
 *
 * What counts as a failure: any `Throwable` that escapes the probe (TypeError,
 * ArgumentCountError, an uncaught exception), any PHP warning (on 7.4 the
 * `'' * 100` class is a warning; on 8 it is a TypeError), and anything the probe
 * itself flags, such as a 5xx REST status. Notices and deprecations are collected
 * and printed but do not fail the walk; they would need their own baseline first.
 *
 * `wp_die()` and `wp_redirect()` are controlled exits, not fatals. Both are turned
 * into exceptions so the probe returns instead of killing the process, and both
 * count as a pass.
 *
 * @since DOKAN_SINCE
 */
abstract class SmokeTestCase extends DokanTestCase {

    /**
     * @var array<int,array{label:string,error:string,where:string}>
     */
    protected array $failures = [];

    /**
     * @var array<int,array{label:string,error:string,where:string}>
     */
    protected array $notices = [];

    /**
     * Probes that ran, for the summary line.
     *
     * @var int
     */
    protected int $probe_count = 0;

    protected ?PoisonWorld $world = null;

    public function set_up() {
        parent::set_up();

        $this->failures    = [];
        $this->notices     = [];
        $this->probe_count = 0;

        add_filter( 'wp_redirect', [ $this, 'abort_redirect' ], 1 );
    }

    public function tear_down() {
        remove_filter( 'wp_redirect', [ $this, 'abort_redirect' ], 1 );

        parent::tear_down();
    }

    /**
     * Seed the poison world on top of the users the base class created.
     *
     * @return PoisonWorld
     */
    protected function seed_poison_world(): PoisonWorld {
        $world = new PoisonWorld( self::factory(), $this->admin_id, $this->customer_id, $this->seller_id1, $this->seller_id2 );

        // Seeding runs plugin code too (refund hooks, suborder splitting, withdraw
        // creation), so it is probed like everything else: a fatal here is a fatal
        // a customer's checkout or a vendor's withdraw request would hit.
        $this->probe(
            '[seed] PoisonWorld::seed()',
            function () use ( $world ) {
                $world->seed();

                return '';
            }
        );

        $this->world = $world;

        // The stale-option fixture bypasses the settings repositories; drop their snapshots.
        $this->flush_settings_caches();

        return $this->world;
    }

    /**
     * Turn a redirect into an exception so templates that redirect do not `exit` the run.
     *
     * @param string $location Redirect target.
     *
     * @return never
     *
     * @throws RedirectAttempted Always.
     */
    public function abort_redirect( $location ) {
        throw new RedirectAttempted( (string) $location );
    }

    /**
     * Run one probe and record what happened.
     *
     * @param string   $label Human-readable description, e.g. `[admin] GET /dokan/v1/orders`.
     * @param callable $probe Code under test. May return a string to flag a failure.
     *
     * @return void
     */
    protected function probe( string $label, callable $probe ): void {
        ++$this->probe_count;

        $buffer_level = ob_get_level();
        $current_user = get_current_user_id();

        // `_doing_it_wrong()` is how WordPress reports a call that only works by accident, such as
        // `wpdb::prepare()` given an object. The base test case fails on it without saying which
        // probe triggered it, so capture it here with the label and the nearest plugin frame.
        $doing_it_wrong = function ( $function_name, $message = '' ) use ( $label ): void {
            $this->failures[] = [
                'label' => $label,
                'error' => sprintf( '_doing_it_wrong(%s): %s', $function_name, wp_strip_all_tags( (string) $message ) ),
                'where' => $this->plugin_frame(),
            ];

            // Recorded with context above; keep the base class from reporting it again without any.
            unset( $this->caught_doing_it_wrong[ $function_name ] );
        };
        add_action( 'doing_it_wrong_run', $doing_it_wrong, 10, 2 );

        set_error_handler( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_set_error_handler
            function ( int $errno, string $errstr, string $errfile = '', int $errline = 0 ) use ( $label ): bool {
                if ( ! ( error_reporting() & $errno ) ) { // phpcs:ignore WordPress.PHP.DevelopmentFunctions.prevent_path_disclosure_error_reporting
                    return false; // Suppressed with @.
                }

                if ( in_array( $errno, [ E_NOTICE, E_USER_NOTICE, E_DEPRECATED, E_USER_DEPRECATED ], true ) ) {
                    $this->notices[] = [
                        'label' => $label,
                        'error' => $errstr,
                        'where' => $this->short_path( $errfile ) . ':' . $errline,
                    ];

                    return true;
                }

                throw new ErrorException( $errstr, 0, $errno, $errfile, $errline );
            }
        );

        try {
            $verdict = $probe();

            if ( is_string( $verdict ) && '' !== $verdict ) {
                $this->failures[] = [
                    'label' => $label,
                    'error' => $verdict,
                    'where' => '',
                ];
            }
        } catch ( RedirectAttempted $e ) {
            // A redirect is a controlled exit.
            unset( $e );
        } catch ( WPDieException $e ) {
            // wp_die() is a controlled exit.
            unset( $e );
        } catch ( Throwable $e ) {
            $this->failures[] = [
                'label' => $label,
                'error' => get_class( $e ) . ': ' . $e->getMessage(),
                'where' => $this->short_path( $e->getFile() ) . ':' . $e->getLine(),
            ];
        } finally {
            remove_action( 'doing_it_wrong_run', $doing_it_wrong, 10 );
            restore_error_handler();

            while ( ob_get_level() > $buffer_level ) {
                ob_end_clean();
            }

            wp_set_current_user( $current_user );
        }
    }

    /**
     * Fail once with every recorded failure, and print the notice summary.
     *
     * @param string $walk Name of the walk for the report header.
     *
     * @return void
     */
    protected function assert_no_fatals( string $walk ): void {
        $this->print_notices( $walk );

        if ( $this->world && $this->world->skipped() ) {
            $this->write( sprintf( "[%s] fixtures skipped: %s\n", $walk, wp_json_encode( $this->world->skipped() ) ) );
        }

        $this->assertGreaterThan( 0, $this->probe_count, sprintf( '[%s] walked nothing; the walker is miswired.', $walk ) );

        // Anything still here was raised outside a probe and would fail the test without context.
        foreach ( $this->caught_doing_it_wrong as $function_name => $message ) {
            $this->failures[] = [
                'label' => '[outside probes]',
                'error' => sprintf( '_doing_it_wrong(%s): %s', $function_name, wp_strip_all_tags( (string) $message ) ),
                'where' => '',
            ];
        }
        $this->caught_doing_it_wrong = [];

        if ( ! $this->failures ) {
            $this->write( sprintf( "[%s] %d probes, no fatals.\n", $walk, $this->probe_count ) );
            return;
        }

        $lines = [];
        foreach ( $this->failures as $failure ) {
            $lines[] = sprintf( '- %s -> %s%s', $failure['label'], $failure['error'], $failure['where'] ? ' @ ' . $failure['where'] : '' );
        }

        $this->fail(
            sprintf(
                "[%s] %d of %d probes fatalled:\n%s",
                $walk,
                count( $this->failures ),
                $this->probe_count,
                implode( "\n", $lines )
            )
        );
    }

    /**
     * @param string $walk Walk name.
     *
     * @return void
     */
    protected function print_notices( string $walk ): void {
        if ( ! $this->notices ) {
            return;
        }

        $this->write( sprintf( "[%s] %d notices/deprecations (set DOKAN_SMOKE_VERBOSE=1 to list).\n", $walk, count( $this->notices ) ) );

        if ( ! getenv( 'DOKAN_SMOKE_VERBOSE' ) ) {
            return;
        }

        $seen = [];
        foreach ( $this->notices as $notice ) {
            $key = $notice['error'] . '@' . $notice['where'];
            if ( isset( $seen[ $key ] ) ) {
                continue;
            }
            $seen[ $key ] = true;
            $this->write( sprintf( "  - %s -> %s @ %s\n", $notice['label'], $notice['error'], $notice['where'] ) );
        }
    }

    /**
     * @param string $text Text to print to the test runner's stderr.
     *
     * @return void
     */
    protected function write( string $text ): void {
        fwrite( STDERR, $text ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
    }

    /**
     * The nearest call-stack frame inside the plugin, as `file:line`.
     *
     * @return string Empty when no plugin frame is on the stack.
     */
    protected function plugin_frame(): string {
        $root = trailingslashit( TEST_DOKAN_PLUGIN_DIR );

        foreach ( debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 40 ) as $frame ) { // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
            $file = $frame['file'] ?? '';
            if ( str_starts_with( $file, $root ) && ! str_starts_with( $file, $root . 'tests/' ) && ! str_starts_with( $file, $root . 'vendor/' ) ) {
                return $this->short_path( $file ) . ':' . ( $frame['line'] ?? 0 );
            }
        }

        return '';
    }

    /**
     * @param string $path Absolute path.
     *
     * @return string Path relative to the plugin root when inside it.
     */
    protected function short_path( string $path ): string {
        $root = trailingslashit( TEST_DOKAN_PLUGIN_DIR );

        return str_starts_with( $path, $root ) ? substr( $path, strlen( $root ) ) : $path;
    }
}
