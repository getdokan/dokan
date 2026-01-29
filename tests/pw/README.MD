# Dokan E2E & API Test Automation

[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

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

- **E2E Tests**: Full user journey testing with browser automation
- **API Tests**: REST API endpoint validation and integration testing
- **Multi-environment Support**: Docker, local WordPress, and CI/CD environments
- **Parallel Execution**: Fast test execution with configurable parallelization
- **Rich Reporting**: HTML reports, traces, screenshots, and videos

### Key Features

- ✅ 120+ automated test scenarios
- ✅ Page Object Model (POM) architecture
- ✅ Dockerized test environment
- ✅ Database utilities for test data management
- ✅ Custom Playwright matchers
- ✅ Comprehensive test fixtures
- ✅ Support for both Dokan Lite and Pro

---

## Prerequisites

Ensure the following are installed on your system:

- **Node.js** 16+ ([Download](https://nodejs.org/) or use [NVM](https://github.com/nvm-sh/nvm))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Composer** (for plugin dependencies)

---

## Quick Start

### 1. Install Dependencies

```bash
# Navigate to test directory
cd wp-content/plugins/dokan-lite/tests/pw

# Install npm dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### 2. Configure Environment

Create a `.env` file in the test directory:

```bash
# Copy example configuration
cp .env.example .env

# Edit with your settings
nano .env
```

**Required Variables:**

```env
# Admin Credentials
ADMIN=admin_username
ADMIN_PASSWORD=secure_password
ADMIN_EMAIL=admin@example.com

# Dokan Configuration
DOKAN_PRO=true                              # Set false for Lite only
LICENSE_KEY=your_dokan_pro_license          # Required for Pro

# Playwright Configuration
BASE_URL=http://localhost:9999
CI=true                                     # true for Docker
HEADLESS=false

# Database Configuration (Docker defaults)
DB_HOST_NAME=localhost
DB_USER_NAME=root
DB_USER_PASSWORD=password
DATABASE=tests-wordpress
DB_PORT=9998

# REST API Configuration
SERVER_URL=http://localhost:9999/?rest_route=
```

> **⚠️ Security:** Never commit `.env` to version control. It's already in `.gitignore`.

### 3. Start Docker Environment

```bash
# Start Docker containers and create admin
npm run start:env

# Run complete setup (plugins, test data)
npm run docker:setup
```

**Expected Output:** ✅ 65 passed, ⊘ 1 skipped

### 4. Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run all API tests
npm run test:api

# Run specific test file
npx playwright test tests/e2e/products.spec.ts
```

---

## Configuration

### Environment Variables Reference

See `.env.example` for complete configuration template.

**Required for Docker:**
- `ADMIN`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` - Admin credentials
- `DOKAN_PRO` - Enable Pro features (true/false)
- `LICENSE_KEY` - Dokan Pro license (if Pro enabled)
- `BASE_URL` - Test site URL
- `CI=true` - Required for Docker environment

**Database Settings:**
- Use default Docker values unless running locally
- `SERVER_URL` must use query string format: `?rest_route=`

---

## Running Tests

### Test Execution Commands

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

**Built with ❤️ by the Dokan Team**

[Website](https://dokan.co) • [Documentation](https://dokan.co/docs/) • [GitHub](https://github.com/getdokan/dokan)

</div>
