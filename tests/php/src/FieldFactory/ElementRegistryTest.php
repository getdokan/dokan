<?php
/**
 * Element Registry Test
 *
 * @package WeDevs\Dokan\Test\FieldFactory
 */

namespace WeDevs\Dokan\Test\FieldFactory;

use WeDevs\Dokan\FieldFactory\Registry\ElementRegistry;
use WeDevs\Dokan\FieldFactory\Elements\Fields\TextField;
use WeDevs\Dokan\FieldFactory\Elements\Fields\SelectField;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class ElementRegistryTest
 *
 * Tests for the ElementRegistry class.
 * @group field-factory
 */
class ElementRegistryTest extends DokanTestCase {

    /**
     * Indicates unit test mode.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    /**
     * Registry instance.
     *
     * @var ElementRegistry
     */
    private $registry;

    /**
     * Set up the test.
     */
    public function set_up(): void {
        parent::set_up();
        ElementRegistry::reset_instance();
        $this->registry = ElementRegistry::get_instance();
    }

    /**
     * Tear down the test.
     */
    public function tear_down(): void {
        ElementRegistry::reset_instance();
        parent::tear_down();
    }

    /**
     * Test singleton pattern.
     */
    public function test_get_instance_returns_same_instance(): void {
        $instance1 = ElementRegistry::get_instance();
        $instance2 = ElementRegistry::get_instance();

        $this->assertSame( $instance1, $instance2 );
    }

    /**
     * Test reset instance creates new instance.
     */
    public function test_reset_instance_creates_new_instance(): void {
        $instance1 = ElementRegistry::get_instance();
        ElementRegistry::reset_instance();
        $instance2 = ElementRegistry::get_instance();

        $this->assertNotSame( $instance1, $instance2 );
    }

    /**
     * Test registering a custom type.
     */
    public function test_register_custom_type(): void {
        $this->registry->register( 'field:custom', TextField::class );

        $this->assertTrue( $this->registry->has( 'field:custom' ) );
        $this->assertEquals( TextField::class, $this->registry->get( 'field:custom' ) );
    }

    /**
     * Test getting non-existent type returns null.
     */
    public function test_get_non_existent_type_returns_null(): void {
        $result = $this->registry->get( 'field:nonexistent' );

        $this->assertNull( $result );
    }

    /**
     * Test has method for existing type.
     */
    public function test_has_returns_true_for_existing_type(): void {
        $this->assertTrue( $this->registry->has( 'field:text' ) );
    }

    /**
     * Test has method for non-existing type.
     */
    public function test_has_returns_false_for_non_existing_type(): void {
        $this->assertFalse( $this->registry->has( 'field:nonexistent' ) );
    }

    /**
     * Test adding alias.
     */
    public function test_add_alias(): void {
        $this->registry->add_alias( 'my_text', 'field:text' );
        // Verify alias works via resolve_type_key
        $resolved = $this->registry->resolve_type_key( 'my_text', null );

        $this->assertEquals( 'field:text', $resolved );
    }

    /**
     * Test alias resolution for non-alias returns same key.
     */
    public function test_resolve_alias_returns_original_for_non_alias(): void {
        // Non-alias keys should pass through unchanged
        $resolved = $this->registry->resolve_type_key( 'field', 'text' );

        $this->assertEquals( 'field:text', $resolved );
    }

    /**
     * Test type key resolution with type only.
     */
    public function test_resolve_type_key_with_type_only(): void {
        $key = $this->registry->resolve_type_key( 'section', null );

        $this->assertEquals( 'section', $key );
    }

    /**
     * Test type key resolution with field and variant.
     */
    public function test_resolve_type_key_with_field_and_variant(): void {
        $key = $this->registry->resolve_type_key( 'field', 'text' );

        $this->assertEquals( 'field:text', $key );
    }

    /**
     * Test type key resolution with legacy alias.
     */
    public function test_resolve_type_key_with_legacy_alias(): void {
        $key = $this->registry->resolve_type_key( 'text', null );

        // 'text' is aliased to 'field:text'
        $this->assertEquals( 'field:text', $key );
    }

    /**
     * Test make method creates instance.
     */
    public function test_make_creates_instance(): void {
        $element = $this->registry->make( 'field:text' );

        $this->assertInstanceOf( TextField::class, $element );
    }

    /**
     * Test make method returns null for invalid type.
     */
    public function test_make_returns_null_for_invalid_type(): void {
        $element = $this->registry->make( 'field:invalid' );

        $this->assertNull( $element );
    }

    /**
     * Test get_all returns registered types.
     */
    public function test_get_all_returns_registered_types(): void {
        $all = $this->registry->get_all();

        $this->assertIsArray( $all );
        $this->assertArrayHasKey( 'field:text', $all );
        $this->assertArrayHasKey( 'field:select', $all );
        $this->assertArrayHasKey( 'section', $all );
    }

    /**
     * Test default types are registered.
     */
    public function test_default_types_registered(): void {
        // Containers
        $this->assertTrue( $this->registry->has( 'page' ) );
        $this->assertTrue( $this->registry->has( 'subpage' ) );

        // Layouts
        $this->assertTrue( $this->registry->has( 'section' ) );
        $this->assertTrue( $this->registry->has( 'subsection' ) );

        // Core Fields
        $this->assertTrue( $this->registry->has( 'field:text' ) );
        $this->assertTrue( $this->registry->has( 'field:select' ) );
        $this->assertTrue( $this->registry->has( 'field:switch' ) );
        $this->assertTrue( $this->registry->has( 'field:number' ) );
    }

    /**
     * Test legacy aliases are registered.
     */
    public function test_legacy_aliases_registered(): void {
        // Legacy aliases should resolve to field types via resolve_type_key
        $this->assertEquals( 'field:text', $this->registry->resolve_type_key( 'text', null ) );
        $this->assertEquals( 'field:select', $this->registry->resolve_type_key( 'select', null ) );
        $this->assertEquals( 'field:switch', $this->registry->resolve_type_key( 'switch', null ) );
        $this->assertEquals( 'field:number', $this->registry->resolve_type_key( 'number', null ) );
    }

    /**
     * Test overwriting existing registration.
     */
    public function test_register_overwrites_existing(): void {
        $original = $this->registry->get( 'field:text' );

        $this->registry->register( 'field:text', SelectField::class );

        $this->assertEquals( SelectField::class, $this->registry->get( 'field:text' ) );
        $this->assertNotEquals( $original, $this->registry->get( 'field:text' ) );
    }
}
