<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;
use WP_Error;
use WP_User;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Vendor sign-up answers on the admin's Edit User screen, and in WordPress's personal data tools.
 *
 * @since DOKAN_SINCE
 */
class AnswersAdmin implements Hookable {

    /** Personal data exporter and eraser ID. */
    const PRIVACY_ID = 'dokan-vendor-registration';

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
        add_action( 'show_user_profile', [ $this, 'render_profile_section' ], 30 );
        add_action( 'edit_user_profile', [ $this, 'render_profile_section' ], 30 );
        add_action( 'user_profile_update_errors', [ $this, 'validate_profile_section' ], 10, 3 );
        add_action( 'personal_options_update', [ $this, 'save_profile_section' ] );
        add_action( 'edit_user_profile_update', [ $this, 'save_profile_section' ] );

        add_filter( 'wp_privacy_personal_data_exporters', [ $this, 'register_exporter' ] );
        add_filter( 'wp_privacy_personal_data_erasers', [ $this, 'register_eraser' ] );
    }

    /**
     * Whether the current user may see and edit this user's answers.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User whose profile is open.
     *
     * @return bool
     */
    public function can_manage( int $user_id ): bool {
        $user = get_userdata( $user_id );

        // Real vendors only; admins and shop managers also pass dokan_is_user_seller().
        return $user && in_array( 'seller', (array) $user->roles, true ) && current_user_can( 'manage_woocommerce' ) && current_user_can( 'edit_user', $user_id );
    }

    /**
     * Render the "Vendor sign-up answers" section.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_User $user User being edited.
     *
     * @return void
     */
    public function render_profile_section( $user ): void {
        if ( ! $user instanceof WP_User || ! $this->can_manage( $user->ID ) ) {
            return;
        }

        $sections = $this->answers->get_sections( $user->ID );
        $form     = $this->answers->get_form( $user->ID );

        if ( ! $sections ) {
            return;
        }
        ?>
        <h2><?php esc_html_e( 'Vendor sign-up answers', 'dokan-lite' ); ?></h2>
        <p class="description">
            <?php
            echo wp_kses(
                sprintf(
                    /* translators: %s: link to the page with the registration form */
                    __( 'From the form on %s. Custom answers are stored in user meta (keys shown).', 'dokan-lite' ),
                    '<a href="' . esc_url( (string) get_permalink( $form['page_id'] ) ) . '">' . esc_html( get_the_title( $form['page_id'] ) ) . '</a>'
                ),
                [ 'a' => [ 'href' => [] ] ]
            );
            ?>
        </p>
        <?php wp_nonce_field( 'dokan_vreg_answers', 'dokan_vreg_answers_nonce' ); ?>
        <?php foreach ( $sections as $section ) : ?>
            <h3><?php echo esc_html( $section['title'] ); ?></h3>
            <table class="form-table" role="presentation">
                <?php foreach ( $section['fields'] as $field ) : ?>
                    <tr>
                        <th><label for="dokan-vreg-admin-<?php echo esc_attr( $field['meta_key'] ); ?>"><?php echo esc_html( $field['label'] ); ?></label></th>
                        <td>
                            <?php // Lists which answers this screen showed, so an emptied multi-select still counts as answered-empty. ?>
                            <input type="hidden" name="dokan_vreg_shown[]" value="<?php echo esc_attr( $field['meta_key'] ); ?>" />
                            <?php $this->render_input( $field ); ?>
                            <p><code><?php echo esc_html( $field['meta_key'] ); ?></code></p>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
        <?php endforeach; ?>
        <?php
    }

    /**
     * Refuse invalid answers before WordPress saves the profile.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Error $errors Profile errors.
     * @param bool     $update Whether an existing user is updated.
     * @param object   $user   User data being saved.
     *
     * @return void
     */
    public function validate_profile_section( $errors, $update, $user ): void {
        $answers = $this->get_posted_answers();

        if ( ! $update || null === $answers || empty( $user->ID ) || ! $this->can_manage( (int) $user->ID ) ) {
            return;
        }

        $fields = $this->answers->get_fields( (int) $user->ID );

        foreach ( $fields as $key => $field ) {
            // Only answers the admin changed, so a field added later never blocks saving the profile.
            if ( array_key_exists( $key, $answers ) && $this->is_changed( $field, $answers[ $key ] ) ) {
                $valid = $this->submission->validate_custom_answer( $field, $answers[ $key ] );

                if ( is_wp_error( $valid ) ) {
                    $errors->add( $valid->get_error_code(), $valid->get_error_message() );
                }
            }
        }
    }

    /**
     * Whether a posted answer differs from the saved one.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field  Field with its saved `value`.
     * @param mixed $answer Posted answer.
     *
     * @return bool
     */
    protected function is_changed( array $field, $answer ): bool {
        $normalize = function ( $value ) {
            if ( is_array( $value ) ) {
                $values = array_map( 'strval', array_filter( $value, 'is_scalar' ) );
                sort( $values );

                return $values;
            }

            return is_scalar( $value ) ? trim( (string) $value ) : '';
        };

        return $normalize( $answer ) !== $normalize( $field['value'] ?? '' );
    }

    /**
     * Save the answers from the Edit User screen.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User being saved.
     *
     * @return void
     */
    public function save_profile_section( $user_id ): void {
        $answers = $this->get_posted_answers();

        if ( null === $answers || ! $this->can_manage( (int) $user_id ) ) {
            return;
        }

        $this->answers->update( (int) $user_id, $answers );
    }

    /**
     * Register the personal data exporter.
     *
     * @since DOKAN_SINCE
     *
     * @param array $exporters Exporters.
     *
     * @return array
     */
    public function register_exporter( $exporters ) {
        $exporters[ self::PRIVACY_ID ] = [
            'exporter_friendly_name' => __( 'Vendor sign-up answers', 'dokan-lite' ),
            'callback'               => [ $this, 'export' ],
        ];

        return $exporters;
    }

    /**
     * Register the personal data eraser.
     *
     * @since DOKAN_SINCE
     *
     * @param array $erasers Erasers.
     *
     * @return array
     */
    public function register_eraser( $erasers ) {
        $erasers[ self::PRIVACY_ID ] = [
            'eraser_friendly_name' => __( 'Vendor sign-up answers', 'dokan-lite' ),
            'callback'             => [ $this, 'erase' ],
        ];

        return $erasers;
    }

    /**
     * Export a user's sign-up answers.
     *
     * @since DOKAN_SINCE
     *
     * @param string $email User email.
     *
     * @return array
     */
    public function export( $email ): array {
        $user = get_user_by( 'email', $email );

        if ( ! $user ) {
            return [
                'data' => [],
                'done' => true,
            ];
        }

        $fields = $this->answers->get_fields( $user->ID );
        $data   = [];

        foreach ( $this->get_saved_keys( $user->ID ) as $key => $value ) {
            $field = $fields[ $key ] ?? null;

            if ( Submission::SIGNUP_PAGE_META === $key ) {
                $data[] = [
                    'name'  => __( 'Signed up on', 'dokan-lite' ),
                    'value' => get_the_title( (int) $value ),
                ];
                continue;
            }

            $data[] = [
                'name'  => $field ? $field['label'] : $key,
                'value' => $field ? $this->answers->format_value( array_merge( $field, [ 'value' => $value ] ) ) : implode( ', ', array_filter( (array) $value, 'is_scalar' ) ),
            ];
        }

        return [
            'data' => $data ? [
                [
                    'group_id'    => self::PRIVACY_ID,
                    'group_label' => __( 'Vendor sign-up answers', 'dokan-lite' ),
                    'item_id'     => 'dokan-vendor-registration-' . $user->ID,
                    'data'        => $data,
                ],
            ] : [],
            'done' => true,
        ];
    }

    /**
     * Erase a user's sign-up answers.
     *
     * @since DOKAN_SINCE
     *
     * @param string $email User email.
     *
     * @return array
     */
    public function erase( $email ): array {
        $user    = get_user_by( 'email', $email );
        $removed = false;

        if ( $user ) {
            foreach ( array_keys( $this->get_saved_keys( $user->ID ) ) as $key ) {
                $removed = delete_user_meta( $user->ID, $key ) || $removed;
            }
        }

        return [
            'items_removed'  => $removed,
            'items_retained' => false,
            'messages'       => [],
            'done'           => true,
        ];
    }

    /**
     * Every `dokan_vreg_` value saved for a user, including the sign-up page.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User ID.
     *
     * @return array<string, mixed>
     */
    protected function get_saved_keys( int $user_id ): array {
        $saved = [];

        foreach ( (array) get_user_meta( $user_id ) as $key => $values ) {
            if ( 0 === strpos( $key, FieldRegistry::META_KEY_PREFIX ) ) {
                $saved[ $key ] = maybe_unserialize( $values[0] ?? '' );
            }
        }

        return $saved;
    }

    /**
     * Posted answers from the Edit User screen, or null when the section wasn't submitted.
     *
     * @since DOKAN_SINCE
     *
     * @return array|null
     */
    protected function get_posted_answers(): ?array {
        $nonce = isset( $_POST['dokan_vreg_answers_nonce'] ) ? sanitize_key( wp_unslash( $_POST['dokan_vreg_answers_nonce'] ) ) : '';

        if ( ! $nonce || ! wp_verify_nonce( $nonce, 'dokan_vreg_answers' ) ) {
            return null;
        }

        // Each answer is sanitized by its field type when saved.
        $answers = isset( $_POST['dokan_vreg'] ) && is_array( $_POST['dokan_vreg'] ) ? wp_unslash( $_POST['dokan_vreg'] ) : []; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        $answers = is_array( $answers ) ? $answers : [];
        $shown   = isset( $_POST['dokan_vreg_shown'] ) && is_array( $_POST['dokan_vreg_shown'] ) ? array_map( 'sanitize_key', wp_unslash( $_POST['dokan_vreg_shown'] ) ) : [];

        // A field shown but not posted (e.g. a multi-select with nothing selected) was emptied.
        foreach ( $shown as $key ) {
            if ( ! array_key_exists( $key, $answers ) ) {
                $answers[ $key ] = '';
            }
        }

        return $answers;
    }

    /**
     * Render one answer's input.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field Field with its `value`.
     *
     * @return void
     */
    protected function render_input( array $field ): void {
        $id    = 'dokan-vreg-admin-' . $field['meta_key'];
        $name  = 'dokan_vreg[' . $field['meta_key'] . ']';
        $value = $field['value'];

        switch ( $field['type'] ) {
            case 'textarea':
                echo '<textarea class="regular-text" rows="4" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">' . esc_textarea( is_scalar( $value ) ? (string) $value : '' ) . '</textarea>';
                break;

            case 'select':
            case 'radio':
            case 'multiselect':
                $multiple = 'multiselect' === $field['type'];
                $selected = array_map( 'strval', array_filter( (array) $value, 'is_scalar' ) );
                echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $name . ( $multiple ? '[]' : '' ) ) . '"' . ( $multiple ? ' multiple' : '' ) . '>';
                if ( ! $multiple ) {
                    echo '<option value="">' . esc_html__( '— Not answered —', 'dokan-lite' ) . '</option>';
                }
                foreach ( $field['options'] as $option ) {
                    echo '<option value="' . esc_attr( $option['value'] ) . '"' . selected( in_array( (string) $option['value'], $selected, true ), true, false ) . '>' . esc_html( $option['label'] ) . '</option>';
                }
                echo '</select>';
                break;

            case 'checkbox':
                echo '<input type="hidden" name="' . esc_attr( $name ) . '" value="" />';
                echo '<input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="yes"' . checked( 'yes', $value, false ) . ' />';
                break;

            default:
                $types = [
                    'number' => 'number',
                    'email'  => 'email',
                    'phone'  => 'tel',
                    'url'    => 'url',
                    'date'   => 'date',
                ];
                echo '<input class="regular-text" type="' . esc_attr( $types[ $field['type'] ] ?? 'text' ) . '" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( is_scalar( $value ) ? (string) $value : '' ) . '" />';
                break;
        }
    }
}
