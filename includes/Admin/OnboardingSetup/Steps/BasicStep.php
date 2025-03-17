<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory as Factory;

class BasicStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string The step ID.
     */
    protected $id = 'basic';

    /**
     * The step priority.
     *
     * @var int The step priority.
     */
    protected int $priority = 1;

    /**
     * The storage key.
     *
     * @var string The storage key.
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_basic';

    /**
     * @inheritDoc
     */
    public function register(): void {
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
        $default_selling = [
            'shipping_fee_recipient'     => 'seller',
            'tax_fee_recipient'          => 'seller',
            'shipping_tax_fee_recipient' => 'seller',
            'order_status_change'        => 'on',
            'new_seller_enable_selling'  => 'on',
        ];

        $dokan_selling = get_option( 'dokan_selling', $default_selling );

        $this
            ->set_title( esc_html__( 'Basic', 'dokan-lite' ) )
            ->add(
                Factory::section( 'basic' )
                    ->set_title( esc_html__( 'Basic', 'dokan-lite' ) )
                    ->add(
                        Factory::field( 'shipping_fee_recipient', 'recipient_selector' )
                            ->set_title( esc_html__( 'Shipping Fee Recipient', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Choose who receives shipping charges - Admin keeps all shipping fees or Vendors receive fees for their products', 'dokan-lite' ) )
                            ->set_default( $dokan_selling['shipping_fee_recipient'] ?? $default_selling['shipping_fee_recipient'] )
                    )->add(
                        Factory::field( 'tax_fee_recipient', 'recipient_selector' )
                            ->set_title( esc_html__( 'Product Tax Fee Recipient', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Determine who collects product taxes - Admin manages all tax collection or Vendors handle their product taxes', 'dokan-lite' ) )
                            ->set_default( $dokan_selling['tax_fee_recipient'] ?? $default_selling['tax_fee_recipient'] )
                    )
                    ->add(
                        Factory::field( 'shipping_tax_fee_recipient', 'recipient_selector' )
                            ->set_title( esc_html__( 'Shipping Tax Fee Recipient', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Select who receives shipping tax - Admin centralizes all shipping tax or Vendors collect shipping tax for their orders', 'dokan-lite' ) )
                            ->set_default( $dokan_selling['shipping_tax_fee_recipient'] ?? $default_selling['shipping_tax_fee_recipient'] )
                    )
                    ->add(
                        Factory::field( 'order_status_change', 'switch' )
                            ->set_title( esc_html__( 'Vendors can change order status', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Allow vendors to update order statuses (processing, completed, etc.) for their products', 'dokan-lite' ) )
                            ->add_option( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                            ->add_option( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                            ->set_default( $dokan_selling['order_status_change'] ?? $default_selling['order_status_change'] )
                    )
                    ->add(
                        Factory::field( 'new_seller_enable_selling', 'switch' )
                            ->set_title( esc_html__( 'New Vendor Selling Directly', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Automatically enable selling capabilities for newly registered vendors', 'dokan-lite' ) )
                            ->add_option( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                            ->add_option( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                            ->set_default( $dokan_selling['new_seller_enable_selling'] ?? $default_selling['new_seller_enable_selling'] )
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
