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
				'personalized_prompt' => __( 'Generate an SEO-friendly short description for', 'dokan-lite' ),
				'title' => __( 'Craft Your Short Description', 'dokan-lite' ),
				'type' => 'input',
			],
			[
				'id' => 'post_content',
				'personalized_prompt' => __( 'Generate an SEO-friendly long description for', 'dokan-lite' ),
				'title' => __( 'Craft Your Description', 'dokan-lite' ),
				'type' => 'input',
			],
			[
				'id' => 'product_summary',
				'personalized_prompt' => __( 'Generate a Product summary based on these', 'dokan-lite' ),
				'title' => __( 'Product Summary', 'dokan-lite' ),
				'type' => 'section',
			],
			[
				'id' => 'product_recommendation_score',
				'personalized_prompt' => __( 'Generate a recommendation score based on these reviews', 'dokan-lite' ),
				'title' => __( 'Product Recommendation Score', 'dokan-lite' ),
				'type' => 'section',
			],
			[
				'id' => 'vendor_biography',
				'personalized_prompt' => __( 'Generate a short biography for vendor', 'dokan-lite' ),
				'title' => __( 'Vendor Biography', 'dokan-lite' ),
				'type' => 'input',
			],
		];

        return apply_filters( 'dokan_ai_get_supported_fields', $fields );
	}
}
