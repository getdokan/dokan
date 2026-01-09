# 🚀 Quick Start - Docker Test Setup

## ⚡ TL;DR

```bash
cd /Users/wedevs/Sites/dokanautomation/wp-content/plugins/dokan-lite/tests/pw

# 1. Start Docker
npm run start:env

# 2. Run setup
npm run docker:setup

# 3. Run tests
npm run test:e2e

# 4. View reports
npm run test:report
```

## ✅ Final Working Configuration

### `.env` File
```bash
ADMIN=admin
ADMIN_PASSWORD=password
VENDOR=vendor1
VENDOR2=vendor2
CUSTOMER=customer1
CUSTOMER2=customer2
USER_PASSWORD=password
DOKAN_PRO=false
LICENSE_KEY=your_license_key
GMAP=your_google_maps_key
BASE_URL=http://localhost:9999
HEADLESS=false
CI=true
DB_HOST_NAME=localhost
DB_USER_NAME=root
DB_USER_PASSWORD=password
DATABASE=tests-wordpress
DB_PORT=9998
DB_PREFIX=wp
SERVER_URL=http://localhost:9999/?rest_route=
```

### Critical Settings
- `CI=true` - **MUST** be true for Docker!
- `DB_PREFIX=wp` - No trailing underscore!
- `BASE_URL=http://localhost:9999` - Test site (NOT 8888)
- `SERVER_URL=http://localhost:9999/?rest_route=` - Query string format
- `DOKAN_PRO=false` - For Lite tests only

## 🔧 Fixed Files

### `utils/testData.ts`
```typescript
plugins: {
    basicAuth: 'master',  // ✅ Correct (was 'Basic-Auth-master')
    woocommerce: 'woocommerce',
    dokanLite: 'dokan-lite',
    // ...
}
```

### `tests/e2e/_site.setup.ts`
Changed from REST API to WP-CLI for initial activations:
```typescript
// ✅ Use WP-CLI
await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(...));
```

### `package.json`
Added Docker-specific commands:
```json
{
  "docker:setup": "npx playwright test --project=site_setup --project=auth_setup --project=e2e_setup",
  "docker:reset": "npm run reset:db && npm run docker:setup"
}
```

## 🎯 Common Commands

```bash
# Docker Management
npm run start:env          # Start containers
npm run stop:env           # Stop containers  
npm run reset:db           # Clean database
npm run reset:env          # Destroy & recreate

# Setup
npm run docker:setup       # Run all setup
npm run docker:reset       # Reset & setup

# Testing
npm run test:e2e           # Run E2E tests
npm run test:api           # Run API tests
npm run test:e2e:headed    # Run with browser visible
npm run test:report        # View reports
```

## 🐛 Troubleshooting

### Tests failing?
```bash
npm run docker:reset
```

### Docker not responding?
```bash
npm run reset:env
npm run docker:setup
```

### Check setup status
```bash
# Should show: 40 passed
npm run docker:setup
```

## ✨ Success Indicators

```
✅ 10 site_setup tests passed
✅ 9 auth_setup tests passed  
✅ 21 e2e_setup tests passed
✅ Total: 40 passed in ~40-60s
```

## 📝 Notes

1. **First setup takes 5-10 minutes** (Docker downloads)
2. **Subsequent runs: 30-60 seconds**
3. **Setup persists** - only run `docker:setup` once
4. **Reset only when needed** - corrupted data or failed setup

---

**Ready to test!** 🚀
