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

        if ( $depth == 1 ) {
            $output .= $indent . '<div class="sub-block">' . "\n\t" .'<h3><a href="' . $url . '">' . $category->name . '</a></h3>' . "\n";
        } else {
            $caret = $args['has_children'] ? ' <span class="caret"></span>' : '';
            $class_name = $args['has_children'] ? ' class="has-children"' : '';
            $output .= $indent . '<li' . $class_name . '><a href="' . $url . '">' . $category->name . $caret . '</a>';
        }
    }
}
