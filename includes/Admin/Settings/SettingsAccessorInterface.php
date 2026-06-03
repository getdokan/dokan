<?php

namespace WeDevs\Dokan\Admin\Settings;

/**
 * Read-only API for accessing Dokan admin settings by their flat schema id.
 *
 * Implementations are schema-aware: defaults come from the registered field
 * definition, and stored values are overlaid via {@see LegacySettingsBridge}
 * so legacy per-section options remain visible during the migration window.
 *
 * @since DOKAN_SINCE
 */
interface SettingsAccessorInterface {

	/**
	 * Read a setting by its flat schema id.
	 *
	 * Resolution order:
	 *   1. If the id is registered, return its overlay-applied value (falling
	 *      back to the schema default when nothing is stored). The supplied
	 *      `$fallback` is ignored.
	 *   2. If the id is not registered, return `$fallback` and (in WP_DEBUG)
	 *      log the miss once per request per id.
	 *
	 * @param string $key      Flat schema id.
	 * @param mixed  $fallback Returned only when $key is not registered.
	 *
	 * @return mixed
	 */
	public function get( string $key, $fallback = null );

	/**
	 * Whether the given id is registered in the schema.
	 *
	 * @param string $key Flat schema id.
	 *
	 * @return bool
	 */
	public function has( string $key ): bool;

	/**
	 * Whether `$key` has a value present in storage (the flat option or, via
	 * the legacy bridge, a mapped per-section legacy option).
	 *
	 * Distinct from {@see has()}: a registered key with no stored value
	 * returns true from `has()` (it's known to the schema) but false from
	 * `has_stored()` (its effective value comes from the schema default,
	 * not from a user-set value).
	 *
	 * Use this to preserve runtime fallback contracts that depend on whether
	 * the user explicitly set a value — e.g. "fall back to the product tax
	 * recipient when shipping_tax_fee_recipient isn't explicitly stored".
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param string $key Flat schema id.
	 *
	 * @return bool
	 */
	public function has_stored( string $key ): bool;

	/**
	 * Snapshot of every registered field's effective value, keyed by id.
	 *
	 * @return array<string,mixed>
	 */
	public function all(): array;
}
