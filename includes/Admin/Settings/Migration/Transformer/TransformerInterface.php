<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

/**
 * Reshape contract for a single settings field as it crosses the
 * legacy ⇄ new boundary.
 *
 * Implementations are resolved per-field via the schema's
 * `legacy_transformer` attribute (FQCN string). When absent the bridge uses
 * the {@see PassThroughTransformer}.
 *
 * @since DOKAN_SINCE
 */
interface TransformerInterface {

    /**
     * Convert a legacy-shape value into the new-flat shape.
     *
     * @param mixed $legacy_value
     *
     * @return mixed
     */
    public function to_new( $legacy_value );

    /**
     * Convert a new-flat value into the legacy shape.
     *
     * @param mixed $new_value
     *
     * @return mixed
     */
    public function to_legacy( $new_value );
}
