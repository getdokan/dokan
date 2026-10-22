<?php

namespace WeDevs\Dokan\Test\Product;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Product;
use Dokan_Object_Injection_Probe;

require_once __DIR__ . '/Dokan_Object_Injection_Probe.php';

/**
 * A poisoned `_product_attributes` meta must not instantiate an object when a vendor saves or opens the product (getdokan/dokan-pro#6268).
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-product-attributes-object-injection
 */
class ProductAttributesObjectInjectionTest extends DokanTestCase {

    /**
     * Product owned by seller 1, with no attributes row.
     *
     * @var int
     */
    protected int $product_id;

    /**
     * Fields the legacy edit form posts to dokan_process_product_meta().
     *
     * @var array
     */
    const SAVE_DATA = [
        '_stock_status'   => 'instock',
        '_enable_reviews' => 'yes',
        '_visibility'     => 'visible',
    ];

    public function set_up() {
        parent::set_up();

        $product = WC_Helper_Product::create_simple_product();
        wp_update_post(
            [
                'ID'          => $product->get_id(),
                'post_author' => $this->seller_id1,
            ]
        );
        $this->product_id = $product->get_id();

        Dokan_Object_Injection_Probe::$woke = false;

        wp_set_current_user( $this->seller_id1 );
    }

    /**
     * Mirror the WooCommerce REST writer, which double-serializes a serialized-looking string so get_post_meta() returns it intact.
     *
     * @param string $inner The serialized payload the attacker controls.
     */
    private function plant_poisoned_attributes( string $inner ): void {
        update_post_meta( $this->product_id, '_product_attributes', $inner );

        $raw = get_post_meta( $this->product_id, '_product_attributes', true );
        $this->assertSame( $inner, $raw, 'get_post_meta() should peel exactly one layer, leaving the attacker string intact.' );
    }

    /**
     * Saving the product does not peel the attacker's layer, so no object is instantiated.
     *
     * @covers ::dokan_process_product_meta
     */
    public function test_vendor_save_does_not_instantiate_poisoned_attributes() {
        $class   = Dokan_Object_Injection_Probe::class;
        $payload = 'O:' . strlen( $class ) . ':"' . $class . '":0:{}';
        $this->plant_poisoned_attributes( $payload );

        dokan_process_product_meta( $this->product_id, self::SAVE_DATA );

        $this->assertFalse( Dokan_Object_Injection_Probe::$woke, 'Saving the product must not unserialize the poisoned attributes into an object.' );
    }

    /**
     * Rendering the variable-product options (on opening the edit page, before any save) must not instantiate them either.
     *
     * @covers ::dokan_product_output_variations
     */
    public function test_variations_render_does_not_instantiate_poisoned_attributes() {
        $class   = Dokan_Object_Injection_Probe::class;
        $payload = 'O:' . strlen( $class ) . ':"' . $class . '":0:{}';
        $this->plant_poisoned_attributes( $payload );

        $GLOBALS['post'] = get_post( $this->product_id ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

        ob_start();
        dokan_product_output_variations();
        ob_get_clean();

        $this->assertFalse( Dokan_Object_Injection_Probe::$woke, 'Rendering the variations UI must not unserialize the poisoned attributes into an object.' );
    }

    /**
     * A non-array entry next to a real variation attribute is skipped instead of causing a TypeError on render.
     *
     * @covers ::dokan_product_output_variations
     */
    public function test_variations_render_skips_non_array_attribute_entries() {
        update_post_meta(
            $this->product_id,
            '_product_attributes',
            [
                'color' => [
                    'name'         => 'Color',
                    'value'        => 'Red | Blue',
                    'position'     => 0,
                    'is_visible'   => 1,
                    'is_variation' => 1,
                    'is_taxonomy'  => 0,
                ],
                'junk'  => 'x',
            ]
        );

        $GLOBALS['post'] = get_post( $this->product_id ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

        ob_start();
        dokan_product_output_variations();
        $html = ob_get_clean();

        $this->assertStringContainsString( 'name="default_attribute_color"', $html );
    }

    /**
     * A legitimate attributes array is still read, so a taxonomy attribute removed on save has its terms unset.
     *
     * @covers ::dokan_process_product_meta
     */
    public function test_legitimate_taxonomy_attribute_is_cleaned_up_on_save() {
        $attribute = WC_Helper_Product::create_attribute( 'size', [ 'small' ] );
        $taxonomy  = $attribute['attribute_taxonomy'];

        wp_set_object_terms( $this->product_id, $attribute['term_ids'], $taxonomy );
        update_post_meta(
            $this->product_id,
            '_product_attributes',
            [
                $taxonomy => [
                    'name'         => $taxonomy,
                    'value'        => '',
                    'position'     => 0,
                    'is_visible'   => 1,
                    'is_variation' => 1,
                    'is_taxonomy'  => 1,
                ],
            ]
        );

        $this->assertNotEmpty( wp_get_object_terms( $this->product_id, $taxonomy ) );

        // Save sends no attribute fields, so the stored taxonomy attribute is treated as removed.
        dokan_process_product_meta( $this->product_id, self::SAVE_DATA );

        $this->assertFalse( Dokan_Object_Injection_Probe::$woke );
        $this->assertEmpty( wp_get_object_terms( $this->product_id, $taxonomy ), 'The removed taxonomy attribute should have its object terms cleared, proving $old_attributes was read as an array.' );
    }
}
