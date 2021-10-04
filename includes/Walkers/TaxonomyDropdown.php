<?php

namespace WeDevs\Dokan\Walkers;

use Walker;

class TaxonomyDropdown extends Walker {

    /**
     * @see Walker::$tree_type
     *
     * @var string
     */
    public $tree_type = 'category';

    /**
     * @see Walker::$db_fields
     *
     * @var array
     */
    public $db_fields = [
        'parent' => 'parent',
        'id'     => 'term_id',
    ];

    /**
     * Post id
     *
     * @var int
     */
    private $post_id = '';

    /**
     * Constructor method
     *
     * @param int $post_id
     */
    public function __construct( $post_id = 0 ) {
        $this->post_id = $post_id;
    }

    /**
     * Start element
     *
     * @param string $output
     * @param object $category
     * @param int    $depth
     * @param array  $args
     * @param int    $id
     *
     * @return void
     */
    public function start_el( &$output, $category, $depth = 0, $args = [], $id = 0 ) {
        if ( defined( 'DOKAN_PRO_PLUGIN_VERSION' ) && version_compare( DOKAN_PRO_PLUGIN_VERSION, '2.9.14', '<' ) ) {
            $commission_val  = dokan_get_seller_percentage( dokan_get_current_user_id(), $this->post_id, $category->term_id );
            $commission_type = dokan_get_commission_type( dokan_get_current_user_id(), $this->post_id, $category->term_id );
        } else {
            $commission_val = dokan()->commission->get_earning_by_product( $this->post_id );

            if ( is_wp_error( $commission_val ) ) {
                $commission_val = 0;
            }
        }

        $pad      = str_repeat( '&nbsp;&#8212;', $depth * 1 );
        $cat_name = apply_filters( 'list_cats', $category->name, $category );
        $output .= "<option class=\"level-$depth\" value=\"" . $category->term_id . '"';

        if ( defined( 'DOKAN_PRO_PLUGIN_VERSION' ) && version_compare( DOKAN_PRO_PLUGIN_VERSION, '2.9.14', '<' ) ) {
            $output .= ' data-commission="' . $commission_val . '" data-commission_type="' . $commission_type . '"';
        } else {
            $output .= ' data-commission="' . $commission_val . '" data-product-id="' . $this->post_id . '"';
        }

        $selected = is_array( $args['selected'] ) ? $args['selected'] : (array) $args['selected'];
        $selected = array_map( 'intval', $selected );

        if ( in_array( $category->term_id, $selected, true ) ) {
            $output .= ' selected="selected"';
        }

        $output .= '>';
        $output .= $pad . ' ' . $cat_name;

        if ( $args['show_count'] ) {
            $output .= '&nbsp;&nbsp;(' . $category->count . ')';
        }

        $output .= "</option>\n";
    }
}
