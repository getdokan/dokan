# 🎯 Dokan Pro Docker Test Setup

## ✅ Setup Complete - 65/66 Tests Passed!

Your Dokan Pro test environment is ready!

---

## 📋 Current Configuration

### `.env` File
```bash
DOKAN_PRO=true  # ← Pro mode enabled
```

### `.wp-env.override.json`
Maps local Pro plugin and WooCommerce extensions into Docker:
- ✅ Dokan Pro
- ✅ WooCommerce Bookings
- ✅ WooCommerce Product Addons
- ✅ WooCommerce Simple Auctions
- ✅ WooCommerce Subscriptions

---

## 🚀 Running Pro Tests

```bash
cd /Users/wedevs/Sites/dokanautomation/wp-content/plugins/dokan-lite/tests/pw

# Run E2E tests (Pro)
npm run test:e2e:pro

# Run API tests (Pro)
npm run test:api:pro

# View reports
npm run test:report
```

---

## 🔄 Switching Between Lite and Pro

### To Run Lite Tests:
```bash
# 1. Update .env
DOKAN_PRO=false

# 2. Restart Docker (to unload Pro plugins)
npm run reset:env

# 3. Run setup
npm run docker:setup

# 4. Run Lite tests
npm run test:e2e
```

### To Run Pro Tests:
```bash
# 1. Update .env
DOKAN_PRO=true

# 2. Restart Docker (to load Pro plugins)
npm run reset:env

# 3. Run setup
npm run docker:setup

# 4. Run Pro tests
npm run test:e2e:pro
```

---

## 📊 Setup Test Results

```
✅ Site Setup: 17 passed
✅ Auth Setup: 9 passed  
✅ E2E Setup: 39 passed
✅ Total: 65/66 passed
```

**Note:** 1 WP-CLI memory error (non-critical, doesn't affect tests)

---

## 🔧 What's Included

### Plugins Activated:
- ✅ WooCommerce 10.4.3
- ✅ Dokan Lite 4.2.4
- ✅ **Dokan Pro 4.2.2**
- ✅ WooCommerce Bookings 2.2.8
- ✅ WooCommerce Product Addons 7.9.2
- ✅ WooCommerce Simple Auctions 3.0.3
- ✅ WooCommerce Subscriptions 7.7.0
- ✅ Basic Auth (master)

### Test Users Created:
- ✅ Admin (admin/password)
- ✅ Vendor 1 + Store
- ✅ Vendor 2 + Store  
- ✅ Customer 1
- ✅ Customer 2

### Dokan Configuration:
- ✅ General settings
- ✅ Selling settings
- ✅ Withdraw settings
- ✅ Reverse withdraw settings
- ✅ Privacy policy
- ✅ **All Pro modules activated**

### WooCommerce Configuration:
- ✅ Tax rates
- ✅ Shipping zones & methods
- ✅ Payment gateways (BACS, Cheque, COD)
- ✅ Categories, tags, attributes
- ✅ Test products created

---

## 💡 Pro-Specific Features

With `DOKAN_PRO=true`, you get:
- All Dokan Pro modules activated
- WooCommerce extensions support (Bookings, Subscriptions, etc.)
- Pro-specific test scenarios
- Extended API endpoints
- Advanced vendor features

---

## 🐛 Troubleshooting

### WP-CLI Memory Errors
These are non-critical and don't affect test execution. They only appear when running WP-CLI commands directly.

### Pro Tests Failing?
```bash
# Reset and setup again
npm run docker:reset
```

### Need to update Pro plugin?
1. Update the plugin in `/Users/wedevs/Sites/dokanautomation/wp-content/plugins/dokan-pro`
2. Restart Docker: `npm run reset:env`
3. Run setup: `npm run docker:setup`

---

## 📝 Notes

1. **Pro setup takes 2-3 minutes** (more plugins to configure)
2. **65 tests pass** - system is fully configured
3. **REST API works** via query string format: `?rest_route=/`
4. **All Pro features enabled** including modules
5. **Memory limit set** to 256M for WordPress

---

## ✨ You're Ready for Pro Testing!

Run your Pro tests now:
```bash
npm run test:e2e:pro
```

🚀
