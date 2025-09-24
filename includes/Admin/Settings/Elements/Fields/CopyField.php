<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * Copy Field.
 * Custom field that provides a button to copy text to the clipboard.
 */
class CopyField extends Text {
    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'copy_field';
}
