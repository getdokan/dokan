# 🎭 Dokan E2E & API Tests (Playwright)

Automated E2E and API tests for Dokan Lite and Dokan Pro using Playwright.

---

## 📚 Documentation

> **🚀 NEW:** Admin creation is now automatic! See [CHANGES.md](./CHANGES.md)
> 
> **📋 Quick Reference:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Commands & credentials cheat sheet

For complete Docker setup instructions, see **[DOCKER-SETUP.md](./DOCKER-SETUP.md)** - our comprehensive guide covering:
- First-time setup
- Docker management
- Running tests
- Troubleshooting
- Switching between Lite and Pro
- Daily usage

---

## ⚡ Quick Start (Docker - Recommended)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- For Pro: Dokan Pro plugin at `wp-content/plugins/dokan-pro`

### 1. Install Dependencies
```bash
cd tests/pw
npm install
npx playwright install chromium
```

### 2. Configure Environment
Create `.env` file (see `.env.example` for all options):

```bash
# Admin Configuration (Creates additional admin, keeps Docker default)
ADMIN=shohan
ADMIN_PASSWORD=01dokan01
ADMIN_EMAIL=shohan@wedevs.com

# Test Users
VENDOR=vendor1
VENDOR2=vendor2
CUSTOMER=customer1
CUSTOMER2=customer2
USER_PASSWORD=01dokan01

# Dokan Configuration
DOKAN_PRO=true              # Set to false for Lite
LICENSE_KEY=your_license_key
GMAP=your_google_maps_key

# Playwright Configuration
BASE_URL=http://localhost:1112
HEADLESS=false
CI=true                     # MUST be true for Docker

# Database Configuration (Docker defaults - DO NOT CHANGE)
DB_HOST_NAME=localhost
DB_USER_NAME=root
DB_USER_PASSWORD=password
DATABASE=tests-wordpress
DB_PORT=2223
DB_PREFIX=wp

# REST API (CRITICAL - DO NOT CHANGE)
SERVER_URL=http://localhost:1112/?rest_route=
```

### 3. Start Docker & Setup
```bash
# Start Docker environment (automatically creates admin!)
npm run start:env

# If you see a Docker warning, verify admin was created:
npm run check:users  # Should show 'shohan'
# If missing, run: npm run create:admin

# Run complete setup (plugins, users, test data)
npm run docker:setup
```

**Expected output:** ✅ 65 passed | ⊘ 1 skipped

> **Note:** You might see a Docker warning about Dokan Pro - this is not critical. Docker still starts fine, and the setup will work correctly.

### 4. Run Tests
```bash
# Run E2E tests
npm run test:e2e

# Run API tests
npm run test:api

# Run specific test file
npm run test:e2e -- tests/e2e/products.spec.ts
```

---

## 🔧 Common Commands

### Docker Management
| Command | Description |
|---------|-------------|
| `npm run start:env` | Start Docker containers |
| `npm run stop:env` | Stop Docker containers |
| `npm run restart:env` | Restart Docker |
| `npm run reset:env` | Destroy & restart (fresh start) |
| `npm run create:admin` | Create/update admin from .env |

### Test Setup
| Command | Description |
|---------|-------------|
| `npm run docker:setup` | Full setup (plugins + users + data) |
| `npm run docker:reset` | Reset database + run setup |
| `npm run restore:pages` | Restore trashed WooCommerce pages |

### Verification & Debugging
| Command | Description |
|---------|-------------|
| `npm run check:pages` | List all pages with status |
| `npm run check:users` | List all WordPress users |
| `npm run check:plugins` | List active plugins |
| `npm run check:modules` | Count active Dokan modules |
| `npm run docker:logs` | View WordPress container logs |
| `npm run docker:logs:cli` | View WP-CLI container logs |

### Running Tests
| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run E2E tests |
| `npm run test:api` | Run API tests |
| `npm run test:e2e:ui` | Run in UI mode |
| `npm run test:e2e:debug` | Run in debug mode |
| `npm run test:report` | View HTML report |

---

## 🐛 Troubleshooting

### Docker Issues
```bash
# If wp-env fails to start
rm -rf ~/.wp-env
npm run start:env

# If containers stopped
npm run start:env
npm run create:admin
```

### REST API Errors (404/405)
✅ **Already Fixed** - `.env` uses `SERVER_URL=http://localhost:9999/?rest_route=` (query string format)

### Admin Login Fails
```bash
# Resync admin credentials from .env
npm run create:admin
```

### Missing Pages (my-account, cart, checkout)
```bash
# Check page status
npm run check:pages

# Restore all trashed pages
npm run restore:pages

# Verify restoration
npm run check:pages | grep publish
```

### Verification Commands
```bash
# Check all pages
npm run check:pages

# Check all users
npm run check:users

# Check active plugins
npm run check:plugins

# Count active Dokan modules (should be ~41 for Pro)
npm run check:modules

# View container logs
npm run docker:logs
npm run docker:logs:cli
```

For detailed troubleshooting, see **[DOCKER-SETUP.md](./DOCKER-SETUP.md)** - Section "🐛 Troubleshooting"

---

## 📁 Project Structure

```
tests/pw/
├── .env                        # Your environment configuration
├── .env.example                # Example configuration
├── .wp-env.json                # Docker config for Lite
├── .wp-env.override.json       # Docker config for Pro (overrides)
├── package.json                # NPM scripts
├── playwright.config.ts        # Playwright main config
├── e2e.config.ts               # E2E test config
├── api.config.ts               # API test config
├── DOCKER-SETUP.md            # 📖 Complete Docker guide
├── README.MD                   # This file
├── tests/
│   ├── e2e/                   # E2E test specs
│   │   ├── _site.setup.ts     # WordPress/plugin setup
│   │   ├── _auth.setup.ts     # User authentication
│   │   └── _env.setup.ts      # Test data setup
│   └── api/                   # API test specs
├── pages/                      # Page Object Models
├── utils/                      # Helper utilities
└── playwright/                 # Test artifacts
```

---

## 🔄 Switching Between Lite and Pro

### For Dokan Lite:
```bash
# 1. Edit .env
DOKAN_PRO=false

# 2. Restart & setup
npm run reset:env
npm run create:admin
npm run docker:setup

# 3. Run Lite tests
npm run test:e2e -- --grep @lite
```

### For Dokan Pro:
```bash
# 1. Edit .env
DOKAN_PRO=true

# 2. Restart & setup
npm run reset:env
npm run create:admin
npm run docker:setup

# 3. Run Pro tests
npm run test:e2e -- --grep @pro
```

---

## 📋 Test Tags

Tests are organized with tags:

| Tag | Description |
|-----|-------------|
| `@lite` | Works with both Lite and Pro |
| `@liteOnly` | Only for Lite |
| `@pro` | Requires Pro |
| `@admin` | Admin-only features |

**Examples:**
```bash
# Run only Lite tests
npx playwright test --grep @lite

# Run Pro tests
npx playwright test --grep @pro

# Exclude Pro tests
npx playwright test --grep-invert @pro
```

---

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| WordPress Site | http://localhost:9999 | - |
| WP Admin | http://localhost:9999/wp-admin | ADMIN / ADMIN_PASSWORD from .env |
| Dokan Dashboard | http://localhost:9999/dashboard | Vendor credentials |
| Vendor Stores | http://localhost:9999/store/vendor1 | - |
| My Account | http://localhost:9999/my-account | Any user from .env |

---

## 🔑 Environment Variables

### Required for Docker:
```bash
ADMIN=your_username              # Custom admin username
ADMIN_PASSWORD=your_password     # Custom admin password
CI=true                          # MUST be true for Docker
BASE_URL=http://localhost:9999   # Docker test site URL
SERVER_URL=http://localhost:9999/?rest_route=  # CRITICAL for REST API
```

### Database (Docker - DO NOT CHANGE):
```bash
DB_HOST_NAME=localhost
DB_USER_NAME=root
DB_USER_PASSWORD=password
DATABASE=tests-wordpress
DB_PORT=2223
DB_PREFIX=wp
```

---

## 📖 Additional Resources

- **[DOCKER-SETUP.md](./DOCKER-SETUP.md)** - Complete Docker guide with troubleshooting
- **[Playwright Documentation](https://playwright.dev/)** - Official Playwright docs
- **[@wordpress/env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/)** - wp-env documentation

---

## 🛠️ Local Site Setup (Non-Docker)

For local WordPress installations (not recommended):

1. Set up local WordPress with Dokan
2. Configure `.env` with your local site details
3. Set `CI=false` and `LOCAL=true`
4. Provide `SITE_PATH` for WP-CLI commands
5. Run: `npm run site:reset`

**Note:** Docker setup is recommended for consistency and isolation.

---

## 🤝 Contributing

### Running Specific Tests
```bash
# Run single test file
npx playwright test tests/e2e/products.spec.ts

# Run tests with specific title
npx playwright test -g "vendor can create product"

# Run in UI mode for debugging
npm run test:e2e:ui
```

### Code Quality
```bash
# Type checking
npm run type

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run prettier
npm run prettier:fix
```

---

## 📊 Test Reports

After running tests:

```bash
# View HTML report
npm run test:report

# View trace for failed tests
npm run test:trace
```

Reports are automatically generated in `playwright-report/` directory.

---

## 💡 Pro Tips

1. **Keep Docker running** between test runs for faster execution
2. **Use `npm run docker:reset`** for a quick fresh start
3. **Check `.env` first** when tests fail - credentials must match WordPress
4. **Use tags** to run specific test groups: `--grep @pro` or `--grep @lite`
5. **View HTML reports** after tests: `npm run test:report`
6. **Check Docker logs** if containers crash: `docker logs tests-cli`
7. **Always run `npm run create:admin`** after starting Docker to ensure credentials match

---

## ✨ What Gets Created

After `npm run docker:setup`, you'll have:

### Users:
- **Admin**: `ADMIN` from .env (e.g., `shohan`)
- **Vendors**: `vendor1`, `vendor2` (sellers)
- **Customers**: `customer1`, `customer2`

### Plugins (Pro mode):
- WooCommerce
- Dokan Lite
- Dokan Pro
- WooCommerce Bookings
- WooCommerce Product Addons
- WooCommerce Simple Auctions
- WooCommerce Subscriptions
- Basic Auth (for REST API)

### Test Data:
- 2 Vendor stores with products
- Tax rates & shipping zones
- Payment gateways (BACS, Cheque, COD)
- Categories, tags, attributes
- Sample coupons
- **41 Dokan Pro modules activated**

---

## 🚀 Ready to Test!

Your Dokan test environment is ready. For detailed information and troubleshooting, see **[DOCKER-SETUP.md](./DOCKER-SETUP.md)**.

Happy Testing! 🎉
