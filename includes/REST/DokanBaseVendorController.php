<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Traits\VendorAuthorizable;

/**
 * Vendor REST Controller for Dokan
 *
 * @since 3.14.11
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
