# Dokan Lite - CLAUDE.md

## Project Overview

Dokan Lite is a multi-vendor e-commerce marketplace plugin for WordPress, powered by WooCommerce. Version 4.2.8. Requires PHP 7.4+ and WooCommerce 8.5.0+.

## Available Skills

The `.claude/skills/` directory contains procedural HOW-TO instructions:

- **`dokan-backend-dev`** — Backend PHP conventions: namespaces, DI container, hooks, REST controllers. **Invoke before writing any PHP code or tests.**
- **`dokan-dev-cycle`** — Testing and linting workflows (PHPUnit, PHPCS, ESLint, Playwright)
- **`dokan-frontend-dev`** — Frontend conventions: React/TypeScript components, Vue legacy, Tailwind, Webpack, state management
- **`dokan-code-review`** — Code review standards: critical violations to flag, PR checklist verification, severity levels
- **`dokan-git`** — Git and GitHub operations: branching, PR templates, CI checks
- **`dokan-qa-automation`** — Playwright E2E and REST API test conventions under `tests/pw/`: page objects, tags, ApiUtils, schemas, CI compatibility
- **`dokan-run-test-suite`** — Run the Playwright suite (local or CI). **Invoke when the team asks to "run the suite", trigger CI, or debug a failed run.**

## Build & Development Commands

```bash
# Frontend
npm run start              # Dev build with watch
npm run start:hot          # Dev with hot module replacement (port 8887)
npm run build              # Production build
npm run lint:js            # ESLint
npm run lint:css           # Stylelint
npm run format             # Code formatting
npm run makepot            # Generate translation .pot file
npm run release            # Full release build

# PHP
composer phpcs             # PHP CodeSniffer
composer phpcbf            # Auto-fix PHP code style

# Testing
npm run phpunit            # Run PHPUnit tests (via wp-env)
npm run phpunit:coverage   # PHPUnit with coverage
npm run test:phpunit       # Start env, run tests, stop env

# Environment
npm run env:start          # Start wp-env
npm run env:stop           # Stop wp-env
```

## Architecture

### Entry Points
- `dokan.php` - Main plugin file, loads autoloader, creates DI container
- `dokan-class.php` - `WeDevs_Dokan` singleton, plugin bootstrap

### Initialization Flow
1. `dokan.php` loads Composer autoloader
2. Creates `Container` (DI) instance
3. Registers `ServiceProvider`
4. Calls `WeDevs_Dokan::init()`
5. Service providers boot and register 52+ services

### Directory Structure

```
dokan-lite/
├── src/                    # React/TypeScript/Vue source (524 files)
│   ├── admin/              # WP admin panel (React)
│   ├── components/         # Shared React components
│   ├── dashboard/          # Vendor dashboard
│   ├── frontend/           # Frontend React components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Redux data stores
│   ├── utilities/          # Shared utilities
│   ├── vendor-dashboard/   # Advanced vendor dashboard
│   ├── intelligence/       # AI features
│   └── styles/             # Global styles
├── includes/               # PHP backend (460 files)
│   ├── Admin/              # Admin functionality
│   ├── Commission/         # Commission calculation
│   ├── Order/              # Order management
│   ├── Product/            # Product management
│   ├── Vendor/             # Vendor management
│   ├── Withdraw/           # Withdrawal system
│   ├── Emails/             # Email templates
│   ├── REST/               # REST API controllers (38 controllers)
│   ├── DependencyManagement/ # DI container & service providers
│   ├── Analytics/          # Vendor analytics
│   └── functions.php       # Core utility functions (3,290 lines)
├── templates/              # Overridable PHP templates (32 dirs)
├── assets/                 # Compiled CSS/JS output
│   ├── css/                # 24 CSS files
│   └── js/                 # 155 JS bundles
├── lib/                    # Mozart-managed third-party packages
├── tests/
│   ├── php/                # PHPUnit tests
│   └── pw/                 # Playwright E2E tests
└── docs/                   # Developer docs
```

### Key PHP Files
- `includes/functions.php` - Global utility functions
- `includes/DependencyManagement/Container.php` - DI container
- `includes/DependencyManagement/ServiceProvider.php` - Service registration
- `includes/REST/Manager.php` - REST API management

### Service Container
Services accessed via `dokan()->service_name` magic getter. Major services:
`product`, `vendor`, `order`, `withdraw`, `commission`, `dashboard`, `email`, `api`, `scripts` (Assets), `shortcodes`, `frontend_manager`, `customizer`, `catalog_mode`, `reverse_withdrawal`, `intelligence`, `analytics`

### Frontend Architecture
- **React** (primary) for admin and modern components
- **Vue 2.7** (legacy) for older vendor dashboard
- **Tailwind CSS 4** for styling with RTL support
- **Webpack 5** with 80+ entry points
- Global JS libraries exposed as `window.dokan.components`, `window.dokan.utilities`, `window.dokan.reactHooks`

### REST API
38 controllers under `includes/REST/` with multiple API versions (v1, v2, v3) for backward compatibility. Covers: orders, products, vendors/stores, withdrawals, commissions, customers, product attributes, admin dashboard stats.

## Secrets in Test Fixtures (GitHub Push Protection)

GitHub Push Protection scans every push and **rejects commits containing strings that match real credential patterns** — even in test code, comments, or docs. A blocked push forces a history rewrite to land. Prevent this at write time.

**Never write credential-shaped literals anywhere in the repo.** This includes fake/sample/placeholder values in PHPUnit tests, Playwright fixtures, factories, docblocks, and Markdown. Provider scanners pattern-match on prefix + entropy, not on context — `sk_live_…`, `pk_live_…`, `rk_live_…`, `AKIA…`, `ghp_…`, `xoxb-…`, `AIza…`, `eyJ…` (JWT), bare 32+ hex/base64 blobs, etc. all trip detection regardless of whether they're "real."

**Use neutral, obviously-fake shapes instead:**
- Generic prefixes: `test_secret_xxx`, `fake_api_key_123`, `EXAMPLE_TOKEN_VALUE`
- Drop the provider prefix entirely: `fake_app_secret_a1b2c3...` not `sk_live_a1b2c3...`
- For Stripe-shaped tests specifically: use Stripe's documented test values (`sk_test_…`) — scanners allowlist these — or invent a non-Stripe prefix.
- For tests that need to verify masking/redaction of a specific format, parametrize the prefix via a constant and pick one that doesn't match any real provider.

**If a push is blocked:** do NOT use the GitHub "allow secret" unblock link for fixture data — rewrite history to remove the literal. The unblock link is only for genuine secrets that were intentionally committed and need rotation tracking.

**Rewrite recipe (filter-branch, works without `git-filter-repo`):**

```bash
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --tree-filter '
  if [ -f path/to/file.php ]; then
    sed -i "" "s/OLD_SECRET_STRING/NEUTRAL_REPLACEMENT/g" path/to/file.php
  fi
' develop..HEAD
```

After rewriting, **the old commits stay alive if anything still references them.** Verify with `git log -S "OLD_SECRET_STRING" --all --source --oneline` — the `--source` column tells you which ref is holding it. Common culprits to clear before GC:

- `refs/original/*` — filter-branch's automatic backup: `git for-each-ref --format='%(refname)' refs/original/ | xargs -n1 git update-ref -d`
- `refs/stash` — any `git stash` made before the rewrite still anchors the pre-rewrite parent commit: `git stash drop` (or `git stash clear`)
- Other local branches/tags pointing at the old SHA — reset or delete them

Then `git reflog expire --expire=now --all && git gc --prune=now`. Re-run the `git log -S … --all` check; it must return empty before force-pushing. Use `git push --force-with-lease` so a concurrent teammate push doesn't get clobbered silently. Teammates with clones must `git fetch && git reset --hard origin/<branch>` since SHAs changed.

## Coding Standards

- **PHP**: WordPress Coding Standards (WPCS) via PHPCS
- **JS/TS**: ESLint with `@wordpress/scripts` config
- **CSS**: Stylelint
- **TypeScript**: Strict mode, ESNext target, React-JSX

## Key Patterns

- **Service-based architecture** with dependency injection container (League Container)
- **WordPress hooks** extensively used for extensibility (actions & filters)
- **Overridable templates** - themes can override templates from `templates/` directory
- **REST API controller pattern** with per-endpoint permission checking
- **Code splitting** via Webpack for performance
- **Mozart** for PHP dependency namespacing (prevents conflicts with other plugins)

## Testing

- **PHPUnit 9.6** with WP-PHPUnit and Brain Monkey for mocking
- Test factories in `tests/php/Factories/`
- Custom assertions in `tests/php/Helpers/`
- **Playwright** for E2E tests in `tests/pw/`
