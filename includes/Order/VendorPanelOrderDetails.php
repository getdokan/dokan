<?php

namespace WeDevs\Dokan\Order;

use Closure;
use ReflectionException;
use ReflectionFunction;
use ReflectionMethod;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Server-side markers for the Vendor panel order details route.
 *
 * The panel renders order details with one of two renderers: the first-party React
 * view, or the server-rendered fragment bridged over REST (ADR-0005). The server owns
 * that decision — third-party code hooked into the details template only renders in the
 * fragment, so those stores are sent there automatically — and publishes it, along with
 * the first-party section flags, through the panel's localized config.
 *
 * Everything here is additive: the fragment renderer, the legacy page and every #2133
 * contract stay untouched.
 *
 * @since DOKAN_SINCE
 */
class VendorPanelOrderDetails implements Hookable {

    /**
     * Renderer markers.
     *
     * @since DOKAN_SINCE
     */
    public const VIEW_REACT    = 'react';
    public const VIEW_FRAGMENT = 'fragment';

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_react_frontend_localized_args', [ $this, 'add_order_details_args' ] );
        add_filter( 'dokan_rest_api_class_map', [ $this, 'register_rest_controllers' ] );
    }

    /**
     * Publish the order-details markers to the Vendor panel.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args Localized args for the panel bundle.
     *
     * @return array
     */
    public function add_order_details_args( $args ): array {
        $args = is_array( $args ) ? $args : [];

        $existing = isset( $args['order_details'] ) && is_array( $args['order_details'] ) ? $args['order_details'] : [];

        $statuses = [];
        foreach ( wc_get_order_statuses() as $status_key => $status_label ) {
            $statuses[] = [
                'value' => $status_key,
                'label' => $status_label,
            ];
        }

        /**
         * Filters which first-party order-details sections the panel renders.
         *
         * Turning a flag off removes that section from the React view; the slot
         * around it still renders, so an extension can replace a section rather
         * than only hide it.
         *
         * @since DOKAN_SINCE
         *
         * @param array $sections Section id => enabled.
         */
        $sections = apply_filters(
            'dokan_vendor_panel_order_details_sections',
            [
                'notes'     => true,
                'downloads' => true,
            ]
        );

        /**
         * Filters the whole order-details marker payload for the Vendor panel.
         *
         * Pro modules and extensions append their section flags and any data
         * their panel bundle needs before the view mounts.
         *
         * @since DOKAN_SINCE
         *
         * @param array $payload Marker payload.
         */
        $args['order_details'] = apply_filters(
            'dokan_vendor_panel_order_details_args',
            array_merge(
                $existing,
                [
                    'view'                  => $this->get_view(),
                    /**
                     * Filters the statuses offered by the panel's status control.
                     *
                     * @since DOKAN_SINCE
                     *
                     * @param array $statuses List of `[ 'value' => ..., 'label' => ... ]`.
                     */
                    'statuses'              => apply_filters( 'dokan_vendor_panel_order_details_statuses', $statuses ),
                    'status_change_allowed' => 'on' === dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ),
                    'sections'              => $sections,
                ]
            )
        );

        return $args;
    }

    /**
     * Register the downloads REST controller.
     *
     * @since DOKAN_SINCE
     *
     * @param array $class_map Controller class map.
     *
     * @return array
     */
    public function register_rest_controllers( $class_map ): array {
        $class_map = is_array( $class_map ) ? $class_map : [];

        $class_map[ DOKAN_DIR . '/includes/REST/OrderDownloadController.php' ] = '\WeDevs\Dokan\REST\OrderDownloadController';

        return $class_map;
    }

    /**
     * Which renderer the Vendor panel uses for order details.
     *
     * Defaults to the fragment when third-party code hooks into the details template
     * (its output only renders there) or when the session is a Vendor staff member —
     * the fragment endpoint already grants staff the access the legacy page grants,
     * while the React view's data routes do not yet.
     *
     * @since DOKAN_SINCE
     *
     * @return string self::VIEW_REACT or self::VIEW_FRAGMENT.
     */
    public function get_view(): string {
        $default = self::VIEW_REACT;

        if ( $this->has_third_party_template_hooks() ) {
            $default = self::VIEW_FRAGMENT;
        }

        // A differing staff-aware id means the session acts for a Vendor it is not:
        // a Vendor staff login. Their data access is only guaranteed by the fragment.
        if ( get_current_user_id() !== dokan_get_current_user_id() ) {
            $default = self::VIEW_FRAGMENT;
        }

        /**
         * Filters which renderer the Vendor panel uses for order details.
         *
         * Best-effort third-party detection picks the default; this filter is the
         * guaranteed override in both directions.
         *
         * @since DOKAN_SINCE
         *
         * @param string $view 'react' or 'fragment'.
         */
        $view = apply_filters( 'dokan_vendor_panel_order_details_view', $default );

        return in_array( $view, [ self::VIEW_REACT, self::VIEW_FRAGMENT ], true ) ? $view : self::VIEW_FRAGMENT;
    }

    /**
     * Whether third-party code hooks into the order details template.
     *
     * The React view renders first-party sections only; a theme or plugin injecting
     * markup through the template's PHP hooks would silently lose it there. Detection
     * is best-effort — closures and reflection failures count as third-party so the
     * fallback errs toward compatibility.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function has_third_party_template_hooks(): bool {
        static $has_third_party = null;

        if ( null !== $has_third_party ) {
            return $has_third_party;
        }

        $template_hooks = [
            'dokan_order_detail_after_order_items',
            'dokan_order_details_after_customer_info',
            'dokan_order_detail_after_order_general_details',
            'dokan_order_detail_after_order_notes',
            'dokan_order_details_fragment_before',
            'dokan_order_details_fragment_after',
        ];

        $first_party_roots = [ dirname( DOKAN_FILE ) ];

        if ( defined( 'DOKAN_PRO_FILE' ) ) {
            $first_party_roots[] = dirname( DOKAN_PRO_FILE );
        }

        $has_third_party = false;

        foreach ( $template_hooks as $hook ) {
            if ( ! isset( $GLOBALS['wp_filter'][ $hook ] ) ) {
                continue;
            }

            foreach ( $GLOBALS['wp_filter'][ $hook ]->callbacks as $priority_callbacks ) {
                foreach ( $priority_callbacks as $callback ) {
                    if ( ! $this->is_first_party_callback( $callback['function'], $first_party_roots ) ) {
                        $has_third_party = true;

                        return $has_third_party;
                    }
                }
            }
        }

        return $has_third_party;
    }

    /**
     * Whether a hook callback is defined inside one of the given plugin roots.
     *
     * @since DOKAN_SINCE
     *
     * @param callable|mixed $callback          Registered hook callback.
     * @param string[]       $first_party_roots Absolute directories considered first-party.
     *
     * @return bool
     */
    protected function is_first_party_callback( $callback, array $first_party_roots ): bool {
        try {
            if ( is_string( $callback ) && function_exists( $callback ) ) {
                $reflection = new ReflectionFunction( $callback );
            } elseif ( is_array( $callback ) && 2 === count( $callback ) ) {
                $reflection = new ReflectionMethod( $callback[0], $callback[1] );
            } elseif ( $callback instanceof Closure ) {
                // A closure's origin is not reliably attributable — treat as third-party.
                return false;
            } elseif ( is_object( $callback ) && method_exists( $callback, '__invoke' ) ) {
                $reflection = new ReflectionMethod( $callback, '__invoke' );
            } else {
                return false;
            }
        } catch ( ReflectionException $e ) {
            return false;
        }

        $file = $reflection->getFileName();

        if ( ! $file ) {
            return false;
        }

        $file = wp_normalize_path( $file );

        foreach ( $first_party_roots as $root ) {
            if ( 0 === strpos( $file, trailingslashit( wp_normalize_path( $root ) ) ) ) {
                return true;
            }
        }

        return false;
    }
}
