# 🚀 Quick Reference Card

## 📋 NEW 3-Step Workflow

```bash
# 1. Start Docker (auto-creates admin!)
npm run start:env

# 1.5. If you saw Docker warnings, verify admin was created:
npm run check:users  # Should show 'shohan'
# If missing: npm run create:admin

# 2. Run setup
npm run docker:setup

# 3. Run tests
npm run test:e2e
```

---

## 🔑 Login Credentials

### Your Custom Admin (for tests)
- URL: http://localhost:9999/wp-admin
- Username: `shohan` (from .env)
- Password: `01dokan01` (from .env)

### Docker Default Admin (fallback)
- URL: http://localhost:9999/wp-admin
- Username: `admin`
- Password: `password`

---

## 💡 Common Commands

| Command | What It Does |
|---------|-------------|
| `npm run start:env` | Start Docker + create admin |
| `npm run start:env:basic` | Start Docker only (no admin) |
| `npm run stop:env` | Stop Docker |
| `npm run restart:env` | Restart + create admin |
| `npm run reset:db` | Reset database + create admin |
| `npm run reset:env` | Full reset + create admin |
| `npm run docker:setup` | Run complete setup |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:api` | Run API tests |

---

## 🔍 Verification Commands

```bash
# Check users exist (should show both admin and shohan)
npm run check:users

# Check plugins active
npm run check:plugins

# Check pages not trashed
npm run check:pages

# Check Dokan modules active
npm run check:modules

# View Docker logs
npm run docker:logs
```

---

## 🆘 Troubleshooting

### Docker warning about Dokan Pro
**Warning:** `✖ Error while running docker compose command`

**Solution:** Not critical! Check if admin was created:
```bash
npm run check:users  # Should show 'shohan'
```

If missing:
```bash
npm run create:admin
```

Then continue:
```bash
npm run docker:setup
```

### Tests fail with "user not found"
```bash
npm run create:admin  # Manually create admin
```

### "My-account page not found"
```bash
npm run wp-env run tests-cli -- wp wc tool run install_pages
```

### Docker won't start
```bash
npm run reset:env  # Full reset
```

### Need fresh start
```bash
npm run reset:env && npm run docker:setup
```

---

## 📍 Access Points

- **WordPress Site:** http://localhost:9999
- **WP Admin:** http://localhost:9999/wp-admin
- **Dokan Dashboard:** http://localhost:9999/dashboard
- **My Account:** http://localhost:9999/my-account
- **Vendor Stores:** http://localhost:9999/store/vendor1

---

## 🎯 What Changed from OLD Approach

**Before:** Had to run `npm run create:admin` separately
**Now:** Automatic when you run `npm run start:env`

**Benefit:** One less command to remember! 🎉
