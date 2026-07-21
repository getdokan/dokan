<?php

namespace WeDevs\Dokan\Order;

use WC_Order;
use WP;
use WP_Query;

/**
 * Renders the Vendor order details template as an HTML fragment.
 *
 * The Vendor panel is React, but order details stays server-rendered PHP so that every
 * Pro and third-party hook inside `templates/orders/details.php` keeps firing exactly as
 * it does on the legacy page. This class renders that template inside a simulated page
 * context and hands the markup — plus any render-time inline script data — to the caller.
 *
 * The page-level wrapper hooks from `templates/orders/orders.php`
 * (`dokan_dashboard_wrap_start`, `dokan_order_inside_content`, …) deliberately do NOT
 * fire here: they also render the PHP sidebar navigation and the status-filter bar, both
 * of which the Vendor panel already provides. That is a documented compatibility
 * boundary, not an oversight — see `docs/adr/0005-vendor-order-details-as-html-fragment.md`.
 *
 * @since DOKAN_SINCE
 */
class DetailsFragment {

    /**
     * Inline-script positions captured from the script registry.
     *
     * @since DOKAN_SINCE
     *
     * @var string[]
     */
    private const POSITIONS = [ 'before', 'after' ];

    /**
     * Render the order details template as a fragment.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order being rendered.
     *
     * @return array{html: string, inline_scripts: array<int, array{handle: string, position: string, code: string}>}
     */
    public function render( WC_Order $order ): array {
        $restore         = $this->simulate_request_context( $order->get_id() );
        $scripts_before  = $this->snapshot_inline_scripts();
        $buffering_level = ob_get_level();
        $html            = '';

        try {
            ob_start();

            /**
             * Fires before the Vendor order details fragment markup.
             *
             * Scoped to the fragment render only — it does not fire on the legacy
             * order details page.
             *
             * @since DOKAN_SINCE
             *
             * @param WC_Order $order Order being rendered.
             */
            do_action( 'dokan_order_details_fragment_before', $order );

            dokan_get_template_part( 'orders/details', '', [ 'order_id' => $order->get_id() ] );

            /**
             * Fires after the Vendor order details fragment markup.
             *
             * Scoped to the fragment render only — it does not fire on the legacy
             * order details page.
             *
             * @since DOKAN_SINCE
             *
             * @param WC_Order $order Order being rendered.
             */
            do_action( 'dokan_order_details_fragment_after', $order );

            $html = ob_get_clean();
        } finally {
            // Guarantee the buffer is popped and the request context is restored even if
            // a hooked callback throws.
            while ( ob_get_level() > $buffering_level ) {
                ob_end_clean();
            }

            $restore();
        }

        return [
            'html'           => $this->wrap( is_string( $html ) ? $html : '' ),
            'inline_scripts' => $this->diff_inline_scripts( $scripts_before, $this->snapshot_inline_scripts() ),
        ];
    }

    /**
     * Wrap the rendered template in the legacy content containers.
     *
     * Third-party CSS is written against the legacy page's class names, so the fragment
     * reproduces them rather than inventing new ones.
     *
     * @since DOKAN_SINCE
     *
     * @param string $html Rendered template output.
     *
     * @return string
     */
    private function wrap( string $html ): string {
        return '<div class="dokan-dashboard-wrap dokan-order-details-fragment">'
            . '<div class="dokan-dashboard-content dokan-orders-content">'
            . '<article class="dokan-orders-area">'
            . $html
            . '</article></div></div>';
    }

    /**
     * Make a REST request look like a legacy order details page render.
     *
     * Extension code was written against a page render: it asks whether it is on the
     * Vendor dashboard, reads the order id from the request, and verifies the order-view
     * nonce. Inside a REST request none of that is true, so guarded extension output
     * silently vanishes.
     *
     * Authorization has already been established by the endpoint's permission rule before
     * this runs, and CSRF protection is preserved at the outer layer by the REST nonce —
     * the fabricated nonce exists so that "verify or bail" extension code renders.
     *
     * @since DOKAN_SINCE
     *
     * @param int $order_id Order being rendered.
     *
     * @return callable Restores everything this method changed. Always call it.
     */
    private function simulate_request_context( int $order_id ): callable {
        global $wp, $wp_query;

        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        $get_backup      = $_GET;
        $request_backup  = $_REQUEST;
        $wp_vars_backup  = $wp instanceof WP ? $wp->query_vars : null;
        $query_backup    = $wp_query instanceof WP_Query ? $wp_query->query_vars : null;

        // dokan_is_seller_dashboard() compares the dashboard page id with `absint()` on
        // the left and an unfiltered value on the right, so this must return an int.
        $current_page_id = static function (): int {
            return absint( apply_filters( 'dokan_get_dashboard_page_id', dokan_get_option( 'dashboard', 'dokan_pages' ) ) );
        };

        add_filter( 'dokan_get_current_page_id', $current_page_id );

        // The `orders` endpoint is read from both WP::$query_vars (the dashboard
        // shortcode) and WP_Query (get_query_var()), so both are simulated.
        if ( $wp instanceof WP ) {
            $wp->query_vars['orders'] = '';
        }

        if ( $wp_query instanceof WP_Query ) {
            $wp_query->query_vars['orders'] = '';
        }

        $nonce = wp_create_nonce( 'dokan_view_order' );

        $_GET['order_id']     = $order_id;
        $_GET['_wpnonce']     = $nonce;
        $_REQUEST['order_id'] = $order_id;
        $_REQUEST['_wpnonce'] = $nonce;
        // phpcs:enable WordPress.Security.NonceVerification.Recommended

        return static function () use ( $get_backup, $request_backup, $wp_vars_backup, $query_backup, $current_page_id ) {
            global $wp, $wp_query;

            $_GET     = $get_backup; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $_REQUEST = $request_backup; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

            if ( null !== $wp_vars_backup && $wp instanceof WP ) {
                $wp->query_vars = $wp_vars_backup;
            }

            if ( null !== $query_backup && $wp_query instanceof WP_Query ) {
                $wp_query->query_vars = $query_backup;
            }

            remove_filter( 'dokan_get_current_page_id', $current_page_id );
        };
    }

    /**
     * Capture the inline data currently attached to every registered script handle.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, array{before: array, after: array, data: string}>
     */
    private function snapshot_inline_scripts(): array {
        $snapshot = [];

        foreach ( wp_scripts()->registered as $handle => $script ) {
            $extra = is_array( $script->extra ) ? $script->extra : [];

            $snapshot[ $handle ] = [
                'before' => isset( $extra['before'] ) ? (array) $extra['before'] : [],
                'after'  => isset( $extra['after'] ) ? (array) $extra['after'] : [],
                'data'   => isset( $extra['data'] ) ? (string) $extra['data'] : '',
            ];
        }

        return $snapshot;
    }

    /**
     * Work out which inline script data was added during the render.
     *
     * Only handles that are registered during a REST request can be captured, which is
     * why extension authors are told to register handles on `init` and enqueue them on
     * `wp_enqueue_scripts`.
     *
     * @since DOKAN_SINCE
     *
     * @param array $before Snapshot taken before the render.
     * @param array $after  Snapshot taken after the render.
     *
     * @return array<int, array{handle: string, position: string, code: string}>
     */
    private function diff_inline_scripts( array $before, array $after ): array {
        $delta = [];
        $empty = [
            'before' => [],
            'after'  => [],
            'data'   => '',
        ];

        foreach ( $after as $handle => $current ) {
            $previous = $before[ $handle ] ?? $empty;

            foreach ( self::POSITIONS as $position ) {
                $added = array_slice( $current[ $position ], count( $previous[ $position ] ) );

                foreach ( $added as $code ) {
                    if ( '' === trim( (string) $code ) ) {
                        continue;
                    }

                    $delta[] = [
                        'handle'   => (string) $handle,
                        'position' => $position,
                        'code'     => (string) $code,
                    ];
                }
            }

            // wp_localize_script() appends to one concatenated string rather than a list.
            $previous_length = strlen( $previous['data'] );

            if (
                strlen( $current['data'] ) > $previous_length
                && 0 === strncmp( $current['data'], $previous['data'], $previous_length )
            ) {
                $added = substr( $current['data'], $previous_length );

                if ( '' !== trim( $added ) ) {
                    $delta[] = [
                        'handle'   => (string) $handle,
                        'position' => 'before',
                        'code'     => $added,
                    ];
                }
            }
        }

        return $delta;
    }
}
