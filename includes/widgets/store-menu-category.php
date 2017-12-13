<?php

/**
 * Category walker for generating dokan store category
 */
class Dokan_Store_Category_Walker extends Dokan_Category_Walker {

    function __construct( $seller_id ) {
        $this->store_url = dokan_get_store_url ( $seller_id );
    }

    function start_el( &$output, $category, $depth = 0, $args = array(), $id = 0 ) {
        extract( $args );
        $indent = str_repeat( "\t", $depth );

        $url = $this->store_url . 'section/' . $category->term_id;
        $selected_cat = get_query_var( 'term' );
        $a_selected_class = $selected_cat == $category->term_id ? 'class="selected"' : '';

        if ( $depth == 0 ) {
            $caret = $args['has_children'] ? ' <span class="caret-icon"><i class="fa fa-angle-right" aria-hidden="true"></i></span>' : '';
            $class_name = $args['has_children'] ? ' class="has-children parent-cat-wrap"' : ' class="parent-cat-wrap"';
            $output .= $indent . '<li' . $class_name . '>' . "\n\t" .'<a href="' . $url . '"'. $a_selected_class .'>' . $category->name . $caret . '</a>' . "\n";
        } else {
            $caret = $args['has_children'] ? ' <span class="caret-icon"><i class="fa fa-angle-right" aria-hidden="true"></i></span>' : '';
            $class_name = $args['has_children'] ? ' class="has-children"' : '';
            $output .= $indent . '<li' . $class_name . '><a href="' . $url . '"'.$a_selected_class.'>' . $category->name . $caret . '</a>';
        }
    }
}
