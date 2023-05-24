<?php
namespace WeDevs\Dokan\ProductCategory;

use WeDevs\Dokan\Cache;

class Categories {

    /**
     * @var array
     *
     * @since 3.6.2
     */
    private $categories = [];

    /**
     * This method will return all the categories
     *
     * @since 3.6.4
     *
     * @return void|array
     */
    public function get_all_categories( $ret = false ) {
        $transient_key = function_exists( 'wpml_get_current_language' ) && ! empty( wpml_get_current_language() ) ? 'multistep_categories_' . wpml_get_current_language() : 'multistep_categories';

        $this->categories = Cache::get_transient( $transient_key );

        if ( false === $this->categories ) {
            //calculate category data
            $this->get_categories();
            // set category data to cache
            Cache::set_transient( $transient_key, $this->categories, '', MONTH_IN_SECONDS );
        }

        if ( $ret ) {
            return $this->categories;
        }
    }

    /**
     * This method will return category data
     *
     * @sience 3.6.2
     *
     * @return array
     */
    public function get() {
        // check if categories are already loaded
        return apply_filters( 'dokan_multistep_product_categories', $this->get_all_categories( true ) );
    }

    /**
     * Sets categories.
     *
     * @since 3.7.0
     *
     * @param array $categories
     *
     * @return void
     */
    public function set_categories( $categories = [] ) {
        $this->categories = $categories;
    }

    /**
     * Get Children of a parent category
     *
     * @since 3.6.4
     *
     * @param int $parent_id
     *
     * @return int[]
     */
    public function get_children( $parent_id ) {
        $children = [];
        // check if parent id is valid
        if ( ! isset( $this->categories[ $parent_id ] ) ) {
            return $children;
        }

        // check if children exist
        if ( empty( $this->categories[ $parent_id ]['children'] ) ) {
            return $children;
        }

        $children = $this->categories[ $parent_id ]['children'];
        // recursively get children of children
        foreach ( $this->categories[ $parent_id ]['children'] as $child_id ) {
            $children = array_merge( $children, $this->get_children( $child_id ) );
        }
        return $children;
    }

    /**
     * Get all the parents of a category.
     *
     * @since 3.6.4
     *
     * @param int $category_id
     *
     * @return array
     */
    public function get_parents( $category_id ) {
        return isset( $this->categories[ $category_id ] ) && $this->categories[ $category_id ]['parents']
        ? $this->categories[ $category_id ]['parents'] : [];
    }

    /**
     * Returns the top patent id of a category.
     *
     * @since 3.6.4
     *
     * @param int $category_id
     *
     * @return int
     */
    public function get_topmost_parent( $category_id ) {
        // check if category id is set
        if ( ! isset( $this->categories[ $category_id ] ) ) {
            return 0;
        }

        if ( 0 === intval( $this->categories[ $category_id ]['parent_id'] ) ) {
            return intval( $this->categories[ $category_id ]['term_id'] );
        }

        return $this->get_topmost_parent( $this->categories[ $category_id ]['parent_id'] );
    }

    /**
     * This method will prepare category data
     *
     * @since 3.6.2
     *
     * @return void
     */
    private function get_categories() {
        global $wpdb;

        // get all categories
        $table  = $wpdb->prefix . 'terms';
        $fields = 'terms.term_id, terms.name, tax.parent AS parent_id';
        $join   = "INNER JOIN `{$wpdb->prefix}term_taxonomy` AS tax ON terms.term_id = tax.term_id";
        $where  = " AND tax.taxonomy = 'product_cat'";

        // If wpml plugin exists then get categories as language set.
        if ( function_exists( 'wpml_get_current_language' ) && ! empty( wpml_get_current_language() ) ) {
            $current_language = wpml_get_current_language();

            $join .= " INNER JOIN `{$wpdb->prefix}icl_translations` AS tr ON terms.term_id = tr.element_id";
            $where .= " AND tr.language_code = '{$current_language}' AND tr.element_type = 'tax_product_cat'";
        }

        // @codingStandardsIgnoreStart
        $categories = $wpdb->get_results(
            $wpdb->prepare( "SELECT $fields FROM $table AS terms $join WHERE %d=%d $where", 1, 1 ),
            OBJECT_K
        );
        // @codingStandardsIgnoreEnd

        if ( empty( $categories ) ) {
            $this->categories = [];
            return;
        }

        // convert category data to array
        $this->categories = json_decode( wp_json_encode( $categories ), true );
        // we don't need old categories variable
        unset( $categories );

        foreach ( $this->categories as $category_id => $category_data ) {
            // set immediate child to a category
            $parent_id = $this->categories[ $category_id ]['parent_id'];

            if ( ! isset( $this->categories[ $category_id ]['children'] ) ) {
                $this->categories[ $category_id ]['children'] = [];
            }

            if ( ! empty( $parent_id ) ) {
                $this->categories[ $parent_id ]['children'][] = $category_id;
            }

            $this->recursively_get_parent_categories( $category_id );
        }
    }

    /**
     * This method will recursively get parent id of a category
     *
     * @sience 3.6.2
     *
     * @param int $current_item
     *
     * @return void
     */
    private function recursively_get_parent_categories( $current_item ) {
        $parent_id = intval( $this->categories[ $current_item ]['parent_id'] );

        // setting base condition to exit recursion
        if ( 0 === $parent_id ) {
            $this->categories[ $current_item ]['parents'] = [];
            $this->categories[ $current_item ]['breadcumb'][] = $this->categories[ $current_item ]['name'];
            // if parent category parents value is empty, no more recursion is needed
        } elseif ( isset( $this->categories[ $parent_id ]['parents'] ) && empty( $this->categories[ $parent_id ]['parents'] ) ) {
            $this->categories[ $current_item ]['parents'][] = $parent_id;
            $this->categories[ $current_item ]['breadcumb'][] = $this->categories[ $parent_id ]['name'];
            // if parent category parents value is not empty, set that value as current category parents
        } elseif ( ! empty( $this->categories[ $parent_id ]['parents'] ) ) {
            $this->categories[ $current_item ]['parents'] = array_merge( $this->categories[ $parent_id ]['parents'], [ $parent_id ] );
            $this->categories[ $current_item ]['breadcumb'] = array_merge( $this->categories[ $parent_id ]['breadcumb'], [ $this->categories[ $parent_id ]['name'], $this->categories[ $current_item ]['name'] ] );
            // otherwise, get parent category parents, then set current category parents
        } else {
            $this->recursively_get_parent_categories( $parent_id );
            $this->recursively_get_parent_categories( $current_item );
        }
    }
}
