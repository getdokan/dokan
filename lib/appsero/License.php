<?php
namespace Appsero;

/**
 * AppSero License Checker
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
    protected $error;

    /**
     * Success message on form submit
     *
     * @var string
     */
    protected $success;

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

        $this->option_key = 'appsero_' . md5( $this->client->slug ) . '_licenses';
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
            'menu_slug'   => 'manage-license',
            'icon_url'    => '',
            'position'    => null,
            'parent_slug' => '',
        );

        $this->menu_args = wp_parse_args( $args, $defaults );

        add_action( 'admin_menu', array( $this, 'admin_menu' ) );

        add_action( $this->client->slug . '_license_check_event', array( $this, 'check_license_status' ) );
    }

    /**
     * Admin Menu hook
     *
     * @return void
     */
    public function admin_menu() {
        $add_page = 'add_' . $this->menu_args['type'] . '_page';

        switch ( $this->menu_args['type'] ) {
            case 'menu':
                $add_page(
                    $this->menu_args['page_title'],
                    $this->menu_args['menu_title'],
                    $this->menu_args['capability'],
                    $this->menu_args['menu_slug'],
                    array( $this, 'menu_output' ),
                    $this->menu_args['icon_url'],
                    $this->menu_args['position']
                );
                break;

            case 'submenu':
                $add_page(
                    $this->menu_args['parent_slug'],
                    $this->menu_args['page_title'],
                    $this->menu_args['menu_title'],
                    $this->menu_args['capability'],
                    $this->menu_args['menu_slug'],
                    array( $this, 'menu_output' )
                );
                break;

            case 'options':
                $add_page(
                    $this->menu_args['page_title'],
                    $this->menu_args['menu_title'],
                    $this->menu_args['capability'],
                    $this->menu_args['menu_slug'],
                    array( $this, 'menu_output' )
                );
                break;
        }
    }

    /**
     * License menu output
     */
    public function menu_output() {

        if ( isset( $_POST['submit'] ) ) {
            $this->license_page_form( $_POST );
        }

        $license = get_option( $this->option_key, null );
        $action = ( $license && isset( $license['status'] ) && 'activate' == $license['status'] ) ? 'Deactive' : 'Active';
        ?>

        <div class="wrap">
            <h1><?php echo $this->menu_args['menu_title']; ?></h1>

            <?php if ( ! empty( $this->error ) ) : ?>
            <div class="notice notice-error is-dismissible" style="max-width: 745px;">
                <p><?php echo $this->error; ?></p>
            </div>
            <?php endif; ?>

            <?php if ( ! empty( $this->success ) ) : ?>
            <div class="notice notice-success is-dismissible" style="max-width: 745px;">
                <p><?php echo $this->success; ?></p>
            </div>
            <?php endif; ?>

            <br />

            <div class="widget open" style="max-width: 800px; margin: 0;">
                <div class="widget-top">
                    <div class="widget-title"><h3>License Settings</h3></div>
                </div>
                <div class="widget-inside" style="display: block; padding: 5px 15px;">
                    <form method="post" action="<?php echo home_url( $_SERVER['REQUEST_URI'] ); ?>" novalidate="novalidate">
                        <table class="form-table">
                            <tbody>
                                <tr>
                                    <th scope="row">
                                        <label>License key</label>
                                    </th>
                                    <td>
                                        <input type="text" class="regular-text code" value="<?php echo $license['key']; ?>"
                                            placeholder="Enter your license key" name="license_key"
                                            <?php echo ( 'Deactive' == $action ) ? 'readonly="readonly"' : ''; ?> />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <input type="hidden" name="_action" value="<?php echo $action; ?>">
                        <p>
                            <button type="submit" name="submit" class="button button-primary"><?php echo $action; ?></button>
                        </p>
                    </form>
                </div>
            </div> <!-- /.widget -->
        </div>

        <?php
    }

    /**
     * License form submit
     */
    private function license_page_form( $form ) {
        if ( $form['_action'] == 'Active' ) {
            $response = $this->activate( $form['license_key'] );

            if ( ! empty( $response['success'] ) ) {
                $data = array(
                    'key'    => $form['license_key'],
                    'status' => 'activate',
                );
                update_option( $this->option_key, $data, false );
                $this->success = 'License activated successfully.';
            }
        } else if ( $form['_action'] == 'Deactive' ) {
            $response = $this->deactivate( $form['license_key'] );

            if ( ! empty( $response['success'] ) ) {
                $this->success = 'License deactivated successfully.';
            }

            $data = array(
                'key'    => '',
                'status' => 'deactivate',
            );

            update_option( $this->option_key, $data, false );
        }

        if ( isset( $response['error'] ) && ! empty( $response['error'] ) ) {
            $this->error = $response['error'];
        }

        // var_export( $response );
    }

    /**
     * Check license status on schedule
     */
    public function check_license_status() {
        $license = get_option( $this->option_key, null );

        if ( isset( $license['key'] ) && ! empty( $license['key'] ) ) {
            $response = $this->check( $license['key'] );

            if ( isset( $response['success'] ) && $response['success'] ) {
                $license['status'] = 'activate';
            } else {
                $license['status'] = 'deactivate';
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

}
