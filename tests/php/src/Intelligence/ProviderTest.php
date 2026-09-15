<?php

namespace WeDevs\Dokan\Test\Intelligence;

use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\AIModelInterface;
use WeDevs\Dokan\Intelligence\Services\AITextGenerationInterface;
use WeDevs\Dokan\Intelligence\Services\Model;
use WeDevs\Dokan\Intelligence\Services\Provider;
use WeDevs\Dokan\Intelligence\Services\Providers\Gemini;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Model resolution for AI providers.
 *
 * @group intelligence
 * @group intelligence-provider
 */
class ProviderTest extends DokanTestCase {

    /**
     * A saved id that is still registered wins.
     */
    public function test_resolve_model_returns_the_saved_model(): void {
        $provider = $this->dummy_provider( [ 'dummy-default', 'dummy-pro' ] );

        $model = $provider->resolve_model( Model::SUPPORTS_TEXT, 'dummy-pro' );

        $this->assertInstanceOf( AIModelInterface::class, $model );
        $this->assertSame( 'dummy-pro', $model->get_id() );
    }

    /**
     * The reported bug: a provider retired the model that settings still hold.
     */
    public function test_resolve_model_falls_back_to_the_default_for_a_retired_id(): void {
        $provider = $this->dummy_provider( [ 'dummy-default', 'dummy-pro' ] );

        $model = $provider->resolve_model( Model::SUPPORTS_TEXT, 'dummy-retired' );

        $this->assertInstanceOf( AIModelInterface::class, $model );
        $this->assertSame( 'dummy-default', $model->get_id() );
    }

    /**
     * Both the saved id and the provider's own default can be gone.
     */
    public function test_resolve_model_falls_back_to_the_first_model_when_the_default_is_retired(): void {
        $provider = $this->dummy_provider( [ 'dummy-a', 'dummy-b' ], 'dummy-retired-default' );

        $model = $provider->resolve_model( Model::SUPPORTS_TEXT, 'dummy-retired' );

        $this->assertInstanceOf( AIModelInterface::class, $model );
        $this->assertSame( 'dummy-a', $model->get_id() );
    }

    public function test_resolve_model_returns_null_when_no_model_supports_the_type(): void {
        $provider = $this->dummy_provider( [ 'dummy-default' ] );

        $this->assertNull( $provider->resolve_model( Model::SUPPORTS_IMAGE, 'dummy-default' ) );
    }

    /**
     * `get_models()` is a filter, so a model may arrive under a key that is not its id.
     */
    public function test_resolve_model_finds_a_model_enlisted_under_a_foreign_key(): void {
        $provider = $this->dummy_provider( [ 'some-third-party-key' => 'dummy-pro' ] );

        $model = $provider->resolve_model( Model::SUPPORTS_TEXT, 'dummy-pro' );

        $this->assertInstanceOf( AIModelInterface::class, $model );
        $this->assertSame( 'dummy-pro', $model->get_id() );
    }

    public function test_has_model_id_reports_registration(): void {
        $provider = $this->dummy_provider( [ 'dummy-default' ] );

        $this->assertTrue( $provider->has_model_id( Model::SUPPORTS_TEXT, 'dummy-default' ) );
        $this->assertFalse( $provider->has_model_id( Model::SUPPORTS_TEXT, 'dummy-retired' ) );
        $this->assertFalse( $provider->has_model_id( Model::SUPPORTS_IMAGE, 'dummy-default' ) );
    }

    public function test_get_default_model_id_by_type_is_empty_without_models_of_that_type(): void {
        $provider = $this->dummy_provider( [ 'dummy-default' ] );

        $this->assertSame( 'dummy-default', $provider->get_default_model_id_by_type( Model::SUPPORTS_TEXT ) );
        $this->assertSame( '', $provider->get_default_model_id_by_type( Model::SUPPORTS_IMAGE ) );
    }

    public function test_resolved_model_is_filterable(): void {
        $provider = $this->dummy_provider( [ 'dummy-default' ] );
        $override = new DummyModel( 'dummy-override' );

        add_filter(
            'dokan_intelligence_' . $provider->get_id() . '_provider_resolved_model',
            function () use ( $override ) {
                return $override;
            }
        );

        $model = $provider->resolve_model( Model::SUPPORTS_TEXT, 'dummy-default' );

        $this->assertSame( 'dummy-override', $model->get_id() );
    }

    /**
     * The invariant that broke: Gemini's default was `gemini-2.0-flash`, no longer registered.
     *
     * Covers every registered text provider, so retiring a model without moving
     * the default fails here instead of fataling on /ai/generate.
     */
    public function test_every_text_provider_default_model_id_is_registered(): void {
        $engines = dokan_get_container()->get( Manager::class )->get_engines( Model::SUPPORTS_TEXT );

        $this->assertNotEmpty( $engines, 'No text AI providers are registered.' );

        foreach ( $engines as $provider_id => $provider ) {
            if ( ! $provider instanceof Provider ) {
                continue;
            }

            $this->assertTrue(
                $provider->has_model_id( Model::SUPPORTS_TEXT, $provider->get_default_model_id() ),
                sprintf( 'Provider "%s" defaults to the unregistered model "%s".', $provider_id, $provider->get_default_model_id() )
            );
        }
    }

    /**
     * Settings read heals a stale id without disturbing anything else in the section.
     */
    public function test_retired_model_value_is_remapped_when_settings_are_read(): void {
        $gemini = dokan_get_container()->get( Gemini::class );

        $values = apply_filters(
            'dokan_get_settings_values',
            [
                'dokan_ai_gemini_model' => 'gemini-2.0-flash',
                'dokan_ai_engine'       => 'gemini',
            ],
            'dokan_ai'
        );

        $this->assertSame( $gemini->get_default_model_id(), $values['dokan_ai_gemini_model'] );
        $this->assertSame( 'gemini', $values['dokan_ai_engine'] );
    }

    public function test_other_sections_are_left_alone_when_settings_are_read(): void {
        $values = apply_filters( 'dokan_get_settings_values', [ 'dokan_ai_gemini_model' => 'gemini-2.0-flash' ], 'dokan_general' );

        $this->assertSame( 'gemini-2.0-flash', $values['dokan_ai_gemini_model'] );
    }

    /**
     * Build a provider whose models come from the given ids.
     *
     * A string array key is used as the enlisted key, to mimic a third party
     * that does not key by model id.
     *
     * @param array  $ids        Model ids, optionally keyed.
     * @param string $default_id Provider default model id.
     *
     * @return DummyProvider
     */
    private function dummy_provider( array $ids, string $default_id = 'dummy-default' ): DummyProvider {
        $provider = new DummyProvider( $default_id );

        add_filter(
            'dokan_intelligence_provider_' . $provider->get_id() . '_models',
            function () use ( $ids ) {
                $models = [];

                foreach ( $ids as $key => $id ) {
                    $models[ is_string( $key ) ? $key : $id ] = new DummyModel( $id );
                }

                return $models;
            }
        );

        return $provider;
    }
}

/**
 * Text-only model used by the tests above.
 */
class DummyModel extends Model implements AITextGenerationInterface {

    /**
     * @var string
     */
    private $id;

    public function __construct( string $id ) {
        $this->id = $id;
    }

    public function get_id(): string {
        return $this->id;
    }

    public function get_title(): string {
        return 'Dummy ' . $this->id;
    }

    public function get_description(): string {
        return '';
    }

    public function get_provider_id(): string {
        return 'dokan-dummy-provider';
    }

    public function process_text( string $prompt, array $args = [] ) {
        return $prompt;
    }

    protected function get_url(): string {
        return 'https://example.test/v1/generate';
    }

    protected function get_headers(): array {
        return [];
    }

    protected function get_payload( string $prompt, array $args = [] ): array {
        return [ 'prompt' => $prompt ];
    }
}

/**
 * Provider used by the tests above. Not enlisted, so it never reaches a real site.
 */
class DummyProvider extends Provider {

    /**
     * @var string
     */
    private $default_model_id;

    public function __construct( string $default_model_id ) {
        $this->default_model_id = $default_model_id;
    }

    public function get_id(): string {
        return 'dokan-dummy-provider';
    }

    public function get_title(): string {
        return 'Dokan Dummy Provider';
    }

    public function get_description(): string {
        return '';
    }

    public function get_api_key_url(): string {
        return 'https://example.test/api-keys';
    }

    public function get_default_model_id(): string {
        return $this->default_model_id;
    }
}
