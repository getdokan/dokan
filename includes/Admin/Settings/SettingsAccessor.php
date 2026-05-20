<?php

namespace WeDevs\Dokan\Admin\Settings;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;

/**
 * Default {@see SettingsAccessorInterface} implementation.
 *
 * Reads are served from {@see SettingsRegistry}, which already overlays the
 * legacy per-section options via {@see LegacySettingsBridge::hydrate_new_from_legacy()}
 * during its `populate_values()` step. The accessor adds no read logic of its
 * own — it just shapes the API.
 *
 * @since DOKAN_SINCE
 */
final class SettingsAccessor implements SettingsAccessorInterface {

	private SettingsRegistry $registry;

	/**
	 * Per-request set of unknown ids that have already been logged, used to
	 * de-duplicate WP_DEBUG notices when a missing key is read in a loop.
	 *
	 * @var array<string,bool>
	 */
	private array $logged_unknown_keys = [];

	/**
	 * @since DOKAN_SINCE
	 *
	 * @param SettingsRegistry $registry
	 */
	public function __construct( SettingsRegistry $registry ) {
		$this->registry = $registry;
	}

	/**
	 * {@inheritDoc}
	 */
	public function get( string $key, $fallback = null ) {
		$field = $this->registry->find_field( $key );

		if ( null === $field ) {
			$this->log_unknown_key_once( $key );
			return $fallback;
		}

		// The registry's populate_values() always sets 'value'; this guard
		// handles schema elements injected by extensions that bypass it.
		if ( array_key_exists( 'value', $field ) ) {
			return $field['value'];
		}

		return $field['default'] ?? $fallback;
	}

	/**
	 * {@inheritDoc}
	 */
	public function has( string $key ): bool {
		return null !== $this->registry->find_field( $key );
	}

	/**
	 * {@inheritDoc}
	 */
	public function all(): array {
		$out = [];
		foreach ( $this->registry->get_schema() as $element ) {
			if ( ( $element['type'] ?? '' ) !== 'field' ) {
				continue;
			}
			$id = $element['id'] ?? '';
			if ( '' === $id ) {
				continue;
			}
			if ( array_key_exists( 'value', $element ) ) {
				$out[ $id ] = $element['value'];
				continue;
			}
			$out[ $id ] = $element['default'] ?? null;
		}
		return $out;
	}

	/**
	 * Log an unknown key once per request (only when WP_DEBUG is on).
	 *
	 * @param string $key
	 */
	private function log_unknown_key_once( string $key ): void {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}
		if ( isset( $this->logged_unknown_keys[ $key ] ) ) {
			return;
		}
		$this->logged_unknown_keys[ $key ] = true;
		if ( function_exists( 'dokan_log' ) ) {
			dokan_log( sprintf( '[settings] unregistered key read via accessor: %s', $key ) );
		}
	}
}
