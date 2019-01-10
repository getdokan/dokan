<?php

include_once DOKAN_LIB_DIR.'/class.taxonomy-walker.php';

class DokanCategoryWalker extends DokanTaxonomyWalker {

    private $post_id = '';

    function __construct( $post_id )  {
        // fetch the list of term ids for the given post
        $this->post_id = $post_id;
    }

    /**
     * @see Walker::$db_fields
     * @var array
     */
    var $db_fields = array('parent' => 'parent', 'id' => 'term_id');


    function start_el( &$output, $category, $depth = 0, $args = array(), $id = 0 ) {

        $commission_val = dokan_get_seller_percentage( dokan_get_current_user_id(), $this->post_id, $category->term_id );
        $commission_type = dokan_get_commission_type( dokan_get_current_user_id(), $this->post_id, $category->term_id );

        $pad      = str_repeat( '&nbsp;', $depth * 3 );
        $cat_name = apply_filters( 'list_cats', $category->name, $category );

        $output .= "\t<option class=\"level-$depth\" value=\"" . $category->term_id . "\"";
        $output .= ' data-commission="' . $commission_val . '" data-commission_type="' . $commission_type . '"';
        if ( $category->term_id == $args['selected'] )
            $output .= ' selected="selected"';
        $output .= '>';
        $output .= $pad . $cat_name;
        $output .= "</option>\n";
    }

}
