import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { helpers, BASE_URL, toPath } from '@utils/helpers';

const { CI } = process.env;

setup.describe('site setup', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('set wp debug config', { tag: ['@lite'] }, async () => {
        for (const [key, value] of Object.entries(data.installWp.debugInfo)) {
            await helpers.exeCommandWpcli(data.commands.wpcli.setDebugConfig(key, value));
        }
    });

    setup('set permalink (post_name)', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.rewritePermalink);
    });

    setup('get server url', { tag: ['@lite'] }, async () => {
        setup.skip(!CI, 'skip on local');
        const headers = await apiUtils.getSiteHeaders(BASE_URL);
        if (headers.link) {
            const serverUrl = headers.link.includes('rest_route') ? toPath('?rest_route=') : toPath('wp-json');
            helpers.createEnvVar('SERVER_URL', serverUrl);
        } else {
            console.log("Headers link doesn't exists");
        }
    });

    setup('activate basic auth', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.basicAuth));
    });

    // Email Log (wordpress.org) — captures every outgoing mail into the
    // `wp_email_log` DB table so the abuse-report email tests can assert on
    // subject/body/recipient. The plugin is downloaded + installed by the
    // wp-env `plugins` array (host-side fetch, so it is NOT blocked by the
    // wp.org-blocking mu-plugin); here we only activate it (a `wp plugin
    // install` from inside WP would hit wp.org and fail).
    setup('activate Email Log', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.emailLog));
    });

    setup('activate Woocommerce', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerce));
    });

    setup('activate Dokan Lite', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.dokanLite));
    });

    setup('activate Dokan Pro', { tag: ['@pro'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.dokanPro));
    });

    // Rank Math SEO is a wordpress.org dependency of the Dokan "Rank Math SEO"
    // product-editor integration. Like Email Log, it is downloaded + installed
    // host-side by the wp-env `plugins` array (so it is NOT blocked by the
    // wp.org-blocking mu-plugin); here we only activate it (a `wp plugin
    // install` from inside WP would hit wp.org and fail). Non-fatal: the
    // module/tests are written to tolerate the plugin being absent
    // (DependencyNotice).
    setup('activate Rank Math SEO', { tag: ['@lite'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.rankMath));
        } catch (error) {
            console.log('Rank Math SEO activation had issues, but continuing...', error);
        }
    });

    setup('flush rewrite rules after plugin activation', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.flushRewrite);
    });

    setup('activate theme (storefront)', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activateTheme(data.installWp.themes.storefront));
    });



    setup('activate Woocommerce booking', { tag: ['@pro'] }, async () => {
        try {
            // Increase memory limit before activation
            await helpers.exeCommandWpcli('wp config set WP_MEMORY_LIMIT 1024M');
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerceBookings));
        } catch (error) {
            console.log('WooCommerce Bookings activation had issues, but continuing...');
        }
    });

    setup('activate Woocommerce product addons', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerceProductAddons));
        } catch (error) {
            console.log('WooCommerce Product Addons activation had issues, but continuing...');
        }
    });

    setup('activate Woocommerce simple auctions', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerceSimpleAuctions));
        } catch (error) {
            console.log('WooCommerce Simple Auctions activation had issues, but continuing...');
        }
    });

    setup('activate Woocommerce subscriptions', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerceSubscriptions));
        } catch (error) {
            console.log('WooCommerce Subscriptions activation had issues, but continuing...');
        }
    });

    setup('activate Woocommerce PDF invoices & packing slips', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommercePdfInvoices));
        } catch (error) {
            console.log('WooCommerce PDF Invoices activation had issues, but continuing...', error);
        }
    });

    // Workaround for a fresh-install bug in dokan-invoice <= 1.2.8: its
    // __construct() reads `wpo_wcpdf_version` to choose which WC PDF class
    // to look up. On a fresh install that option isn't written until WC PDF
    // first runs admin_init, so dokan-invoice picks the legacy class
    // `WooCommerce_PDF_Invoices`, fails class_exists() in
    // localization_setup_and_is_dependency_available(), and silently
    // self-deactivates via dependency_notice() (dokan-invoice.php:155) on
    // the next admin page load. Seeding the option here makes the
    // new-class branch (`WPO_WCPDF`) win on the very first load.
    setup('seed wpo_wcpdf_version (workaround for dokan-invoice <=1.2.8)', { tag: ['@pro'] }, async () => {
        // `wp option update` exits non-zero when the value is unchanged, so a
        // re-run on an already-seeded site would fail the whole setup chain.
        // Tolerate that no-op case while still surfacing genuine failures.
        try {
            await helpers.exeCommandWpcli('wp option update wpo_wcpdf_version 5.11.0 --autoload=yes');
        } catch (error) {
            console.log('wpo_wcpdf_version already seeded, skipping...', error);
        }
    });

    setup('activate Dokan Invoice', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.dokanInvoice));
        } catch (error) {
            console.log('Dokan Invoice activation had issues, but continuing...', error);
        }
    });

    // Enable WC PDF Invoice & Packing Slip documents. Both are disabled by
    // default until the admin saves their settings page once, which means
    // dokan-invoice's REST hook bails (`$document->is_enabled()` is false)
    // and `actions.invoice.url` never gets injected. Seed the option here so
    // dokan-invoice tests can rely on the URL being present.
    //
    // `my_account_buttons => always` forces the My Account → Orders row
    // button to render regardless of whether the document has already been
    // generated. The default `available` mode only renders once the
    // document has been minted (visited or attached to an email), and
    // `attach_to_email_ids => []` disables the email auto-generation. In
    // CI on a fresh install no prior order has a generated invoice doc, so
    // HP-customer-1 / HP-customer-2 see zero buttons and fail. Locally we
    // never noticed because customer1 has accumulated orders from prior
    // runs whose invoices were minted via earlier admin tests.
    setup('enable WC PDF invoice + packing-slip documents', { tag: ['@pro'] }, async () => {
        await helpers.exeCommandWpcli(
            `wp eval 'update_option("wpo_wcpdf_documents_settings_invoice", ["enabled" => "1", "attach_to_email_ids" => [], "my_account_buttons" => "always"]); update_option("wpo_wcpdf_documents_settings_packing-slip", ["enabled" => "1", "my_account_buttons" => "always"]);'`,
        );
    });
    setup('set dokan license', { tag: ['@pro'] }, async () => {
        setup.skip(!process.env.LICENSE_KEY, 'LICENSE_KEY env var not set – skipping license setup (fork PR or unconfigured secret)');
        try {
            await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
        } catch (error) {
            console.log('License setup failed, but continuing...', error);
        }
    });

    setup('activate all dokan modules', { tag: ['@pro'] }, async () => {
        // 'auction' requires woocommerce-simple-auctions. Even though that plugin is activated above,
        // it may fail silently (try-catch). Including 'auction' in the batch causes the entire request
        // to be rejected with 400 when the plugin is absent, leaving all other modules unactivated.
        // Activate the core batch first, then attempt 'auction' separately as a non-fatal step.
        const coreModules = dbData.dokan.modules.filter((m: string) => m !== 'auction');
        const [response] = await apiUtils.activateModules(coreModules, payloads.adminAuth);
        if (!response.ok()) {
            console.log('Core module activation failed, but continuing...');
        }
        try {
            const [auctionResponse] = await apiUtils.activateModules(['auction'], payloads.adminAuth);
            if (!auctionResponse.ok()) {
                console.log('Auction module not available (woocommerce-simple-auctions may be missing), continuing...');
            }
        } catch (error) {
            console.log('Auction module activation skipped:', error);
        }
    });

    setup('set site general settings', { tag: ['@lite'] }, async () => {
        const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings, payloads.adminAuth);
        if (siteSettings) {
            expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings));
        } else {
            console.log('Failed to set site settings, but continuing...');
        }
    });

    setup('get test environment info', { tag: ['@lite'] }, async () => {
        try {
            const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
            if (systemInfo) {
                helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
            }
        } catch (error) {
            console.log('Failed to get system info, but continuing...');
        }
    });
});
