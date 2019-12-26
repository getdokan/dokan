<?php
namespace Appsero;

/**
 * Appsero License Checker
 *
 * This class will check, active and deactive license
 */
class License {

    /**
     * AppSero\Client
     *
     * @var object
     */
    protected $client;

    /**
     * Arguments of create menu
     *
     * @var array
     */
    protected $menu_args;

    /**
     * `option_name` of `wp_options` table
     *
     * @var string
     */
    protected $option_key;

    /**
     * Error message of HTTP request
     *
     * @var string
     */
    public $error;

    /**
     * Success message on form submit
     *
     * @var string
     */
    public $success;

    /**
     * Corn schedule hook name
     *
     * @var string
     */
    protected $schedule_hook;

    /**
     * Set value for valid licnese
     *
     * @var boolean
     */
    private $is_valid_licnese = null;

    /**
     * Initialize the class
     *
     * @param Appsero\Client
     */
    public function __construct( Client $client ) {
        $this->client = $client;

        $this->option_key = 'appsero_' . md5( $this->client->slug ) . '_manage_license';

        $this->schedule_hook = $this->client->slug . '_license_check_event';

        // Run hook to check license status daily
        add_action( $this->schedule_hook, array( $this, 'check_license_status' ) );

        // Active/Deactive corn schedule
        $this->run_schedule();
    }

    /**
     * Check license
     *
     * @return boolean
     */
    public function check( $license_key ) {
        $route    = 'public/license/' . $this->client->hash . '/check';

        return $this->send_request( $license_key, $route );
    }

    /**
     * Active a license
     *
     * @return boolean
     */
    public function activate( $license_key ) {
        $route    = 'public/license/' . $this->client->hash . '/activate';

        return $this->send_request( $license_key, $route );
    }

    /**
     * Deactivate a license
     *
     * @return boolean
     */
    public function deactivate( $license_key ) {
        $route    = 'public/license/' . $this->client->hash . '/deactivate';

        return $this->send_request( $license_key, $route );
    }

    /**
     * Send common request
     *
     * @param $license_key
     * @param $route
     *
     * @return array
     */
    protected function send_request( $license_key, $route ) {
        $params = array(
            'license_key' => $license_key,
            'url'         => esc_url( home_url() ),
        );

        $response = $this->client->send_request( $params, $route, true );

        if ( is_wp_error( $response ) ) {
            return array(
                'success' => false,
                'error'   => $response->get_error_message()
            );
        }

        $response = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $response ) || isset( $response['exception'] )) {
            return array(
                'success' => false,
                'error'   => 'Unknown error occurred, Please try again.'
            );
        }

        if ( isset( $response['errors'] ) && isset( $response['errors']['license_key'] ) ) {
            $response = array(
                'success' => false,
                'error'   => $response['errors']['license_key'][0]
            );
        }

        return $response;
    }

    /**
     * Add settings page for license
     *
     * @param array $args
     *
     * @return void
     */
    public function add_settings_page( $args = array() ) {
        $defaults = array(
            'type'        => 'menu', // Can be: menu, options, submenu
            'page_title'  => 'Manage License',
            'menu_title'  => 'Manage License',
            'capability'  => 'manage_options',
            'menu_slug'   => $this->client->slug . '-manage-license',
            'icon_url'    => '',
            'position'    => null,
            'parent_slug' => '',
        );

        $this->menu_args = wp_parse_args( $args, $defaults );

        add_action( 'admin_menu', array( $this, 'admin_menu' ), 99 );
    }

    /**
     * Admin Menu hook
     *
     * @return void
     */
    public function admin_menu() {
        switch ( $this->menu_args['type'] ) {
            case 'menu':
                $this->add_menu_page();
                break;

            case 'submenu':
                $this->add_submenu_page();
                break;

            case 'options':
                $this->add_options_page();
                break;
        }
    }

    /**
     * License menu output
     */
    public function menu_output() {

        if ( isset( $_POST['submit'] ) ) {
            $this->license_form_submit( $_POST );
        }

        $license = get_option( $this->option_key, null );
        $action = ( $license && isset( $license['status'] ) && 'activate' == $license['status'] ) ? 'deactive' : 'active';
        $this->licenses_style();
        ?>

        <div class="wrap appsero-license-settings-wrapper">
            <h1>License Settings</h1>

            <?php
                $this->show_license_page_notices();
                do_action( 'before_appsero_license_section' );
            ?>

            <div class="appsero-license-settings appsero-license-section">
                <?php $this->show_license_page_card_header(); ?>

                <div class="appsero-license-details">
                    <p>Active <strong><?php echo $this->client->name; ?></strong> by your license key to get professional support and automatic update from your WordPress dashboard.</p>
                    <form method="post" action="<?php $this->formActionUrl(); ?>" novalidate="novalidate" spellcheck="false">
                        <input type="hidden" name="_action" value="<?php echo $action; ?>">
                        <input type="hidden" name="_nonce" value="<?php echo wp_create_nonce( $this->client->name ); ?>">
                        <div class="license-input-fields">
                            <div class="license-input-key">
                                <svg enable-background="new 0 0 512 512" version="1.1" viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m463.75 48.251c-64.336-64.336-169.01-64.335-233.35 1e-3 -43.945 43.945-59.209 108.71-40.181 167.46l-185.82 185.82c-2.813 2.813-4.395 6.621-4.395 10.606v84.858c0 8.291 6.709 15 15 15h84.858c3.984 0 7.793-1.582 10.605-4.395l21.211-21.226c3.237-3.237 4.819-7.778 4.292-12.334l-2.637-22.793 31.582-2.974c7.178-0.674 12.847-6.343 13.521-13.521l2.974-31.582 22.793 2.651c4.233 0.571 8.496-0.85 11.704-3.691 3.193-2.856 5.024-6.929 5.024-11.206v-27.929h27.422c3.984 0 7.793-1.582 10.605-4.395l38.467-37.958c58.74 19.043 122.38 4.929 166.33-39.046 64.336-64.335 64.336-169.01 0-233.35zm-42.435 106.07c-17.549 17.549-46.084 17.549-63.633 0s-17.549-46.084 0-63.633 46.084-17.549 63.633 0 17.548 46.084 0 63.633z"/>
                                </svg>
                                <input type="text" value="<?php echo $this->get_input_license_value( $action, $license ); ?>"
                                    placeholder="Enter your license key to activate" name="license_key"
                                    <?php echo ( 'deactive' == $action ) ? 'readonly="readonly"' : ''; ?>
                                />
                            </div>
                            <button type="submit" name="submit" class="<?php echo 'deactive' == $action ? 'deactive-button' : ''; ?>">
                                <?php echo $action == 'active' ? 'Activate License' : 'Deactivate License' ; ?>
                            </button>
                        </div>
                    </form>

                    <?php
                        if ( 'deactive' == $action && isset( $license['remaining'] ) ) {
                            $this->show_active_license_info( $license );
                        }
                    ?>
                </div>
            </div> <!-- /.appsero-license-settings -->

            <?php do_action( 'after_appsero_license_section' ); ?>
        </div>
        <?php
    }

    /**
     * License form submit
     */
    public function license_form_submit( $form ) {
        if ( ! isset( $form['_nonce'], $form['_action'] ) ) {
            $this->error = "Please add all information";
            return;
        }

        if ( ! wp_verify_nonce( $form['_nonce'], $this->client->name ) ) {
            $this->error = "You don't have permission to manage license.";
            return;
        }

        switch ( $form['_action'] ) {
            case 'active':
                $this->active_client_license( $form );
                break;

            case 'deactive':
                $this->deactive_client_license( $form );
                break;
        }
    }

    /**
     * Check license status on schedule
     */
    public function check_license_status() {
        $license = get_option( $this->option_key, null );

        if ( isset( $license['key'] ) && ! empty( $license['key'] ) ) {
            $response = $this->check( $license['key'] );

            if ( isset( $response['success'] ) && $response['success'] ) {
                $license['status']           = 'activate';
                $license['remaining']        = $response['remaining'];
                $license['activation_limit'] = $response['activation_limit'];
                $license['expiry_days']      = $response['expiry_days'];
                $license['title']            = $response['title'];
                $license['source_id']        = $response['source_identifier'];
                $license['recurring']        = $response['recurring'];
            } else {
                $license['status']      = 'deactivate';
                $license['expiry_days'] = 0;
            }

            update_option( $this->option_key, $license, false );
        }
    }

    /**
     * Check this is a valid license
     */
    public function is_valid() {
        if ( null !== $this->is_valid_licnese ) {
            return $this->is_valid_licnese;
        }

        $license = get_option( $this->option_key, null );
        if ( ! empty( $license['key'] ) && isset( $license['status'] ) && $license['status'] == 'activate' ) {
            $this->is_valid_licnese = true;
        } else {
        	$this->is_valid_licnese = false;
        }

        return $this->is_valid_licnese;
    }

    /**
     * Check this is a valid license
     */
    public function is_valid_by( $option, $value ) {
        $license = get_option( $this->option_key, null );

        if ( ! empty( $license['key'] ) && isset( $license['status'] ) && $license['status'] == 'activate' ) {
            if ( isset( $license[ $option ] ) && $license[ $option ] == $value ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Styles for licenses page
     */
    private function licenses_style() {
        ?>
        <style type="text/css">
            .appsero-license-section {
                width: 100%;
                max-width: 1100px;
                min-height: 1px;
                box-sizing: border-box;
            }
            .appsero-license-settings {
                background-color: #fff;
                box-shadow: 0px 3px 10px rgba(16, 16, 16, 0.05);
            }
            .appsero-license-settings * {
                box-sizing: border-box;
            }
            .appsero-license-title {
                background-color: #F8FAFB;
                border-bottom: 2px solid #EAEAEA;
                display: flex;
                align-items: center;
                padding: 10px 20px;
            }
            .appsero-license-title svg {
                width: 30px;
                height: 30px;
                fill: #0082BF;
            }
            .appsero-license-title span {
                font-size: 17px;
                color: #444444;
                margin-left: 10px;
            }
            .appsero-license-details {
                padding: 20px;
            }
            .appsero-license-details p {
                font-size: 15px;
                margin: 0 0 20px 0;
            }
            .license-input-key {
                position: relative;
                flex: 0 0 72%;
                max-width: 72%;
            }
            .license-input-key input {
                background-color: #F9F9F9;
                padding: 10px 15px 10px 48px;
                border: 1px solid #E8E5E5;
                border-radius: 3px;
                height: 45px;
                font-size: 16px;
                color: #71777D;
                width: 100%;
                box-shadow: 0 0 0 transparent;
            }
            .license-input-key input:focus {
                outline: 0 none;
                border: 1px solid #E8E5E5;
                box-shadow: 0 0 0 transparent;
            }
            .license-input-key svg {
                width: 22px;
                height: 22px;
                fill: #0082BF;
                position: absolute;
                left: 14px;
                top: 13px;
            }
            .license-input-fields {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                max-width: 850px;
                width: 100%;
            }
            .license-input-fields button {
                color: #fff;
                font-size: 17px;
                padding: 8px;
                height: 46px;
                background-color: #0082BF;
                border-radius: 3px;
                cursor: pointer;
                flex: 0 0 25%;
                max-width: 25%;
                border: 1px solid #0082BF;
            }
            .license-input-fields button.deactive-button {
                background-color: #E40055;
                border-color: #E40055;
            }
            .license-input-fields button:focus {
                outline: 0 none;
            }
            .active-license-info {
                display: flex;
            }
            .single-license-info {
                min-width: 220px;
                flex: 0 0 30%;
            }
            .single-license-info h3 {
                font-size: 18px;
                margin: 0 0 12px 0;
            }
            .single-license-info p {
                margin: 0;
                color: #00C000;
            }
            .single-license-info p.occupied {
                color: #E40055;
            }
        </style>
        <?php
    }

    /**
     * Show active license information
     */
    private function show_active_license_info( $license ) {
        ?>
        <div class="active-license-info">
            <div class="single-license-info">
                <h3>Activation Remaining</h3>
                <?php if ( empty( $license['activation_limit'] ) ): ?>
                    <p>Unlimited</p>
                <?php else: ?>
                    <p class="<?php echo $license['remaining'] ? '' : 'occupied'; ?>">
                        <?php echo $license['remaining']; ?> out of <?php echo $license['activation_limit']; ?>
                    </p>
                <?php endif; ?>
            </div>
            <div class="single-license-info">
                <h3>Expires in</h3>
                <?php
                    if ( $license['recurring'] && false !== $license['expiry_days'] ) {
                        $occupied = $license['expiry_days'] > 10 ? '' : 'occupied';
                        echo '<p class="' . $occupied . '">' . $license['expiry_days'] . ' days</p>';
                    } else {
                        echo '<p>Never</p>';
                    }
                ?>
            </div>
        </div>
        <?php
    }

    /**
     * Show license settings page notices
     */
    private function show_license_page_notices() {
            if ( ! empty( $this->error ) ) :
        ?>
            <div class="notice notice-error is-dismissible appsero-license-section">
                <p><?php echo $this->error; ?></p>
            </div>
        <?php
            endif;
            if ( ! empty( $this->success ) ) :
        ?>
            <div class="notice notice-success is-dismissible appsero-license-section">
                <p><?php echo $this->success; ?></p>
            </div>
        <?php
            endif;
            echo '<br />';
    }

    /**
     * Card header
     */
    private function show_license_page_card_header() {
        ?>
        <div class="appsero-license-title">
            <svg enable-background="new 0 0 299.995 299.995" version="1.1" viewBox="0 0 300 300" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
                <path d="m150 161.48c-8.613 0-15.598 6.982-15.598 15.598 0 5.776 3.149 10.807 7.817 13.505v17.341h15.562v-17.341c4.668-2.697 7.817-7.729 7.817-13.505 0-8.616-6.984-15.598-15.598-15.598z"/>
                <path d="m150 85.849c-13.111 0-23.775 10.665-23.775 23.775v25.319h47.548v-25.319c-1e-3 -13.108-10.665-23.775-23.773-23.775z"/>
                <path d="m150 1e-3c-82.839 0-150 67.158-150 150 0 82.837 67.156 150 150 150s150-67.161 150-150c0-82.839-67.161-150-150-150zm46.09 227.12h-92.173c-9.734 0-17.626-7.892-17.626-17.629v-56.919c0-8.491 6.007-15.582 14.003-17.25v-25.697c0-27.409 22.3-49.711 49.711-49.711 27.409 0 49.709 22.3 49.709 49.711v25.697c7.993 1.673 14 8.759 14 17.25v56.919h2e-3c0 9.736-7.892 17.629-17.626 17.629z"/>
            </svg>
            <span>Activate License</span>
        </div>
        <?php
    }

    /**
     * Active client license
     */
    private function active_client_license( $form ) {
        if ( empty( $form['license_key'] ) ) {
            $this->error = 'The license key field is required.';
            return;
        }

        $license_key = sanitize_text_field( $form['license_key'] );
        $response = $this->activate( $license_key );

        if ( ! $response['success'] ) {
            $this->error = $response['error'] ? $response['error'] : 'Unknown error occurred.';
            return;
        }

        $data = array(
            'key'              => $license_key,
            'status'           => 'activate',
            'remaining'        => $response['remaining'],
            'activation_limit' => $response['activation_limit'],
            'expiry_days'      => $response['expiry_days'],
            'title'            => $response['title'],
            'source_id'        => $response['source_identifier'],
            'recurring'        => $response['recurring'],
        );

        update_option( $this->option_key, $data, false );

        $this->success = 'License activated successfully.';
    }

    /**
     * Deactive client license
     */
    private function deactive_client_license( $form ) {
        $license = get_option( $this->option_key, null );

        if ( empty( $license['key'] ) ) {
            $this->error = 'License key not found.';
            return;
        }

        $response = $this->deactivate( $license['key'] );

        $data = array(
            'key'    => '',
            'status' => 'deactivate',
        );

        update_option( $this->option_key, $data, false );

        if ( ! $response['success'] ) {
            $this->error = $response['error'] ? $response['error'] : 'Unknown error occurred.';
            return;
        }

        $this->success = 'License deactivated successfully.';
    }

    /**
     * Add license menu page
     */
    private function add_menu_page() {
        add_menu_page(
            $this->menu_args['page_title'],
            $this->menu_args['menu_title'],
            $this->menu_args['capability'],
            $this->menu_args['menu_slug'],
            array( $this, 'menu_output' ),
            $this->menu_args['icon_url'],
            $this->menu_args['position']
        );
    }

    /**
     * Add submenu page
     */
    private function add_submenu_page() {
        add_submenu_page(
            $this->menu_args['parent_slug'],
            $this->menu_args['page_title'],
            $this->menu_args['menu_title'],
            $this->menu_args['capability'],
            $this->menu_args['menu_slug'],
            array( $this, 'menu_output' ),
            $this->menu_args['position']
        );
    }

    /**
     * Add submenu page
     */
    private function add_options_page() {
        add_options_page(
            $this->menu_args['page_title'],
            $this->menu_args['menu_title'],
            $this->menu_args['capability'],
            $this->menu_args['menu_slug'],
            array( $this, 'menu_output' ),
            $this->menu_args['position']
        );
    }

    /**
     * Schedule daily sicense checker event
     */
    public function schedule_cron_event() {
        if ( ! wp_next_scheduled( $this->schedule_hook ) ) {
            wp_schedule_event( time(), 'daily', $this->schedule_hook );

            wp_schedule_single_event( time() + 20, $this->schedule_hook );
        }
    }

    /**
     * Clear any scheduled hook
     */
    public function clear_scheduler() {
        wp_clear_scheduled_hook( $this->schedule_hook );
    }

    /**
     * Enable/Disable schedule
     */
    private function run_schedule() {
        switch ( $this->client->type ) {
            case 'plugin':
                register_activation_hook( $this->client->file, array( $this, 'schedule_cron_event' ) );
                register_deactivation_hook( $this->client->file, array( $this, 'clear_scheduler' ) );
                break;

            case 'theme':
                add_action( 'after_switch_theme', array( $this, 'schedule_cron_event' ) );
                add_action( 'switch_theme', array( $this, 'clear_scheduler' ) );
                break;
        }
    }

    /**
     * Form action URL
     */
    private function formActionUrl() {
        echo add_query_arg(
            array( 'page' => $_GET['page'] ),
            admin_url( basename( $_SERVER['SCRIPT_NAME'] ) )
        );
    }

    /**
     * Get input license key
     * @param  $action
     * @return $license
     */
    private function get_input_license_value( $action, $license ) {
        if ( 'active' == $action ) {
            return isset( $license['key'] ) ? $license['key'] : '';
        }

        if ( 'deactive' == $action ) {
            $key_length = strlen( $license['key'] );

            return str_pad(
                substr( $license['key'], 0, $key_length / 2 ), $key_length, '*'
            );
        }

        return '';
    }

}
