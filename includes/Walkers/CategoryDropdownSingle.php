<?php

namespace WeDevs\Dokan\Walkers;

use WeDevs\Dokan\Walkers\TaxonomyDropdown;

class CategoryDropdownSingle extends TaxonomyDropdown {

    private $post_id = '';

    /**
     * @see Walker::$db_fields
     * @var array
     */
    var $db_fields = array(
		'parent' => 'parent',
		'id' => 'term_id',
	);

    public function __construct( $post_id ) {
        $this->post_id = $post_id;
    }


    public function start_el( &$output, $category, $depth = 0, $args = array(), $id = 0 ) {
        if ( defined( 'DOKAN_PRO_PLUGIN_VERSION' ) && version_compare( DOKAN_PRO_PLUGIN_VERSION, '2.9.14', '<' ) ) {
            $commission_val  = dokan_get_seller_percentage( dokan_get_current_user_id(), $this->post_id, $category->term_id );
            $commission_type = dokan_get_commission_type( dokan_get_current_user_id(), $this->post_id, $category->term_id );
        } else {
            $commission_val = dokan()->commission->get_earning_by_product( $this->post_id );

            if ( is_wp_error( $commission_val ) ) {
                $commission_val = 0;
            }
        }

        $pad      = str_repeat( '&nbsp;', $depth * 3 );
        $cat_name = apply_filters( 'list_cats', $category->name, $category );
        $output   .= "\t<option class=\"level-$depth\" value=\"" . $category->term_id . '"';

        if ( defined( 'DOKAN_PRO_PLUGIN_VERSION' ) && version_compare( DOKAN_PRO_PLUGIN_VERSION, '2.9.14', '<' ) ) {
            $output .= ' data-commission="' . $commission_val . '" data-commission_type="' . $commission_type . '"';
        } else {
            $output .= ' data-commission="' . $commission_val . '" data-product-id="' . $this->post_id . '"';
        }

        if ( $category->term_id == $args['selected'] ) {
            $output .= ' selected="selected"';
        }

        $output .= '>';
        $output .= $pad . $cat_name;
        $output .= "</option>\n";
    }
}
