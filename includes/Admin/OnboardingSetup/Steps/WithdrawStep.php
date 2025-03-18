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

    /**
     * @inheritDoc
     */
	public function register(): void {}

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

        $default_status = [
            'wc-completed'  => 'wc-completed',
            'wc-processing' => '',
            'wc-on-hold'    => '',
        ];

        $withdraw_status  = dokan_get_option( 'withdraw_order_status', 'dokan_withdraw', $default_status );
        $withdraw_limits  = dokan_get_option( 'withdraw_limit', 'dokan_withdraw', '50' );
        $withdraw_methods = dokan_get_option(
            'withdraw_methods',
            'dokan_withdraw',
            apply_filters( 'dokan_settings_withdraw_methods_default', $default_methods )
        );

        $this->set_title( esc_html__( 'Withdraw', 'dokan-lite' ) )
             ->add(
                 Factory::section( 'withdraw-methods' )
                     ->set_title( esc_html__( 'Withdraw', 'dokan-lite' ) )
                     ->add(
                         Factory::field( 'paypal', 'switch' )
                             ->set_title( esc_html__( 'PayPal', 'dokan-lite' ) )
                             ->set_description( esc_html__( 'Enable PayPal for your vendor as a withdraw method', 'dokan-lite' ) )
                             ->add_option( esc_html__( 'Enabled', 'dokan-lite' ), 'paypal' )
                             ->add_option( esc_html__( 'Disabled', 'dokan-lite' ), '' )
                             ->set_default( $withdraw_methods['paypal'] ?? $default_methods['paypal'] )
                     )
                     ->add(
                         Factory::field( 'bank', 'switch' )
                             ->set_title( esc_html__( 'Bank Transfer', 'dokan-lite' ) )
                             ->set_description( esc_html__( 'Enable Bank Transfer for your vendor as a withdraw method', 'dokan-lite' ) )
                             ->add_option( esc_html__( 'Enabled', 'dokan-lite' ), 'bank' )
                             ->add_option( esc_html__( 'Disabled', 'dokan-lite' ), '' )
                             ->set_default( $withdraw_methods['bank'] ?? $default_methods['bank'] )
                     )
                     ->add(
                         Factory::field( 'skrill', 'switch' )
                             ->set_title( esc_html__( 'Skrill', 'dokan-lite' ) )
                             ->set_description( esc_html__( 'Enable Skrill for your vendor as a withdraw method', 'dokan-lite' ) )
                             ->add_option( esc_html__( 'Enabled', 'dokan-lite' ), 'skrill' )
                             ->add_option( esc_html__( 'Disabled', 'dokan-lite' ), '' )
                             ->set_default( $withdraw_methods['skrill'] ?? $default_methods['skrill'] )
                     )
                     ->add(
                         Factory::field( 'withdraw_limit', 'number' )
                             ->set_title( esc_html__( 'Minimum Withdraw Limits', 'dokan-lite' ) )
                             ->set_description( esc_html__( 'Set the minimum balance required before vendors can request withdrawals', 'dokan-lite' ) )
                             ->set_prefix( get_woocommerce_currency_symbol() )
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

	public function settings(): array {
		return [];
	}

    /**
     * @inheritDoc
     */
    public function option_dispatcher( $data ): void {
        parent::option_dispatcher( $data );
        // TODO: Implement option_dispatcher() method.
    }
}
