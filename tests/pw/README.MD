# 🎭 Dokan E2E & API Test Automation

**Comprehensive end-to-end and API testing suite for Dokan Lite & Pro using Playwright**

[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📚 Documentation

This README contains everything you need to run the Dokan Playwright test suite in Docker.

---

## ⚡ Quick Start (Docker - Recommended)

### Prerequisites

- [Node.js](https://nodejs.org/) 16+ or [NVM](https://github.com/nvm-sh/nvm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Installation

```bash
# Navigate to test directory
cd wp-content/plugins/dokan-lite/tests/pw

# Install dependencies
npm install

# Install Chromium browser
npx playwright install chromium
```

### 2. Configure Environment

Create `.env` file in `tests/pw/` directory:

```bash
# Admin Configuration
ADMIN=your_admin_username
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=admin@example.com

# Test Users
VENDOR=vendor1
VENDOR2=vendor2
CUSTOMER=customer1
CUSTOMER2=customer2
USER_PASSWORD=test_password

# Dokan Configuration
DOKAN_PRO=true                              # Set to false for Lite only
LICENSE_KEY=your_dokan_pro_license_key      # Required for Pro
GMAP=your_google_maps_api_key               # Optional

# Playwright Configuration
BASE_URL=http://localhost:9999
HEADLESS=false
CI=true                                     # MUST be true for Docker

# Database Configuration (Docker defaults - DO NOT CHANGE)
DB_HOST_NAME=localhost
DB_USER_NAME=root
DB_USER_PASSWORD=password
DATABASE=tests-wordpress
DB_PORT=9998
DB_PREFIX=wp

# REST API (CRITICAL - DO NOT CHANGE)
SERVER_URL=http://localhost:9999/?rest_route=
```

> **⚠️ Security Note:** Never commit your `.env` file to version control. It's already in `.gitignore`.

### 3. Start & Setup

```bash
# Step 1: Start Docker environment
npm run start:env

# You'll see a Docker warning (it's not critical - see DOCKER-WARNING.md)
# Expected: WordPress test site started at http://localhost:9999

# Step 2: Create admin user from .env (REQUIRED!)
npm run create:admin

# Verify admin was created
npm run check:users  # Should show 'admin' and your custom admin

# Step 3: Run complete setup (activates plugins, creates test data)
npm run docker:setup

# Expected output: ✅ 65 passed, ⊘ 1 skipped
```

> **⚠️ Important:** `create:admin` must be run **separately** after `start:env`. The Docker warning prevents automatic chaining.
>
> **💡 Quick All-in-One:** For convenience, use `npm run docker:full` (does all 3 steps)

### 4. Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run all API tests
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
| `npm run create:admin` | Create admin from .env (run after start:env) |
| `npm run stop:env` | Stop Docker containers |
| `npm run restart:env` | Restart Docker |
| `npm run reset:env` | Full reset (destroy & recreate) |
| `npm run reset:db` | Reset database only |
| `npm run docker:full` | All-in-one: start + create admin + setup |

### Test Execution

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run E2E tests (Playwright UI automation) |
| `npm run test:api` | Run API tests (REST API validation) |
| `npm run test:e2e:headed` | Run E2E tests with visible browser |
| `npm run test:e2e:ui` | Run tests in Playwright UI Mode |
| `npm run test:e2e:debug` | Debug tests with Playwright Inspector |

### Verification & Debugging

| Command | Description |
|---------|-------------|
| `npm run check:users` | List WordPress users |
| `npm run check:plugins` | List active plugins |
| `npm run check:pages` | List WordPress pages |
| `npm run check:modules` | Check active Dokan modules |
| `npm run docker:logs` | View Docker container logs |

---

## 🎯 Test Tags & Filtering

### Run Tests by Tag

```bash
# Dokan Lite tests only
npx playwright test --grep '@lite'

# Dokan Pro tests only
npx playwright test --grep '@pro'

# Admin-specific tests
npx playwright test --grep '@admin'

# Vendor-specific tests
npx playwright test --grep '@vendor'

# Multiple tags
npx playwright test --grep '@lite|@pro'

# Exclude specific tags
npx playwright test --grep-invert '@pro'
```

### Run Specific Test Files

```bash
# Single file
npx playwright test tests/e2e/products.spec.ts

# Multiple files
npx playwright test tests/e2e/products.spec.ts tests/e2e/orders.spec.ts

# All files in a directory
npx playwright test tests/e2e/

# By test name
npx playwright test -g "should create product"
```

---

## 🐛 Troubleshooting

### Docker Warning About Dokan Pro

If you see:
```
✖ Error while running docker compose command.
Warning: Failed to activate plugin. Dokan Pro requires Dokan Lite
```

**This is NOT critical!** Docker still starts fine. See [DOCKER-WARNING.md](./DOCKER-WARNING.md) for full explanation.

**Quick fix:**
```bash
npm run check:users      # Verify admin exists
npm run create:admin     # If admin missing
npm run docker:setup     # Activates plugins correctly
```

### Admin User Not Created

**Check:**
```bash
npm run check:users
```

**If your custom admin is missing:**
```bash
npm run create:admin
```

### REST API Errors (404/405)

✅ **Already Fixed** - `.env` uses `SERVER_URL=http://localhost:9999/?rest_route=` (query string format)

If you still see errors, verify:
```bash
# Check .env has correct SERVER_URL
cat .env | grep SERVER_URL

# Should show: SERVER_URL=http://localhost:9999/?rest_route=
```

### Tests Timeout or Fail

```bash
# Clear Docker cache and restart
npm run reset:env
npm run docker:setup

# Or full nuclear option
docker system prune -a
rm -rf ~/.wp-env
npm run start:env
npm run docker:setup
```

### Database Connection Issues

Verify `.env` has correct database settings:
```bash
DB_HOST_NAME=localhost
DB_PORT=9998
DATABASE=tests-wordpress
DB_USER_NAME=root
DB_USER_PASSWORD=password
DB_PREFIX=wp
```

---

## 🏗️ Project Structure

```
tests/pw/
├── tests/
│   ├── e2e/                    # E2E test specs
│   │   ├── _auth.setup.ts      # Authentication setup
│   │   ├── _env.setup.ts       # Environment setup
│   │   ├── _site.setup.ts      # Site configuration setup
│   │   └── *.spec.ts           # Test specifications
│   └── api/                    # API test specs
│       └── *.spec.ts
├── playwright/                 # Test utilities & helpers
├── playwright-report/          # Test reports
├── utils/                      # Utility functions
├── .env                        # Environment variables (create this!)
├── .env.example                # Environment template
├── .wp-env.json                # Docker WordPress config
├── .wp-env.override.json       # Pro plugins override
├── playwright.config.ts        # E2E test configuration
├── api.config.ts               # API test configuration
├── package.json                # Dependencies & scripts
└── *.md                        # Documentation
```

---

## 🔄 Switching Between Lite & Pro

### For Dokan Lite Testing

```bash
# In .env, set:
DOKAN_PRO=false

# Restart Docker
npm run restart:env
npm run docker:setup

# Run Lite tests
npm run test:e2e -- --grep '@lite'
```

### For Dokan Pro Testing

**Prerequisites:**
1. Clone Dokan Pro and WooCommerce extensions
2. Configure `.wp-env.override.json` with correct paths
3. Have valid Dokan Pro license key

```bash
# In .env, set:
DOKAN_PRO=true
LICENSE_KEY=your_valid_license_key

# Restart Docker
npm run restart:env
npm run docker:setup

# Run Pro tests
npm run test:e2e -- --grep '@pro'
```

See [DOCKER-SETUP.md](./DOCKER-SETUP.md#dokan-pro-setup) for detailed Pro setup instructions.

---

## 📊 Test Reports

### View Reports

```bash
# View latest HTML report
npm run test:report

# View trace for debugging
npm run test:trace -- trace.zip

# Generate Allure report (if configured)
npm run allure:generate
npm run allure:open
```

### Report Locations

- **HTML Report:** `playwright-report/index.html`
- **Test Results:** `test-results/`
- **Traces:** `test-results/*/trace.zip`

---

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| WordPress Site | http://localhost:9999 | - |
| WP Admin | http://localhost:9999/wp-admin | Your `.env` `ADMIN` credentials |
| Dokan Dashboard | http://localhost:9999/dashboard | Vendor credentials |
| Vendor Stores | http://localhost:9999/store/vendor1 | - |
| My Account | http://localhost:9999/my-account | Any user from `.env` |

**Default Fallback Admin:**
- Username: `admin`
- Password: `password`

---

## 🔐 Environment Variables

### Required Variables

```bash
# Admin credentials (REQUIRED)
ADMIN=your_username
ADMIN_PASSWORD=your_password
ADMIN_EMAIL=your_email

# Dokan configuration (REQUIRED)
DOKAN_PRO=true|false
LICENSE_KEY=your_license    # Required only if DOKAN_PRO=true

# Playwright (REQUIRED)
BASE_URL=http://localhost:9999
CI=true
```

### Optional Variables

```bash
# API Keys (only if testing related features)
GMAP=google_maps_key
MAPBOX=mapbox_key
TALKJS_APP_ID=talkjs_id
TALKJS_APP_SECRET=talkjs_secret

# Payment Gateway Keys (only if testing payments)
TEST_PUBLISH_KEY_STRIPE=pk_test_...
TEST_SECRET_KEY_STRIPE=sk_test_...
# ... etc

# Test Behavior
HEADLESS=true|false         # Run tests in headless mode
SLOWMO=1000                 # Slow down tests (ms)
NO_SETUP=true|false         # Skip setup tests
```

### Database Variables (Docker)

```bash
# DO NOT CHANGE these for Docker
DB_HOST_NAME=localhost
DB_USER_NAME=root
DB_USER_PASSWORD=password
DATABASE=tests-wordpress
DB_PORT=9998
DB_PREFIX=wp

# CRITICAL: Must use query string format
SERVER_URL=http://localhost:9999/?rest_route=
```

---

## 🏠 Local WordPress Setup (Non-Docker)

If you prefer testing against a local WordPress installation instead of Docker:

### Requirements

- Existing WordPress installation
- Dokan plugin installed and activated
- WooCommerce installed and activated

### Configuration

```bash
# In .env, set:
LOCAL=true
SITE_PATH=/path/to/your/wordpress
BASE_URL=http://your-local-site.test
CI=false

# Database should match your local setup
DB_HOST_NAME=localhost
DB_PORT=3306
DATABASE=your_database_name
DB_USER_NAME=your_db_user
DB_USER_PASSWORD=your_db_password
```

### Run Tests

```bash
# Skip Docker-specific setup
npm run site:setup
npm run auth:setup
npm run env:setup

# Run tests
npm run test:e2e
```

---

## 🤝 Contributing

### Writing Tests

1. **Follow Playwright best practices**
   - Use Page Object Model (POM)
   - Keep tests independent and atomic
   - Use meaningful test names and tags

2. **Use proper tags**
   ```typescript
   test('@lite @admin should create product', async ({ page }) => {
     // Test code
   });
   ```

3. **Add tests to appropriate directory**
   - E2E tests → `tests/e2e/`
   - API tests → `tests/api/`

4. **Use existing utilities**
   - Helpers in `playwright/` directory
   - Page objects for reusable components

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name @lite', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
  });

  test('should do something @admin', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Running Your Tests

```bash
# Run your new test
npx playwright test tests/e2e/your-test.spec.ts

# Debug your test
npx playwright test tests/e2e/your-test.spec.ts --debug

# Run in UI mode
npx playwright test tests/e2e/your-test.spec.ts --ui
```

---

## 📖 Additional Resources

### Documentation

- **[DOCKER-SETUP.md](./DOCKER-SETUP.md)** - Complete Docker setup guide
- **[SERIAL-COMMANDS.md](./SERIAL-COMMANDS.md)** - Detailed step-by-step workflow
- **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - Commands cheat sheet
- **[DOCKER-WARNING.md](./DOCKER-WARNING.md)** - Docker warning explained
- **[CHANGES.md](./CHANGES.md)** - Recent improvements
- **[NEW-ADMIN-APPROACH.md](./NEW-ADMIN-APPROACH.md)** - Admin user management

### External Links

- [Playwright Documentation](https://playwright.dev/)
- [Dokan Documentation](https://dokan.co/docs/)
- [WooCommerce Testing](https://github.com/woocommerce/woocommerce/tree/trunk/plugins/woocommerce/tests)
- [WordPress Docker Environment](https://github.com/WordPress/gutenberg/tree/trunk/packages/env)

---

## 💡 Pro Tips

### Performance Optimization

```bash
# Run tests in parallel (faster)
npm run test:e2e -- --workers=4

# Run only failed tests
npm run test:e2e -- --last-failed

# Run tests from specific line
npx playwright test products.spec.ts:42
```

### Debugging Tips

```bash
# Step through tests
npm run test:e2e:debug

# Record test trace
PWDEBUG=1 npm run test:e2e

# View test in headed mode
npm run test:e2e:headed

# Use Playwright Inspector
npm run test:codegen
```

### Daily Workflow

```bash
# Morning: Start fresh (3 commands)
npm run start:env       # Start Docker
npm run create:admin    # Create admin (REQUIRED!)
npm run docker:setup    # Setup everything

# OR use the all-in-one command:
npm run docker:full     # Does all 3 steps above

# Test your changes
npm run test:e2e -- tests/e2e/your-feature.spec.ts

# Evening: Clean up
npm run stop:env
```

---

## 🚨 Important Notes

### Security

- ⚠️ **Never commit `.env` file** - Contains sensitive credentials
- ⚠️ **Use dummy data** for API keys in CI/CD
- ⚠️ **Rotate credentials** regularly
- ⚠️ **Review `.gitignore`** before committing

### Docker

- 🐳 Docker must be running before `npm run start:env`
- 🐳 Default admin (`admin/password`) always exists as fallback
- 🐳 Containers persist between runs (use `reset:env` to clean)

### Testing

- 🧪 Tests should be independent (no shared state)
- 🧪 Use tags appropriately (`@lite`, `@pro`, `@admin`, `@vendor`)
- 🧪 Clean up test data after tests complete
- 🧪 Expected: **65 passed, 1 skipped** after `docker:setup`

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/getdokan/dokan/issues)
- **Discussions:** [GitHub Discussions](https://github.com/getdokan/dokan/discussions)
- **Documentation:** [Dokan Docs](https://dokan.co/docs/)

---

## 📄 License

This project is licensed under the GPL-2.0+ License - see the [LICENSE](../../LICENSE.txt) file for details.

---

<div align="center">

**Built with ❤️ by the Dokan Team**

[Website](https://dokan.co) • [Documentation](https://dokan.co/docs/) • [GitHub](https://github.com/getdokan/dokan)

</div>
