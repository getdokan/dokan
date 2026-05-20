<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\Admin\Settings\Migration\Fixtures\ReverseStringTransformer;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacySettingsBridgeTest extends DokanTestCase {

    public function test_class_exists_and_construct(): void {
        $bridge = new LegacySettingsBridge();
        $this->assertInstanceOf( LegacySettingsBridge::class, $bridge );
    }

    public function test_get_mapping_harvests_legacy_key_attribute(): void {
        $fixture = [
            [
                'id'         => 'banner_width',
                'type'       => 'field',
                'default'    => 400,
                'legacy_key' => 'dokan_appearance.store_banner_width',
            ],
            [
                'id'      => 'no_legacy_field',
                'type'    => 'field',
                'default' => '',
            ],
            [
                'id'   => 'not_a_field',
                'type' => 'section',
            ],
        ];

        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $map    = $bridge->get_mapping();

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertArrayHasKey( 'banner_width', $map );
        $this->assertSame(
            [
				'option' => 'dokan_appearance',
				'field' => 'store_banner_width',
			],
            $map['banner_width']
        );
        $this->assertArrayNotHasKey( 'no_legacy_field', $map );
        $this->assertArrayNotHasKey( 'not_a_field', $map );
    }

    public function test_dokan_legacy_settings_key_mapping_filter_adds_entries(): void {
        add_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );
        $cb = static function ( array $map ): array {
            $map['extra_addon_field'] = 'dokan_some_addon.extra';
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $cb );

        $bridge = new LegacySettingsBridge();
        $map    = $bridge->get_mapping();

        remove_filter( 'dokan_legacy_settings_key_mapping', $cb );
        remove_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

        $this->assertSame(
            [
				'option' => 'dokan_some_addon',
				'field' => 'extra',
			],
            $map['extra_addon_field']
        );
    }

    public function test_malformed_legacy_key_is_dropped(): void {
        $fixture = [
            [
				'id' => 'good',
				'type' => 'field',
				'legacy_key' => 'dokan_general.foo',
			],
            [
				'id' => 'no_dot',
				'type' => 'field',
				'legacy_key' => 'just_a_word',
			],
            [
				'id' => 'empty_option',
				'type' => 'field',
				'legacy_key' => '.bar',
			],
            [
				'id' => 'empty_field',
				'type' => 'field',
				'legacy_key' => 'dokan_general.',
			],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $map    = $bridge->get_mapping();

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( [ 'good' ], array_keys( $map ) );
    }

    public function test_transform_legacy_payload_to_new_returns_mapped_slice(): void {
        $fixture = [
            [
				'id' => 'banner_width',
				'type' => 'field',
				'legacy_key' => 'dokan_appearance.store_banner_width',
				'default' => 400,
			],
            [
				'id' => 'unrelated',
				'type' => 'field',
				'legacy_key' => 'dokan_general.unrelated_field',
				'default' => '',
			],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $slice  = $bridge->transform_legacy_payload_to_new(
            'dokan_appearance',
            [
				'store_banner_width' => 800,
				'untracked' => 'ignored',
			]
        );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( [ 'banner_width' => 800 ], $slice );
    }

    public function test_transform_preserves_explicit_null_and_false(): void {
        $fixture = [
            [
				'id' => 'enable_x',
				'type' => 'field',
				'legacy_key' => 'dokan_general.enable_x',
				'default' => false,
			],
            [
				'id' => 'note_x',
				'type' => 'field',
				'legacy_key' => 'dokan_general.note_x',
				'default' => '',
			],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $slice  = $bridge->transform_legacy_payload_to_new(
            'dokan_general',
            [
				'enable_x' => false,
				'note_x' => null,
			]
        );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame(
            [
				'enable_x' => false,
				'note_x' => null,
			], $slice
        );
    }

    public function test_transform_returns_empty_for_unmapped_option(): void {
        add_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

        $bridge = new LegacySettingsBridge();
        $slice  = $bridge->transform_legacy_payload_to_new( 'dokan_unknown', [ 'x' => 1 ] );

        remove_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

        $this->assertSame( [], $slice );
    }

    public function test_hydrate_new_does_not_overwrite_existing_new_values(): void {
        $fixture = [
            [
				'id' => 'banner_width',
				'type' => 'field',
				'legacy_key' => 'dokan_appearance.store_banner_width',
				'default' => 400,
			],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_appearance', [ 'store_banner_width' => 999 ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [ 'banner_width' => 200 ] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertSame( 200, $hydrated['banner_width'] );
    }

    public function test_hydrate_new_adopts_legacy_when_new_missing(): void {
        $fixture = [
            [
				'id' => 'banner_width',
				'type' => 'field',
				'legacy_key' => 'dokan_appearance.store_banner_width',
				'default' => 400,
			],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_appearance', [ 'store_banner_width' => 999 ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertSame( 999, $hydrated['banner_width'] );
    }

    public function test_hydrate_new_falls_back_to_schema_default(): void {
        $fixture = [
            [
				'id' => 'banner_width',
				'type' => 'field',
				'legacy_key' => 'dokan_appearance.store_banner_width',
				'default' => 400,
			],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( 400, $hydrated['banner_width'] );
    }

    public function test_hydrate_legacy_from_new_overwrites_when_new_has_value(): void {
        $fixture = [
            [
				'id' => 'banner_width',
				'type' => 'field',
				'legacy_key' => 'dokan_appearance.store_banner_width',
				'default' => 400,
			],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_admin_settings', [ 'banner_width' => 1024 ] );

        $bridge = new LegacySettingsBridge();
        $merged = $bridge->hydrate_legacy_from_new( 'dokan_appearance', [ 'store_banner_width' => 200 ] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_admin_settings' );

        $this->assertSame( 1024, $merged['store_banner_width'] );
    }

    public function test_hydrate_legacy_from_new_leaves_legacy_when_new_absent(): void {
        $fixture = [
            [
				'id' => 'banner_width',
				'type' => 'field',
				'legacy_key' => 'dokan_appearance.store_banner_width',
				'default' => 400,
			],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_admin_settings' );

        $bridge = new LegacySettingsBridge();
        $merged = $bridge->hydrate_legacy_from_new( 'dokan_appearance', [ 'store_banner_width' => 200 ] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( 200, $merged['store_banner_width'] );
    }

    public function test_writes_back_to_legacy_options_on_new_save(): void {
        update_option( 'dokan_general', [ 'site_logo' => 'old.png' ] );
        update_option( 'dokan_admin_settings', [ 'general_marketplace_site_logo' => 'new.png' ] );

        $map_filter = static function ( $map ) {
            $map['general_marketplace_site_logo'] = [
                'option' => 'dokan_general',
                'field'  => 'site_logo',
            ];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        $bridge  = new LegacySettingsBridge();
        $written = $bridge->write_new_to_legacy( [ 'general_marketplace_site_logo' => 'new.png' ] );

        remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        $stored = get_option( 'dokan_general' );
        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        $this->assertContains( 'dokan_general', $written );
        $this->assertSame( 'new.png', $stored['site_logo'] );
    }

    public function test_writes_back_supports_nested_path(): void {
        $fixture = [
            [
                'id'         => 'general_marketplace_geo_latitude',
                'type'       => 'field',
                'legacy_key' => 'dokan_geolocation.location.latitude',
                'default'    => '',
            ],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option(
            'dokan_geolocation', [
				'location' => [
					'latitude' => '0.0',
					'longitude' => '0.0',
				],
			]
        );

        $bridge  = new LegacySettingsBridge();
        $written = $bridge->write_new_to_legacy( [ 'general_marketplace_geo_latitude' => '23.45' ] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        $stored = get_option( 'dokan_geolocation' );
        delete_option( 'dokan_geolocation' );

        $this->assertContains( 'dokan_geolocation', $written );
        $this->assertSame( '23.45', $stored['location']['latitude'] );
        $this->assertSame( '0.0', $stored['location']['longitude'] );
    }

    public function test_hydrates_new_from_legacy_nested_path(): void {
        $fixture = [
            [
                'id'         => 'general_marketplace_geo_latitude',
                'type'       => 'field',
                'legacy_key' => 'dokan_geolocation.location.latitude',
                'default'    => '',
            ],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_geolocation', [ 'location' => [ 'latitude' => '23.45' ] ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_geolocation' );

        $this->assertSame( '23.45', $hydrated['general_marketplace_geo_latitude'] );
    }

    public function test_transformer_dispatch_runs_for_both_directions(): void {
        $fixture = [
            [
                'id'                 => 'banner_width',
                'type'               => 'field',
                'legacy_key'         => 'dokan_appearance.store_banner_width',
                'legacy_transformer' => ReverseStringTransformer::class,
                'default'            => '',
            ],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        update_option( 'dokan_appearance', [ 'store_banner_width' => 'abc' ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );
        $this->assertSame( 'cba', $hydrated['banner_width'] );

        $written = $bridge->write_new_to_legacy( [ 'banner_width' => 'xyz' ] );
        $stored  = get_option( 'dokan_appearance' );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertContains( 'dokan_appearance', $written );
        $this->assertSame( 'zyx', $stored['store_banner_width'] );
    }

    public function test_bridge_bootstrap_mirrors_changed_keys_to_legacy(): void {
        $map_filter = static function ( $map ) {
            $map['general_marketplace_site_logo'] = [
				'option' => 'dokan_general',
				'field' => 'site_logo',
			];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        $bridge    = new LegacySettingsBridge();
        $bootstrap = new \WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap( $bridge );
        $bootstrap->register_hooks();

        $repo = new \WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository();
        $repo->update( [ 'general_marketplace_site_logo' => 'new.png' ] );

        $stored_legacy = get_option( 'dokan_general' );

        remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        remove_action( 'dokan_admin_settings_changed', [ $bootstrap, 'on_settings_changed' ], 10 );
        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        $this->assertIsArray( $stored_legacy );
        $this->assertSame( 'new.png', $stored_legacy['site_logo'] );
    }

    public function test_bridge_bootstrap_reentry_guard_prevents_recursion(): void {
        $map_filter = static function ( $map ) {
            $map['general_marketplace_site_logo'] = [
				'option' => 'dokan_general',
				'field' => 'site_logo',
			];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        $bridge    = new LegacySettingsBridge();
        $bootstrap = new \WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap( $bridge );
        $bootstrap->register_hooks();
        $repo = new \WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository();
        $repo->update( [ 'general_marketplace_site_logo' => 'seed.png' ] );

        // Count `dokan_admin_settings_changed` firings at priority 5 so it runs
        // before the bootstrap mirror at priority 10.
        $invocations = 0;
        $counter     = static function () use ( &$invocations ) {
            ++$invocations;
        };
        add_action( 'dokan_admin_settings_changed', $counter, 5 );

        $repo->update( [ 'general_marketplace_site_logo' => 'first.png' ] );
        $repo->update( [ 'general_marketplace_site_logo' => 'second.png' ] );

        remove_action( 'dokan_admin_settings_changed', $counter, 5 );
        remove_action( 'dokan_admin_settings_changed', [ $bootstrap, 'on_settings_changed' ], 10 );
        remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        $stored_legacy = get_option( 'dokan_general' );
        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        // Two top-level repository updates — counter should fire exactly twice,
        // not more (no infinite loop, no nested re-entry).
        $this->assertSame( 2, $invocations );
        $this->assertSame( 'second.png', $stored_legacy['site_logo'] );
    }

    public function test_callable_transformer_pair_runs_for_both_directions(): void {
        $fixture = [
            [
                'id'                 => 'banner_caption',
                'type'               => 'field',
                'legacy_key'         => 'dokan_appearance.banner_caption',
                'legacy_transformer' => [
                    'to_new'    => 'strtoupper',
                    'to_legacy' => 'strtolower',
                ],
                'default'            => '',
            ],
        ];
        $cb = static function () use ( $fixture ) {
            return $fixture;
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        update_option( 'dokan_appearance', [ 'banner_caption' => 'hello' ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );
        $this->assertSame( 'HELLO', $hydrated['banner_caption'] );

        $bridge->write_new_to_legacy( [ 'banner_caption' => 'WORLD' ] );
        $stored = get_option( 'dokan_appearance' );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertSame( 'world', $stored['banner_caption'] );
    }

    public function test_callable_transformer_accepts_class_method_array(): void {
        $fixture = [
            [
                'id'                 => 'banner_caption',
                'type'               => 'field',
                'legacy_key'         => 'dokan_appearance.banner_caption',
                'legacy_transformer' => [
                    'to_new'    => [ \WeDevs\Dokan\Test\Admin\Settings\Migration\Fixtures\ReverseStringTransformer::class, 'reverse' ],
                    'to_legacy' => [ \WeDevs\Dokan\Test\Admin\Settings\Migration\Fixtures\ReverseStringTransformer::class, 'reverse' ],
                ],
                'default'            => '',
            ],
        ];
        $cb = static function () use ( $fixture ) {
            return $fixture;
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_appearance', [ 'banner_caption' => 'abc' ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertSame( 'cba', $hydrated['banner_caption'] );
    }

    public function test_callable_transformer_accepts_closure(): void {
        $fixture = [
            [
                'id'                 => 'banner_caption',
                'type'               => 'field',
                'legacy_key'         => 'dokan_appearance.banner_caption',
                'legacy_transformer' => [
                    'to_new'    => static function ( $v ) {
                        return strrev( (string) $v );
                    },
                    'to_legacy' => static function ( $v ) {
                        return strrev( (string) $v );
                    },
                ],
                'default'            => '',
            ],
        ];
        $cb = static function () use ( $fixture ) {
            return $fixture;
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_appearance', [ 'banner_caption' => 'abc' ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        // Closures are accepted by CallableTransformer; to_new runs on hydrate.
        $this->assertSame( 'cba', $hydrated['banner_caption'] );
    }

    public function test_callable_transformer_ignored_when_pair_incomplete(): void {
        $fixture = [
            [
                'id'                 => 'banner_caption',
                'type'               => 'field',
                'legacy_key'         => 'dokan_appearance.banner_caption',
                'legacy_transformer' => [ 'to_new' => 'strtoupper' ],
                'default'            => '',
            ],
        ];
        $cb = static function () use ( $fixture ) {
            return $fixture;
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_appearance', [ 'banner_caption' => 'abc' ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        // Incomplete pair is ignored at harvest; pass-through applies.
        $this->assertSame( 'abc', $hydrated['banner_caption'] );
    }

    public function test_bridge_only_field_round_trips(): void {
        $fixture = [
            [
                'id'          => 'bridge_only_setup_wizard_message',
                'bridge_only' => true,
                'legacy_key'  => 'dokan_general.setup_wizard_message',
                'default'     => '',
            ],
        ];
        $cb = static function () use ( $fixture ) {
			return $fixture;
		};
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        update_option( 'dokan_general', [ 'setup_wizard_message' => 'hello' ] );

        $bridge = new LegacySettingsBridge();
        $new    = $bridge->hydrate_new_from_legacy( [] );
        $this->assertSame( 'hello', $new['bridge_only_setup_wizard_message'] ?? null );

        $bridge->write_new_to_legacy( [ 'bridge_only_setup_wizard_message' => 'world' ] );
        $stored = get_option( 'dokan_general' );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_general' );

        $this->assertSame( 'world', $stored['setup_wizard_message'] );
    }

    public function test_multi_mapping_hydrates_from_legacy_via_slots(): void {
        $fixture = [
            [
                'id'                 => 'product_page_appearance',
                'type'               => 'field',
                'legacy_key'         => [
                    'vendor_info'   => [ 'option' => 'dokan_appearance', 'field' => 'show_vendor_info' ],
                    'more_products' => [ 'option' => 'dokan_appearance', 'field' => 'show_more_products' ],
                    'shipping_tab'  => [ 'option' => 'dokan_appearance', 'field' => 'show_shipping_tab' ],
                ],
                'legacy_transformer' => [
                    'to_new'    => static function ( $slots ) {
                        return [
                            'vendor_info'   => ! empty( $slots['vendor_info'] ),
                            'more_products' => ! empty( $slots['more_products'] ),
                            'shipping_tab'  => ! empty( $slots['shipping_tab'] ),
                        ];
                    },
                    'to_legacy' => static function ( $new ) {
                        return [
                            'vendor_info'   => ! empty( $new['vendor_info'] ) ? 'on' : '',
                            'more_products' => ! empty( $new['more_products'] ) ? 'on' : '',
                            'shipping_tab'  => ! empty( $new['shipping_tab'] ) ? 'on' : '',
                        ];
                    },
                ],
                'default'            => [ 'vendor_info' => false, 'more_products' => false, 'shipping_tab' => false ],
            ],
        ];
        $cb = static function () use ( $fixture ) {
            return $fixture;
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        update_option( 'dokan_appearance', [
            'show_vendor_info'   => 'on',
            'show_more_products' => '',
            'show_shipping_tab'  => 'on',
        ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertSame(
            [ 'vendor_info' => true, 'more_products' => false, 'shipping_tab' => true ],
            $hydrated['product_page_appearance']
        );
    }

    public function test_multi_mapping_writes_back_each_slot(): void {
        $fixture = [
            [
                'id'                 => 'product_page_appearance',
                'type'               => 'field',
                'legacy_key'         => [
                    'vendor_info'   => [ 'option' => 'dokan_appearance', 'field' => 'show_vendor_info' ],
                    'more_products' => [ 'option' => 'dokan_appearance', 'field' => 'show_more_products' ],
                    'shipping_tab'  => [ 'option' => 'dokan_appearance', 'field' => 'show_shipping_tab' ],
                ],
                'legacy_transformer' => [
                    'to_new'    => static function ( $slots ) {
                        return $slots;
                    },
                    'to_legacy' => static function ( $new ) {
                        return [
                            'vendor_info'   => ! empty( $new['vendor_info'] ) ? 'on' : '',
                            'more_products' => ! empty( $new['more_products'] ) ? 'on' : '',
                            'shipping_tab'  => ! empty( $new['shipping_tab'] ) ? 'on' : '',
                        ];
                    },
                ],
                'default'            => [],
            ],
        ];
        $cb = static function () use ( $fixture ) {
            return $fixture;
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $bridge->write_new_to_legacy( [
            'product_page_appearance' => [
                'vendor_info'   => true,
                'more_products' => false,
                'shipping_tab'  => true,
            ],
        ] );
        $stored = get_option( 'dokan_appearance' );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertSame( 'on', $stored['show_vendor_info'] );
        $this->assertSame( '', $stored['show_more_products'] );
        $this->assertSame( 'on', $stored['show_shipping_tab'] );
    }

    public function test_multi_mapping_spans_multiple_legacy_options(): void {
        $fixture = [
            [
                'id'                 => 'cross_option_field',
                'type'               => 'field',
                'legacy_key'         => [
                    'a' => [ 'option' => 'dokan_appearance', 'field' => 'slot_a' ],
                    'b' => [ 'option' => 'dokan_general', 'field' => 'slot_b' ],
                ],
                'legacy_transformer' => [
                    'to_new'    => static function ( $slots ) {
                        return $slots;
                    },
                    'to_legacy' => static function ( $new ) {
                        return [ 'a' => $new['a'] ?? '', 'b' => $new['b'] ?? '' ];
                    },
                ],
                'default'            => [],
            ],
        ];
        $cb = static function () use ( $fixture ) {
            return $fixture;
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        update_option( 'dokan_appearance', [ 'slot_a' => 'A' ] );
        update_option( 'dokan_general', [ 'slot_b' => 'B' ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );
        $this->assertSame( [ 'a' => 'A', 'b' => 'B' ], $hydrated['cross_option_field'] );

        $bridge->write_new_to_legacy( [ 'cross_option_field' => [ 'a' => 'A2', 'b' => 'B2' ] ] );
        $stored_app = get_option( 'dokan_appearance' );
        $stored_gen = get_option( 'dokan_general' );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );
        delete_option( 'dokan_general' );

        $this->assertSame( 'A2', $stored_app['slot_a'] );
        $this->assertSame( 'B2', $stored_gen['slot_b'] );
    }
}
