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
