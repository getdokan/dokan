<?php
namespace WeDevs\Dokan\Test\Factories;

use Moip\Resource\Customer;
use WC_Customer;
use WP_UnitTest_Generator_Sequence;

class SellerFactory extends CustomerFactory {
    public function __construct( $factory = null ) {
        parent::__construct( $factory );
        $this->default_generation_definitions = array(
            'email' => new WP_UnitTest_Generator_Sequence( 'seller%s@example.com' ),
            'username' => new WP_UnitTest_Generator_Sequence( 'seller%s' ),
            'password' => new WP_UnitTest_Generator_Sequence( 'seller%s' ),
            'fname'    => new WP_UnitTest_Generator_Sequence( 'store%s'),
            'lname'    => new WP_UnitTest_Generator_Sequence( 'store%s'),
            'phone'    => new WP_UnitTest_Generator_Sequence( 'store%s'),
            'shopname' => new WP_UnitTest_Generator_Sequence( 'store%s'),
            'shopurl'  => new WP_UnitTest_Generator_Sequence( 'store%s'),
            'role'     => 'seller',
        );
    }

    public function create_object( $args ) {
        $_POST = $args; // $_POST global variable is required in Dokan Registration.
        // Todo: Need to handle the nonce verification in Dokan includes/Registration.php class.
        $customer_id = parent::create_object( $args );

        $customer_id;
    }
}
