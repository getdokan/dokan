<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Reads a page's vendor registration block and turns its saved attributes into a complete form setup.
 *
 * @since DOKAN_SINCE
 */
class FormSetup implements Hookable {

    /** Block name of the vendor registration form. */
    const BLOCK_NAME = 'dokan/vendor-registration';

    /** @var FieldRegistry */
    protected FieldRegistry $registry;

    /** @var array<int, array> Setups already read in this request, keyed by page ID. */
    protected array $cache = [];

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FieldRegistry $registry Field registry.
     */
    public function __construct( FieldRegistry $registry ) {
        $this->registry = $registry;
    }

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'save_post', [ $this, 'flush_cache' ] );
    }

    /**
     * Get the form setup of a page's registration block (the first one counts).
     *
     * @since DOKAN_SINCE
     *
     * @param int $page_id Page ID.
     *
     * @return array Setup with `page_id`, `has_block`, `split_steps`, `steps` and `sections`; defaults when the page has no block.
     */
    public function get_for_page( int $page_id ): array {
        if ( isset( $this->cache[ $page_id ] ) ) {
            return $this->cache[ $page_id ];
        }

        $block      = $this->find_block( $page_id );
        $attributes = $block ? (array) ( $block['attrs'] ?? [] ) : [];
        $setup      = $this->build( $attributes );

        $setup['page_id']    = $page_id;
        $setup['has_block']  = null !== $block;
        $setup['attributes'] = $attributes;

        $this->cache[ $page_id ] = $setup;

        return $setup;
    }

    /**
     * Content for a newly created Vendor Onboarding page: the block, or the shortcode where pages can't use the block editor.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_default_page_content(): string {
        if ( ! function_exists( 'use_block_editor_for_post_type' ) ) {
            require_once ABSPATH . 'wp-admin/includes/post.php';
        }

        // The Classic Editor plugin turns the block editor off for pages; the owner couldn't edit the block there.
        if ( ! use_block_editor_for_post_type( 'page' ) ) {
            return '[dokan-vendor-onboarding-registration]';
        }

        return '<!-- wp:' . self::BLOCK_NAME . ' /-->';
    }

    /**
     * Get the Vendor Onboarding page's block setup: the master for forms that aren't a block.
     *
     * @since DOKAN_SINCE
     *
     * @return array|null Null when that page has no registration block.
     */
    public function get_master_setup(): ?array {
        $page_id = absint( dokan_get_option( 'vendor_onboarding', 'dokan_pages', 0 ) );

        if ( ! $page_id || 'publish' !== get_post_status( $page_id ) ) {
            return null;
        }

        $setup = $this->get_for_page( $page_id );

        return $setup['has_block'] ? $setup : null;
    }

    /**
     * Get the default form setup.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_defaults(): array {
        $setup = $this->build( [] );

        $setup['page_id']    = 0;
        $setup['has_block']  = false;
        $setup['attributes'] = [];

        return $setup;
    }

    /**
     * Check whether a page has the registration block.
     *
     * @since DOKAN_SINCE
     *
     * @param int $page_id Page ID.
     *
     * @return bool
     */
    public function page_has_block( int $page_id ): bool {
        return null !== $this->find_block( $page_id );
    }

    /**
     * Forget the setups read so far, e.g. after a page is saved.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function flush_cache(): void {
        $this->cache = [];
    }

    /**
     * Build a complete setup from saved block attributes.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Saved block attributes.
     *
     * @return array
     */
    public function build( array $attributes ): array {
        $rows     = $this->registry->get_rows();
        $defaults = $this->registry->get_sections();
        $saved    = is_array( $attributes['sections'] ?? null ) ? $attributes['sections'] : [];

        $sections = $saved ? $this->apply_saved_sections( $saved, $defaults, $rows ) : $this->default_sections( $defaults );
        $sections = $this->add_missing_sections( $sections, $defaults );
        $sections = $this->add_missing_rows( $sections, $rows );

        foreach ( $sections as &$section ) {
            $keeps_visible = (bool) array_filter(
                $section['rows'],
                function ( $row ) {
                    return $row['locked'] || $row['keeps_section_visible'];
                }
            );

            if ( ! $keeps_visible ) {
                continue;
            }

            // Rows the owner hid by hiding the section stay hidden.
            if ( ! empty( $section['hidden'] ) ) {
                foreach ( $section['rows'] as &$row ) {
                    if ( ! $row['locked'] && ! $row['keeps_section_visible'] ) {
                        $row['hidden'] = true;
                    }
                }
                unset( $row );
            }

            // A section holding a locked row, or one that must stay visible, can't be hidden.
            $section['hidden'] = false;
            $section['locked'] = true;
        }
        unset( $section );

        return $this->apply_steps( $attributes, $sections );
    }

    /**
     * Find the first registration block on a page, including inside nested blocks.
     *
     * @param int $page_id Page ID.
     *
     * @return array|null
     */
    protected function find_block( int $page_id ): ?array {
        $post = $page_id ? get_post( $page_id ) : null;

        if ( ! $post || ! has_block( self::BLOCK_NAME, $post ) ) {
            return null;
        }

        return $this->find_in_blocks( parse_blocks( $post->post_content ) );
    }

    /**
     * Search parsed blocks depth-first for the registration block.
     *
     * @param array $blocks Parsed blocks.
     *
     * @return array|null
     */
    protected function find_in_blocks( array $blocks ): ?array {
        foreach ( $blocks as $block ) {
            if ( self::BLOCK_NAME === ( $block['blockName'] ?? '' ) ) {
                return $block;
            }

            if ( ! empty( $block['innerBlocks'] ) ) {
                $found = $this->find_in_blocks( $block['innerBlocks'] );

                if ( $found ) {
                    return $found;
                }
            }
        }

        return null;
    }

    /**
     * Turn the registry's sections into setup sections without rows.
     *
     * @param array[] $defaults Registry sections.
     *
     * @return array[]
     */
    protected function default_sections( array $defaults ): array {
        return array_map(
            function ( $section ) {
                return array_merge(
                    $section, [
						'custom' => false,
						'step' => '',
						'rows' => [],
					]
                );
            },
            $defaults
        );
    }

    /**
     * Rebuild sections and rows from the saved attributes, keeping their saved order.
     *
     * @param array   $saved    Saved sections.
     * @param array[] $defaults Registry sections.
     * @param array[] $rows     Available rows keyed by ID.
     *
     * @return array[]
     */
    protected function apply_saved_sections( array $saved, array $defaults, array $rows ): array {
        $defaults = array_column( $defaults, null, 'id' );
        $sections = [];
        $placed   = [];

        // Built-in row IDs, available or not, so a custom row can never stand in for one.
        $reserved = array_flip( wp_list_pluck( $this->registry->get_registered_rows(), 'id' ) );

        foreach ( $saved as $saved_section ) {
            if ( ! is_array( $saved_section ) ) {
                continue;
            }

            $id = sanitize_key( $saved_section['id'] ?? '' );

            if ( '' === $id || isset( $sections[ $id ] ) ) {
                continue;
            }

            if ( isset( $defaults[ $id ] ) ) {
                $section = array_merge( $defaults[ $id ], [ 'custom' => false ] );
            } elseif ( ! empty( $saved_section['custom'] ) ) {
                $section = [
                    'id'     => $id,
                    'title'  => $this->text( $saved_section['title'] ?? '' ),
                    'hidden' => false,
                    'locked' => false,
                    'custom' => true,
                ];
            } else {
                continue;
            }

            if ( ! $section['locked'] && isset( $saved_section['hidden'] ) ) {
                $section['hidden'] = (bool) $saved_section['hidden'];
            }

            $section['step'] = sanitize_key( $this->text( $saved_section['step'] ?? '' ) );
            $section['rows'] = [];

            foreach ( (array) ( $saved_section['rows'] ?? [] ) as $saved_row ) {
                $row = $this->resolve_saved_row( $saved_row, $rows, $placed, $reserved );

                if ( $row ) {
                    $section['rows'][]    = $row;
                    $placed[ $row['id'] ] = true;

                    if ( ! empty( $row['meta_key'] ) ) {
                        $placed[ 'meta:' . $row['meta_key'] ] = true;
                    }
                }
            }

            $sections[ $id ] = $section;
        }

        return array_values( $sections );
    }

    /**
     * Turn one saved row into a setup row, or null when it no longer applies.
     *
     * @param mixed   $saved_row Saved row.
     * @param array[] $rows      Available rows keyed by ID.
     * @param array   $placed    Row IDs and `meta:` keys already placed.
     * @param array   $reserved  Built-in row IDs, as keys.
     *
     * @return array|null
     */
    protected function resolve_saved_row( $saved_row, array $rows, array $placed, array $reserved ): ?array {
        if ( ! is_array( $saved_row ) ) {
            return null;
        }

        $id = sanitize_key( $this->text( $saved_row['id'] ?? '' ) );

        if ( '' === $id || isset( $placed[ $id ] ) ) {
            return null;
        }

        if ( ! empty( $saved_row['custom'] ) ) {
            $row = isset( $reserved[ $id ] ) ? null : $this->build_custom_row( $id, $saved_row );

            // Two fields saving to the same meta key would overwrite each other.
            return $row && ! isset( $placed[ 'meta:' . $row['meta_key'] ] ) ? $row : null;
        }

        // A row whose module is off, or that no longer exists, is dropped.
        if ( ! isset( $rows[ $id ] ) ) {
            return null;
        }

        $row = array_merge( $rows[ $id ], [ 'custom' => false ] );

        foreach ( [ 'label', 'placeholder', 'help' ] as $text ) {
            $value = $this->text( $saved_row[ $text ] ?? '' );

            if ( '' !== $value ) {
                $row[ $text ] = $value;
            }
        }

        if ( ! $row['locked'] ) {
            if ( isset( $saved_row['required'] ) ) {
                $row['required'] = (bool) $saved_row['required'];
            }

            // Rows Dokan settings switch on (EU fields, subscription packs) show whenever their setting is on.
            if ( isset( $saved_row['hidden'] ) && ! $row['keeps_section_visible'] ) {
                $row['hidden'] = (bool) $saved_row['hidden'];
            }
        }

        // Per-form labels for the parts of an extension row, limited to the parts it declares.
        $row['labels'] = [];

        if ( ! empty( $row['edit_labels'] ) && is_array( $saved_row['labels'] ?? null ) ) {
            foreach ( array_keys( (array) $row['edit_labels'] ) as $key ) {
                $label = $this->text( $saved_row['labels'][ $key ] ?? '' );

                if ( '' !== $label ) {
                    $row['labels'][ $key ] = $label;
                }
            }
        }

        return $row;
    }

    /**
     * Build a custom field row from its saved settings; rows without a valid meta key are dropped.
     *
     * @param string $id        Row ID.
     * @param array  $saved_row Saved row.
     *
     * @return array|null
     */
    protected function build_custom_row( string $id, array $saved_row ): ?array {
        $meta_key = $this->text( $saved_row['metaKey'] ?? '' );
        $type     = $this->text( $saved_row['type'] ?? 'text' );

        if ( ! $this->registry->is_custom_meta_key( $meta_key ) || ! in_array( $type, FieldRegistry::CUSTOM_FIELD_TYPES, true ) ) {
            return null;
        }

        $options = [];

        if ( in_array( $type, FieldRegistry::OPTION_FIELD_TYPES, true ) ) {
            foreach ( (array) ( $saved_row['options'] ?? [] ) as $option ) {
                // Values keep any language; they only need to be non-empty and unique.
                $value = is_array( $option ) ? $this->text( $option['value'] ?? '' ) : '';

                if ( '' !== $value && ! isset( $options[ $value ] ) ) {
                    $label             = $this->text( $option['label'] ?? '' );
                    $options[ $value ] = [
                        'label' => '' !== $label ? $label : $value,
                        'value' => $value,
                    ];
                }
            }
        }

        return [
            'id'                    => $id,
            'custom'                => true,
            'type'                  => $type,
            'label'                 => $this->text( $saved_row['label'] ?? '' ),
            'placeholder'           => $this->text( $saved_row['placeholder'] ?? '' ),
            'help'                  => $this->text( $saved_row['help'] ?? '' ),
            'required'              => ! empty( $saved_row['required'] ),
            'hidden'                => ! empty( $saved_row['hidden'] ),
            'locked'                => false,
            'options'               => array_values( $options ),
            'meta_key'              => $meta_key, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- row property, not a query.
            'input_name'            => 'dokan_vreg[' . $meta_key . ']',
            'keeps_section_visible' => false,
        ];
    }

    /**
     * Put back built-in sections the saved setup doesn't have, after the section that precedes them by default.
     *
     * @param array[] $sections Setup sections.
     * @param array[] $defaults Registry sections.
     *
     * @return array[]
     */
    protected function add_missing_sections( array $sections, array $defaults ): array {
        $previous = null;

        foreach ( $this->default_sections( $defaults ) as $default ) {
            $ids = wp_list_pluck( $sections, 'id' );

            if ( ! in_array( $default['id'], $ids, true ) ) {
                $index = null === $previous ? 0 : array_search( $previous, $ids, true ) + 1;
                array_splice( $sections, $index, 0, [ $default ] );
            }

            $previous = $default['id'];
        }

        return $sections;
    }

    /**
     * Place available rows the saved setup doesn't have into their default section, by position.
     *
     * @param array[] $sections Setup sections.
     * @param array[] $rows     Available rows keyed by ID.
     *
     * @return array[]
     */
    protected function add_missing_rows( array $sections, array $rows ): array {
        $placed = [];

        foreach ( $sections as $section ) {
            foreach ( $section['rows'] as $row ) {
                $placed[ $row['id'] ] = true;
            }
        }

        $section_index = array_flip( wp_list_pluck( $sections, 'id' ) );

        foreach ( $rows as $id => $row ) {
            if ( isset( $placed[ $id ] ) || ! isset( $section_index[ $row['section'] ] ) ) {
                continue;
            }

            $target = &$sections[ $section_index[ $row['section'] ] ]['rows'];
            $insert = 0;

            // Right after the last row that comes before it by default, wherever the owner moved that one.
            foreach ( $target as $index => $existing ) {
                if ( empty( $existing['custom'] ) && isset( $existing['position'] ) && $existing['position'] < $row['position'] ) {
                    $insert = $index + 1;
                }
            }

            array_splice( $target, $insert, 0, [ array_merge( $row, [ 'custom' => false ] ) ] );
            unset( $target );
        }

        return $sections;
    }

    /**
     * Resolve steps and assign every section to one.
     *
     * @param array   $attributes Saved block attributes.
     * @param array[] $sections   Setup sections.
     *
     * @return array
     */
    protected function apply_steps( array $attributes, array $sections ): array {
        $split = ! empty( $attributes['splitSteps'] );
        $steps = [];

        if ( $split ) {
            foreach ( (array) ( $attributes['steps'] ?? [] ) as $step ) {
                $id = is_array( $step ) ? sanitize_key( $this->text( $step['id'] ?? '' ) ) : '';

                if ( '' !== $id ) {
                    $steps[ $id ] = [
                        'id'    => $id,
                        'title' => $this->text( $step['title'] ?? '' ),
                    ];
                }
            }

            $suggested = $this->registry->get_suggested_steps();
            $steps     = $steps ? array_values( $steps ) : $suggested['steps'];
            $step_ids  = wp_list_pluck( $steps, 'id' );
            $last_step = end( $step_ids );

            foreach ( $sections as &$section ) {
                if ( in_array( $section['step'], $step_ids, true ) ) {
                    continue;
                }

                $default_step    = $suggested['sections'][ $section['id'] ] ?? '';
                $section['step'] = in_array( $default_step, $step_ids, true ) ? $default_step : $last_step;
            }
            unset( $section );
        } else {
            foreach ( $sections as &$section ) {
                $section['step'] = '';
            }
            unset( $section );
        }

        return [
            'split_steps' => $split,
            'steps'       => $steps,
            'sections'    => $sections,
        ];
    }

    /**
     * Sanitize a saved text value; anything that isn't a scalar becomes an empty string.
     *
     * @param mixed $value Saved value.
     *
     * @return string
     */
    protected function text( $value ): string {
        return is_scalar( $value ) ? sanitize_text_field( (string) $value ) : '';
    }
}
