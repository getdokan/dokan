# 🐳 Dokan Docker Test Setup Guide

## ✅ Complete Working Configuration

All setup has been completed and tested. Follow these steps to run tests:

---

## 📋 Prerequisites (One-Time)

```bash
cd /Users/wedevs/Sites/dokanautomation/wp-content/plugins/dokan-lite/tests/pw

# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium
```

---

## 🚀 Running Tests

### **Quick Start**

```bash
# Start Docker (if not running)
npm run start:env

# Run setup (first time or after reset)
npm run docker:setup

# Run E2E tests
npm run test:e2e

# View reports
npm run test:report
```

### **Daily Workflow**

```bash
# Just run tests (setup persists)
npm run test:e2e
```

### **Reset Everything**

```bash
# Reset database and rerun setup
npm run docker:reset

# Or destroy and recreate Docker
npm run reset:env && npm run docker:setup
```

---

## 🔧 Critical Configuration Details

### **1. Environment Variables (`.env`)**

```bash
# Admin (Docker default)
ADMIN=admin
ADMIN_PASSWORD=password

# Test Users
VENDOR=vendor1
VENDOR2=vendor2
CUSTOMER=customer1
CUSTOMER2=customer2
USER_PASSWORD=password

# Dokan
DOKAN_PRO=false
LICENSE_KEY=your_license_key
GMAP=your_google_maps_key

# Playwright
BASE_URL=http://localhost:9999
HEADLESS=false
CI=true  # CRITICAL: Must be true for Docker!

# Database (Docker defaults)
DB_HOST_NAME=localhost
DB_USER_NAME=root
DB_USER_PASSWORD=password
DATABASE=tests-wordpress
DB_PORT=9998
DB_PREFIX=wp  # No trailing underscore!

# REST API (auto-set by setup)
SERVER_URL=http://localhost:9999/?rest_route=
```

### **2. Docker Configuration (`.wp-env.json`)**

```json
{
    "env": {
        "tests": {
            "port": 9999,
            "mysqlPort": 9998,
            "core": null,
            "phpVersion": "7.4",
            "plugins": [
                "https://github.com/WP-API/Basic-Auth/archive/master.zip",
                "https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip"
            ],
            "themes": ["https://downloads.wordpress.org/theme/storefront.latest-stable.zip"],
            "config": {
                "WP_DEBUG": "true",
                "SCRIPT_DEBUG": "true",
                "WP_DEBUG_LOG": "true",
                "WP_DEBUG_DISPLAY": "true"
            },
            "mappings": {
                "wp-data": "./wp-data",
                "wp-content/debug.log": "./wp-data/debug.log",
                "wp-content/mu-plugins": "./mu-plugins",
                "wp-content/plugins/dokan-lite": "../../"
            }
        }
    }
}
```

---

## 🔍 Key Issues Fixed

### **1. BASE_URL Configuration**
- ❌ **Wrong**: `http://localhost:8888` (development site)
- ✅ **Correct**: `http://localhost:9999` (test site)

### **2. CI Environment Variable**
- ❌ **Wrong**: `CI=false` (tries to use local SITE_PATH)
- ✅ **Correct**: `CI=true` (uses Docker wp-cli)

### **3. Database Configuration**
- ❌ **Wrong**: `DB_PREFIX=wp_` (creates double underscore: wp__usermeta)
- ✅ **Correct**: `DB_PREFIX=wp` (correct table names: wp_usermeta)
- ✅ **Port**: `9998` (Docker MySQL)
- ✅ **Database**: `tests-wordpress`
- ✅ **Password**: `password`

### **4. Basic Auth Plugin**
- Plugin is installed as `master/basic-auth.php` (from GitHub archive)
- Plugin name in WP-CLI is just `master` (not `Basic-Auth-master`)
- Updated `utils/testData.ts`: `basicAuth: 'master'`
- Changed from REST API activation to WP-CLI activation

### **5. REST API Format**
- Docker's `.htaccess` doesn't work properly
- Using query string format: `?rest_route=/` instead of `/wp-json/`
- Auto-detected and configured by setup script

### **6. Plugin Activation Method**
- ❌ **Old**: Used REST API (circular dependency - needs Basic Auth active)
- ✅ **New**: Use WP-CLI for initial activation, REST API for subsequent operations

---

## 📦 Available Commands

### **Docker Commands**
```bash
npm run start:env          # Start Docker containers
npm run stop:env           # Stop Docker containers
npm run restart:env        # Restart Docker
npm run reset:db           # Clean database and restart
npm run reset:env          # Destroy and recreate Docker
```

### **Setup Commands**
```bash
npm run docker:setup       # Run all setup (site + auth + env)
npm run docker:reset       # Reset DB + run all setup
npm run docker:site:setup  # Only site setup
npm run docker:auth:setup  # Only auth setup
npm run docker:env:setup   # Only env setup
```

### **Test Commands**
```bash
npm run test:e2e           # Run E2E tests (Lite)
npm run test:api           # Run API tests
npm run test:e2e:pro       # Run E2E tests (Pro)
npm run test:e2e:headed    # Run with visible browser
npm run test:e2e:ui        # Run in UI mode
npm run test:e2e:debug     # Run in debug mode
npm run test:report        # View test reports
```

---

## 🎯 Setup Flow

```
1. npm run start:env
   ↓
2. Docker creates:
   - WordPress at http://localhost:9999
   - MySQL at localhost:9998
   - Installs WooCommerce, Storefront, Basic Auth
   - Maps Dokan plugin from local directory
   ↓
3. npm run docker:setup
   ↓
   a) site_setup (via WP-CLI):
      - Sets debug config
      - Sets permalinks
      - Activates Storefront theme
      - Activates Basic Auth plugin
      - Activates WooCommerce
      - Activates Dokan Lite
   ↓
   b) auth_setup (via REST API):
      - Creates admin authentication
      - Creates vendor1 & vendor2 users + stores
      - Creates customer1 & customer2 users
      - Generates authentication state files
   ↓
   c) e2e_setup (via REST API):
      - Configures WooCommerce (tax, shipping, payments)
      - Configures Dokan settings
      - Creates test products, categories, tags
   ↓
4. npm run test:e2e
   ↓
5. Tests run successfully! 🎉
```

---

## 🐛 Troubleshooting

### **Tests failing?**
```bash
npm run docker:reset
```

### **Docker issues?**
```bash
npm run reset:env
npm run docker:setup
```

### **Check Docker status**
```bash
docker ps
# Should see: WordPress and MySQL containers running
```

### **Access WordPress admin**
```
URL: http://localhost:9999/wp-admin
Username: admin
Password: password
```

### **Access Database**
```
Host: localhost
Port: 9998
Username: root
Password: password
Database: tests-wordpress
```

### **View Docker logs**
```bash
npm run wp-env logs
```

---

## ✨ Success Indicators

When setup is successful, you'll see:

```
✅ 10 site_setup tests passed
✅ 9 auth_setup tests passed  
✅ 21 e2e_setup tests passed
✅ Total: 40 passed
```

Then tests can run normally!

---

## 📝 Notes

1. **First time setup takes ~5-10 minutes** (Docker download + WordPress install)
2. **Subsequent runs are much faster** (~30-60 seconds)
3. **Setup persists between test runs** - only need to run `docker:setup` once
4. **Docker must be running** before starting tests
5. **Reset only when needed** - if tests fail or data is corrupted

---

## 🎉 You're Ready!

The setup is now complete and all tests should pass. Happy testing! 🚀
