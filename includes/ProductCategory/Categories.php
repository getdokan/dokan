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
        $this->get_categories();

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
        // Get all product categories.
        $product_categories = get_terms(
            [
                'taxonomy'   => 'product_cat',
                'hide_empty' => false,
            ]
        );

        // Transform the categories with required data.
        $transformed_categories = array_map(
            function ( $category ) {
                return [
                    'term_id'   => $category->term_id,
                    'name'      => $category->name,
                    'parent_id' => $category->parent,
                ];
            },
            $product_categories
        );

        // Set categories index as term_id.
        $categories = array_column( $transformed_categories, null, 'term_id' );

        if ( empty( $categories ) ) {
            $this->categories = [];
            return;
        }

        // Set categories data.
        $this->categories = $categories;

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
        $parent_id = intval( $this->categories[ $current_item ]['parent_id'] ?? 0 );

        // setting base condition to exit recursion
        if ( 0 === $parent_id ) {
            $this->categories[ $current_item ]['parents'] = [];
            $this->categories[ $current_item ]['breadcumb'][] = $this->categories[ $current_item ]['name'] ?? '';
            // if parent category parents value is empty, no more recursion is needed
        } elseif ( isset( $this->categories[ $parent_id ]['parents'] ) && empty( $this->categories[ $parent_id ]['parents'] ) ) {
            $this->categories[ $current_item ]['parents'][] = $parent_id;
            $this->categories[ $current_item ]['breadcumb'][] = $this->categories[ $parent_id ]['name'] ?? '';
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

    /**
     * Get product categories in a fully hierarchical (recursive) format for JS consumption.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_product_categories_tree(): array {
        $categories = get_terms(
            [
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
			]
        );

        if ( is_wp_error( $categories ) || empty( $categories ) ) {
            return [];
        }

        // Index categories by parent
        $by_parent = [];
        foreach ( $categories as $cat ) {
            $by_parent[ $cat->parent ][] = $cat;
        }

        /**
         * Recursive function to build category tree
         */
        $build_tree = function ( $parent_id ) use ( &$build_tree, &$by_parent ) {
            $tree = [];

            if ( ! isset( $by_parent[ $parent_id ] ) ) {
                return $tree;
            }

            foreach ( $by_parent[ $parent_id ] as $cat ) {
                $tree[] = [
                    'value'    => $cat->slug,
                    'label'    => $cat->name,
                    'parent'   => $cat->parent,
                    'count'    => $cat->count,
                    'slug'     => $cat->slug,
                    'term_id'  => $cat->term_id,
                    'children' => $build_tree( $cat->term_id ),
                ];
            }

            return $tree;
        };

        $tree = $build_tree( 0 ); // Top-level categories have parent = 0

        /**
         * Allow filtering the final category tree
         *
         * @since DOKAN_SINCE
         *
         * @param array $tree       Hierarchical category tree
         * @param array $categories Raw category data
         */
        return apply_filters( 'dokan_get_product_categories_tree', $tree, $categories );
    }
}
