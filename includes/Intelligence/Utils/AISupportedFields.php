<?php

namespace WeDevs\Dokan\Intelligence\Utils;

class AISupportedFields {

    public static function get_supported_fields(): array {
        $fields = [
			[
				'id' => 'post_title',
				'personalized_prompt' => __( 'Generate an SEO-friendly one line title for', 'dokan-lite' ),
				'title' => __( 'Craft Your Title', 'dokan-lite' ),
				'type' => 'input',
			],
			[
				'id' => 'post_excerpt',
				'personalized_prompt' => __( 'Refine the following product description for ', 'dokan-lite' ),
				'title' => __( 'Craft Your Short Description', 'dokan-lite' ),
				'type' => 'editor',
			],
			[
				'id' => 'post_content',
				'personalized_prompt' => __( 'Refine the following product description', 'dokan-lite' ),
				'title' => __( 'Craft Your Description', 'dokan-lite' ),
				'type' => 'editor',
			],
		];

        return apply_filters( 'dokan_ai_get_supported_fields', $fields );
	}
}
