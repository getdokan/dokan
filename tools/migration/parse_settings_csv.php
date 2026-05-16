<?php
// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_fopen
// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_fclose
// phpcs:disable WordPress.WP.AlternativeFunctions.json_encode_json_encode
// phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited
// phpcs:disable Generic.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition
// phpcs:disable PHPCompatibility.ParameterValues.RemovedProprietaryCSVEscaping.DeprecatedParamNotPassed
/**
 * Parse the frozen Settings.Mapping CSV into a normalized JSON stream.
 *
 * Standalone CLI migration tool — runs outside the WordPress runtime, so
 * `WP_Filesystem` / `wp_json_encode` / global-name protections do not apply.
 *
 * Reads the CSV with fgetcsv() so quoted commas/newlines are handled natively.
 * For each data row it emits the original columns plus three derived helpers:
 *   - _new_top:    top-level destination (first segment of `Mapping`, trimmed)
 *   - _new_path:   full destination path as an array of trimmed segments
 *   - _other_info: decoded `OtherInfoJSON` (or [] if not parseable)
 *
 * Rows with fewer than the expected column count are skipped — those are
 * malformed continuation artefacts that survived the CSV unflattening.
 *
 * Rows with MORE columns than expected are real records whose `OtherInfoJSON`
 * value had unescaped double quotes that confused the CSV quoting. The first
 * 10 columns are still structurally intact in these rows, so we glue the
 * trailing columns back into the last (`OtherInfoJSON`) column with commas.
 * The recovered JSON may not parse — that's fine, `_other_info` falls back
 * to `[]` and the structural fields we depend on are correct.
 *
 * Usage:
 *   php tools/migration/parse_settings_csv.php [csv-path] > /tmp/csv_inventory.json
 */

$path = $argv[1] ?? '/Users/mahbub/Downloads/Settings.Mapping.-.fields_extracted_fixed.csv';

$fh = fopen( $path, 'r' );
if ( ! $fh ) {
	fwrite( STDERR, "Unable to open CSV: $path\n" );
	exit( 1 );
}

$head = fgetcsv( $fh );
if ( ! $head ) {
	fwrite( STDERR, "Unable to read CSV header from: $path\n" );
	exit( 1 );
}

$expected_cols = count( $head );
$out           = [];

while ( ( $r = fgetcsv( $fh ) ) !== false ) {
	$col_count = count( $r );
	if ( $col_count < $expected_cols ) {
		continue; // skip malformed continuation rows
	}
	if ( $col_count > $expected_cols ) {
		// Over-wide rows: unescaped quotes inside OtherInfoJSON split the
		// last column across multiple fields. Glue the trailing fragments
		// back into the final column so structural fields stay aligned.
		$base   = array_slice( $r, 0, $expected_cols - 1 );
		$base[] = implode( ',', array_slice( $r, $expected_cols - 1 ) );
		$r      = $base;
	}

	$rec                = array_combine( $head, $r );
	$mapping            = isset( $rec['Mapping'] ) ? (string) $rec['Mapping'] : '';
	$segments           = $mapping === '' ? [ '' ] : array_map( 'trim', explode( '>', $mapping ) );
	$rec['_new_top']    = trim( $segments[0] ?? '' );
	$rec['_new_path']   = $segments;
	$other_raw          = isset( $rec['OtherInfoJSON'] ) ? (string) $rec['OtherInfoJSON'] : '';
	$other_decoded      = json_decode( $other_raw, true );
	$rec['_other_info'] = is_array( $other_decoded ) ? $other_decoded : [];

	$out[] = $rec;
}

fclose( $fh );

echo json_encode( $out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
