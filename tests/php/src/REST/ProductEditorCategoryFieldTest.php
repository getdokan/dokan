<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\ProductCategory\Helper as ProductCategoryHelper;
use WeDevs\Dokan\ProductEditor\Elements;
use WeDevs\Dokan\REST\ProductControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The product editor's Categories field reflects the category the vendor picked.
 *
 * Covers getdokan/dokan-pro#6129: a product carries every ancestor of the picked category as a
 * term, so a field populated from the raw term list showed the top-level parent instead of the
 * child, and the next save wrote that parent back over the vendor's choice.
 *
 * @group dokan-product-controller-v3
 * @group dokan-product-editor
 *
 * @covers \WeDevs\Dokan\ProductEditor\FormSchema::resolve_field_value
 * @covers \WeDevs\Dokan\Product\Hooks::sync_category_data_for_commission
 */
class ProductEditorCategoryFieldTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Top-level category.
     *
     * @var int
     */
    protected int $parent_id;

    /**
     * Child of the top-level category.
     *
     * @var int
     */
    protected int $child_id;

    /**
     * Grandchild the vendor picks in these tests.
     *
     * @var int
     */
    protected int $grandchild_id;

    /**
     * Product owned by the acting vendor.
     *
     * @var int
     */
    protected int $product_id;

    /**
     * Setup test environment.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        $controller = new ProductControllerV3();
        $controller->register_routes();

        // register_routes() arms the payload resolver only once per process, so re-add it here since WordPress restores hooks between tests.
        add_filter( 'rest_pre_dispatch', [ $controller, 'resolve_product_payload_before_validation' ], 1, 3 );

        // Names sort parent < grandchild < child, so a field reading the raw term list cannot land on the picked category by ordering.
        $this->parent_id     = $this->create_category( 'aaa-gadgets' );
        $this->child_id      = $this->create_category( 'zzz-wearables', $this->parent_id );
        $this->grandchild_id = $this->create_category( 'mmm-smartwatches', $this->child_id );

        $this->set_category_style( 'single' );

        $this->product_id = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
                    'name'          => 'Categorised Product',
                    'regular_price' => '10',
                ]
            );

        wp_set_current_user( $this->seller_id1 );
    }

    /**
     * Create a product category.
     *
     * @param string $name      Category name.
     * @param int    $parent_id Parent category id.
     *
     * @return int
     */
    protected function create_category( string $name, int $parent_id = 0 ): int {
        $term = wp_insert_term( $name, 'product_cat', [ 'parent' => $parent_id ] );

        return (int) $term['term_id'];
    }

    /**
     * Set the admin "single vs. multiple" category selection setting.
     *
     * @param string $style Either 'single' or 'multiple'.
     *
     * @return void
     */
    protected function set_category_style( string $style ): void {
        $settings                           = get_option( 'dokan_selling', [] );
        $settings['product_category_style'] = $style;

        update_option( 'dokan_selling', $settings );
    }

    /**
     * Dispatch a JSON request, the way the product form does.
     *
     * @param string $method HTTP method.
     * @param string $route  Route below the namespace.
     * @param array  $body   Request payload.
     *
     * @return WP_REST_Response
     */
    protected function json_request( string $method, string $route, array $body ): WP_REST_Response {
        $request = new WP_REST_Request( $method, $this->get_route( $route ) );
        $request->add_header( 'Content-Type', 'application/json' );
        $request->set_body( wp_json_encode( $body ) );

        return $this->server->dispatch( $request );
    }

    /**
     * Save the product with the given categories, the way the editor does.
     *
     * @param array $category_ids Categories the vendor picked.
     *
     * @return WP_REST_Response
     */
    protected function save_categories( array $category_ids ): WP_REST_Response {
        return $this->json_request( 'PUT', '/products/' . $this->product_id, [ Elements::CATEGORIES => $category_ids ] );
    }

    /**
     * Read the Categories field back out of the editor's form schema.
     *
     * @param int|null $product_id Product to read, defaults to the test product.
     *
     * @return array Term ids the field is populated with.
     */
    protected function get_field_category_ids( ?int $product_id = null ): array {
        return wp_list_pluck( $this->get_field_category_value( $product_id ), 'value' );
    }

    /**
     * Read the raw Categories field value, the async-select option objects the editor renders.
     *
     * @param int|null $product_id Product to read, defaults to the test product.
     *
     * @return array Option objects: [ { value, label }, ... ].
     */
    protected function get_field_category_value( ?int $product_id = null ): array {
        $product_id = $product_id ?? $this->product_id;

        $request = new WP_REST_Request( 'GET', $this->get_route( '/products/' . $product_id . '/fields' ) );
        $request->set_param( 'id', $product_id );

        $data = $this->server->dispatch( $request )->get_data();

        foreach ( $data['form_items'] ?? [] as $item ) {
            if ( Elements::CATEGORIES === ( $item['id'] ?? '' ) ) {
                return array_values( (array) ( $item['value'] ?? [] ) );
            }
        }

        return [];
    }

    /**
     * The categories currently stored on the test product.
     *
     * @return array
     */
    protected function get_stored_term_ids(): array {
        $terms = wp_get_post_terms( $this->product_id, 'product_cat', [ 'fields' => 'ids' ] );

        sort( $terms );

        return array_map( 'absint', $terms );
    }

    /**
     * Saving a grandchild stores the whole chain but keeps the grandchild as the chosen category.
     *
     * @return void
     */
    public function test_saving_a_grandchild_keeps_it_as_the_chosen_category(): void {
        $this->save_categories( [ $this->grandchild_id ] );

        $expected_chain = [ $this->parent_id, $this->child_id, $this->grandchild_id ];
        sort( $expected_chain );

        $this->assertSame( $expected_chain, $this->get_stored_term_ids(), 'The ancestor chain must stay on the product.' );
        $this->assertSame(
            [ $this->grandchild_id ],
            array_values( ProductCategoryHelper::get_product_chosen_category( $this->product_id ) ),
            'The picked grandchild must be the chosen category.'
        );
    }

    /**
     * The editor field shows the picked grandchild, not its top-level ancestor.
     *
     * @return void
     */
    public function test_field_shows_the_picked_child_not_its_ancestor(): void {
        $this->save_categories( [ $this->grandchild_id ] );

        $this->assertSame(
            [ $this->grandchild_id ],
            $this->get_field_category_ids(),
            'The field must show the category the vendor picked.'
        );
    }

    /**
     * Re-saving whatever the field shows leaves the vendor's choice intact.
     *
     * @return void
     */
    public function test_resaving_the_field_value_does_not_overwrite_the_choice(): void {
        $this->save_categories( [ $this->grandchild_id ] );

        // A reopened form posts whole option objects back, not bare ids, so exercise that round trip.
        $this->save_categories( $this->get_field_category_value() );

        $this->assertSame(
            [ $this->grandchild_id ],
            $this->get_field_category_ids(),
            'Re-saving the form must not walk the selection up to the parent.'
        );
    }

    /**
     * Single mode surfaces the first chosen category, not whichever sorts first by name.
     *
     * A product can carry more than one chosen category — a store switched from multiple to single,
     * or terms spanning two branches — and the field must not let the name sort decide the winner.
     *
     * @return void
     */
    public function test_single_mode_keeps_the_first_chosen_id_regardless_of_name_order(): void {
        // 'bbb-apparel' sorts before the grandchild 'mmm-smartwatches', so a name-sorted read would pick it.
        $unrelated_id = $this->create_category( 'bbb-apparel' );

        wp_set_object_terms(
            $this->product_id,
            [ $this->parent_id, $this->child_id, $this->grandchild_id, $unrelated_id ],
            'product_cat'
        );
        update_post_meta( $this->product_id, 'chosen_product_cat', [ $this->grandchild_id, $unrelated_id ] );

        $this->assertSame(
            [ $this->grandchild_id ],
            $this->get_field_category_ids(),
            'Single mode must keep the first chosen category, not the one that sorts first by name.'
        );
    }

    /**
     * With multiple selection on, the field lists the picked categories only.
     *
     * @return void
     */
    public function test_multiple_selection_lists_chosen_categories_without_ancestors(): void {
        $this->set_category_style( 'multiple' );

        $unrelated_id = $this->create_category( 'bbb-apparel' );

        $this->save_categories( [ $this->grandchild_id, $unrelated_id ] );

        $shown = $this->get_field_category_ids();
        sort( $shown );

        $expected = [ $this->grandchild_id, $unrelated_id ];
        sort( $expected );

        $this->assertSame( $expected, $shown, 'Only the picked categories belong in the field.' );
    }

    /**
     * A product that never recorded a selection falls back to the deepest term of its branch.
     *
     * @return void
     */
    public function test_product_without_a_recorded_selection_falls_back_to_the_deepest_term(): void {
        wp_set_object_terms( $this->product_id, [ $this->parent_id, $this->child_id, $this->grandchild_id ], 'product_cat' );
        delete_post_meta( $this->product_id, 'chosen_product_cat' );

        $this->assertSame(
            [ $this->grandchild_id ],
            $this->get_field_category_ids(),
            'Products saved outside Dokan must still resolve to the most specific category.'
        );
    }

    /**
     * Creating a product records the chosen category the same way updating one does.
     *
     * @return void
     */
    public function test_create_records_the_chosen_category_like_update_does(): void {
        $response = $this->json_request(
            'POST',
            '/products',
            [
                'name'               => 'Created Product',
                'regular_price'      => '10',
                'description'        => 'Created through the editor.',
                Elements::CATEGORIES => [ $this->grandchild_id ],
            ]
        );

        $this->assertSame( 201, $response->get_status(), 'The product must be created.' );

        $created_id = (int) $response->get_data()['id'];

        $expected_chain = [ $this->parent_id, $this->child_id, $this->grandchild_id ];
        sort( $expected_chain );

        $stored = array_map( 'absint', wp_get_post_terms( $created_id, 'product_cat', [ 'fields' => 'ids' ] ) );
        sort( $stored );

        $this->assertSame( $expected_chain, $stored, 'A created product must carry the ancestor chain too.' );
        $this->assertSame(
            [ $this->grandchild_id ],
            array_values( ProductCategoryHelper::get_product_chosen_category( $created_id ) ),
            'A created product must record its chosen category.'
        );
        $this->assertSame(
            [ $this->grandchild_id ],
            $this->get_field_category_ids( $created_id ),
            'The editor must show the created product the category it was given.'
        );
    }
}
