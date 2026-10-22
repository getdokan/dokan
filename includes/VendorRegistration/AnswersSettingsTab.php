<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * "Additional info" tab in the vendor's Store Settings: their custom sign-up answers, editable later.
 *
 * @since DOKAN_SINCE
 */
class AnswersSettingsTab implements Hookable {

    /** Tab ID in the Store Settings schema. */
    const TAB_ID = 'tab_additional_info';

    /** @var VendorAnswers */
    protected VendorAnswers $answers;

    /** @var Submission */
    protected Submission $submission;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param VendorAnswers $answers    Vendor answers.
     * @param Submission    $submission Sign-up checks.
     */
    public function __construct( VendorAnswers $answers, Submission $submission ) {
        $this->answers    = $answers;
        $this->submission = $submission;
    }

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_get_vendor_settings_schema', [ $this, 'add_tab' ], 95, 2 );
        add_filter( 'dokan_rest_vendor_settings_validate', [ $this, 'validate' ], 10, 4 );
        add_action( 'dokan_after_saving_vendor_settings', [ $this, 'save' ], 10, 2 );
    }

    /**
     * Add the tab, one card per section of the vendor's form; nothing when the form has no custom fields.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements  Schema elements.
     * @param int   $vendor_id Vendor ID.
     *
     * @return array
     */
    public function add_tab( $elements, $vendor_id ) {
        // The answers are the vendor's own: store staff don't see them.
        $sections = $this->is_vendor( (int) $vendor_id ) ? $this->answers->get_sections( (int) $vendor_id ) : [];

        if ( ! $sections ) {
            return $elements;
        }

        $elements   = (array) $elements;
        $elements[] = [
            'id'         => self::TAB_ID,
            'type'       => 'tab',
            'subpage_id' => 'store_settings',
            'title'      => __( 'Additional info', 'dokan-lite' ),
            // After Policies (50).
            'priority'   => 60,
        ];

        foreach ( $sections as $index => $section ) {
            // Not a `dokan_vreg_` ID, so it can't collide with a custom field's meta key.
            $section_id = 'vendor_registration_section_' . $section['id'];
            $elements[] = [
                'id'          => $section_id,
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'tab_id'      => self::TAB_ID,
                'title'       => $section['title'],
                'description' => 0 === $index ? __( 'Your answers from sign-up. Update them anytime; they aren’t shown on your store page.', 'dokan-lite' ) : '',
                'priority'    => 10 + $index,
            ];

            foreach ( $section['fields'] as $field ) {
                $elements[] = $this->field_element( $field, $section_id );
            }
        }

        return $elements;
    }

    /**
     * Check the submitted answers with the same rules as sign-up.
     *
     * @since DOKAN_SINCE
     *
     * @param array $errors       Errors keyed by field ID.
     * @param array $sanitized    Submitted values.
     * @param array $fields_by_id Schema fields.
     * @param int   $vendor_id    Vendor ID.
     *
     * @return array
     */
    public function validate( $errors, $sanitized, $fields_by_id, $vendor_id ) {
        $errors = (array) $errors;

        if ( ! $this->is_vendor( (int) $vendor_id ) ) {
            return $errors;
        }

        $fields = $this->answers->get_fields( (int) $vendor_id );

        foreach ( $this->changed_answers( $fields, (array) $sanitized ) as $key => $answer ) {
            $valid = $this->submission->validate_custom_answer( $fields[ $key ], $answer );

            if ( is_wp_error( $valid ) ) {
                $errors[ $key ][] = $valid->get_error_message();
            }
        }

        return $errors;
    }

    /**
     * Save the submitted answers as their own user meta.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id Vendor ID.
     * @param array $sanitized Submitted values.
     *
     * @return void
     */
    public function save( $vendor_id, $sanitized ): void {
        if ( ! $this->is_vendor( (int) $vendor_id ) ) {
            return;
        }

        $answers = $this->changed_answers( $this->answers->get_fields( (int) $vendor_id ), (array) $sanitized );

        if ( $answers ) {
            $this->answers->update( (int) $vendor_id, $answers );
        }
    }

    /**
     * Whether the current user is the vendor themselves.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor ID.
     *
     * @return bool
     */
    protected function is_vendor( int $vendor_id ): bool {
        return get_current_user_id() === $vendor_id;
    }

    /**
     * Submitted answers that differ from the saved ones.
     *
     * @since DOKAN_SINCE
     *
     * The page sends every field on each save, so unchanged answers (even ones the form's rules no longer accept) are left alone.
     *
     * @param array $fields    Fields with their saved `value`, keyed by meta key.
     * @param array $sanitized Submitted values.
     *
     * @return array<string, mixed>
     */
    protected function changed_answers( array $fields, array $sanitized ): array {
        $changed = [];

        foreach ( $fields as $key => $field ) {
            if ( ! array_key_exists( $key, $sanitized ) ) {
                continue;
            }

            $answer = $this->from_setting( $field, $sanitized[ $key ] );
            $saved  = 'checkbox' === $field['type'] && 'yes' !== $field['value'] ? '' : $field['value'];

            if ( $this->normalize( $answer ) !== $this->normalize( $saved ) ) {
                $changed[ $key ] = $answer;
            }
        }

        return $changed;
    }

    /**
     * Comparable form of an answer.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value Answer.
     *
     * @return string|string[]
     */
    protected function normalize( $value ) {
        if ( is_array( $value ) ) {
            $values = array_map( 'strval', array_filter( $value, 'is_scalar' ) );
            sort( $values );

            return $values;
        }

        return is_scalar( $value ) ? trim( (string) $value ) : '';
    }

    /**
     * Build the settings field for one answer, using the settings page's own controls.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $field      Field with its `value`.
     * @param string $section_id Card ID.
     *
     * @return array
     */
    protected function field_element( array $field, string $section_id ): array {
        $value   = $field['value'];
        $element = [
            'id'          => $field['meta_key'],
            'type'        => 'field',
            'section_id'  => $section_id,
            'title'       => $field['label'],
            'description' => $field['help'],
            'placeholder' => __( 'Not answered yet', 'dokan-lite' ),
            'layout'      => 'full-width',
            // Saved as its own user meta, never in the store profile.
            'non_meta'    => true,
            // Only a light cast here: the core number sanitizer turns '' into 0; VendorAnswers sanitizes by field type on save.
            'sanitize_callback' => [ $this, 'pass_through' ],
            'value'       => is_scalar( $value ) ? (string) $value : '',
            'default'     => '',
        ];

        switch ( $field['type'] ) {
            case 'textarea':
                $element['variant'] = 'textarea';
                break;

            case 'number':
                $element['variant'] = 'number';
                break;

            case 'select':
                $element['variant'] = 'select';
                $element['options'] = array_map(
                    function ( $option ) {
                        return [
                            'title' => $option['label'],
                            'value' => $option['value'],
                        ];
                    },
                    $field['options']
                );
                break;

            case 'radio':
                $element['variant'] = 'vendor_radio';
                $element['options'] = $field['options'];
                break;

            case 'multiselect':
                $element['variant']  = 'vendor_multiselect';
                $element['multiple'] = true;
                $element['options']  = $field['options'];
                $element['value']    = array_values( array_map( 'strval', array_filter( (array) $value, 'is_scalar' ) ) );
                $element['default']  = [];
                break;

            case 'checkbox':
                $element['variant']       = 'switch';
                $element['value']         = 'yes' === $value ? 'yes' : 'no';
                $element['default']       = 'no';
                $element['enable_state']  = [
                    'label' => __( 'Yes', 'dokan-lite' ),
                    'value' => 'yes',
                ];
                $element['disable_state'] = [
                    'label' => __( 'No', 'dokan-lite' ),
                    'value' => 'no',
                ];
                break;

            default:
                // Email, phone, URL and date are text here; the server checks them by type.
                $element['variant'] = 'text';

                if ( 'date' === $field['type'] ) {
                    $element['placeholder'] = __( 'YYYY-MM-DD', 'dokan-lite' );
                }
                break;
        }

        return $element;
    }

    /**
     * Keep a submitted answer as is: scalars as strings, lists as lists of strings.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value Submitted value.
     *
     * @return string|string[]
     */
    public function pass_through( $value ) {
        if ( is_array( $value ) ) {
            return array_values( array_map( 'strval', array_filter( $value, 'is_scalar' ) ) );
        }

        return is_scalar( $value ) ? (string) $value : '';
    }

    /**
     * Turn a settings value back into an answer: the switch's "no" means unticked.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field Field.
     * @param mixed $value Settings value.
     *
     * @return mixed
     */
    protected function from_setting( array $field, $value ) {
        return 'checkbox' === $field['type'] && 'yes' !== $value ? '' : $value;
    }
}
