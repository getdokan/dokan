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
     * Override display_element method to add additional validation
     *
     * @param object $element           Data object.
     * @param array  $children_elements List of elements to continue traversing.
     * @param int    $max_depth         Max depth to traverse.
     * @param int    $depth             Depth of current element.
     * @param array  $args              An array of arguments.
     * @param string $output            Used to append additional content.
     */
    public function display_element( $element, &$children_elements, $max_depth, $depth, $args, &$output ) {
        // Validate element is an object before accessing properties
        if ( ! $element ) {
            return;
        }

        // Check if the required ID field exists
        $id_field = $this->db_fields['id'] ?? 0;
        if ( ! isset( $element->$id_field ) ) {
            return;
        }

        // Now call the parent method which will properly handle valid elements
        parent::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
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


        $taxonomy = isset( $category->taxonomy ) ? $category->taxonomy : '';

        if ( ! taxonomy_exists( $taxonomy ) ) {
            dokan_log( 'Taxonomy does not exist: ' . $taxonomy );
            return;
        }
        // Check if term_id exists
        if ( ! isset( $category->term_id ) ) {
            return;
        }

        $pad      = str_repeat( '&nbsp;&#8212;', $depth * 1 );
        $cat_name = apply_filters( 'list_cats', $category->name, $category );
        $output   .= "<option class=\"level-$depth\" value=\"" . $category->term_id . '"';

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


