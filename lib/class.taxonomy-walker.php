<?php

use WeDevs\Dokan\Walkers\TaxonomyDropdown;

/**
 *  Dokan Product category Walker Class
 *  @author weDevs
 */
class DokanTaxonomyWalker extends TaxonomyDropdown {

    /**
     * Constructor method
     *
     * @param int $post_id
     */
    public function __construct( $post_id = '' )  {
        // dokan_doing_it_wrong( self::class, __( 'Use `WeDevs\Dokan\Walkers\TaxonomyDropdown` instead.', 'dokan-lite' ), 'Dokan:3.0.0' );
        parent::__construct( $post_id );
    }
}
