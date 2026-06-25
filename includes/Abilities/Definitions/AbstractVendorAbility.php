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
 * @since DOKAN_SINCE
 */
abstract class AbstractVendorAbility implements AbilityDefinition {

    /**
     * Resolve the current vendor ID (vendor staff resolve to their parent vendor).
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    protected static function current_vendor_id(): int {
        return dokan_get_current_user_id();
    }

    /**
     * Whether the current user is a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_current_user_vendor(): bool {
        return dokan_is_user_seller( self::current_vendor_id() );
    }

    /**
     * A standard "not a vendor" error.
     *
     * @since DOKAN_SINCE
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
     * Base ability metadata shared by Dokan abilities.
     *
     * @since DOKAN_SINCE
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
