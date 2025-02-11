<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Traits\VendorAuthorizable;

/**
 * Vendor REST Controller for Dokan
 *
 * @since DOKAN_SINCE
 *
 * @package dokan
 */
abstract class DokanBaseVendorController extends DokanBaseController {
    use VendorAuthorizable;

    /**
     * Endpoint base.
     *
     * @var string
     */
    protected $rest_base = 'vendor';
}
