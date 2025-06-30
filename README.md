# Dokan Multivendor Marketplace

![dokan](https://dokan.co/app/uploads/2024/02/dokan-new-color-logo.svg)

Welcome to the **Dokan Multivendor Marketplace** repository on **GitHub**. Here you can find the **source code**, **open issues**, and **contribute** to the development of the **Dokan plugin**. **Dokan** is the ultimate frontend **multivendor marketplace** plugin for **WordPress**, powered by **WooCommerce**, helping you build your own **multivendor marketplace** similar to **Amazon**, **Shopify**, **eBay**, and **Magento**.

We recommend all **developers** to follow the [**Dokan blog**](https://dokan.co/blog/) to stay up to date about everything happening in the **project**. You can also follow [**@DokanTweets**](https://x.com/DokanTweets) on **X** for the latest development updates.

## 🚀 Getting Started

To get up and running with **Dokan development**, you will need to make sure that you have **installed** all of the prerequisites.

### 📋 Prerequisites

* **[Node.js](https://nodejs.org/en/download) (>= 20.x)**: We recommend using [**NVM**](https://github.com/nvm-sh/nvm#installing-and-updating) (Node Version Manager) to ensure you're using the correct version of **Node**.
* **[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)**: Used to manage project **dependencies** and run various **scripts** involved in building and testing the **project**.
* **[PHP 7.4](https://www.php.net/manual/en/install.php)+**: Dokan currently features a minimum **PHP** version of **7.4**. It is also needed to run **Composer** and various project build **scripts**.
* **[Composer](https://getcomposer.org/doc/00-intro.md)**: We use **Composer** to manage all of the dependencies for **PHP packages** and **plugins**.
* **[WordPress](https://wordpress.org/download/)**: A working **WordPress** installation with **WooCommerce** activated.
* **[WooCommerce](https://woocommerce.com/download/)**: **Dokan** is built on top of **WooCommerce** and requires it to function.

Once you've installed all of the prerequisites, the following will prepare all of the build outputs necessary for development:

```bash
# Navigate to the Dokan plugin directory
cd wp-content/plugins/dokan-lite

# Install the PHP dependencies
composer install && composer du -o

# Install the npm dependencies
npm install

# OR build for production
npm run build

# Build the assets in development mode with watch
npm run start
```

## 📁 Repository Architecture

Dokan follows a **structured organization** to make **development** and **contribution** easier:

```
dokan-lite/
├── 📂 assets/             # Contains all the frontend and admin assets.
│   ├── css/               # CSS stylesheets.
│   ├── js/                # JavaScript files.
│   ├── images/            # Image assets.
│   ├── src/               # Source files for the style, script and other frontend codes.
│   └── ...                # Rest of the files.
├── 📂 includes/           # Core PHP files that power the plugin functionality.
│   ├── Admin/             # Admin-specific code.
│   ├── functions.php      # Global functions.
│   └── ...                # Rest of the core functionality files.
├── 📂 templates/          # Frontend template files.
│   ├── dashboard/         # Vendor dashboard templates.
│   ├── global/            # Vendor global templates.
│   ├── emails/            # Email templates.
│   ├── settings/          # Vendor settings templates.
│   └── ...                # Rest of the templates.
├── 📂 tests/              # Test suites.
│   ├── php/               # PHPUnit tests.
│   └── pw/                # Playwrite tests.
├── 📂 lib/                # Third-party libraries and dependencies.
├── 📂 docs/               # Documentation files.
└── 📂 languages/          # Translation files.
```

## Scripts

### NPM Scripts

Dokan includes several **npm** scripts to help with development:


| Command             | Purpose                                                   |
|---------------------|-----------------------------------------------------------|
| `npm run start`     | Development build with **watch** mode.                    |
| `npm run start:hot` | Development with **hot module** replacement.              |
| `npm run build`     | Production build.                                         |
| `npm run makepot`   | Generates the **POT** file for **translations**.          |
| `npm run format`    | Formats code according to **WordPress** coding standards. |
| `npm run lint:css`  | Lints **CSS** files.                                      |
| `npm run lint:js`   | Lints **JavaScript** files.                               |
| `npm run release`   | Prepares a full release package.                          |

### Composer Scripts

Dokan also provides **Composer** scripts for **PHP** development:

| Command                 | Purpose                                                        |
|-------------------------|----------------------------------------------------------------|
| `composer phpcs`        | Runs **PHP CodeSniffer** to check coding standards.            |
| `composer phpcs:report` | Generates a **PHP CodeSniffer** report file.                   |
| `composer phpcbf`       | Automatically fixes coding standard violations where possible. |
| `composer test`         | Runs **PHPUnit** tests.                                        |
| `composer test-f`       | Runs specific **PHPUnit** tests (requires filter parameter).   |

## 🧪 Testing

Dokan follows **Test Driven Development** (TDD) practices to ensure code **quality** and **reliability**. The repository includes comprehensive documentation and resources for **testing** in the `docs/tdd` directory:

* [**TDD Overview**](docs/tdd/readme.md): Introduction to **TDD** in **Dokan**.
* [**Getting Started with Testing**](docs/tdd/get-started.md): Best practices and organization of test cases.
* [**Test Factories**](docs/tdd/factories.md): Using **factories** to create **test data**.
* [**Mocking**](docs/tdd/mocking.md): Use mocking to test external functionalities.

To run tests, you can use the **Composer** scripts mentioned above or run **PHPUnit** directly:

```bash
# Run all tests
./vendor/bin/phpunit

# Run tests with a specific filter
./vendor/bin/phpunit --filter=test_name
```

## 🛡 Reporting Security Issues

To disclose a **security issue** to our team, please submit a **report** via our [**contact form**](https://dokan.co/contact/).

## 💬 Support

This repository is not suitable for **support**. Please don't use our issue tracker for support requests, but for **core Dokan** issues only. Support can take place through the **appropriate channels**:

* The [**Dokan documentation**](https://dokan.co/wordpress/dokan-documentation/) for help getting started.
* The [**Dokan support portal**](https://dokan.co/contact/) for customers who have purchased **themes** or **extensions**.
* The [**WordPress.org forums**](https://wordpress.org/support/plugin/dokan-lite/) for users of the free **Dokan Lite** plugin.

## 📞 Community

For peer to peer support and **discussions**:

* Join our [**Facebook community**](https://www.facebook.com/groups/dokanmultivendor/)
* Follow us on [**X**](https://x.com/DokanTweets)
* Subscribe to our [**YouTube channel**](https://www.youtube.com/playlist?list=PLJorZsV2RVv_xOhw2_zLE6xQkdfN-KLyG)

## 🤝 Contributing to Dokan

As an **open source project**, we rely on community contributions to continue to improve **Dokan**. To contribute:

1. **Fork** the repository.
2. Create a **feature branch**.
3. Make your changes.
4. Submit a **pull request**.
5. Finally, add the with `Needs: Dev Review` & `Needs: Testing` label for **progress** tracking.

Please follow our [**commit message & contribution guidelines**](CONTRIBUTING.md) when submitting pull requests.
