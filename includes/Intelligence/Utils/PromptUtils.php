<?php

namespace WeDevs\Dokan\Intelligence\Utils;

class PromptUtils {
    /**
     * Find personalized prompt by key.
     *
     * @param string $id The id to search for.
     * @return string|null The personalized prompt or null if not found.
     */
    public static function get_personalized_prompt( string $id ): ?string {
        foreach ( AISupportedFields::get_supported_fields() as $field ) {
            if ( $field['id'] === $id ) {
                return $field['personalized_prompt'];
            }
        }

        return null; // Return null if the key is not found
    }
    /**
     * Prepares a personalized prompt based on the given ID and original prompt.
     *
     * @param string $id The ID for finding the personalized prompt.
     * @param string $prompt The original prompt.
     * @return string The prepared prompt.
     */
    public static function prepare_prompt( string $id, string $prompt ): string {
        $personalized_prompt = self::get_personalized_prompt( $id );

        if ( $personalized_prompt ) {
            $prompt = $personalized_prompt . ' ' . $prompt;
        }

        return apply_filters( 'dokan_ai_get_prompt', $prompt, $personalized_prompt );
    }
}
