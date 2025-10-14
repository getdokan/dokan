<?php
namespace WeDevs\Dokan\Test\Admin\Settings;

use PHPUnit\Framework\Assert;
use WeDevs\Dokan\Admin\Settings\LegacyTransformer;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacyTransformerTest extends DokanTestCase {

    public function test_transform_new_to_old(): void {
        $transformer = new LegacyTransformer();

        $pages_values = [
            'general' => [
                'marketplace' => [
                    'marketplace_settings' => [
                        'vendor_store_url' => 'store',
                        'enable_single_seller_mode' => 'off',
                    ],
                ],
            ],
        ];

        $result = $transformer->transform(
            [
				'from' => 'new',
				'data' => $pages_values,
			]
        );

        Assert::assertArrayHasKey( 'dokan_general', $result );
        Assert::assertSame( 'store', $result['dokan_general']['custom_store_url'] );
        Assert::assertSame( 'off', $result['dokan_general']['enable_single_seller_mode'] );
    }

    public function test_transform_old_to_new(): void {
        $transformer = new LegacyTransformer();

        $legacy = [
            'dokan_general' => [
                'custom_store_url' => 'legacy-store',
                'enable_single_seller_mode' => 'on',
            ],
        ];

        $result = $transformer->transform(
            [
				'from' => 'old',
				'data' => $legacy,
			]
        );

        $this->assertIsArray( $result );
        $this->assertSame( 'legacy-store', $result['general']['marketplace']['marketplace_settings']['vendor_store_url'] );
        $this->assertSame( 'on', $result['general']['marketplace']['marketplace_settings']['enable_single_seller_mode'] );
    }
}
