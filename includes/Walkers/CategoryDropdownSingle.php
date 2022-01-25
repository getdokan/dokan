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
        'id'     => 'term_id',
    );

    public function __construct( $post_id ) {
        $this->post_id = $post_id;
    }


    public function start_el( &$output, $category, $depth = 0, $args = array(), $id = 0 ) {
        $pad      = str_repeat( '&nbsp;&#8212;', $depth * 1 );
        $cat_name = apply_filters( 'list_cats', $category->name, $category );
        $output   .= "\t<option class=\"level-$depth\" value=\"" . $category->term_id . '"';

        if ( $category->term_id == $args['selected'] ) {
            $output .= ' selected="selected"';
        }

        $output .= '>';
        $output .= $pad . ' ' . $cat_name;
        $output .= "</option>\n";
    }
}
