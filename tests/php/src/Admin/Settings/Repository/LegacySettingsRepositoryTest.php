<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Repository;

use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepositoryInterface;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacySettingsRepositoryTest extends DokanTestCase {

    public function test_class_implements_interface(): void {
        $repo = new LegacySettingsRepository();
        $this->assertInstanceOf( LegacySettingsRepositoryInterface::class, $repo );
    }
}
