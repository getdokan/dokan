# Dokan E2E & API Test Automation

Comprehensive end-to-end and API testing suite for Dokan Multivendor Marketplace using Playwright and TypeScript.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Organization](#test-organization)
- [Docker Environment](#docker-environment)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This test suite provides comprehensive test coverage for Dokan Lite and Dokan Pro, including:

## Quick Start

# 🚀 Quick Setup Guide

Complete setup instructions for Dokan development and testing environment.

## Prerequisites

- **Node.js** 16+ ([NVM](https://github.com/nvm-sh/nvm) recommended)
- **Docker Desktop** (must be running)
- **Composer** (for PHP dependencies)
- **Git**

---

## Step 1: Install Plugin Dependencies

```bash
# Navigate to plugin root
cd wp-content/plugins/dokan-lite

# Install PHP dependencies
composer install && composer dump-autoload --optimize

# Install JavaScript dependencies
npm install

# Build plugin assets (REQUIRED!)
npm run build
```

> ⚠️ **Important:** The `npm run build` step is **required** - it generates CSS/JS files needed for the plugin to work.

---

## Step 2: Install Test Suite Dependencies

```bash
# Navigate to test directory
cd tests/pw

# Install test dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

---

## Step 3: Configure Environment

Create a `.env` file in `tests/pw/` directory:

```env
# Admin Configuration (REQUIRED)
ADMIN=your_admin_username
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=admin@example.com

# Dokan Configuration
DOKAN_PRO=true
LICENSE_KEY=your_dokan_pro_license_key

# Playwright Configuration (REQUIRED)
BASE_URL=http://localhost:9999
CI=true
HEADLESS=false

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

> ⚠️ **Security:** Never commit your `.env` file - it's already in `.gitignore`.

---

## Development Environment Requirements

On your local development setup (where the test code resides), ensure that **all required plugins are installed and active**:

- Dokan  
- Dokan Pro  
- WooCommerce Bookings  
- WooCommerce Product Add-Ons  
- WooCommerce Simple Auction  
- WooCommerce Subscriptions  

> **Important:**  
> The test server references the local site’s plugin directory. Missing plugins in your development environment may cause tests to fail or behave inconsistently.

---

## Step 4: Start Docker Environment

### Option A: Step by Step

```bash
# 1. Make sure Docker Desktop is running!

# 2. Start WordPress Docker environment
npm run start:env

# 3. Run complete setup (activates plugins, creates test data)
npm run docker:setup
```

### Option B: All-in-One (Recommended)

```bash
# Does all 3 steps above automatically
npm run docker:full
```

---

## Step 5: Verify Setup

```bash
# Check if plugins are activated
npm run check:plugins

# Check if users are created
npm run check:users

# Check active Dokan modules
npm run check:modules
```

**Expected output from `check:plugins`:**
- ✅ dokan-lite (active)
- ✅ dokan-pro (active)
- ✅ woocommerce (active)
- ✅ master/Basic Auth (active)

---

## Quick Command Reference

| Task | Command |
|------|---------|
| **Plugin Setup** | `cd wp-content/plugins/dokan-lite` → `composer install` → `npm install` → `npm run build` |
| **Test Setup** | `cd tests/pw` → `npm install` → `npx playwright install chromium` |
| **Start Docker** | `npm run start:env` |
| **Create Admin** | `npm run create:admin` |
| **Full Setup** | `npm run docker:full` |
| **Run E2E Tests** | `npm run test:e2e` |
| **Run API Tests** | `npm run test:api` |
| **Stop Docker** | `npm run stop:env` |
| **Reset Environment** | `npm run reset:env` |

---

## Troubleshooting

### `start:env` Fails

**Check:**
1. ✅ Docker Desktop is running
2. ✅ Composer dependencies installed (`vendor/` directory exists)
3. ✅ npm dependencies installed (`node_modules/` exists)
4. ✅ Assets are built (`assets/css/style.css` exists)

**Fix:**
```bash
# Rebuild everything
cd wp-content/plugins/dokan-lite
composer install
npm install
npm run build
```

### Plugins Don't Activate

**Check:**
```bash
npm run check:plugins
```

**Fix:**
```bash
# Run setup again
npm run docker:setup
```

### Docker Warning About Dokan Pro

If you see:
```
✖ Error while running docker compose command.
Warning: Failed to activate plugin. Dokan Pro requires Dokan Lite
```

**This is NOT critical!** Docker still starts. Run:
```bash
npm run docker:setup
```

---

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| WordPress Site | http://localhost:9999 | - |
| WP Admin | http://localhost:9999/wp-admin | Your `.env` `ADMIN` credentials |
| Dokan Dashboard | http://localhost:9999/dashboard | Vendor credentials |
| Default Admin | http://localhost:9999/wp-admin | `admin` / `password` (fallback) |

---

## Next Steps

- **Run Tests:** `npm run test:e2e` or `npm run test:api`
- **View Documentation:** See [README.MD](./README.MD) for detailed information
- **Debug Tests:** `npm run test:e2e:debug` or `npm run test:e2e:ui`

---

## Important Notes

1. ⚠️ **Build assets first:** Always run `npm run build` in plugin root before starting Docker
2. ⚠️ **Docker must be running:** Start Docker Desktop before `npm run start:env`
3. ⚠️ **Plugin order matters:** Dokan Lite must activate before Dokan Pro
4. ⚠️ **Create admin separately:** Run `create:admin` after `start:env` (or use `docker:full`)


#### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with visible browser
npm run test:headed

# Run in UI mode
npm run test:ui

# Debug specific test
npm run test:debug

# Run specific test by name
npx playwright test -g "should create product"
```

#### API Tests

```bash
# Run all API tests
npm run test:api

# Run specific API test
npx playwright test tests/api/products.spec.ts
```

### Test Filtering

#### By Tags

```bash
# Dokan Lite tests only
npx playwright test --grep '@lite'

# Dokan Pro tests only
npx playwright test --grep '@pro'

# Admin-specific tests
npx playwright test --grep '@admin'

# Vendor-specific tests
npx playwright test --grep '@vendor'
```

#### Parallel Execution

```bash
# Run with 4 workers
npx playwright test --workers=4

# Run serially
npx playwright test --workers=1

# Run failed tests only
npx playwright test --last-failed
```

---

## Test Organization

### Project Structure

```
tests/pw/
├── tests/
│   ├── e2e/                    # E2E test specifications
│   │   ├── _auth.setup.ts      # Authentication setup
│   │   ├── _env.setup.ts       # Environment setup
│   │   ├── _site.setup.ts      # Site configuration
│   │   └── *.spec.ts           # Test files
│   └── api/                    # API test specifications
├── pages/                      # Page Object Models
├── utils/                      # Utility functions
├── fixtures/                   # Test fixtures
├── playwright-report/          # Test reports
├── test-results/              # Test artifacts
├── playwright.config.ts       # E2E configuration
├── api.config.ts              # API configuration
└── package.json               # Dependencies & scripts
```

### Page Object Model

Tests use the Page Object Model pattern:

```typescript
// Example: Using page objects
test('Admin can create product', async ({ page }) => {
  const admin = new AdminPage(page);
  const products = new ProductsPage(page);
  
  await admin.login();
  await products.createSimpleProduct({
    name: 'Test Product',
    price: '10.00'
  });
  
  await expect(page.locator('.success')).toBeVisible();
});
```

---

## Docker Environment

### Docker Commands

| Command | Description |
|---------|-------------|
| `npm run start:env` | Start Docker containers + create admin |
| `npm run stop:env` | Stop Docker containers |
| `npm run restart:env` | Restart Docker |
| `npm run reset:env` | Destroy and recreate environment |
| `npm run docker:setup` | Complete setup (plugins + data) |
| `npm run docker:full` | All-in-one (start + admin + setup) |

### Verification Commands

| Command | Description |
|---------|-------------|
| `npm run check:users` | List WordPress users |
| `npm run check:plugins` | List active plugins |
| `npm run check:pages` | List WordPress pages |
| `npm run check:modules` | List active Dokan modules |

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| WordPress Site | http://localhost:9999 | - |
| WP Admin | http://localhost:9999/wp-admin | From `.env` |
| Dokan Dashboard | http://localhost:9999/dashboard | Vendor users |

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd wp-content/plugins/dokan-lite/tests/pw
          npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Start Docker environment
        run: |
          cd wp-content/plugins/dokan-lite/tests/pw
          npm run start:env
          npm run docker:setup
      
      - name: Run tests
        run: npm run test:e2e
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Troubleshooting

### Common Issues

#### Docker Fails to Start

**Solutions:**
```bash
# Ensure Docker Desktop is running
docker ps

# Clear Docker cache
docker system prune -a
rm -rf ~/.wp-env

# Restart environment
npm run start:env
```

#### Admin User Not Created

**Check:**
```bash
npm run check:users
```

**Fix:**
```bash
npm run create:admin
```

#### REST API Errors (404/405)

**Verify configuration:**
```bash
cat .env | grep SERVER_URL
# Should be: SERVER_URL=http://localhost:9999/?rest_route=
```

#### Tests Timeout

**Solutions:**
```bash
# Reset environment
npm run reset:env
npm run docker:setup

# Increase timeout in playwright.config.ts
timeout: 60000  // 60 seconds
```

---

## Contributing

### Writing Tests

#### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { ProductsPage } from '@pages/productsPage';

test.describe('Products @lite @vendor', () => {
  test('should create simple product', async ({ page }) => {
    // Arrange
    const products = new ProductsPage(page);
    const productData = {
      name: 'Test Product',
      price: '10.00'
    };
    
    // Act
    await products.createProduct(productData);
    
    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

#### Best Practices

1. **Use appropriate tags**: `@lite`, `@pro`, `@admin`, `@vendor`, `@customer`
2. **Follow Page Object Model**: Keep selectors in page objects
3. **Write independent tests**: No shared state between tests
4. **Use meaningful names**: Describe what the test does
5. **Add proper assertions**: Verify expected outcomes

### Pull Request Guidelines

1. **Branch naming**: `feature/test-name` or `fix/issue-name`
2. **Commit messages**: Clear, descriptive messages
3. **Test coverage**: Add tests for new features
4. **Documentation**: Update README if needed
5. **Linting**: Ensure all linters pass

---

## License

This project is licensed under the GPL-2.0+ License. See the [LICENSE](../../LICENSE.txt) file for details.

---

## Resources

### Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Dokan Documentation](https://dokan.co/docs/)

### Support

- **Issues**: [GitHub Issues](https://github.com/getdokan/dokan/issues)
- **Discussions**: [GitHub Discussions](https://github.com/getdokan/dokan/discussions)
- **Documentation**: [Dokan Docs](https://dokan.co/docs/)

---

<div align="center">

[Website](https://dokan.co) • [Documentation](https://dokan.co/docs/) • [GitHub](https://github.com/getdokan/dokan)

</div>
