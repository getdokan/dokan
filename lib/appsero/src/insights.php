<?php
namespace AppSero;

/**
 * AppSero Insights
 *
 * This is a tracker class to track plugin usage based on if the customer has opted in.
 * No personal information is being tracked by this class, only general settings, active plugins, environment details
 * and admin email.
 */
class Insights {

    /**
     * The client version
     *
     * @var string
     */
    public $version = '1.0';

    /**
     * Hash identifier of the plugin
     *
     * @var string
     */
    public $hash;

    /**
     * Slug of the plugin
     *
     * @var string
     */
    public $slug;

    /**
     * Name of the plugin
     *
     * @var string
     */
    public $name;

    /**
     * Main plugin file
     *
     * @var string
     */
    public $basename;

    /**
     * The plugin/theme file path
     *
     * @var string
     */
    public $file;

    /**
     * The notice text
     *
     * @var string
     */
    public $notice;

    /**
     * Wheather to the notice or not
     *
     * @var boolean
     */
    protected $show_notice = true;

    /**
     * If extra data needs to be sent
     *
     * @var array
     */
    protected $extra_data = array();

    /**
     * URL to the API endpoint
     *
     * @var string
     */
    protected $endpoint = 'https://api.appsero.com';

    /**
     * Initialize the class
     *
     * @param string  $slug slug of the plugin
     * @param string  $name readable name of the plugin
     * @param string  $file main plugin file path
     */
    public function __construct( $hash, $name, $file ) {
        $this->hash = $hash;
        $this->name = $name;
        $this->file = $file;
    }

    /**
     * Don't show the notice
     *
     * @return \self
     */
    public function hide_notice() {
        $this->show_notice = false;

        return $this;
    }

    /**
     * Add extra data if needed
     *
     * @param array $data
     *
     * @return \self
     */
    public function add_extra( $data = array() ) {
        $this->extra_data = $data;

        return $this;
    }

    /**
     * Set custom notice text
     *
     * @param  string $text
     *
     * @return \self
     */
    public function notice( $text ) {
        $this->notice = $text;

        return $this;
    }

    /**
     * Initialize theme hooks
     *
     * @return void
     */
    public function init_theme() {
        $this->basename = str_replace( WP_CONTENT_DIR . '/themes/', '', $this->file );
        list( $this->slug, $mainfile) = explode( '/', $this->basename );

        $this->init_common();

        add_action( 'switch_theme', array( $this, 'deactivation_cleanup' ) );
    }

    /**
     * Initialize plugin hooks
     *
     * @return void
     */
    public function init_plugin() {
        $this->basename = plugin_basename( $this->file );

        list( $this->slug, $mainfile) = explode( '/', $this->basename );

        // plugin deactivate popup
        // if ( ! $this->is_local_server() ) {
            add_action( 'plugin_action_links_' . $this->basename, array( $this, 'plugin_action_links' ) );
            add_action( 'admin_footer', array( $this, 'deactivate_scripts' ) );
        // }

        $this->init_common();

        register_deactivation_hook( $this->file, array( $this, 'deactivation_cleanup' ) );
    }

    /**
     * Initialize common hooks
     *
     * @return void
     */
    protected function init_common() {

        if ( $this->show_notice ) {
            // tracking notice
            add_action( 'admin_notices', array( $this, 'admin_notice' ) );
        }

        add_action( 'admin_init', array( $this, 'handle_optin_optout' ) );

        // uninstall reason
        add_action( 'wp_ajax_' . $this->slug . '_submit-uninstall-reason', array( $this, 'uninstall_reason_submission' ) );

        // cron events
        add_action( 'cron_schedules', array( $this, 'add_weekly_schedule' ) );
        add_action( $this->slug . '_tracker_send_event', array( $this, 'send_tracking_data' ) );
        // add_action( 'admin_init', array( $this, 'send_tracking_data' ) ); // test
    }

    /**
     * API Endpoint
     *
     * @return string
     */
    public function endpoint() {
        return apply_filters( 'appsero_endpoint', $this->endpoint );
    }

    /**
     * Send tracking data to AppSero server
     *
     * @param  boolean  $override
     *
     * @return void
     */
    public function send_tracking_data( $override = false ) {
        // skip on AJAX Requests
        if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
            return;
        }

        if ( ! $this->tracking_allowed() && ! $override ) {
            return;
        }

        // Send a maximum of once per week
        $last_send = $this->get_last_send();

        if ( $last_send && $last_send > strtotime( '-1 week' ) ) {
            return;
        }

        $this->send_request( $this->get_tracking_data(), 'track' );

        update_option( $this->slug . '_tracking_last_send', time() );
    }

    /**
     * Send request to remote endpoint
     *
     * @param  array  $params
     * @param  string $route
     *
     * @return void
     */
    private function send_request( $params, $route ) {
        $url = trailingslashit(  $this->endpoint() ) . $route;

        $response = wp_remote_post( $url, array(
            'method'      => 'POST',
            'timeout'     => 30,
            'redirection' => 5,
            'httpversion' => '1.0',
            'blocking'    => false,
            'headers'     => array( 'user-agent' => 'AppSero/' . md5( esc_url( home_url() ) ) . ';' ),
            'body'        => array_merge( $params, array( 'client' => $this->version ) ),
            'cookies'     => array()
        ) );

        return $response;
    }

    /**
     * Get the tracking data points
     *
     * @return array
     */
    protected function get_tracking_data() {
        $all_plugins = $this->get_all_plugins();
        $admin_user  = get_user_by( 'id', 1 );
        $first_name  = $last_name = '';

        if ( $admin_user ) {
            $first_name = $admin_user->first_name ? $admin_user->first_name : $admin_user->display_name;
            $last_name  = $admin_user->last_name;
        }

        $data = array(
            'url'              => home_url(),
            'site'             => get_bloginfo( 'name' ),
            'admin_email'      => get_option( 'admin_email' ),
            'first_name'       => $first_name,
            'last_name'        => $last_name,
            'hash'             => $this->hash,
            'server'           => $this->get_server_info(),
            'wp'               => $this->get_wp_info(),
            'users'            => $this->get_user_counts(),
            'active_plugins'   => count( $all_plugins['active_plugins'] ),
            'inactive_plugins' => count( $all_plugins['inactive_plugins'] ),
        );

        // for child classes
        if ( $extra = $this->get_extra_data() ) {
            $data['extra'] = $extra;
        }

        return apply_filters( $this->slug . '_tracker_data', $data );
    }

    /**
     * If a child class wants to send extra data
     *
     * @return mixed
     */
    protected function get_extra_data() {
        return $this->extra_data;
    }

    /**
     * Explain the user which data we collect
     *
     * @return string
     */
    protected function data_we_collect() {
        $data = array(
            'Server environment details (php, mysql, server, WordPress versions)',
            'Number of users in your site',
            'Site language',
            'Number of active and inactive plugins',
            'Site name and url',
            'Your name and email address',
        );

        return $data;
    }

    /**
     * Check if the user has opted into tracking
     *
     * @return bool
     */
    private function tracking_allowed() {
        $allow_tracking = get_option( $this->slug . '_allow_tracking', 'no' );

        return $allow_tracking == 'yes';
    }

    /**
     * Get the last time a tracking was sent
     *
     * @return false|string
     */
    private function get_last_send() {
        return get_option( $this->slug . '_tracking_last_send', false );
    }

    /**
     * Check if the notice has been dismissed or enabled
     *
     * @return boolean
     */
    private function notice_dismissed() {
        $hide_notice = get_option( $this->slug . '_tracking_notice', 'no' );

        if ( 'hide' == $hide_notice ) {
            return true;
        }

        return false;
    }

    /**
     * Check if the current server is localhost
     *
     * @return boolean
     */
    private function is_local_server() {
        $is_local = in_array( $_SERVER['REMOTE_ADDR'], array( '127.0.0.1', '::1' ) );

        return apply_filters( 'appsero_is_local', $is_local );
    }

    /**
     * Schedule the event weekly
     *
     * @return void
     */
    private function schedule_event() {
        wp_schedule_event( time(), 'weekly', $this->slug . '_tracker_send_event' );
    }

    /**
     * Clear any scheduled hook
     *
     * @return void
     */
    private function clear_schedule_event() {
        wp_clear_scheduled_hook( $this->slug . '_tracker_send_event' );
    }

    /**
     * Display the admin notice to users that have not opted-in or out
     *
     * @return void
     */
    public function admin_notice() {

        if ( $this->notice_dismissed() ) {
            return;
        }

        if ( $this->tracking_allowed() ) {
            return;
        }

        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        // don't show tracking if a local server
        if ( $this->is_local_server() ) {
            $optin_url  = add_query_arg( $this->slug . '_tracker_optin', 'true' );
            $optout_url = add_query_arg( $this->slug . '_tracker_optout', 'true' );

            if ( empty( $this->notice ) ) {
                $notice = sprintf( __( 'Want to help make <strong>%1$s</strong> even more awesome? Allow %1$s to collect non-sensitive diagnostic data and usage information.', 'dokan-lite' ), $this->name );
            } else {
                $notice = $this->notice;
            }

            $notice .= ' (<a class="' . $this->slug . '-insights-data-we-collect" href="#">' . __( 'what we collect', 'dokan-lite' ) . '</a>)';
            $notice .= '<p class="description" style="display:none;">' . implode( ', ', $this->data_we_collect() ) . '. No sensitive data is tracked.</p>';

            echo '<div class="updated"><p>';
                echo wp_kses( $notice, array(
                'a' => array(
                    'href' => array(),
                    'class' => array(),
                    'title' => array()
                ),
                'p' => array(
                    'class' => array(),
                    'id' => array(),
                    'style' => array(),
                ),
                'strong' => array()
                ) );
                echo '</p><p class="submit">';
                echo '&nbsp;<a href="' . esc_url( $optin_url ) . '" class="button-primary button-large">' . esc_html__( 'Allow', 'dokan-lite' ) . '</a>';
                echo '&nbsp;<a href="' . esc_url( $optout_url ) . '" class="button-secondary button-large">' . esc_html__( 'No thanks', 'dokan-lite' ) . '</a>';
            echo '</p></div>';

            echo "<script type='text/javascript'>jQuery('." . esc_attr( $this->slug ) . "-insights-data-we-collect').on('click', function(e) {
                    e.preventDefault();
                    jQuery(this).parents('.updated').find('p.description').slideToggle('fast');
                });
                </script>
            ";
        }
    }

    /**
     * handle the optin/optout
     *
     * @return void
     */
    public function handle_optin_optout() {

        if ( isset( $_GET[ $this->slug . '_tracker_optin' ] ) && $_GET[ $this->slug . '_tracker_optin' ] == 'true' ) {
            $this->optin();

            wp_redirect( remove_query_arg( $this->slug . '_tracker_optin' ) );
            exit;
        }

        if ( isset( $_GET[ $this->slug . '_tracker_optout' ] ) && $_GET[ $this->slug . '_tracker_optout' ] == 'true' ) {
            $this->optout();

            wp_redirect( remove_query_arg( $this->slug . '_tracker_optout' ) );
            exit;
        }
    }

    /**
     * Tracking optin
     *
     * @return void
     */
    public function optin() {
        update_option( $this->slug . '_allow_tracking', 'yes' );
        update_option( $this->slug . '_tracking_notice', 'hide' );

        $this->clear_schedule_event();
        $this->schedule_event();
        $this->send_tracking_data();
    }

    /**
     * Optout from tracking
     *
     * @return void
     */
    public function optout() {
        update_option( $this->slug . '_allow_tracking', 'no' );
        update_option( $this->slug . '_tracking_notice', 'hide' );

        $this->clear_schedule_event();
    }

    /**
     * Get the number of post counts
     *
     * @param  string  $post_type
     *
     * @return integer
     */
    public function get_post_count( $post_type ) {
        global $wpdb;

        return (int) $wpdb->get_var( "SELECT count(ID) FROM $wpdb->posts WHERE post_type = '$post_type' and post_status = 'publish'");
    }

    /**
     * Get server related info.
     *
     * @return array
     */
    private static function get_server_info() {
        global $wpdb;

        $server_data = array();

        if ( isset( $_SERVER['SERVER_SOFTWARE'] ) && ! empty( $_SERVER['SERVER_SOFTWARE'] ) ) {
            $server_data['software'] = $_SERVER['SERVER_SOFTWARE'];
        }

        if ( function_exists( 'phpversion' ) ) {
            $server_data['php_version'] = phpversion();
        }

        $server_data['mysql_version']        = $wpdb->db_version();

        $server_data['php_max_upload_size']  = size_format( wp_max_upload_size() );
        $server_data['php_default_timezone'] = date_default_timezone_get();
        $server_data['php_soap']             = class_exists( 'SoapClient' ) ? 'Yes' : 'No';
        $server_data['php_fsockopen']        = function_exists( 'fsockopen' ) ? 'Yes' : 'No';
        $server_data['php_curl']             = function_exists( 'curl_init' ) ? 'Yes' : 'No';

        return $server_data;
    }

    /**
     * Get WordPress related data.
     *
     * @return array
     */
    private function get_wp_info() {
        $wp_data = array();

        $wp_data['memory_limit'] = WP_MEMORY_LIMIT;
        $wp_data['debug_mode']   = ( defined('WP_DEBUG') && WP_DEBUG ) ? 'Yes' : 'No';
        $wp_data['locale']       = get_locale();
        $wp_data['version']      = get_bloginfo( 'version' );
        $wp_data['multisite']    = is_multisite() ? 'Yes' : 'No';

        return $wp_data;
    }

    /**
     * Get the list of active and inactive plugins
     *
     * @return array
     */
    private function get_all_plugins() {
        // Ensure get_plugins function is loaded
        if ( ! function_exists( 'get_plugins' ) ) {
            include ABSPATH . '/wp-admin/includes/plugin.php';
        }

        $plugins             = get_plugins();
        $active_plugins_keys = get_option( 'active_plugins', array() );
        $active_plugins      = array();

        foreach ( $plugins as $k => $v ) {
            // Take care of formatting the data how we want it.
            $formatted = array();
            $formatted['name'] = strip_tags( $v['Name'] );

            if ( isset( $v['Version'] ) ) {
                $formatted['version'] = strip_tags( $v['Version'] );
            }

            if ( isset( $v['Author'] ) ) {
                $formatted['author'] = strip_tags( $v['Author'] );
            }

            if ( isset( $v['Network'] ) ) {
                $formatted['network'] = strip_tags( $v['Network'] );
            }

            if ( isset( $v['PluginURI'] ) ) {
                $formatted['plugin_uri'] = strip_tags( $v['PluginURI'] );
            }

            if ( in_array( $k, $active_plugins_keys ) ) {
                // Remove active plugins from list so we can show active and inactive separately
                unset( $plugins[$k] );
                $active_plugins[$k] = $formatted;
            } else {
                $plugins[$k] = $formatted;
            }
        }

        return array( 'active_plugins' => $active_plugins, 'inactive_plugins' => $plugins );
    }

    /**
     * Get user totals based on user role.
     *
     * @return array
     */
    private function get_user_counts() {
        $user_count          = array();
        $user_count_data     = count_users();
        $user_count['total'] = $user_count_data['total_users'];

        // Get user count based on user role
        foreach ( $user_count_data['avail_roles'] as $role => $count ) {
            $user_count[ $role ] = $count;
        }

        return $user_count;
    }

    /**
     * Add weekly cron schedule
     *
     * @param array  $schedules
     *
     * @return array
     */
    public function add_weekly_schedule( $schedules ) {

        $schedules['weekly'] = array(
            'interval' => DAY_IN_SECONDS * 7,
            'display'  => __( 'Once Weekly', 'dokan-lite' )
        );

        return $schedules;
    }

    /**
     * Clear our options upon deactivation
     *
     * @return void
     */
    public function deactivation_cleanup() {
        $this->clear_schedule_event();

        delete_option( $this->slug . '_allow_tracking' );
        delete_option( $this->slug . '_tracking_notice' );
        delete_option( $this->slug . '_tracking_last_send' );
    }

    /**
     * Hook into action links and modify the deactivate link
     *
     * @param  array  $links
     *
     * @return array
     */
    public function plugin_action_links( $links ) {

        if ( array_key_exists( 'deactivate', $links ) ) {
            $links['deactivate'] = str_replace( '<a', '<a class="' . $this->slug . '-deactivate-link"', $links['deactivate'] );
        }

        return $links;
    }

    private function get_uninstall_reasons() {
        $reasons = array(
            array(
                'id'          => 'could-not-understand',
                'text'        => 'I couldn\'t understand how to make it work',
                'type'        => 'textarea',
                'placeholder' => 'Would you like us to assist you?'
            ),
            array(
                'id'          => 'found-better-plugin',
                'text'        => 'I found a better plugin',
                'type'        => 'text',
                'placeholder' => 'Which plugin?'
            ),
            array(
                'id'          => 'not-have-that-feature',
                'text'        => 'The plugin is great, but I need specific feature that you don\'t support',
                'type'        => 'textarea',
                'placeholder' => 'Could you tell us more about that feature?'
            ),
            array(
                'id'          => 'is-not-working',
                'text'        => 'The plugin is not working',
                'type'        => 'textarea',
                'placeholder' => 'Could you tell us a bit more whats not working?'
            ),
            array(
                'id'          => 'looking-for-other',
                'text'        => 'It\'s not what I was looking for',
                'type'        => '',
                'placeholder' => ''
            ),
            array(
                'id'          => 'did-not-work-as-expected',
                'text'        => 'The plugin didn\'t work as expected',
                'type'        => 'textarea',
                'placeholder' => 'What did you expect?'
            ),
            array(
                'id'          => 'other',
                'text'        => 'Other',
                'type'        => 'textarea',
                'placeholder' => 'Could you tell us a bit more?'
            ),
        );

        return $reasons;
    }

    /**
     * Plugin deactivation uninstall reason submission
     *
     * @return void
     */
    public function uninstall_reason_submission() {

        if ( ! wp_verify_nonce( $_POST['nonce'], 'wedevs_insights_nonce' ) ) {
            wp_send_json_error();
        }

        if ( ! isset( $_POST['reason_id'] ) ) {
            wp_send_json_error();
        }

        $current_user = wp_get_current_user();

        $data = array(
            'hash'        => $this->hash,
            'reason_id'   => sanitize_text_field( $_POST['reason_id'] ),
            'reason_info' => isset( $_REQUEST['reason_info'] ) ? trim( stripslashes( $_REQUEST['reason_info'] ) ) : '',
            'site'        => get_bloginfo( 'name' ),
            'url'         => home_url(),
            'admin_email' => get_option( 'admin_email' ),
            'user_email'  => $current_user->user_email,
            'first_name'  => $current_user->first_name,
            'last_name'   => $current_user->last_name,
            'server'      => $this->get_server_info(),
            'wp'          => $this->get_wp_info(),
        );

        $this->send_request( $data, 'deactivate' );

        wp_send_json_success();
    }

    /**
     * Handle the plugin deactivation feedback
     *
     * @return void
     */
    public function deactivate_scripts() {
        global $pagenow;

        if ( 'plugins.php' != $pagenow ) {
            return;
        }

        $reasons = $this->get_uninstall_reasons();
        ?>

        <div class="wd-dr-modal" id="<?php echo esc_attr( $this->slug ); ?>-wd-dr-modal">
            <div class="wd-dr-modal-wrap">
                <div class="wd-dr-modal-header">
                    <h3><?php esc_html_e( 'If you have a moment, please let us know why you are deactivating:', 'dokan-lite' ); ?></h3>
                </div>

                <div class="wd-dr-modal-body">
                    <ul class="reasons">
                        <?php foreach ($reasons as $reason) { ?>
                            <li data-type="<?php echo esc_attr( $reason['type'] ); ?>" data-placeholder="<?php echo esc_attr( $reason['placeholder'] ); ?>">
                                <label><input type="radio" name="selected-reason" value="<?php echo esc_attr( $reason['id'] ); ?>"> <?php echo esc_html( $reason['text'] ); ?></label>
                            </li>
                        <?php } ?>
                    </ul>
                </div>

                <div class="wd-dr-modal-footer">
                    <a href="#" class="dont-bother-me"><?php esc_html_e( 'I rather wouldn\'t say', 'dokan-lite' ); ?></a>
                    <button class="button-secondary"><?php esc_html_e( 'Submit & Deactivate', 'dokan-lite' ); ?></button>
                    <button class="button-primary"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></button>
                </div>
            </div>
        </div>

        <style type="text/css">
            .wd-dr-modal {
                position: fixed;
                z-index: 99999;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                background: rgba(0,0,0,0.5);
                display: none;
            }

            .wd-dr-modal.modal-active {
                display: block;
            }

            .wd-dr-modal-wrap {
                width: 475px;
                position: relative;
                margin: 10% auto;
                background: #fff;
            }

            .wd-dr-modal-header {
                border-bottom: 1px solid #eee;
                padding: 8px 20px;
            }

            .wd-dr-modal-header h3 {
                line-height: 150%;
                margin: 0;
            }

            .wd-dr-modal-body {
                padding: 5px 20px 20px 20px;
            }

            .wd-dr-modal-body .reason-input {
                margin-top: 5px;
                margin-left: 20px;
            }
            .wd-dr-modal-footer {
                border-top: 1px solid #eee;
                padding: 12px 20px;
                text-align: right;
            }
        </style>

        <script type="text/javascript">
            (function($) {
                $(function() {
                    var modal = $( '#<?php echo esc_attr( $this->slug ); ?>-wd-dr-modal' );
                    var deactivateLink = '';

                    $( '#the-list' ).on('click', 'a.<?php echo esc_attr( $this->slug ); ?>-deactivate-link', function(e) {
                        e.preventDefault();

                        modal.addClass('modal-active');
                        deactivateLink = $(this).attr('href');
                        modal.find('a.dont-bother-me').attr('href', deactivateLink).css('float', 'left');
                    });

                    modal.on('click', 'button.button-primary', function(e) {
                        e.preventDefault();

                        modal.removeClass('modal-active');
                    });

                    modal.on('click', 'input[type="radio"]', function () {
                        var parent = $(this).parents('li:first');

                        modal.find('.reason-input').remove();

                        var inputType = parent.data('type'),
                            inputPlaceholder = parent.data('placeholder'),
                            reasonInputHtml = '<div class="reason-input">' + ( ( 'text' === inputType ) ? '<input type="text" size="40" />' : '<textarea rows="5" cols="45"></textarea>' ) + '</div>';

                        if ( inputType !== '' ) {
                            parent.append( $(reasonInputHtml) );
                            parent.find('input, textarea').attr('placeholder', inputPlaceholder).focus();
                        }
                    });

                    modal.on('click', 'button.button-secondary', function(e) {
                        e.preventDefault();

                        var button = $(this);

                        if ( button.hasClass('disabled') ) {
                            return;
                        }

                        var $radio = $( 'input[type="radio"]:checked', modal );

                        var $selected_reason = $radio.parents('li:first'),
                            $input = $selected_reason.find('textarea, input[type="text"]');

                        $.ajax({
                            url: ajaxurl,
                            type: 'POST',
                            data: {
                                action: '<?php echo $this->slug; ?>_submit-uninstall-reason',
                                reason_id: ( 0 === $radio.length ) ? 'none' : $radio.val(),
                                reason_info: ( 0 !== $input.length ) ? $input.val().trim() : '',
                                nonce: '<?php echo wp_create_nonce( 'wedevs_insights_nonce' ); ?>'
                            },
                            beforeSend: function() {
                                button.addClass('disabled');
                                button.text('Processing...');
                            },
                            complete: function() {
                                window.location.href = deactivateLink;
                            }
                        });
                    });
                });
            }(jQuery));
        </script>

        <?php
    }
}
