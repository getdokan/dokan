<?php
namespace WeDevs\Dokan\Test\Factories;

use WeDevs\Dokan\Test\Helpers\WC_Helper_Product;
use WP_UnitTest_Factory_For_Thing;
use WP_UnitTest_Generator_Sequence;

class ProductFactory extends WP_UnitTest_Factory_For_Thing {
    protected $seller_id = '';

    public function __construct( $factory = null ) {
        parent::__construct( $factory );
        $this->default_generation_definitions = array(
            'name'          => new WP_UnitTest_Generator_Sequence( 'Product %s' ),
            'type'          => 'simple',
            'regular_price' => '10',
            'price'         => '10',
        );
    }

    public function create_object( $args ) {
        $product = $this->create_simple_product( $args );

        if ( $this->seller_id ) {
            $post_data = [
                'ID'          => $product->get_id(),
                'post_author' => $this->seller_id,
            ];

            wp_update_post( $post_data );
        }

        return $product->get_id();
    }

    public function update_object( $product_id, $fields ) {
        $product = wc_get_product( $product_id );

        if ( isset( $fields['name'] ) ) {
            $product->set_name( $fields['name'] );
        }

        if ( isset( $fields['regular_price'] ) ) {
            $product->set_regular_price( $fields['regular_price'] );
        }

        if ( isset( $fields['description'] ) ) {
            $product->set_description( $fields['description'] );
        }

        if ( isset( $fields['short_description'] ) ) {
            $product->set_short_description( $fields['short_description'] );
        }

        $product->save();

        return $product_id;
    }

    public function get_object_by_id( $product_id ) {
        return wc_get_product( $product_id );
    }

    public function set_seller_id( int $seller_id ) {
        $this->seller_id = $seller_id;

        return $this;
    }

    /******* Start start Wrapper WC Product creation  *********/

    /**
     * Delete a product.
     *
     * @param int $product_id ID to delete.
     */
    public function delete_product( $product_id ) {
        return WC_Helper_Product::delete_product( $product_id );
    }

    /**
     * Create simple product.
     *
     * @since 2.3
     * @param bool  $save Save or return object.
     * @param array $props Properties to be set in the new product, as an associative array.
     * @return WC_Product_Simple
     */
    public function create_simple_product( $props = array(), $save = true ) {
        return WC_Helper_Product::create_simple_product( $save, $props );
    }

    /**
     * Create a downloadable product.
     *
     * @since 6.4.0
     *
     * @param bool  $save      Save or return object.
     * @param array $downloads An array of arrays (each containing a 'name' and 'file' key) or WC_Product_Download objects.
     *
     * @return WC_Product_Simple|false
     */
    public function create_downloadable_product( array $downloads = array(), $save = true ) {
        return WC_Helper_Product::create_downloadable_product( $downloads, $save );
    }

    /**
     * Create external product.
     *
     * @since 3.0.0
     * @return WC_Product_External
     */
    public function create_external_product() {
        return WC_Helper_Product::create_external_product();
    }

    /**
     * Create grouped product.
     *
     * @since 3.0.0
     * @return WC_Product_Grouped
     */
    public function create_grouped_product() {
        return WC_Helper_Product::create_grouped_product();
    }

    /**
     * Create a dummy variation product or configure an existing product object with dummy data.
     *
     *
     * @since 2.3
     * @param WC_Product_Variable|null $product Product object to configure, or null to create a new one.
     * @return WC_Product_Variable
     */
    public function create_variation_product( $product = null ) {
        return WC_Helper_Product::create_variation_product( $product );
    }

    /**
     * Creates an instance of WC_Product_Variation with the supplied parameters, optionally persisting it to the database.
     *
     * @param string $parent_id Parent product id.
     * @param string $sku SKU for the variation.
     * @param int    $price Price of the variation.
     * @param array  $attributes Attributes that define the variation, e.g. ['pa_color'=>'red'].
     * @param bool   $save If true, the object will be saved to the database after being created and configured.
     *
     * @return WC_Product_Variation The created object.
     */
    public function create_product_variation_object( $parent_id, $sku, $price, $attributes, $save = true ) {
        return WC_Helper_Product::create_product_variation_object( $parent_id, $sku, $price, $attributes, $save );
    }

    /**
     * Creates an instance of WC_Product_Attribute with the supplied parameters.
     *
     * @param string $raw_name Attribute raw name (without 'pa_' prefix).
     * @param array  $terms Possible values for the attribute.
     *
     * @return WC_Product_Attribute The created attribute object.
     */
    public function create_product_attribute_object( $raw_name = 'size', $terms = array( 'small' ) ) {
        return WC_Helper_Product::create_product_attribute_object( $raw_name, $terms );
    }

    /**
     * Create a dummy attribute.
     *
     * @since 2.3
     *
     * @param string        $raw_name Name of attribute to create.
     * @param array(string) $terms          Terms to create for the attribute.
     * @return array
     */
    public function create_attribute( $raw_name = 'size', $terms = array( 'small' ) ) {
        return WC_Helper_Product::create_attribute( $raw_name, $terms );
    }

    /**
     * Delete an attribute.
     *
     * @param int $attribute_id ID to delete.
     *
     * @since 2.3
     */
    public function delete_attribute( $attribute_id ) {
        return WC_Helper_Product::delete_attribute( $attribute_id );
    }

    /**
     * Creates a new product review on a specific product.
     *
     * @since 3.0
     * @param int    $product_id integer Product ID that the review is for.
     * @param string $review_content string Content to use for the product review.
     * @return integer Product Review ID.
     */
    public function create_product_review( $product_id, $review_content = 'Review content here' ) {
        return WC_Helper_Product::create_product_review( $product_id, $review_content );
    }

    /**
     * A helper function for hooking into save_post during the test_product_meta_save_post test.
     * @since 3.0.1
     *
     * @param int $id ID to update.
     */
    public function save_post_test_update_meta_data_direct( $id ) {
        return WC_Helper_Product::save_post_test_update_meta_data_direct( $id );
    }
    /*******   End of Wrapper WC Product creation  *********/
}
