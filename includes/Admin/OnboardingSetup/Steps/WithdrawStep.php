<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory as Factory;

class WithdrawStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string The step ID.
     */
    protected $id = 'withdraw';

    /**
     * The step priority.
     *
     * @var int The step priority.
     */
    protected int $priority = 30;

    /**
     * The storage key.
     *
     * @var string The storage key.
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_withdraw';

    protected $settings_options = [ 'dokan_withdraw' ];

    /**
     * @inheritDoc
     */
    public function register(): void {

        $data = [
            'currency' => dokan_get_container()->get( 'scripts' )->get_localized_price(),
        ];

        wp_localize_script(
            'dokan-admin-dashboard',
            'dokanWithdrawDashboard',
            $data,
        );
    }

    /**
     * @inheritDoc
     */
	public function scripts(): array {
		return [];
	}

	public function styles(): array {
		return [];
	}

	/**
	 * @inheritDoc
	 */
	public function describe_settings(): void {
        $default_methods = [
            'paypal' => 'paypal',
            'bank'   => '',
            'skrill' => '',
        ];

        $default_status = [ 'wc-completed' => 'wc-completed' ];

        $withdraw_status  = dokan_get_option( 'withdraw_order_status', 'dokan_withdraw', $default_status );
        $withdraw_limits  = dokan_get_option( 'withdraw_limit', 'dokan_withdraw', '50' );
        $withdraw_methods = dokan_get_option(
            'withdraw_methods',
            'dokan_withdraw',
            apply_filters( 'dokan_settings_withdraw_methods_default', $default_methods )
        );

        $this->set_title( esc_html__( 'Withdraw', 'dokan-lite' ) )
            ->add(
                Factory::section( 'withdraw' )
                        ->set_title( esc_html__( 'Withdraw', 'dokan-lite' ) )
                        ->add(
                            Factory::field( 'paypal', 'switch' )
                                    ->set_title( esc_html__( 'PayPal', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Enable PayPal for your vendor as a withdraw method', 'dokan-lite' ) )
                                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'paypal' )
                                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), '' )
                                    ->set_default( $default_methods['paypal'] )
                                    ->set_value( $withdraw_methods['paypal'] )
                        )
                        ->add(
                            Factory::field( 'bank', 'switch' )
                                    ->set_title( esc_html__( 'Bank Transfer', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Enable Bank Transfer for your vendor as a withdraw method', 'dokan-lite' ) )
                                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'bank' )
                                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), '' )
                                    ->set_default( $default_methods['bank'] )
                                    ->set_value( $withdraw_methods['bank'] )
                        )
                        ->add(
                            Factory::field( 'skrill', 'switch' )
                                    ->set_title( esc_html__( 'Skrill', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Enable Skrill for your vendor as a withdraw method', 'dokan-lite' ) )
                                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'skrill' )
                                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), '' )
                                    ->set_default( $default_methods['skrill'] )
                                    ->set_value( $withdraw_methods['skrill'] )
                        )
                        ->add(
                            Factory::field( 'withdraw_limit', 'currency' )
                                    ->set_title( esc_html__( 'Minimum Withdraw Limits', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Set the minimum balance required before vendors can request withdrawals', 'dokan-lite' ) )
                                    ->set_currency_symbol( get_woocommerce_currency_symbol() )
                                    ->set_default( $withdraw_limits )
                        )
                        ->add(
                            Factory::field( 'withdraw_order_status', 'multicheck' )
                                    ->set_title( esc_html__( 'Order Status for Withdraw', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Define which order status makes funds eligible for withdrawal', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Completed', 'dokan-lite' ), 'wc-completed' )
                                    ->add_option( esc_html__( 'Processing', 'dokan-lite' ), 'wc-processing' )
                                    ->add_option( esc_html__( 'On Hold', 'dokan-lite' ), 'wc-on-hold' )
                                    ->set_default( $withdraw_status )
                        )
            );
    }

    /**
     * @inheritDoc
     */
    public function settings(): array {
        return [];
    }

    /**
     * @inheritDoc
     */
    public function option_dispatcher( $data ): void {
        $default_settings = [
            'withdraw_order_status' => [ 'wc-completed' => 'wc-completed' ],
            'withdraw_limit'        => '50',
            'withdraw_methods'      => apply_filters(
                'dokan_settings_withdraw_methods_default',
                [
                    'paypal' => 'paypal',
                    'bank'   => '',
                    'skrill' => '',
                ]
            ),
        ];

        $dokan_appearance = get_option( 'dokan_withdraw', $default_settings );
        if ( ! empty( $data['withdraw']['withdraw_order_status'] ) ) { // Fill the order status key by value. (as per admin settings)
            $withdraw_order_status = array_combine( $data['withdraw']['withdraw_order_status'], $data['withdraw']['withdraw_order_status'] );
        }

        $dokan_appearance['withdraw_order_status']      = $withdraw_order_status ?? $default_settings['withdraw_order_status'];
        $dokan_appearance['withdraw_limit']             = $data['withdraw']['withdraw_limit'] ?? $default_settings['withdraw_limit'];
        $dokan_appearance['withdraw_methods']['bank']   = $data['withdraw']['bank'] ?? $default_settings['withdraw_methods']['bank'];
        $dokan_appearance['withdraw_methods']['paypal'] = $data['withdraw']['paypal'] ?? $default_settings['withdraw_methods']['paypal'];
        $dokan_appearance['withdraw_methods']['skrill'] = $data['withdraw']['skrill'] ?? $default_settings['withdraw_methods']['skrill'];

        update_option( 'dokan_withdraw', $dokan_appearance );
    }
}
