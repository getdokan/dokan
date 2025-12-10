<?php

if ( function_exists( 'wc_print_notices' ) ) {
    wc_print_notices();
}

?>

<div class="dokan-vendor-onboarding">
    <h1 class="onboarding-title"><?php esc_html_e( 'Vendor Onboarding', 'dokan-lite' ); ?></h1>

    <div class="onboarding-container">
        <!-- Login Section -->
        <div class="login-section">
            <h2><?php esc_html_e( 'Login', 'dokan-lite' ); ?></h2>
            <?php wc_get_template( 'global/form-login.php' ); ?>
        </div>

        <!-- Registration Section -->
        <div class="registration-section">
            <h2><?php esc_html_e( 'Registration', 'dokan-lite' ); ?></h2>
            <?php dokan_get_template_part( 'account/vendor-registration', false, [ 'data' => $data ] ); ?>
        </div>
    </div>
</div>

<style>
    .dokan-vendor-onboarding {
        max-width: 1400px;
        margin: 0 auto;
        padding: 60px 40px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .onboarding-title {
        font-size: 2.5rem;
        margin-bottom: 60px;
        font-weight: 600;
        color: #000;
    }

    .onboarding-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 80px;
        align-items: start;
    }

    .login-section h2,
    .registration-section h2 {
        font-size: 2rem;
        margin-bottom: 30px;
        font-weight: 600;
        color: #000;
    }

    /* Login Form Styling */
    .login-section .woocommerce-form-login {
        max-width: 600px;
    }

    .login-section .woocommerce-form-login .form-row {
        display: block !important;
        width: 100% !important;
        margin-bottom: 20px;
        float: none !important;
    }

    .login-section .woocommerce-form-login .form-row.form-row-first,
    .login-section .woocommerce-form-login .form-row.form-row-last {
        width: 100% !important;
        float: none !important;
    }

    .login-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: 400;
        color: #666;
        font-size: 0.95rem;
    }

    .login-section input[type="text"],
    .login-section input[type="password"],
    .login-section input[type="email"] {
        width: 100%;
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        background-color: #fff;
        transition: border-color 0.3s ease;
    }

    .login-section input[type="text"]:focus,
    .login-section input[type="password"]:focus,
    .login-section input[type="email"]:focus {
        outline: none;
        border-color: #999;
    }

    .login-section .woocommerce-form-login__rememberme {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }

    .login-section input[type="checkbox"] {
        margin-right: 8px;
        width: 16px;
        height: 16px;
    }

    .login-section button[type="submit"],
    .login-section .button {
        background-color: #000;
        color: #fff;
        padding: 12px 30px;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .login-section button[type="submit"]:hover,
    .login-section .button:hover {
        background-color: #333;
    }

    .login-section .lost_password {
        margin-top: 20px;
    }

    .login-section .lost_password a {
        color: #e74c3c;
        text-decoration: none;
        font-size: 0.95rem;
    }

    .login-section .lost_password a:hover {
        text-decoration: underline;
    }

    /* Registration Section Styling */
    .registration-section form {
        max-width: 600px;
    }

    .registration-section .form-row {
        margin-bottom: 20px;
    }

    .registration-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: 400;
        color: #666;
        font-size: 0.95rem;
    }

    .registration-section input[type="text"],
    .registration-section input[type="password"],
    .registration-section input[type="email"],
    .registration-section input[type="tel"],
    .registration-section input[type="url"],
    .registration-section select,
    .registration-section textarea {
        width: 100%;
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        background-color: #fff;
        transition: border-color 0.3s ease;
    }

    .registration-section select,
    .registration-section select.dokan-form-control {
        height: auto;
    }

    .registration-section input:focus,
    .registration-section select:focus,
    .registration-section textarea:focus {
        outline: none;
        border-color: #999;
    }

    .registration-section button[type="submit"],
    .registration-section .dokan-btn {
        background-color: #000;
        color: #fff;
        padding: 12px 30px;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .registration-section button[type="submit"]:hover,
    .registration-section .dokan-btn:hover {
        background-color: #333;
    }

    .registration-section .help-block,
    .registration-section .description {
        font-size: 0.85rem;
        color: #666;
        margin-top: 5px;
    }

    .registration-section input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin-right: 8px;
    }

    @media (max-width: 1024px) {
        .onboarding-container {
            grid-template-columns: 1fr;
            gap: 60px;
        }
        
        .login-section .woocommerce-form-login,
        .registration-section form {
            max-width: 100%;
        }
    }

    @media (max-width: 768px) {
        .dokan-vendor-onboarding {
            padding: 40px 20px;
        }

        .onboarding-title {
            font-size: 2rem;
            margin-bottom: 40px;
        }

        .login-section h2,
        .registration-section h2 {
            font-size: 1.5rem;
        }

        .onboarding-container {
            gap: 40px;
        }
    }
</style>
