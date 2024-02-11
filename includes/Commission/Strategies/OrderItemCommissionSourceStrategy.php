<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\CommissionCalculatorFactory;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;
use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;

class OrderItemCommissionSourceStrategy implements CommissionSourceStrategyInterface {
    private $order_item_id;
    const SOURCE = 'order_item';

    public function __construct( $order_item_id ) {
        $this->order_item_id = $order_item_id;
    }

    public function get_commission_calculator(): ?CommissionCalculatorInterface {
        $commission_percentage = $this->order_item_id ? wc_get_order_item_meta( $this->order_item_id, '_dokan_commission_rate', true ) : '';
        $commission_type = $this->order_item_id ? wc_get_order_item_meta( $this->order_item_id, '_dokan_commission_type', true ) : '';
        $additional_flat  = $this->order_item_id ? wc_get_order_item_meta( $this->order_item_id, '_dokan_additional_fee', true ) : '';

        $settings = new CommissionSettings( $commission_type, $additional_flat, $commission_percentage );
        $commission_calculator = CommissionCalculatorFactory::createCalculator( $settings, 0 );

        if ( $commission_calculator && $commission_calculator->is_applicable() ) {
            return $commission_calculator;
        }

        return null;
    }

    public function get_source(): string {
        return self::SOURCE;
    }
}
