<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Vendor\Settings\Schema\SetupWizardSchema;
use WeDevs\Dokan\Vendor\Settings\WizardStoreSaver;
use WeDevs\Dokan\Vendor\SetupWizardCompat;
use WP_REST_Server;

/**
 * Vendor Onboarding (setup wizard) REST controller.
 *
 * The wizard's store step saves here instead of the legacy `$_POST` pipeline.
 * Inherits the whole validate/sanitize pipeline from the Store settings
 * controller and swaps three axes: the schema (SetupWizardSchema — wizard
 * gates, address always present), the persistence (WizardStoreSaver — Seam A
 * suppressed, Seam B intact, legacy wizard action re-fired via the compat
 * shim), and the permission (see check_permission()).
 *
 * @since DOKAN_SINCE
 */
class VendorOnboardingController extends VendorStoreSettingsController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'vendor-onboarding';

    /**
     * The wizard step being served.
     *
     * @var string
     */
    protected string $step = 'store';

    /**
     * Register REST routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<step>store|payment)',
            [
                'args' => [
                    'step' => [
                        'description' => __( 'The wizard step the values belong to.', 'dokan-lite' ),
                        'type'        => 'string',
                        'enum'        => [ 'store', 'payment' ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'values' => [
                            'description' => __( 'Flat key-value map of field values keyed by field id.', 'dokan-lite' ),
                            'type'        => 'object',
                            'required'    => true,
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * GET handler — pins the step before delegating to the shared pipeline.
     *
     * @since DOKAN_SINCE
     *
     * @param \WP_REST_Request $request Request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_items( $request ) {
        $this->step = (string) ( $request['step'] ?? 'store' );

        return parent::get_items( $request );
    }

    /**
     * PUT handler — pins the step before delegating to the shared pipeline.
     *
     * @since DOKAN_SINCE
     *
     * @param \WP_REST_Request $request Request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item( $request ) {
        $this->step = (string) ( $request['step'] ?? 'store' );

        return parent::update_item( $request );
    }

    /**
     * Permission check — wizard parity for Vendors, dashboard parity for
     * Vendor Staff.
     *
     * A Vendor needs only `dokandar`, the floor every seller-role user has:
     * the legacy wizard gates on login alone, and onboarding must not lock a
     * Vendor out. Vendor Staff resolve to their Vendor's store, so they also
     * need the dashboard capability that guards the same fields — the store
     * settings menu for the store step, the payment menu for payout details.
     * Tightening the legacy page itself is tracked separately
     * (plugin-internal-tasks#2130, open question 3).
     *
     * @since DOKAN_SINCE
     *
     * @param \WP_REST_Request|null $request Request object.
     *
     * @return bool
     */
    public function check_permission( $request = null ) {
        if ( ! current_user_can( 'dokandar' ) ) {
            return false;
        }

        if ( ! current_user_can( 'vendor_staff' ) ) {
            return true;
        }

        // Runs before the handlers pin $this->step, so the step comes from the route.
        $step = $request instanceof \WP_REST_Request ? (string) $request['step'] : 'store';

        return current_user_can( 'payment' === $step ? 'dokan_view_store_payment_menu' : 'dokan_view_store_settings_menu' );
    }

    /**
     * Validate/sanitize against the wizard's own step schema.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return array Flat schema elements.
     */
    protected function get_input_schema( int $vendor_id ): array {
        return 'payment' === $this->step
            ? SetupWizardSchema::get_payment_schema( $vendor_id )
            : SetupWizardSchema::get_schema( $vendor_id );
    }

    /**
     * Build the wizard step schema response for a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return array
     */
    protected function get_response_schema( int $vendor_id ): array {
        $schema = $this->get_input_schema( $vendor_id );

        /**
         * Filter the setup wizard step REST response.
         *
         * @since DOKAN_SINCE
         *
         * @param array  $schema    Flat schema elements with values.
         * @param int    $vendor_id Vendor user ID.
         * @param string $step      Wizard step being served.
         */
        $schema = apply_filters( 'dokan_rest_vendor_onboarding_response', $schema, $vendor_id, $this->step );

        // Same as the Store settings response: server-side hooks never leave the server.
        foreach ( array_keys( $schema ) as $index ) {
            unset( $schema[ $index ]['sanitize_callback'], $schema[ $index ]['validation_func'] );
        }

        return $schema;
    }

    /**
     * Keep only the gateways and field keys the payment step declares.
     *
     * Everything under `payment` is read by the withdraw code and the gateway
     * modules, so a key the step never rendered (another gateway's connection
     * data, a nested array where a string belongs) must not reach it.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field The field schema element.
     * @param mixed $value The raw submitted value.
     *
     * @return mixed Sanitized value.
     */
    protected function sanitize_field_value( array $field, $value ) {
        $value = parent::sanitize_field_value( $field, $value );

        if ( 'payment_methods' !== ( $field['variant'] ?? '' ) ) {
            return $value;
        }

        $value = (array) $value;
        $clean = [];

        foreach ( (array) ( $field['gateways'] ?? [] ) as $gateway ) {
            $gateway_id = (string) ( $gateway['id'] ?? '' );
            $keys       = wp_list_pluck( (array) ( $gateway['fields'] ?? [] ), 'key' );

            if ( ! empty( $gateway['declaration'] ) ) {
                $keys[] = 'declaration';
            }

            // Connect-only rows declare no fields, so nothing of theirs is saved here.
            if ( '' === $gateway_id || empty( $keys ) || ! isset( $value[ $gateway_id ] ) || ! is_array( $value[ $gateway_id ] ) ) {
                continue;
            }

            foreach ( $keys as $key ) {
                if ( isset( $value[ $gateway_id ][ $key ] ) && is_scalar( $value[ $gateway_id ][ $key ] ) ) {
                    $clean[ $gateway_id ][ $key ] = $value[ $gateway_id ][ $key ];
                }
            }
        }

        return $clean;
    }

    /**
     * Persist through the wizard saver (Seam A suppressed, Seam B intact),
     * then replay both post-save seams: the modern flat-array action and the
     * legacy wizard action with its instance + `$_POST` bag expectations.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id    Vendor user ID.
     * @param array $sanitized    Sanitized values keyed by field id.
     * @param array $fields_by_id Schema field elements keyed by id.
     *
     * @return void
     */
    protected function persist( int $vendor_id, array $sanitized, array $fields_by_id ): void {
        if ( 'payment' === $this->step ) {
            $this->persist_payment( $vendor_id, $sanitized, $fields_by_id );
            return;
        }

        parent::persist( $vendor_id, $sanitized, $fields_by_id );

        ( new SetupWizardCompat() )->fire_store_save_action( $vendor_id, $sanitized, $fields_by_id );
    }

    /**
     * The wizard writes through WizardStoreSaver — Seam A stays suppressed and
     * the legacy address-completion math replays (see plugin-internal-tasks#2130).
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id Vendor user ID.
     * @param array $slice     Legacy-shaped profile slice.
     *
     * @return void
     */
    protected function save_slice( int $vendor_id, array $slice ): void {
        ( new WizardStoreSaver() )->save( $vendor_id, $slice );
    }

    /**
     * Persist the payment step: fold gateway values into the nested
     * `payment` array (merging over untouched gateway keys), award the legacy
     * profile-completion weight, and fire Seam B through the writer — which
     * the legacy payment save never did, leaving the vendor cache stale.
     *
     * The legacy payment action is replayed with the nested `settings` bag
     * Pro's handlers read (`$_POST['settings']['skrill']['email']`, …).
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id    Vendor user ID.
     * @param array $sanitized    Sanitized values keyed by field id.
     * @param array $fields_by_id Schema field elements keyed by id.
     *
     * @return void
     */
    protected function persist_payment( int $vendor_id, array $sanitized, array $fields_by_id ): void {
        $methods = (array) ( $sanitized['payment_methods'] ?? [] );

        if ( ! empty( $methods ) ) {
            $prev    = get_user_meta( $vendor_id, 'dokan_profile_settings', true );
            $prev    = is_array( $prev ) ? $prev : [];
            $payment = isset( $prev['payment'] ) && is_array( $prev['payment'] ) ? $prev['payment'] : [];

            foreach ( $methods as $gateway_id => $gateway_values ) {
                $gateway_values = (array) $gateway_values;

                // Store the attestation in the legacy 'on' shape the dashboard form, its validation and the withdraw-log export all read.
                if ( array_key_exists( 'declaration', $gateway_values ) ) {
                    $gateway_values['declaration'] = empty( $gateway_values['declaration'] ) ? '' : 'on';
                }

                $existing                = isset( $payment[ $gateway_id ] ) && is_array( $payment[ $gateway_id ] ) ? $payment[ $gateway_id ] : [];
                $payment[ $gateway_id ] = array_merge( $existing, $gateway_values );
            }

            $slice = [ 'payment' => $payment ];
            $slice = $this->award_payment_completion( $slice, $prev, $methods );

            // Not WizardStoreSaver: its address-completion replay would re-add the address weight on every payment save.
            $this->writer->save( $vendor_id, $slice, [ 'apply_settings_args_filter' => false ] );
        }

        /** This action is documented in includes/REST/VendorStoreSettingsController.php */
        do_action( 'dokan_after_saving_vendor_settings', $vendor_id, $sanitized, $fields_by_id );

        ( new SetupWizardCompat() )->fire_payment_save_action( $vendor_id, $methods );
    }

    /**
     * Replicates the legacy payment-step profile-completion math — bank wins
     * over PayPal, the winner takes `payment_method_val` — but awards the
     * progress bump only when the weight wasn't already counted (the legacy
     * handler re-added it on every save). With Pro active, its Seam B
     * recompute overwrites this with the canonical calculation anyway.
     *
     * @since DOKAN_SINCE
     *
     * @param array $slice   The payment slice being written.
     * @param array $prev    The vendor's current profile settings.
     * @param array $methods Sanitized gateway values keyed by gateway id.
     *
     * @return array The slice with profile_completion folded in.
     */
    protected function award_payment_completion( array $slice, array $prev, array $methods ): array {
        $completion = isset( $prev['profile_completion'] ) && is_array( $prev['profile_completion'] ) ? $prev['profile_completion'] : [];

        if ( empty( $completion['progress_vals']['payment_method_val'] ) ) {
            return $slice;
        }

        $weight   = (int) $completion['progress_vals']['payment_method_val'];
        $required = array_keys( (array) dokan_bank_payment_required_fields() );
        $bank     = (array) ( $methods['bank'] ?? [] );

        $bank_complete = ! empty( $bank ) && array_reduce(
            $required,
            static function ( $complete, $key ) use ( $bank ) {
                return $complete && '' !== trim( (string) ( $bank[ $key ] ?? '' ) );
            },
            true
        );

        $paypal_set = '' !== trim( (string) ( $methods['paypal']['email'] ?? '' ) );

        if ( ! $bank_complete && ! $paypal_set ) {
            return $slice;
        }

        $already_awarded = ! empty( $completion['bank'] ) || ! empty( $completion['paypal'] );

        if ( $bank_complete ) {
            $completion['bank']   = $weight;
            $completion['paypal'] = 0;
        } else {
            $completion['paypal'] = $weight;
            $completion['bank']   = 0;
        }

        if ( ! $already_awarded ) {
            $completion['progress'] = (int) ( $completion['progress'] ?? 0 ) + $weight;
        }

        $slice['profile_completion'] = $completion;

        return $slice;
    }
}
