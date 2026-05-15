<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

/**
 * Legacy Settings Bridge.
 *
 * Bidirectional mapping between the new flat `dokan_settings` wp_option and
 * the legacy per-page `dokan_*` wp_options. Supports the legacy-view toggle
 * without coupling the new REST write path to legacy storage.
 *
 * See docs/superpowers/specs/2026-05-15-legacy-settings-bridge-design.md.
 *
 * @since DOKAN_SINCE
 */
class LegacySettingsBridge {

    /**
     * Cached normalized mapping, lazily built per-request.
     *
     * @var array<string,array{option:string,field:string}>|null
     */
    private ?array $map = null;

    /**
     * Cached defaults index, built alongside the mapping.
     *
     * @var array<string,mixed>|null
     */
    private ?array $defaults = null;

    /**
     * Cached reverse index keyed by legacy option name.
     *
     * @var array<string,array<string,string>>|null
     */
    private ?array $by_option = null;
}
