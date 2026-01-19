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

# 3. Create admin user (run AFTER start:env)
npm run create:admin

# 4. Run complete setup (activates plugins, creates test data)
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
npm run create:admin
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

---

**Need Help?** Check the [README.MD](./README.MD) for detailed documentation.
