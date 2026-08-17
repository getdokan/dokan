<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

/**
 * Bridges one withdraw-method charge entry between the legacy and new shapes.
 *
 * Shape map:
 *   legacy: [ 'fixed' => 7.89, 'percentage' => 10.11 ]
 *   new:    [ 'admin_percentage' => '10.11', 'additional_fee' => '7.89' ]
 *
 * The legacy `dokan_withdraw.withdraw_charges` option is a parent array keyed
 * by method (`paypal`, `bank`, `dokan_stripe_express`, `skrill`,
 * `dokan_custom`, …). Each new field declares its own dotted `legacy_key`
 * pointing to one sub-path:
 *
 *   'legacy_key' => 'dokan_withdraw.withdraw_charges.paypal',
 *
 * The bridge resolves the path with {@see LegacyAddress::read_from} /
 * `write_to`, so a single transformer instance round-trips every method.
 *
 * Values are passed through unchanged on the values themselves — only the
 * key names are flipped (percentage ⇔ admin_percentage, fixed ⇔
 * additional_fee). The combine_input field stores strings (from the text
 * inputs), so this transformer doesn't coerce types and leaves rounding /
 * formatting to the consumer.
 *
 * @since DOKAN_SINCE
 */
final class WithdrawChargeTransformer implements TransformerInterface {

    /**
     * {@inheritDoc}
     *
     * @param array<string,mixed>|null $legacy_value
     */
    public function to_new( $legacy_value ) {
        $legacy = is_array( $legacy_value ) ? $legacy_value : [];
        return [
            'admin_percentage' => $legacy['percentage'] ?? '',
            'additional_fee'   => $legacy['fixed'] ?? '',
        ];
    }

    /**
     * {@inheritDoc}
     *
     * @return array<string,mixed>
     */
    public function to_legacy( $new_value ) {
        $new = is_array( $new_value ) ? $new_value : [];
        return [
            'percentage' => $new['admin_percentage'] ?? '',
            'fixed'      => $new['additional_fee'] ?? '',
        ];
    }
}
