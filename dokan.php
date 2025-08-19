<?php
/**
 * Plugin Name: Dokan
 * Plugin URI: https://dokan.co/wordpress/
 * Description: An e-commerce marketplace plugin for WordPress. Powered by WooCommerce and weDevs.
 * Version: 4.0.5
 * Author: Dokan Inc.
 * Author URI: https://dokan.co/wordpress/
 * Text Domain: dokan-lite
 * Requires Plugins: woocommerce
 * WC requires at least: 8.5.0
 * WC tested up to: 10.0.4
 * Domain Path: /languages/
 * License: GPL2
 */

/*
 * Copyright (c) 2025 Dokan Inc. (email: info@dokan.co). All rights reserved.
 *
 * Released under the GPL license
 * http://www.opensource.org/licenses/gpl-license.php
 *
 * This is an add-on for WordPress
 * http://wordpress.org/
 *
 * **********************************************************************
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 * **********************************************************************
 */

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';

/**
 * Include file for loading the WeDevs_Dokan class.
 *
 * @since 3.13.0
 */
require_once __DIR__ . '/dokan-class.php';

// Define constant for the Plugin file.
defined( 'DOKAN_FILE' ) || define( 'DOKAN_FILE', __FILE__ );

// Use the necessary namespace.
use WeDevs\Dokan\DependencyManagement\Container;

// Declare the $dokan_container as global to access from the inside of the function.
global $dokan_container;

// Instantiate the container.
$dokan_container = new Container();

// Register the service providers.
$dokan_container->addServiceProvider( new \WeDevs\Dokan\DependencyManagement\Providers\ServiceProvider() );

/**
 * Get the container.
 *
 * @since 3.13.0
 *
 * @return Container The global container instance.
 */
function dokan_get_container(): Container {
    global $dokan_container;

    return $dokan_container;
}

/**
 * Load Dokan Plugin when all plugins loaded.
 *
 * @return WeDevs_Dokan The singleton instance of WeDevs_Dokan.
 */
function dokan() {
    return WeDevs_Dokan::init();
}

// Let's go...
dokan();
