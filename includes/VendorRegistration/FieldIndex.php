<?php

namespace WeDevs\Dokan\VendorRegistration;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Finds the custom field meta keys in use: in registration blocks on any page, and in vendor answers.
 *
 * @since DOKAN_SINCE
 */
class FieldIndex {

    /** Post types a registration block can be saved in. */
    const POST_TYPES = [ 'page', 'post', 'wp_block', 'wp_template', 'wp_template_part' ];

    /** @var FormSetup */
    protected FormSetup $setup;

    /** @var FieldRegistry */
    protected FieldRegistry $registry;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FormSetup     $setup    Form setup reader.
     * @param FieldRegistry $registry Field registry.
     */
    public function __construct( FormSetup $setup, FieldRegistry $registry ) {
        $this->setup    = $setup;
        $this->registry = $registry;
    }

    /**
     * Get every saved custom field key with what's known about it.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, array> Keyed by meta key: `key`, `label`, `type`, `options`, `pages`, `answers`, `removed`.
     */
    public function get_fields(): array {
        $fields = [];

        foreach ( $this->get_block_posts() as $post ) {
            foreach ( $this->find_blocks( parse_blocks( $post->post_content ) ) as $block ) {
                $setup = $this->setup->build( (array) ( $block['attrs'] ?? [] ) );

                foreach ( $setup['sections'] as $section ) {
                    foreach ( $section['rows'] as $row ) {
                        if ( empty( $row['custom'] ) ) {
                            continue;
                        }

                        $key = $row['meta_key'];

                        if ( ! isset( $fields[ $key ] ) ) {
                            $fields[ $key ] = [
                                'key'     => $key,
                                'label'   => $row['label'],
                                'type'    => $row['type'],
                                'options' => $row['options'],
                                'pages'   => [],
                                'answers' => 0,
                                'removed' => false,
                            ];
                        }

                        $fields[ $key ]['pages'][ $post->ID ] = [
                            'id'    => $post->ID,
                            'title' => get_the_title( $post ),
                        ];
                    }
                }
            }
        }

        foreach ( $this->get_answer_stats() as $key => $stats ) {
            if ( ! isset( $fields[ $key ] ) ) {
                // Fields deleted from every form: only their answers remain.
                $fields[ $key ] = [
                    'key'     => $key,
                    'label'   => ucwords( str_replace( '_', ' ', substr( $key, strlen( FieldRegistry::META_KEY_PREFIX ) ) ) ),
                    'type'    => $this->guess_type( $stats['sample'] ),
                    'options' => [],
                    'pages'   => [],
                    'answers' => 0,
                    'removed' => true,
                ];
            }

            $fields[ $key ]['answers'] = $stats['answers'];
        }

        foreach ( $fields as &$field ) {
            $field['pages'] = array_values( $field['pages'] );
        }
        unset( $field );

        return $fields;
    }

    /**
     * Posts holding a registration block, in any status an owner can edit.
     *
     * @since DOKAN_SINCE
     *
     * @return \WP_Post[]
     */
    public function get_block_posts(): array {
        global $wpdb;

        $types    = implode( ',', array_fill( 0, count( self::POST_TYPES ), '%s' ) );
        $like     = '%' . $wpdb->esc_like( '<!-- wp:' . FormSetup::BLOCK_NAME ) . '%';
        $post_ids = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- editor-only lookup across post types.
            $wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts} WHERE post_type IN ($types) AND post_status IN ('publish', 'draft', 'pending', 'private', 'future') AND post_content LIKE %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $types holds placeholders.
                array_merge( self::POST_TYPES, [ $like ] )
            )
        );

        return array_filter( array_map( 'get_post', array_map( 'intval', $post_ids ) ) );
    }

    /**
     * Count the answers saved under each custom field key.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, array{answers: int, sample: string}>
     */
    public function get_answer_stats(): array {
        global $wpdb;

        $rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- editor-only aggregate.
            $wpdb->prepare(
                "SELECT meta_key, COUNT(*) AS answers, MAX(meta_value) AS sample FROM {$wpdb->usermeta} WHERE meta_key LIKE %s AND meta_value <> '' GROUP BY meta_key",
                $wpdb->esc_like( FieldRegistry::META_KEY_PREFIX ) . '%'
            ),
            ARRAY_A
        );

        $stats = [];

        foreach ( (array) $rows as $row ) {
            if ( ! $this->registry->is_custom_meta_key( (string) $row['meta_key'] ) ) {
                continue;
            }

            $stats[ $row['meta_key'] ] = [
                'answers' => (int) $row['answers'],
                'sample'  => (string) $row['sample'],
            ];
        }

        return $stats;
    }

    /**
     * Guess a removed field's type from one of its saved answers.
     *
     * @since DOKAN_SINCE
     *
     * @param string $sample Saved meta value.
     *
     * @return string
     */
    public function guess_type( string $sample ): string {
        if ( is_serialized( $sample ) ) {
            return 'multiselect';
        }

        if ( in_array( $sample, [ 'yes', 'no' ], true ) ) {
            return 'checkbox';
        }

        if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $sample ) ) {
            return 'date';
        }

        if ( is_numeric( $sample ) ) {
            return 'number';
        }

        if ( is_email( $sample ) ) {
            return 'email';
        }

        if ( preg_match( '#^https?://#i', $sample ) ) {
            return 'url';
        }

        return false !== strpos( $sample, "\n" ) ? 'textarea' : 'text';
    }

    /**
     * Every registration block in parsed blocks, including nested ones.
     *
     * @since DOKAN_SINCE
     *
     * @param array $blocks Parsed blocks.
     *
     * @return array[]
     */
    protected function find_blocks( array $blocks ): array {
        $found = [];

        foreach ( $blocks as $block ) {
            if ( FormSetup::BLOCK_NAME === ( $block['blockName'] ?? '' ) ) {
                $found[] = $block;
            }

            if ( ! empty( $block['innerBlocks'] ) ) {
                $found = array_merge( $found, $this->find_blocks( $block['innerBlocks'] ) );
            }
        }

        return $found;
    }
}
