<?php
// phpcs:disable WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_file_get_contents
// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_fopen
// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_fclose
// phpcs:disable WordPress.WP.AlternativeFunctions.json_encode_json_encode
// phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited
/**
 * Generate the CSV-derived settings schema fragment.
 *
 * Reads the unified inventory JSON produced by `parse_settings_csv.php` (after
 * the `Transaction → Transactions` jq pass) and emits a PHP file containing a
 * `return [ … ];` array of schema elements that `SettingsSchema::get_schema()`
 * can splice into its flat schema.
 *
 * Standalone CLI migration tool — runs outside the WordPress runtime, so
 * `WP_Filesystem` / `wp_json_encode` / global-name protections do not apply.
 *
 * Three classes of CSV row:
 *   - Mapped row (Mapping != "" && != "-") → emit `type: field` entry.
 *   - Unmapped row with `KEEP-BRIDGE-ONLY[-NESTED]` decision → emit
 *     `bridge_only: true` entry. These never appear in the UI but the bridge
 *     still preserves their stored values across the new flat option.
 *   - Unmapped row with `DROP` decision → skipped (UI sub_section headers).
 *
 * Decisions are sourced from the frozen inventory doc at
 * `docs/superpowers/specs/2026-05-16-csv-fields-inventory.md`. Any unmapped row
 * that isn't represented in the decisions table is a bug — the generator stops
 * and reports the offender so a human can update the doc.
 *
 * Usage:
 *   php tools/migration/generate_schema_fragment.php /tmp/csv_inventory.unified.json \
 *       > includes/Admin/Settings/Schema/Generated/csv_fields.php
 *   php -l includes/Admin/Settings/Schema/Generated/csv_fields.php
 *
 * @package WeDevs\Dokan\Migration
 */

declare( strict_types=1 );

if ( PHP_SAPI !== 'cli' ) {
    fwrite( STDERR, "This tool must be run from the CLI.\n" );
    exit( 1 );
}

if ( $argc < 2 ) {
    fwrite( STDERR, "Usage: php {$argv[0]} <inventory.unified.json>\n" );
    exit( 1 );
}

$inventory_path = $argv[1];
if ( ! is_file( $inventory_path ) ) {
    fwrite( STDERR, "Inventory JSON not found: {$inventory_path}\n" );
    exit( 1 );
}

$inventory_raw  = file_get_contents( $inventory_path );
$inventory_rows = json_decode( $inventory_raw, true );
if ( ! is_array( $inventory_rows ) ) {
    fwrite( STDERR, "Failed to decode inventory JSON.\n" );
    exit( 1 );
}

/**
 * Unmapped-row decisions sourced from the inventory doc.
 *
 * Keyed by `<SectionKey>|<FieldKey>`. Values are one of:
 *   - `DROP`                       — silently skip; UI sub_section header, no value.
 *   - `KEEP-BRIDGE-ONLY`           — emit a `bridge_only: true` entry.
 *   - `KEEP-BRIDGE-ONLY-NESTED`    — same emission, marker reserved for Task 7
 *                                    (nested gmap shape) so a future change can
 *                                    distinguish without a doc round-trip.
 */
$decisions = [
    // DROP — sub_section UI headers (no stored value).
    'dokan_general|site_options'                  => 'DROP',
    'dokan_general|vendor_store_options'          => 'DROP',
    'dokan_general|product_page_options'          => 'DROP',
    'dokan_selling|commission'                    => 'DROP',
    'dokan_selling|fee-recipients'                => 'DROP',
    'dokan_selling|selling_capabilities'          => 'DROP',
    'dokan_selling|catalog_mode_settings'         => 'DROP',
    'dokan_appearance|appearance_options'         => 'DROP',
    'dokan_social_api|section_title'              => 'DROP',

    // KEEP-BRIDGE-ONLY — real fields without a new-UI home (yet).
    'dokan_selling|catalog_mode_hide_product_price'           => 'KEEP-BRIDGE-ONLY',
    'dokan_appearance|store_map'                              => 'KEEP-BRIDGE-ONLY',
    'dokan_geolocation|location'                              => 'KEEP-BRIDGE-ONLY-NESTED',
    'dokan_product_subscription|cancelling_email_subject'     => 'KEEP-BRIDGE-ONLY',
    'dokan_product_subscription|cancelling_email_body'        => 'KEEP-BRIDGE-ONLY',
    'dokan_product_subscription|alert_email_subject'          => 'KEEP-BRIDGE-ONLY',
    'dokan_product_subscription|alert_email_body'             => 'KEEP-BRIDGE-ONLY',
    'dokan_product_advertisement|vendor_subscription_enabled' => 'KEEP-BRIDGE-ONLY',
];

/**
 * Slugify a single path segment.
 *
 * `strtolower(preg_replace('/[^a-z0-9]+/i', '_', $segment))` then trim of
 * leading/trailing underscores. Empty segments collapse to ''.
 */
$slugify = static function ( string $raw ): string {
    $slug = strtolower( (string) preg_replace( '/[^a-z0-9]+/i', '_', $raw ) );
    return trim( $slug, '_' );
};

/**
 * Build the full slug for a mapped field.
 *
 * `<top_tab>_<sub_path joined>_<FieldKey>` with collapsing of repeat
 * underscores after concatenation.
 */
$build_field_id = static function ( array $path, string $field_key ) use ( $slugify ): string {
    $parts = array_map( $slugify, $path );
    $parts[] = $slugify( $field_key );
    $parts = array_filter( $parts, static fn ( $p ) => $p !== '' );
    $id    = implode( '_', $parts );
    // Collapse any double underscores introduced by oddly punctuated segments.
    $id = (string) preg_replace( '/_+/', '_', $id );
    return trim( $id, '_' );
};

$fields      = [];
$bridge_only = [];
$id_counts   = [];
$collisions  = [];
$drops       = 0;
$total_rows  = 0;

foreach ( $inventory_rows as $row ) {
    ++$total_rows;
    $section = (string) ( $row['SectionKey'] ?? '' );
    $field   = (string) ( $row['FieldKey'] ?? '' );
    $mapping = (string) ( $row['Mapping'] ?? '' );
    $key     = $section . '|' . $field;

    $is_unmapped = $mapping === '' || $mapping === '-';

    if ( $is_unmapped ) {
        if ( ! isset( $decisions[ $key ] ) ) {
            fwrite( STDERR, "FATAL: unmapped row without a decision: {$key}\n" );
            fwrite( STDERR, "Add it to the inventory doc and the \$decisions array.\n" );
            exit( 2 );
        }

        $decision = $decisions[ $key ];

        if ( $decision === 'DROP' ) {
            ++$drops;
            continue;
        }

        // KEEP-BRIDGE-ONLY[-NESTED].
        $bridge_id = 'bridge_only_' . $slugify( $field );

        $bridge_only[] = [
            'bridge_only' => true,
            'id'          => $bridge_id,
            'legacy_key'  => [
                'option' => $section,
                'field'  => $field,
            ],
        ];
        continue;
    }

    // Mapped row.
    $path = isset( $row['_new_path'] ) && is_array( $row['_new_path'] )
        ? array_values( array_filter( array_map( 'trim', $row['_new_path'] ), static fn ( $s ) => $s !== '' ) )
        : [];

    if ( ! $path ) {
        fwrite( STDERR, "FATAL: mapped row with empty _new_path: {$key}\n" );
        exit( 2 );
    }

    $top_tab  = (string) ( $row['_new_top'] ?? $path[0] );
    $sub_path = array_slice( $path, 1 );

    $new_label       = (string) ( $row['New Label'] ?? '' );
    $new_description = (string) ( $row['New Description'] ?? '' );
    $old_label       = (string) ( $row['Label'] ?? '' );
    $old_description = (string) ( $row['Description'] ?? '' );

    $label       = ( $new_label !== '' && $new_label !== '-' ) ? $new_label : $old_label;
    $description = ( $new_description !== '' && $new_description !== '-' ) ? $new_description : $old_description;

    $field_type    = (string) ( $row['FieldType'] ?? '' );

    // CSV DefaultValue cells are wrapped in single quotes by the source export
    // (Google Sheets style). Strip a leading and/or trailing single quote so
    // the emitted default matches the legacy stored value verbatim.
    $default_value = $row['DefaultValue'] ?? '';
    if ( is_string( $default_value ) ) {
        if ( strlen( $default_value ) >= 1 && substr( $default_value, 0, 1 ) === "'" ) {
            $default_value = substr( $default_value, 1 );
        }
        if ( strlen( $default_value ) >= 1 && substr( $default_value, -1 ) === "'" ) {
            $default_value = substr( $default_value, 0, -1 );
        }
    }
    $other_info    = isset( $row['_other_info'] ) && is_array( $row['_other_info'] )
        ? $row['_other_info']
        : [];
    $is_lite       = (bool) ( $other_info['is_lite'] ?? false );

    $id = $build_field_id( $path, $field );

    // Track id frequency so we can produce deterministic suffixes for collisions.
    if ( ! isset( $id_counts[ $id ] ) ) {
        $id_counts[ $id ] = 0;
    }
    ++$id_counts[ $id ];

    if ( $id_counts[ $id ] > 1 ) {
        $resolved   = $id . '_' . $id_counts[ $id ];
        $collisions[] = [
            'original' => $id,
            'resolved' => $resolved,
            'section'  => $section,
            'field'    => $field,
        ];
        $id = $resolved;
    }

    $fields[] = [
        'type'        => 'field',
        'id'          => $id,
        'top_tab'     => $top_tab,
        'sub_path'    => $sub_path,
        'label'       => $label,
        'description' => $description,
        'field_type'  => $field_type,
        'default'     => $default_value,
        'is_lite'     => $is_lite,
        'legacy_key'  => [
            'option' => $section,
            'field'  => $field,
        ],
    ];
}

if ( $collisions ) {
    fwrite( STDERR, 'WARNING: id collisions detected (' . count( $collisions ) . "):\n" );
    foreach ( $collisions as $c ) {
        fwrite( STDERR, "  {$c['section']}.{$c['field']} → {$c['original']} (resolved to {$c['resolved']})\n" );
    }
}

fwrite(
    STDERR,
    sprintf(
        "Generated: %d fields, %d bridge-only, %d dropped, %d total rows.\n",
        count( $fields ),
        count( $bridge_only ),
        $drops,
        $total_rows
    )
);

/**
 * Render a single value (recursively) into a PHP-array literal source string.
 *
 * Keeps the output deterministic and human-readable. Strings use
 * `var_export` (which produces single-quoted strings with proper escaping).
 */
$render_value = static function ( $value, int $indent ) use ( &$render_value ): string {
    $pad   = str_repeat( '    ', $indent );
    $pad_i = str_repeat( '    ', $indent + 1 );

    if ( is_array( $value ) ) {
        if ( $value === [] ) {
            return '[]';
        }
        $is_list = array_keys( $value ) === range( 0, count( $value ) - 1 );
        $lines   = [];
        foreach ( $value as $k => $v ) {
            $rendered = $render_value( $v, $indent + 1 );
            if ( $is_list ) {
                $lines[] = $pad_i . $rendered . ',';
            } else {
                $lines[] = $pad_i . var_export( $k, true ) . ' => ' . $rendered . ',';
            }
        }
        return "[\n" . implode( "\n", $lines ) . "\n" . $pad . ']';
    }

    if ( is_bool( $value ) ) {
        return $value ? 'true' : 'false';
    }

    if ( $value === null ) {
        return 'null';
    }

    if ( is_int( $value ) || is_float( $value ) ) {
        return (string) $value;
    }

    // Strings (including ints-as-strings) — preserve fidelity from the CSV.
    return var_export( (string) $value, true );
};

// Assemble the file.
$all_elements = array_merge( $fields, $bridge_only );

$header = <<<'PHP'
<?php
// phpcs:ignoreFile
/**
 * Auto-generated CSV-derived settings schema fragment.
 *
 * Produced by `tools/migration/generate_schema_fragment.php` from the frozen
 * settings inventory CSV. DO NOT EDIT BY HAND — re-run the generator instead.
 *
 * Source CSV:  Settings.Mapping.-.fields_extracted_fixed.csv (225 rows)
 * Source JSON: /tmp/csv_inventory.unified.json
 * Generated:   %GENERATED_AT%
 *
 * Wired into `SettingsSchema::get_schema()` behind the `dokan_csv_schema_enabled`
 * WordPress option (default `false`). When the flag is off this file is not
 * required and production behaviour is identical to the hand-authored schema.
 *
 * @package WeDevs\Dokan\Admin\Settings\Schema\Generated
 */

PHP;

$header = str_replace( '%GENERATED_AT%', gmdate( 'Y-m-d H:i:s' ) . ' UTC', $header );

$body = 'return ' . $render_value( $all_elements, 0 ) . ";\n";

echo $header . "\n" . $body;
