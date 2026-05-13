---
name: dokan-code-review
description: Review Dokan code changes and pull requests for coding standards, security, and architectural compliance. Use when reviewing PRs, performing code audits, or checking code quality.
---

# Dokan Code Review

Review code changes against Dokan coding standards and project conventions. Consult the other `dokan-*` skills for detailed standards.

## Critical Violations to Flag

### Backend PHP

**Architecture & Structure:**

-   **Wrong base class for REST controllers** — Must extend the appropriate Dokan base controller (`DokanBaseAdminController`, `DokanBaseVendorController`, or `DokanBaseController`), not `WP_REST_Controller` directly. See `dokan-backend-dev` skill.
-   **Missing `prepare_item_for_response()`** — Every REST controller must transform data through this method, not return raw arrays.
-   **Missing pagination headers** — Collection endpoints must call `format_collection_response()` to set `X-WP-Total` and `X-WP-TotalPages`.
-   **Missing `prepare_links()`** — REST responses must include `self` and `collection` HATEOAS links.
-   **Missing extensibility filters** — REST responses must apply `dokan_rest_prepare_{resource}_object` filter. Query args must be filterable.
-   **Direct instantiation instead of DI** — Use `dokan()->service_name` or container, not `new ClassName()` for registered services.
-   **Hooks outside `Hookable` pattern** — New hook registrations should go in a dedicated `Hooks` class implementing `Hookable` interface, registered in `CommonServiceProvider`.
-   **Service not registered** — New services must be added to the appropriate `ServiceProvider` in `includes/DependencyManagement/Providers/`.

**Naming & Conventions:**

-   **camelCase methods** — Must use `snake_case` for methods, variables, and hooks (WordPress convention).
-   **Wrong namespace** — Must follow `WeDevs\Dokan\{Domain}\{Class}` pattern with matching file path.
-   **Wrong text domain** — Must use `dokan-lite` for all translatable strings.
-   **Missing `dokan` prefix on hooks** — All `apply_filters()` and `do_action()` hook names must start with `dokan_` (e.g., `dokan_order_created`, `dokan_vendor_updated`). Never use unprefixed or generic hook names to avoid conflicts with other plugins.

**Security:**

-   **Missing permission callbacks** — Every REST route must have a `permission_callback` (never omit it).
-   **Loose comparisons** — Must use strict comparisons (`===`, `!==`). `in_array()` must pass `true` as third argument.
-   **Unsanitized input** — All `$request` params must be sanitized (`sanitize_text_field()`, `absint()`, `wc_clean()`, etc.).
-   **Unescaped output** — All output must be escaped (`esc_html()`, `esc_attr()`, `wp_kses_post()`, etc.).
-   **Direct SQL without `$wpdb->prepare()`** — All dynamic SQL values must use prepared statements.

**Documentation:**

-   **Missing `@since` tag** — Required for new public/protected methods and hooks.
-   **Missing PHPDoc** — Required for all class methods, hooks, and filters.

### Frontend (React/TypeScript)

-   **Class components** — Must use functional components only.
-   **Direct UI library usage** — Should wrap `@getdokan/dokan-ui` components through `src/components/` wrappers.
-   **Missing TypeScript types** — Strict mode is enabled; no `any` types without justification.
-   **Inline styles instead of Tailwind** — Use Tailwind classes with `twMerge()` for conditional composition.
-   **Direct state mutation** — Use `@wordpress/data` store actions, not direct state changes.
-   **Missing hook exports** — New hooks in `src/hooks/` must be exported from `src/hooks/index.tsx`.
-   **Missing `dokan` prefix on JS hooks** — All `@wordpress/hooks` hook names (`addFilter`, `applyFilters`, `addAction`, `doAction`) must start with `dokan_` (e.g., `dokan_order_list_columns`, `dokan_dashboard_init`). Never use unprefixed or generic hook names to avoid conflicts with other plugins.

### Testing

-   **Not extending `DokanTestCase`** — PHP tests must extend `DokanTestCase`, not `WP_UnitTestCase` directly.
-   **Missing test group** — Tests should have `@group` annotations.
-   **Manual user/order creation** — Use test factories (`$this->factory()->seller->create()`, `$this->factory()->order->create()`).
-   **Direct REST calls in tests** — Use helper methods (`$this->get_request()`, `$this->post_request()`).
-   **Missing E2E tags** — Playwright tests must have tags (`@lite`, `@pro`, `@admin`).

## PR Checklist Verification

Verify against the PR template (`.github/pull_request_template.md`):

1.  **Code follows WordPress coding standards** — Run `composer phpcs` on changed files
2.  **PHPCS tests pass** — No coding standard violations
3.  **Inline documentation present** — PHPDoc for new methods/hooks
4.  **Proper labels assigned** — Bug fix, feature, enhancement, etc.
5.  **Changelog entry** — Before/after description included
6.  **Screenshots** — Required for visual changes
7.  **Test instructions** — Steps to reproduce/verify the change

## PR Labels

Apply the correct labels during review. Labels drive workflow state and help the team triage.

### Review State Labels

| Label | When to Apply |
|---|---|
| `Review Needed` | PR is ready for developer review |
| `Needs: Dev Review` | Requires a developer review and approval |
| `Need Dev Review Only` | Only needs dev review (no QA) |
| `Needs: Author Reply` | Reviewer has requested changes or asked questions — waiting on the author |
| `Needs: Code Enhancement` | Code works but needs quality improvements before merge |
| `Needs: Testing` | Requires further testing |
| `Needs: Discussion` | Decisions are needed before the task can proceed |
| `QA In Progress` | QA team is actively testing |
| `QA Approved` | QA team has approved the PR |
| `Dev Review Done` | Applied when PR is approved by the reviewer |
| `Ready to Merge` | PR is approved and ready to merge |
| `DO NOT MERGE` | PR must not be merged (blocking issue) |

### Type Labels

| Label | When to Apply |
|---|---|
| `Type: Bug` | Bug fix |
| `Type: Enhancement` | Improvement to existing feature |
| `Type: New Feature` | Entirely new functionality |
| `Type: Client Issue` | Reported by a client |
| `Feature Request` | Requested by customer |

### Priority Labels

| Label | When to Apply |
|---|---|
| `[Priority] High` | High priority — needs immediate attention |
| `urgent` | Urgent — critical fix needed |
| `Major` | Major change with significant impact |
| `Minor` | Minor change with limited impact |

### Scope Labels (apply all that match)

Focus areas: `focus: order`, `focus: product management`, `focus: vendor management`, `focus: payments`, `focus: shipping`, `focus: customer management`, `focus: reporting`, `focus: security`, `focus: ux`, `focus: integration`, `focus: localization`, `focus: customization`, `focus: promotions`, `focus: subscription`

Module areas: `[Orders]`, `[Products]`, `[Store]`, `[Vendor Dashboard]`, `[Withdraw]`, `[Social]`, `[Geolocation]`, `[Suggestions]`

### Other Labels

| Label | When to Apply |
|---|---|
| `Dependency With Pro` | Changes that require corresponding Dokan Pro changes |
| `REST API` | Changes to REST API endpoints |
| `Has Pull Request` | Issue that has a linked PR |
| `In Progress` | Issue is being worked on |
| `Needs Changelog` | PR needs a changelog entry |
| `Changelog Updated` | Changelog has been added |
| `Merge Conflict` | PR has merge conflicts to resolve |
| `Need R&D` | Requires research before implementation |
| `Mockup In Progress` | UI mockup is being prepared |

### Label Transitions During Review

Typical flow:

```text
Review Needed → (reviewing) → Needs: Author Reply → (author updates) → Review Needed
Review Needed → (approved) → Dev Review Done → QA In Progress → QA Approved → Ready to Merge
```

When requesting changes:

1.  Remove `Review Needed`
2.  Add `Needs: Author Reply`
3.  Leave clear comments explaining what needs to change

When author addresses feedback:

1.  Remove `Needs: Author Reply`
2.  Add `Review Needed`

When approving:

1.  Remove `Review Needed`
2.  Add `Dev Review Done`
3.  Approve the PR via GitHub review

## Review Approach

1.  **Scan for critical violations** listed above
2.  **Check the PR checklist** items are satisfied
3.  **Verify REST patterns** — schema, pagination, links, filters, error handling
4.  **Check security** — permissions, sanitization, escaping, SQL safety
5.  **Review extensibility** — are appropriate filters/actions in place for pro plugin extension?
6.  **Assess test coverage** — are new features/fixes covered by tests?

## Output Format

For each violation found:

```text
[severity]: [Specific problem]
Location: [File path and line number]
Standard: [Reference to relevant dokan-* skill section]
Fix: [Brief explanation or correct example]
```

Severity levels:

-   **CRITICAL** — Security issues, data loss risk, broken functionality
-   **ERROR** — Standards violation, missing required patterns
-   **WARNING** — Suboptimal approach, missing best practice
-   **SUGGESTION** — Improvement opportunity, not a violation

## Reviewer Principles

From the PR template:

> **Correct** — Does the change do what it's supposed to? Code 100% fulfilling the requirements?
> **Secure** — Would a nefarious party find some way to exploit this change? Everything sanitized/escaped appropriately?
> **Readable** — Will your future self be able to understand this change months down the road?
> **Elegant** — Does the change fit aesthetically within the overall style and architecture?
