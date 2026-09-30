<?php

namespace WeDevs\Dokan\Abilities\Definitions;

use Automattic\WooCommerce\Abilities\AbilityDefinition;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Base class for Dokan vendor-scoped ability definitions.
 *
 * Implements WooCommerce's public {@see AbilityDefinition} interface so the abilities can be
 * registered through the `woocommerce_ability_definition_classes` filter. Concrete subclasses
 * are only autoloaded when that filter runs, which only happens when WooCommerce 10.9+ (and its
 * Abilities API) is active — so referencing this base never fatals on older WooCommerce.
 *
 * Dokan abilities are inherently vendor-scoped: their callbacks resolve the current vendor via
 * dokan_get_current_user_id() and delegate to Dokan services that filter by that vendor.
 *
 * @since 5.0.15
 */
abstract class AbstractVendorAbility implements AbilityDefinition {

    /**
     * Resolve the current vendor ID (vendor staff resolve to their parent vendor).
     *
     * @since 5.0.15
     *
     * @return int
     */
    protected static function current_vendor_id(): int {
        return dokan_get_current_user_id();
    }

    /**
     * Whether the current user is a vendor.
     *
     * @since 5.0.15
     *
     * @return bool
     */
    public static function is_current_user_vendor(): bool {
        return dokan_is_user_seller( self::current_vendor_id() );
    }

    /**
     * Whether the current user is a store admin (administrator or shop manager).
     *
     * @since 5.0.15
     *
     * @return bool
     */
    public static function is_store_admin(): bool {
        return current_user_can( 'manage_woocommerce' );
    }

    /**
     * The Dokan capability a caller must hold to use this ability.
     *
     * An empty string means the ability needs no capability beyond being a vendor. Subclasses
     * override this to declare their own gate.
     *
     * @since 5.0.15
     *
     * @return string
     */
    protected static function required_capability(): string {
        return '';
    }

    /**
     * Clamp pagination input to the bounds every query ability shares.
     *
     * @since 5.0.15
     *
     * @param array $input Ability input.
     *
     * @return array{0: int, 1: int} Page (>= 1) and per-page (1–100).
     */
    protected static function pagination( array $input ): array {
        $page     = max( 1, (int) ( $input['page'] ?? 1 ) );
        $per_page = min( 100, max( 1, (int) ( $input['per_page'] ?? 10 ) ) );

        return [ $page, $per_page ];
    }

    /**
     * Shared permission callback: store admins pass; everyone else must be a vendor and hold the
     * ability's declared capability.
     *
     * Vendor staff resolve to their parent vendor for data scope but keep their own, narrower set
     * of `dokan_*` capabilities — so scope alone is not authorization. Without this check a staff
     * member reaches vendor data their assigned permissions exclude.
     *
     * @since 5.0.15
     *
     * @return bool
     */
    public static function check_permission(): bool {
        if ( self::is_store_admin() ) {
            return true;
        }

        if ( ! static::is_current_user_vendor() ) {
            return false;
        }

        $capability = static::required_capability();

        /**
         * Filters the capability required to use a Dokan ability.
         *
         * @since 5.0.15
         *
         * @param string $capability   Required capability, or an empty string for none.
         * @param string $ability_name The ability being checked.
         */
        $capability = (string) apply_filters(
            'dokan_ability_required_capability',
            $capability,
            static::get_name()
        );

        return '' === $capability || current_user_can( $capability );
    }

    /**
     * A standard "not a vendor" error.
     *
     * @since 5.0.15
     *
     * @return WP_Error
     */
    protected static function forbidden(): WP_Error {
        return new WP_Error(
            'dokan_ability_forbidden',
            __( 'You must be a vendor to perform this action.', 'dokan-lite' ),
            [ 'status' => 403 ]
        );
    }

    /**
     * Guard an execute callback.
     *
     * Repeats {@see self::check_permission()} inside `execute()` rather than trusting the
     * permission callback alone, because an ability's callbacks are public and reachable without
     * the Abilities API running its own permission pre-flight.
     *
     * @since 5.0.15
     *
     * @return WP_Error|null Error when the caller is not permitted, null otherwise.
     */
    protected static function guard(): ?WP_Error {
        return static::check_permission() ? null : self::forbidden();
    }

    /**
     * Base ability metadata shared by Dokan abilities.
     *
     * @since 5.0.15
     *
     * @param bool $is_readonly Whether the ability only reads data.
     *
     * @return array
     */
    protected static function base_meta( bool $is_readonly ): array {
        return [
            'show_in_rest' => true,
            'mcp'          => [
                'public' => true,
                'type'   => 'tool',
            ],
            'annotations'  => [
                'readonly'    => $is_readonly,
                'idempotent'  => $is_readonly,
                'destructive' => false,
            ],
        ];
    }
}
