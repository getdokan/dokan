<?php

namespace WeDevs\Dokan\Commission\Settings;

/**
 * Setting builder class.
 *
 * @since DOKAN_SINCE
 */
class Builder {

    const TYPE_ORDER_ITEM = 'order_item';
    const TYPE_GLOBAL = 'global';
    const TYPE_VENDOR = 'vendor';
    const TYPE_PRODUCT = 'product';

    /**
     * Builds setting for different strategies.
     *
     * @since DOKAN_SINCE
     *
     * @param string $type
     * @param        $param
     *
     * @return InterfaceSetting
     */
    public static function build( string $type, $param ): InterfaceSetting {
        switch ( $type ) {
            case self::TYPE_ORDER_ITEM:
                return new OrderItem( $param );
            case self::TYPE_GLOBAL:
                return new GlobalSetting( $param );
            case self::TYPE_VENDOR:
                return new Vendor( $param );
            case self::TYPE_PRODUCT:
                return new Product( $param );
            default:
                return new DefaultSetting();
        }
    }
}
