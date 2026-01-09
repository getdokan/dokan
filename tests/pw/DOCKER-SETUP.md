# 🐳 Dokan Test Suite - Docker Setup Guide

Complete guide for running Dokan Lite and Pro tests with Docker.

---

## 📋 Prerequisites

- Docker Desktop running
- Node.js installed
- For Pro: Dokan Pro plugin at `wp-content/plugins/dokan-pro`

---

## ⚡ Quick Start (First Time Setup)

### Step 1: Navigate to Test Directory
```bash
cd /Users/wedevs/Sites/dokanautomation/wp-content/plugins/dokan-lite/tests/pw
```

### Step 2: Configure `.env` File

Create/edit `.env` with your credentials:

```bash
# Admin Credentials
ADMIN=shohan
ADMIN_PASSWORD=01dokan01

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
BASE_URL=http://localhost:9999
HEADLESS=false
CI=true                     # MUST be true for Docker

# Database Configuration (Docker defaults)
DB_HOST_NAME=localhost
DB_USER_NAME=root
DB_USER_PASSWORD=password
DATABASE=tests-wordpress
DB_PORT=9998
DB_PREFIX=wp

# REST API
SERVER_URL=http://localhost:9999/?rest_route=
```

### Step 3: Start Docker
```bash
npm run start:env
```

**Wait for:**
```
WordPress test site started at http://localhost:9999
✔ Done!
```

### Step 4: Sync Admin Credentials
```bash
npm run sync:admin
```

**What this does:**
- Reads `ADMIN` and `ADMIN_PASSWORD` from `.env`
- Creates WordPress admin user to match
- Removes default `admin` user
- Prevents pages from being trashed

### Step 5: Run Setup
```bash
npm run docker:setup
```

**Expected result:**
```
✅ 65 passed (1-2 minutes)
⊘ 1 skipped (germanized - optional)
```

### Step 6: Verify Setup
```bash
# Check plugins active
npm run wp-env run tests-cli -- wp plugin list --status=active

# Check users created
npm run wp-env run tests-cli -- wp user list

# Test login at: http://localhost:9999/wp-login.php
# Username: shohan (from your .env)
# Password: 01dokan01 (from your .env)
```

### Step 7: Run Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run all API tests
npm run test:api

# Run specific test file
npm run test:e2e -- tests/e2e/products.spec.ts

# Run tests with specific tag
npm run test:e2e -- --grep @pro
```

---

## 🔄 Daily Usage

### Start Docker
```bash
npm run start:env
```

### Run Tests
```bash
npm run test:e2e
```

### Stop Docker
```bash
npm run stop:env
```

---

## 🔄 Switching Between Lite and Pro

### For Dokan Lite Testing:
```bash
# 1. Edit .env
DOKAN_PRO=false

# 2. Restart Docker
npm run reset:env

# 3. Sync admin
npm run sync:admin

# 4. Run setup
npm run docker:setup

# 5. Run Lite tests
npm run test:e2e -- --grep @lite
```

### For Dokan Pro Testing:
```bash
# 1. Edit .env
DOKAN_PRO=true

# 2. Restart Docker  
npm run reset:env

# 3. Sync admin
npm run sync:admin

# 4. Run setup
npm run docker:setup

# 5. Run Pro tests
npm run test:e2e -- --grep @pro
```

---

## 📦 What Gets Created

### WordPress Users:
| Username | Role | Password | Email |
|----------|------|----------|-------|
| shohan (from .env) | Admin | 01dokan01 | shohan@example.com |
| vendor1 | Seller | 01dokan01 | vendor1@email.com |
| vendor2 | Seller | 01dokan01 | vendor2@email.com |
| customer1 | Customer | 01dokan01 | customer1@email.com |
| customer2 | Customer | 01dokan01 | customer2@email.com |

### Active Plugins (Pro Mode):
- WooCommerce 10.4.3
- Dokan Lite 4.2.4
- Dokan Pro 4.2.2
- WooCommerce Bookings
- WooCommerce Product Addons
- WooCommerce Simple Auctions
- WooCommerce Subscriptions
- Basic Auth (for REST API)

### Active Dokan Pro Modules (39):
All modules activated including: Auction, Booking, Delivery Time, Elementor, Geolocation, Live Chat, Store Support, RMA, Wholesale, Stripe, PayPal Marketplace, and more.

### Test Data:
- 2 Vendor stores with products
- Tax rates
- Shipping zones & methods
- Payment gateways (BACS, Cheque, COD)
- Categories, tags, attributes
- Sample coupons

---

## 🛠️ Common Commands

### Docker Management:
```bash
# Start Docker
npm run start:env

# Stop Docker
npm run stop:env

# Restart Docker
npm run restart:env

# Reset database (keep containers)
npm run reset:db

# Full reset (destroy everything)
npm run reset:env

# Clean reset + setup
npm run docker:reset
```

### Setup Commands:
```bash
# Sync admin from .env
npm run sync:admin

# Run complete setup
npm run docker:setup

# Restore trashed pages
npm run restore:pages
```

### Testing Commands:
```bash
# Run E2E tests
npm run test:e2e

# Run API tests
npm run test:api

# Run specific test
npm run test:e2e -- tests/e2e/products.spec.ts

# Run with tag
npm run test:e2e -- --grep @pro

# View test report
npm run test:report
```

### WP-CLI Commands:
```bash
# List plugins
npm run wp-env run tests-cli -- wp plugin list

# List users
npm run wp-env run tests-cli -- wp user list

# List pages
npm run wp-env run tests-cli -- wp post list --post_type=page

# Activate plugin
npm run wp-env run tests-cli -- wp plugin activate woocommerce

# Update user password
npm run wp-env run tests-cli -- wp user update shohan --user_pass=newpass
```

---

## 🐛 Troubleshooting

### Issue: `wp-env` command not found
**Solution:**
```bash
# ❌ Wrong: wp-env destroy
# ✅ Correct: npm run reset:env
# ✅ Or: npx wp-env destroy
```

### Issue: WooCommerce not installed
**Symptoms:** REST API returns 404, my-account page not found

**Solution:**
```bash
# Check plugins
npm run wp-env run tests-cli -- wp plugin list

# If WooCommerce missing, restart Docker
npm run reset:env
npm run sync:admin
npm run docker:setup
```

### Issue: My-account page not found
**Solution:**
```bash
npm run restore:pages
```

### Issue: Admin login fails
**Solution:**
```bash
# Update password to match .env
npm run wp-env run tests-cli -- wp user update shohan --user_pass=01dokan01

# Or resync
npm run sync:admin
```

### Issue: Git lock file error
```bash
# Clean and restart
rm -rf ~/.wp-env
npm run start:env
```

### Issue: Port already in use
```bash
# Stop existing wp-env
npm run stop:env

# Kill process on port
lsof -ti:9999 | xargs kill -9

# Restart
npm run start:env
```

### Issue: Docker containers stopped
```bash
# Check Docker running
docker ps | grep tests

# If empty, restart
npm run start:env
```

### Issue: REST API 404/405 errors
**Cause:** Permalinks not working

**Solution:** Already fixed - `.env` has `SERVER_URL=http://localhost:9999/?rest_route=`

### Issue: Tests timeout
**Solution:**
```bash
# Increase timeout in test file or config
# Or run with more workers:
npm run test:e2e -- --workers=2
```

### Issue: Database connection errors
**Verify .env has:**
```bash
DB_HOST_NAME=localhost
DB_PORT=9998
DATABASE=tests-wordpress
DB_USER_NAME=root
DB_USER_PASSWORD=password
DB_PREFIX=wp  # No trailing underscore!
```

---

## 📊 Understanding the Setup Process

### What `npm run docker:setup` Does:

**1. Site Setup (site_setup project):**
- Sets WordPress debug config
- Sets permalinks
- Activates Storefront theme
- Activates Basic Auth
- Activates WooCommerce
- Activates Dokan Lite
- Activates Dokan Pro (if `DOKAN_PRO=true`)
- Activates all Pro modules
- Activates WooCommerce extensions

**2. Auth Setup (auth_setup project):**
- Authenticates admin user
- Enables admin selling status
- Creates vendor1 and vendor2
- Creates customer1 and customer2
- Saves authentication files

**3. E2E Setup (e2e_setup project):**
- Configures WooCommerce settings
- Adds tax rates
- Adds shipping zones & methods
- Adds payment gateways
- Creates categories, tags, attributes
- Configures all Dokan settings
- Creates test products
- Creates test coupons

---

## 💡 Pro Tips

1. **Keep Docker running** between test runs for faster execution
2. **Use `npm run docker:reset`** for a quick fresh start
3. **Check `.env` first** when tests fail - credentials must match WordPress
4. **Use tags** to run specific test groups: `--grep @pro` or `--grep @lite`
5. **View HTML reports** after tests: `npm run test:report`
6. **Check Docker logs** if containers crash: `docker logs tests-cli`

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] Can login at http://localhost:9999/wp-login.php with .env credentials
- [ ] Dokan menu visible in wp-admin
- [ ] Can access http://localhost:9999/wp-admin/admin.php?page=dokan#/modules
- [ ] All modules show as "Active"
- [ ] Vendor stores visible at http://localhost:9999/store/
- [ ] Products created and visible
- [ ] Tests pass: `npm run test:e2e -- tests/e2e/products.spec.ts`

---

## 📁 Important Files

### `.env`
Your credentials and configuration (DO NOT commit to git)

### `.wp-env.json`
Docker environment for Lite (base configuration)

### `.wp-env.override.json`
Docker environment for Pro (overrides with Pro plugins)

Example `.wp-env.override.json`:
```json
{
    "env": {
        "tests": {
            "plugins": [
                "https://github.com/WP-API/Basic-Auth/archive/master.zip",
                "https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip",
                "../../../dokan-pro",
                "../../../woocommerce-bookings",
                "../../../woocommerce-product-addons",
                "../../../woocommerce-simple-auctions",
                "../../../woocommerce-subscriptions"
            ],
            "config": {
                "WP_MEMORY_LIMIT": "512M",
                "WP_MAX_MEMORY_LIMIT": "512M"
            },
            "mappings": {
                "wp-data": "./wp-data",
                "wp-content/debug.log": "./wp-data/debug.log",
                "wp-content/mu-plugins": "./mu-plugins",
                "wp-content/plugins/dokan-lite": "../../",
                "wp-content/plugins/dokan-pro": "../../../dokan-pro"
            }
        }
    }
}
```

### `package.json`
NPM scripts for running tests and managing Docker

---

## 🚨 Complete Fresh Start (Nuclear Option)

If everything is broken:

```bash
cd /Users/wedevs/Sites/dokanautomation/wp-content/plugins/dokan-lite/tests/pw

# 1. Stop Docker
npm run stop:env

# 2. Clean everything
rm -rf ~/.wp-env
pkill -f wp-env

# 3. Start fresh
npm run start:env

# 4. Sync admin
npm run sync:admin

# 5. Run setup
npm run docker:setup

# 6. Verify
npm run wp-env run tests-cli -- wp plugin list
npm run wp-env run tests-cli -- wp user list

# 7. Run tests
npm run test:e2e
```

---

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run start:env` | Start Docker |
| `npm run stop:env` | Stop Docker |
| `npm run reset:env` | Destroy & restart Docker |
| `npm run sync:admin` | Create admin from .env |
| `npm run docker:setup` | Full test environment setup |
| `npm run docker:reset` | Reset DB + run setup |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:api` | Run API tests |
| `npm run restore:pages` | Restore trashed pages |

---

## ✨ You're Ready!

Your Dokan test environment is ready. Run your tests:

```bash
npm run test:e2e
```

Happy Testing! 🚀
