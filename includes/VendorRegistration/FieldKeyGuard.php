<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Re-checks custom field keys when a page with the block is saved, so the editor's key rules hold site-wide.
 *
 * @since DOKAN_SINCE
 */
class FieldKeyGuard implements Hookable {

    /** Longest key the editor generates. */
    const MAX_LENGTH = 50;

    /** @var FieldIndex */
    protected FieldIndex $index;

    /** @var FieldRegistry */
    protected FieldRegistry $registry;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FieldIndex    $index    Saved field index.
     * @param FieldRegistry $registry Field registry.
     */
    public function __construct( FieldIndex $index, FieldRegistry $registry ) {
        $this->index    = $index;
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
        add_filter( 'wp_insert_post_data', [ $this, 'check_keys' ], 10, 2 );
    }

    /**
     * Rewrite clashing custom field keys in the content about to be saved.
     *
     * @since DOKAN_SINCE
     *
     * @param array $data    Slashed post data.
     * @param array $postarr Slashed post array.
     *
     * @return array
     */
    public function check_keys( $data, $postarr ) {
        if ( ! is_array( $data ) || ! in_array( $data['post_type'] ?? '', FieldIndex::POST_TYPES, true ) ) {
            return $data;
        }

        $content = wp_unslash( (string) ( $data['post_content'] ?? '' ) );

        if ( false === strpos( $content, '<!-- wp:' . FormSetup::BLOCK_NAME ) ) {
            return $data;
        }

        $blocks = parse_blocks( $content );

        if ( $this->fix_blocks( $blocks, (int) ( $postarr['ID'] ?? 0 ) ) ) {
            $data['post_content'] = wp_slash( serialize_blocks( $blocks ) );
        }

        return $data;
    }

    /**
     * Give every custom row in the registration blocks a key that holds site-wide.
     *
     * @since DOKAN_SINCE
     *
     * @param array $blocks  Parsed blocks, changed in place.
     * @param int   $post_id Post being saved; 0 for a new one.
     *
     * @return bool Whether any key changed.
     */
    public function fix_blocks( array &$blocks, int $post_id ): bool {
        $used = [];

        return $this->fix_rows( $blocks, $this->get_known_fields( $post_id ), $this->get_previous_rows( $post_id ), $used );
    }

    /**
     * Walk the blocks, nested ones included, resolving each custom row's key against the page's one index.
     *
     * @since DOKAN_SINCE
     *
     * @param array $blocks   Parsed blocks, changed in place.
     * @param array $known    Fields used elsewhere.
     * @param array $previous This page's last saved rows.
     * @param array $used     Keys given to rows so far, as keys; shared across the page's blocks.
     *
     * @return bool Whether any key changed.
     */
    protected function fix_rows( array &$blocks, array $known, array $previous, array &$used ): bool {
        $changed = false;

        foreach ( $blocks as &$block ) {
            if ( ! empty( $block['innerBlocks'] ) && $this->fix_rows( $block['innerBlocks'], $known, $previous, $used ) ) {
                $changed = true;
            }

            if ( FormSetup::BLOCK_NAME !== ( $block['blockName'] ?? '' ) || ! is_array( $block['attrs']['sections'] ?? null ) ) {
                continue;
            }

            foreach ( $block['attrs']['sections'] as &$section ) {
                if ( ! is_array( $section['rows'] ?? null ) ) {
                    continue;
                }

                foreach ( $section['rows'] as &$row ) {
                    if ( ! is_array( $row ) || empty( $row['custom'] ) ) {
                        continue;
                    }

                    $key = is_string( $row['metaKey'] ?? null ) ? $row['metaKey'] : '';

                    // FormSetup drops rows without a usable key.
                    if ( ! $this->registry->is_custom_meta_key( $key ) ) {
                        continue;
                    }

                    $resolved = $this->resolve_key(
                        (string) ( $row['id'] ?? '' ),
                        $key,
                        is_string( $row['type'] ?? null ) ? $row['type'] : 'text',
                        ! empty( $row['reused'] ),
                        $known,
                        $previous,
                        $used
                    );

                    $used[ $resolved ] = true;

                    if ( $resolved !== $key ) {
                        $row['metaKey'] = $resolved;
                        unset( $row['reused'] );
                        $changed = true;
                    }
                }
                unset( $row );
            }
            unset( $section );
        }
        unset( $block );

        return $changed;
    }

    /**
     * The key a row may save under.
     *
     * @since DOKAN_SINCE
     *
     * @param string $row_id   Row ID.
     * @param string $key      Key the editor sent.
     * @param string $type     Field type.
     * @param bool   $reused   Whether the key was picked from the saved fields.
     * @param array  $known    Fields used elsewhere, keyed by meta key: `type` (null when only answers remain).
     * @param array  $previous This page's last saved rows: `by_id` (row ID => key, type) and `by_key` (key => type).
     * @param array  $used     Keys already given to rows in this content, as keys.
     *
     * @return string
     */
    protected function resolve_key( string $row_id, string $key, string $type, bool $reused, array $known, array $previous, array $used ): string {
        $elsewhere = $known[ $key ] ?? null;
        $kept      = ! isset( $used[ $key ] );

        if ( $kept && $elsewhere ) {
            // One meaning per key: the type it has elsewhere, or had here once only its answers remain.
            $expected = $elsewhere['type'] ?? ( $previous['by_key'][ $key ] ?? null );
            // And no silent sharing: this page must already have had it, or picked it.
            $kept = ( null === $expected || $type === $expected ) && ( isset( $previous['by_key'][ $key ] ) || $reused );
        }

        if ( $kept ) {
            return $key;
        }

        // The key this page gave the row last time keeps a stale editor from renaming it on every save.
        $last = $previous['by_id'][ $row_id ]['key'] ?? '';

        if ( '' !== $last && $last !== $key && ! isset( $used[ $last ] ) && ( ! isset( $known[ $last ]['type'] ) || $type === $known[ $last ]['type'] ) ) {
            return $last;
        }

        return $this->unique_key( $key, $known, $previous, $used );
    }

    /**
     * A numbered variant of the key that nothing else uses, as the editor would make.
     *
     * @since DOKAN_SINCE
     *
     * @param string $key      Clashing key.
     * @param array  $known    Fields used elsewhere.
     * @param array  $previous This page's last saved rows.
     * @param array  $used     Keys given to rows in this content.
     *
     * @return string
     */
    protected function unique_key( string $key, array $known, array $previous, array $used ): string {
        $base   = (string) preg_replace( '/_\d+$/', '', $key );
        $base   = '' !== $base ? $base : $key;
        $suffix = 1;

        do {
            $tail      = '_' . ( ++$suffix );
            $candidate = substr( $base, 0, self::MAX_LENGTH - strlen( $tail ) ) . $tail;
        } while (
            isset( $known[ $candidate ] )
            || isset( $previous['by_key'][ $candidate ] )
            || isset( $used[ $candidate ] )
            || in_array( $candidate, FieldRegistry::RESERVED_META_KEYS, true )
        );

        return $candidate;
    }

    /**
     * Fields used on other pages or answered by vendors, with the type they hold there.
     *
     * @since DOKAN_SINCE
     *
     * @param int $post_id Post being saved.
     *
     * @return array<string, array{type: string|null}> Type is null when only answers remain: the index can only guess it.
     */
    protected function get_known_fields( int $post_id ): array {
        $known = [];

        foreach ( $this->index->get_fields( $post_id ) as $key => $field ) {
            if ( $field['pages'] || $field['answers'] > 0 ) {
                $known[ $key ] = [ 'type' => $field['removed'] ? null : $field['type'] ];
            }
        }

        return $known;
    }

    /**
     * The custom rows this page saved last time.
     *
     * @since DOKAN_SINCE
     *
     * @param int $post_id Post being saved.
     *
     * @return array{by_id: array<string, array{key: string, type: string}>, by_key: array<string, string>}
     */
    protected function get_previous_rows( int $post_id ): array {
        $rows = [
            'by_id'  => [],
            'by_key' => [],
        ];
        $post = $post_id ? get_post( $post_id ) : null;

        if ( ! $post ) {
            return $rows;
        }

        foreach ( $this->index->find_blocks( parse_blocks( (string) $post->post_content ) ) as $block ) {
            foreach ( (array) ( $block['attrs']['sections'] ?? [] ) as $section ) {
                foreach ( (array) ( $section['rows'] ?? [] ) as $row ) {
                    $key = is_array( $row ) && ! empty( $row['custom'] ) && is_string( $row['metaKey'] ?? null ) ? $row['metaKey'] : '';

                    if ( '' === $key ) {
                        continue;
                    }

                    $type = is_string( $row['type'] ?? null ) ? $row['type'] : 'text';

                    $rows['by_key'][ $key ]                         = $type;
                    $rows['by_id'][ (string) ( $row['id'] ?? '' ) ] = [
                        'key'  => $key,
                        'type' => $type,
                    ];
                }
            }
        }

        return $rows;
    }
}
