# E2E Testing Guide

## Prerequisites

### Clone Repositories
Clone both Dokan Lite and Dokan Pro repositories.

### Environment Configuration

Create a `.env` file in the `tests/pw` directory with the following variables:

```env
# User Credentials
ADMIN=
ADMIN_PASSWORD=
VENDOR=
VENDOR2=
CUSTOMER=
CUSTOMER2=
USER_PASSWORD=

# API Keys
GMAP=
LICENSE_KEY=

# Playwright Configuration
#SITE_PATH=
BASE_URL=
HEADLESS=true
LOCAL=true
DOKAN_PRO=true
NO_SETUP=true

# Database Configuration
DB_HOST_NAME=
DB_USER_NAME=
DB_USER_PASSWORD=
DATABASE=
DB_PORT=
DB_PREFIX=
```

## How to Run E2E Tests on Local Environment

### WordPress & Plugin Setup

1. **Install and Activate WooCommerce**

2. **Install Dokan Lite and Dokan Pro**

3. **Configure WordPress Permalinks**
   - Set **Permalink structure** = `Post Name`
   - Set **Product permalinks** = `Custom base`

4. **Activate Dokan Pro License**
   - Enter your Dokan Pro License key and activate it

5. **Enable Dokan Modules**
   - Go to **Admin → Dokan → Modules**
   - Enable all modules **except Paystack**

6. **Install Required Plugins**
   - JSON Basic Authentication
   - WooCommerce Bookings
   - WooCommerce Product Add-Ons
   - WooCommerce Simple Auction
   - WooCommerce Subscriptions

### Test Environment Setup

1. Navigate to the test directory:
   ```bash
   cd dokan-lite/tests/pw
   ```

2. Install dependencies:
   ```bash
   npm install --include=dev
   npm install --omit=dev
   ```

3. Install Playwright and browsers:
   ```bash
   playwright install chromium
   playwright install --with-deps chromium
   playwright install-deps chromium
   playwright install
   playwright install --with-deps
   playwright install-deps
   ```

### Running Tests

#### Authentication Setup
```bash
NO_SETUP=true npx playwright test --project=auth_setup
```

#### Environment Setup
```bash
NO_SETUP=true npx playwright test --project=e2e_setup
```

#### Run Individual Test Spec
```bash
npx playwright test newCoupons.spec.ts
```

#### Debug Mode
```bash
npx playwright test newCoupons.spec.ts --debug
```

#### UI Mode
```bash
npx playwright test newCoupons.spec.ts --ui
```

#### Headless Mode
Set the value of `HEADLESS=true` in your `.env` file

#### Run Specific Test by Name
```bash
npx playwright test --grep "Admin Can Add Marketplace Coupon"
```

