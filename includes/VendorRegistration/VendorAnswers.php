<?php

namespace WeDevs\Dokan\VendorRegistration;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * A vendor's custom sign-up answers: which form they come from, and reading and updating them later.
 *
 * @since DOKAN_SINCE
 */
class VendorAnswers {

    /** @var FormSetup */
    protected FormSetup $setup;

    /** @var Submission */
    protected Submission $submission;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FormSetup  $setup      Form setup reader.
     * @param Submission $submission Sign-up checks.
     */
    public function __construct( FormSetup $setup, Submission $submission ) {
        $this->setup      = $setup;
        $this->submission = $submission;
    }

    /**
     * The form a vendor's answers belong to: the page they signed up on, else the Vendor Onboarding page's block.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id Vendor ID.
     *
     * @return array|null Form setup, or null when neither page has the block.
     */
    public function get_form( int $user_id ): ?array {
        $page_id = absint( get_user_meta( $user_id, Submission::SIGNUP_PAGE_META, true ) );

        if ( $page_id ) {
            $setup = $this->setup->get_for_page( $page_id );

            if ( $setup['has_block'] ) {
                return $setup;
            }
        }

        return $this->setup->get_master_setup();
    }

    /**
     * The custom fields of the vendor's form with their answers, grouped by section title.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id Vendor ID.
     *
     * @return array[] Each section has `id`, `title` and `fields`; each field is a setup row plus its `value`.
     */
    public function get_sections( int $user_id ): array {
        $form = $this->get_form( $user_id );

        if ( ! $form ) {
            return [];
        }

        $sections = [];

        foreach ( $form['sections'] as $section ) {
            $fields = [];

            foreach ( $section['rows'] as $row ) {
                if ( empty( $row['custom'] ) ) {
                    continue;
                }

                $row['value'] = get_user_meta( $user_id, $row['meta_key'], true );

                // A field hidden later still shows while the vendor has an answer for it, so every answer stays editable.
                if ( ( $section['hidden'] || ! empty( $row['hidden'] ) ) && ( '' === $row['value'] || [] === $row['value'] ) ) {
                    continue;
                }

                $fields[] = $row;
            }

            if ( $fields ) {
                $sections[] = [
                    'id'     => $section['id'],
                    'title'  => $section['title'],
                    'fields' => $fields,
                ];
            }
        }

        return $sections;
    }

    /**
     * All custom fields of the vendor's form, keyed by meta key.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id Vendor ID.
     *
     * @return array<string, array>
     */
    public function get_fields( int $user_id ): array {
        $fields = [];

        foreach ( $this->get_sections( $user_id ) as $section ) {
            foreach ( $section['fields'] as $field ) {
                $fields[ $field['meta_key'] ] = $field;
            }
        }

        return $fields;
    }

    /**
     * Check and save answers for the vendor's form fields; keys not in the form are ignored.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $user_id Vendor ID.
     * @param array $answers Posted answers keyed by meta key.
     *
     * @return true|WP_Error
     */
    public function update( int $user_id, array $answers ) {
        $fields = $this->get_fields( $user_id );
        $errors = new WP_Error();

        foreach ( $fields as $key => $field ) {
            if ( ! array_key_exists( $key, $answers ) ) {
                continue;
            }

            $valid = $this->submission->validate_custom_answer( $field, $answers[ $key ] );

            if ( is_wp_error( $valid ) ) {
                $errors->add( $valid->get_error_code(), $valid->get_error_message() );
            }
        }

        if ( $errors->has_errors() ) {
            return $errors;
        }

        foreach ( $fields as $key => $field ) {
            if ( ! array_key_exists( $key, $answers ) ) {
                continue;
            }

            $value = $this->submission->sanitize_answer( $field, $answers[ $key ] );

            if ( null === $value ) {
                delete_user_meta( $user_id, $key );
            } else {
                update_user_meta( $user_id, $key, $value );
            }
        }

        return true;
    }

    /**
     * Turn a saved answer into display text, using option labels for choice fields.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field Field with its `value`.
     *
     * @return string
     */
    public function format_value( array $field ): string {
        $value = $field['value'] ?? '';

        if ( 'checkbox' === $field['type'] ) {
            return 'yes' === $value ? __( 'Yes', 'dokan-lite' ) : ( 'no' === $value ? __( 'No', 'dokan-lite' ) : '' );
        }

        $labels = wp_list_pluck( $field['options'] ?? [], 'label', 'value' );
        $values = array_map( 'strval', array_filter( (array) $value, 'is_scalar' ) );

        return implode(
            ', ',
            array_map(
                function ( $item ) use ( $labels ) {
                    return $labels[ $item ] ?? $item;
                },
                $values
            )
        );
    }
}
