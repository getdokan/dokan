<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

use WeDevs\Dokan\Cache as BaseCache;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * @package WeDevs\Dokan\ReverseWithdrawal
 *
 * @since DOKAN_SINCE
 */
class Cache {

    /**
     * Class constructor
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        add_action( 'dokan_reverse_withdrawal_created', [ $this, 'clear_cache' ], 10, 1 );
    }

    /**
     * Clear cache
     *
     * @since DOKAN_SINCE
     *
     * @param array $data
     *
     * @return void
     */
    public function clear_cache( $data ) {
        BaseCache::invalidate_group( 'reverse_withdrawal' );
        if ( ! empty( $data['vendor_id'] ) ) {
            BaseCache::invalidate_group( "reverse_withdrawal_{$data['vendor_id']}" );
        }
    }

}
