# 🎯 Docker Commands - Serial Execution Order

This guide shows the **exact serial order** to run Docker commands for Dokan testing.

---

## 📋 Quick Reference Card

```bash
# Copy this entire block and run step-by-step:

# STEP 0: Install (One-time only)
npm install
npx playwright install chromium

# STEP 1: Start Docker (auto-creates admin!)
npm run start:env

# STEP 2: Complete Setup
npm run docker:setup

# STEP 3: Run Tests
npm run test:e2e
```

---

## 🔢 Detailed Serial Steps

### **STEP 0: Installation (One-Time Only)**

**When:** First time only, or after cloning the repo

```bash
# Navigate to test directory
cd /path/to/dokan-lite/tests/pw

# Install dependencies
npm install

# Install Chromium browser
npx playwright install chromium
```

**Verify:**
```bash
ls node_modules/  # Should see @playwright, @wordpress, etc.
```

---

### **STEP 1: Start Docker + Create Admin** 🐳

**When:** Every time you want to start testing (first command of the day)

```bash
npm run start:env
```

**What it does:**
1. ✅ Starts Docker containers
2. ✅ Downloads WordPress
3. ✅ Sets up MySQL database
4. ✅ Creates test site at http://localhost:9999
5. ✅ **Automatically creates your admin from `.env`**

**Expected Output:**
```
WordPress test site started at http://localhost:9999
MySQL for automated testing is listening on port 9998
✔ Done! (in 35s)

🔧 Creating admin user: shohan (shohan@wedevs.com)
✅ Admin user created! ID: 2
📧 Email: shohan@wedevs.com
👤 Username: shohan
🔑 Password: 01dokan01

ℹ️  Docker default admin (admin/password) still exists for fallback
```

**⚠️ You Might See a Warning (Not Critical):**
```
✖ Error while running docker compose command.
Warning: Failed to activate plugin. Dokan Pro requires Dokan Lite
```

**This is okay!** Docker still starts fine. The warning happens because `.wp-env.override.json` tries to load Dokan Pro before Dokan Lite is activated. The `docker:setup` command (next step) will activate plugins in the correct order.

**Verify Everything Started:**
```bash
# Check containers running
docker ps | grep tests
# Should show 3 running containers:
# - tests-wordpress-1
# - tests-cli-1  
# - tests-mysql-1

# Check users created (both default and custom)
npm run check:users
# Should show BOTH:
# - admin (ID: 1) - Docker default
# - shohan (ID: 2) - Your custom admin from .env
```

**If 'shohan' user is missing:**
```bash
npm run create:admin  # Run manually
```

> **💡 Note:** If you need Docker without admin creation, use `npm run start:env:basic`

---

### **STEP 2: Run Complete Setup** ⚙️

**When:** After STEP 1 (run once per Docker session, or after reset)

```bash
npm run docker:setup
```

**What it does:**
1. **Site Setup** - Activates plugins (WooCommerce, Dokan Lite, Dokan Pro)
2. **Auth Setup** - Creates test users (vendors, customers)
3. **E2E Setup** - Creates test data (products, categories, settings)

**This is 3 sub-steps in one command:**
```bash
# Broken down (you can run individually if needed):
npm run docker:site:setup   # Step 3a: Plugins
npm run docker:auth:setup   # Step 3b: Users
npm run docker:env:setup    # Step 3c: Test data
```

**Expected Output:**
```
Running 66 tests using 4 workers
  ✓  65 passed (1.8m)
  -  1 skipped (germanized - optional)
```

**Verify:**
```bash
npm run check:plugins
npm run check:users
npm run check:modules  # Should show: Active modules: 41 (for Pro)
```

---

### **STEP 3: Run Tests** 🧪

**When:** After STEP 3 completes successfully

```bash
# Run E2E tests
npm run test:e2e

# OR run API tests
npm run test:api

# OR run specific test file
npm run test:e2e -- tests/e2e/products.spec.ts
```

**Expected Output:**
```
Running X tests using 4 workers
  ✓  X passed (Xm)
```

**View Report:**
```bash
npm run test:report
```

---

## 🔁 Daily Usage (After Initial Setup)

Once you've completed STEPS 0-4 once, your daily workflow is:

```bash
# Day 1: Full setup
npm run start:env       # STEP 1
npm run create:admin      # STEP 2
npm run docker:setup    # STEP 3
npm run test:e2e        # STEP 4

# Day 2 onwards: If Docker is stopped
npm run start:env       # STEP 1
npm run test:e2e        # STEP 4 (skip 2-3, already set up!)

# OR use the combined command:
npm run docker:start    # Does STEP 1 + 2 automatically
npm run test:e2e        # STEP 4
```

**When Docker is still running:**
```bash
# Just run tests directly
npm run test:e2e
```

---

## 🔄 Reset & Troubleshooting Commands

### **Reset Database Only (Keep containers)**
```bash
npm run reset:db        # Clean DB
npm run create:admin      # Recreate admin
npm run docker:setup    # Re-run setup
```

### **Full Reset (Destroy everything)**
```bash
npm run reset:env       # Destroy & restart Docker
npm run create:admin      # Recreate admin
npm run docker:setup    # Re-run setup
```

### **Quick Reset**
```bash
npm run docker:reset    # Does reset:db + docker:setup
```

### **Fix Missing Pages**
```bash
npm run check:pages     # Check status
npm run restore:pages   # Restore trashed pages
```

---

## ✅ Verification Commands (Run Anytime)

```bash
# Check pages
npm run check:pages

# Check users
npm run check:users

# Check active plugins
npm run check:plugins

# Count active Dokan modules
npm run check:modules

# View Docker logs
npm run docker:logs
npm run docker:logs:cli
```

---

## 🎯 Complete Workflow Examples

### **Example 1: Fresh Start (Monday Morning)**
```bash
cd tests/pw

# Start everything
npm run start:env       # Wait 30s
npm run create:admin      # Wait 5s
npm run docker:setup    # Wait 2min

# Verify
npm run check:users
npm run check:plugins

# Run tests
npm run test:e2e
```

### **Example 2: Quick Daily Run**
```bash
# Docker already running
npm run test:e2e
```

### **Example 3: Something Broke - Full Reset**
```bash
npm run stop:env        # Stop everything
npm run reset:env       # Destroy & restart
npm run create:admin      # Recreate admin
npm run docker:setup    # Re-setup
npm run test:e2e        # Test
```

### **Example 4: Pages Missing**
```bash
npm run check:pages             # See "trash" status
npm run restore:pages           # Restore them
npm run check:pages             # Verify "publish"
npm run test:e2e                # Test
```

---

## 📊 Command Dependencies Flow

```
STEP 0: npm install
         ↓
STEP 1: npm run start:env
         ↓
STEP 2: npm run create:admin
         ↓
STEP 3: npm run docker:setup
         ├─→ docker:site:setup (plugins)
         ├─→ docker:auth:setup (users)
         └─→ docker:env:setup (test data)
         ↓
STEP 4: npm run test:e2e / test:api
         ↓
STEP 5: npm run test:report
```

---

## 🚨 Common Issues & Serial Fixes

### Issue: "wp-env command not found"
**Solution:** Use `npm run start:env` instead

### Issue: "WordPress not installed"
**Solution:** Wait longer after `npm run start:env` (30-60s)

### Issue: "Admin login fails"
**Solution:**
```bash
npm run create:admin  # Re-sync admin
```

### Issue: "My-account page not found"
**Solution:**
```bash
npm run restore:pages
```

### Issue: "No users created"
**Solution:**
```bash
npm run docker:setup  # Re-run setup
```

### Issue: "Modules not activated"
**Solution:**
```bash
npm run check:modules      # Check count
npm run docker:logs        # Check errors
npm run docker:reset       # Reset & re-setup
```

---

## 💡 Pro Tips

1. **Always run commands in this order** - skipping steps causes issues
2. **Wait for each step to complete** before starting the next
3. **Check verification commands** if anything seems wrong
4. **Keep Docker running** between test runs for speed
5. **Use `docker:reset`** for quick clean start
6. **Run `create:admin` after every Docker restart**

---

## 🎓 Understanding Each Step

| Step | Purpose | Skip If... |
|------|---------|------------|
| 0 | Install dependencies | Already installed |
| 1 | Start Docker containers | Containers already running |
| 2 | Create WordPress admin | Already done today |
| 3 | Setup plugins/users/data | Already done this session |
| 4 | Run actual tests | - |

---

## 📞 Quick Help

**Everything working?**
```bash
npm run check:pages && npm run check:users && npm run check:plugins && npm run check:modules
```

**Start from scratch?**
```bash
npm run reset:env && npm run create:admin && npm run docker:setup
```

**Just run tests?**
```bash
npm run test:e2e
```

---

Happy Testing! 🎉
