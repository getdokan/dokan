<?php

namespace WeDevs\Dokan\Walkers;

use Walker;

class Category extends Walker {
    public $tree_type = 'category';

    public $db_fields = [
		'parent' => 'parent',
		'id' => 'term_id',
	]; //TODO: decouple this

    public function start_lvl( &$output, $depth = 0, $args = [] ) {
        $indent = str_repeat( "\t", $depth );

        if ( $depth === 0 ) {
            $output .= $indent . '<ul class="children level-' . $depth . '">' . "\n";
        } else {
            $output .= "$indent<ul class='children level-$depth'>\n";
        }
    }

    public function end_lvl( &$output, $depth = 0, $args = [] ) {
        $indent = str_repeat( "\t", $depth );

        if ( $depth === 0 ) {
            $output .= "$indent</ul> <!-- .sub-category -->\n";
        } else {
            $output .= "$indent</ul>\n";
        }
    }

    public function start_el( &$output, $category, $depth = 0, $args = [], $id = 0 ) {
        extract( $args );
        $indent = str_repeat( "\t\r", $depth );

        if ( $depth === 0 ) {
            $caret      = $args['has_children'] ? ' <span class="caret-icon"><i class="fa fa-angle-right" aria-hidden="true"></i></span>' : '';
            $class_name = $args['has_children'] ? ' class="has-children parent-cat-wrap"' : ' class="parent-cat-wrap"';
            $output .= $indent . '<li' . $class_name . '><a href="' . get_term_link( $category ) . '">' . $category->name . $caret . '</a>' . "\n";
        } else {
            $caret      = $args['has_children'] ? ' <span class="caret-icon"><i class="fa fa-angle-right" aria-hidden="true"></i></span>' : '';
            $class_name = $args['has_children'] ? ' class="has-children"' : '';
            $output .= $indent . '<li' . $class_name . '><a href="' . get_term_link( $category ) . '">' . $category->name . $caret . '</a>';
        }
    }

    public function end_el( &$output, $category, $depth = 0, $args = [] ) {
        $indent = str_repeat( "\t", $depth );

        if ( $depth === 1 ) {
            $output .= "$indent</li><!-- .sub-block -->\n";
        } else {
            $output .= "$indent</li>\n";
        }
    }
}
