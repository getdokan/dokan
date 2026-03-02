---
name: dokan-dev-cycle
description: Run tests, linting, and quality checks for Dokan development. Use when running tests, fixing code style, building assets, or following the development workflow.
---

# Dokan Development Cycle

This skill provides guidance for the Dokan Lite development workflow including building, testing, linting, and CI.

## Build Commands

```bash
npm run start              # Dev build with watch
npm run start:hot          # Dev with HMR (port 8887)
npm run build              # Production build
npm run makepot            # Generate translation .pot file
npm run release            # Full release build
```

## PHP Linting (PHPCS)

```bash
composer phpcs             # Check coding standards
composer phpcbf            # Auto-fix coding standard violations
```

PHPCS config is in `phpcs.xml.dist`. It scans `includes/` only (excludes `assets/`, `src/`, `lib/`, `vendor/`, `tests/`).

**CI behavior:** GitHub Actions runs PHPCS only on changed files in PRs (not the entire codebase).

## JavaScript/CSS Linting

```bash
npm run lint:js            # ESLint (via @wordpress/scripts)
npm run lint:css           # Stylelint
npm run format             # Code formatting
```

## PHPUnit Tests

```bash
npm run phpunit            # Run tests (requires wp-env running)
npm run phpunit:coverage   # Run with coverage report
npm run test:phpunit       # Start env → run tests → stop env
```

### Environment

```bash
npm run env:start          # Start wp-env Docker environment
npm run env:stop           # Stop wp-env
```

### Writing PHP Tests

All tests extend `DokanTestCase` (`tests/php/src/DokanTestCase.php`):

```php
namespace WeDevs\Dokan\Test\MyDomain;

use WeDevs\Dokan\Test\DokanTestCase;

class MyServiceTest extends DokanTestCase {
    /**
     * @group dokan-my-domain
     */
    public function test_something() {
        wp_set_current_user( $this->seller_id1 );
        $response = $this->get_request( '/my-resource' );
        $this->assertEquals( 200, $response->get_status() );
    }
}
```

### Available Test Helpers

**Pre-created users** (from `DokanTestCase`):
- `$this->admin_id` — WordPress admin
- `$this->seller_id1`, `$this->seller_id2` — Vendor users
- `$this->customer_id` — Customer user

**REST request helpers:**
- `$this->get_request( $route )` — GET
- `$this->post_request( $route, $body )` — POST
- `$this->put_request( $route, $body )` — PUT
- `$this->delete_request( $route )` — DELETE

**Test Factories** (`tests/php/src/Factories/`):
- `$this->factory()->seller->create()` — Create vendor
- `$this->factory()->order->create()` — Create order
- `$this->factory()->product->create()` — Create product
- `$this->factory()->customer->create()` — Create customer
- `$this->factory()->coupon->create()` — Create coupon
- `$this->factory()->shipping->create()` — Create shipping

**Order helpers:**
- `$this->create_multi_vendor_order()` — Multi-vendor order
- `$this->create_single_vendor_order()` — Single-vendor order

**Custom assertions** (`tests/php/src/CustomAssertion/`):
- `DBAssertionTrait` — Database assertions
- `NestedArrayAssertionTrait` — Nested array comparisons

### Unit tests (no DB/REST)

Set `$is_unit_test = true` to skip REST server and database setup:

```php
class MyUnitTest extends DokanTestCase {
    protected $is_unit_test = true;
    // Uses Brain Monkey for mocking WordPress functions
}
```

## Playwright E2E Tests

Config: `tests/pw/playwright.config.ts`

```bash
# Run from tests/pw/ directory
npx playwright test
npx playwright test --grep @lite          # Only lite tests
npx playwright test --grep @pro           # Only pro tests
```

### Test Tags
- `@lite` — Lite plugin tests
- `@liteOnly` — Lite-only features
- `@pro` — Pro plugin tests
- `@serial` — Must run sequentially

### Page Object Model

70+ page objects in `tests/pw/pages/`. Follow the POM pattern:

```typescript
test('admin can set commission', { tag: ['@lite', '@admin'] }, async () => {
    await admin.navigateToCommissionPage();
    // assertions
});
```

### E2E Utilities (`tests/pw/utils/`)
- `apiUtils.ts` — REST API client
- `dbUtils.ts` — Direct database access
- `testData.ts`, `payloads.ts` — Test fixtures
- `helpers.ts` — Common helpers

## Development Workflow

1. Make code changes
2. Run `composer phpcs` for PHP changes
3. Run `npm run lint:js` for JS/TS changes
4. Run `npm run phpunit` for unit tests
5. Fix any issues (`composer phpcbf`, manual fixes)
6. Commit only after all checks pass

## CI Pipeline (GitHub Actions)

- **`phpcs.yml`** — Runs on PRs: PHPCS on changed files + PHPUnit
- **`e2e_api_tests.yml`** — Playwright E2E/API tests
- **`deploy.yml`** — Release deployment
