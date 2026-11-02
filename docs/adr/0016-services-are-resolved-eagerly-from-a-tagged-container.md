# Services are resolved eagerly from a tagged, Mozart-prefixed League container at `init` 4

Status: Accepted (retroactive — documents existing code)

## Context

Dokan Lite has many service classes (managers, hook registrars, REST, admin pages, Analytics, Commission calculators). Older code reached them through a hand-built array on the `WeDevs_Dokan` singleton. As the plugin grew it needed a way to register services in groups, to load some groups only in wp-admin, on the front end, during AJAX or under WP-CLI, to let Dokan Pro add or replace services, and to avoid clashing with other plugins that bundle the same container library.

## Decision

**[Lite]** on **[Third-party: League Container]** Dokan uses a League dependency-injection container, bundled under its own namespace by Mozart, organised into tagged service providers, and it constructs whole tag groups eagerly on `init` priority 4.

- **Prefixed library.** `WeDevs\Dokan\DependencyManagement\Container` (`lite:includes/DependencyManagement/Container.php:16`) extends `WeDevs\Dokan\ThirdParty\Packages\League\Container\Container`. Composer maps that namespace to `lib/packages/` (`lite:composer.json:43`) and runs `mozart compose` in its install and update scripts, so Dokan's copy of League cannot collide with another plugin's.
- **One root provider, fourteen children.** `dokan.php` creates the global container and adds the root `ServiceProvider` (`lite:dokan.php:67-70`). `ServiceProvider::boot()` (`lite:includes/DependencyManagement/Providers/ServiceProvider.php:60`) adds fourteen child providers (`:61-74`). Adding a provider instantiates no service.
- **Aliases.** `ServiceProvider::register()` (`lite:includes/DependencyManagement/Providers/ServiceProvider.php:96`) registers the `dokan()->name` aliases (`order`, `vendor`, `commission`, `api`, and so on) as shared definitions tagged `container-service` (`:98`). `WeDevs_Dokan::__get()` (`lite:dokan-class.php:111`) answers `dokan()->name` from the legacy array (filled only through `dokan_get_class_container`) and then from the container.
- **Interface tags.** `BaseServiceProvider::add_with_implements_tags()` and `share_with_implements_tags()` (`lite:includes/DependencyManagement/BaseServiceProvider.php:65`, `:86`) tag every definition with each interface its class implements, and `provides()` (`:33`) answers for those interfaces. This is how `Contracts\Hookable` works as a tag.
- **Eager resolution by context.** `WeDevs_Dokan::init_classes()` (`lite:dokan-class.php:316`, hooked on `init` priority 4 at `:266`) resolves `common-service`, then `admin-service` when `is_admin()` or `frontend-service` otherwise, then `container-service`, then `ajax-service` under `DOING_AJAX` and `cli-service` under `WP_CLI`. Resolving a tag constructs every class in it, and most classes register their WordPress hooks in their constructors.
- **Hookable pass.** Newer services implement `Contracts\Hookable` and register hooks in `register_hooks()` instead of the constructor. `WeDevs_Dokan::init_hooks()` resolves `Hookable::class` and calls `register_hooks()` on each (`lite:dokan-class.php:276-279`), inside `woocommerce_loaded` (fired at `wc:includes/class-woocommerce.php:301`).
- **Shared by default, fresh where state matters.** Most definitions are shared (one instance per request). The Commission calculators are registered non-shared by `CommissionServiceProvider::register()` (`add_with_implements_tags( $service, $service, false )`), so each `dokan_get_container()->get( OrderCommission::class )` returns a fresh object and per-order state cannot leak between calls.

## Consequences

- Hook registration has a single, predictable moment for each request context, and wp-admin-only or front-end-only classes are never constructed in the other context.
- Dokan Pro and other extensions can reach any Lite service by alias or class name and can contribute through the seams around the container (`dokan_get_class_container`, the tag and interface conventions). These seams are consumed by Dokan Pro.
- Eager construction means every class in `container-service` and `common-service` is built on every request that reaches `init`, whether or not the request uses it. Constructor work is therefore paid on every page load.
- Two existing ADRs record downstream effects of this decision: [ADR-0005 (PHPUnit requires a webpack build)](./0005-phpunit-requires-a-webpack-build.md), caused by `Assets` being constructed eagerly at `init` 4, and [ADR-0008](./0008-lite-owns-the-wp-dokan-cli-namespace.md), which uses the `cli-service` tag to keep the CLI registry out of web requests.
- Resolving a service before `init` priority 4 (through `dokan()->name` or the container) constructs that one service early. The constructor of `WeDevs_Dokan` does this deliberately: it resolves `admin_notices` from the container (`lite:dokan-class.php:81`) and `tracker` through `init_appsero_tracker()` (`lite:dokan-class.php:434`).

## Risks

- **Constructor side effects at boot.** Because construction is eager and constructors register hooks or read files, an exception or fatal in any constructor in a resolved tag stops the whole request, including unrelated pages. ADR-0005 (PHPUnit) is one concrete instance.
- **Order of priorities matters.** Services constructed at `init` 4 that add `init` callbacks at priority 10 rely on WordPress still running them in the same pass. Moving `init_classes()` to a later priority would silently skip those callbacks.
- **Tags that are never resolved.** Several providers apply tags (`analytics-service`, `commission-service`, `admin-settings-service` and others) that no code resolves by name; their members are reached through `Hookable` or by class name. A new service added only to such a tag, without implementing `Hookable`, is never constructed.
- **Interface index scope.** `BaseServiceProvider::provides()` keeps a method-level static interface index that is merged on every call and never reset; the bootstrap architecture document lists its PHP-version scoping as a Known gap.

## Recommendations

- New services should implement `Contracts\Hookable` and keep constructors free of hook registration, file reads and queries, so that eager construction stays cheap and safe.
- When adding a service, confirm that the tag it receives is actually resolved, or that it implements `Hookable`.
- Consider lazy resolution (constructing a service on first use) for heavy services that are needed only on specific screens. This changes when hooks are registered and must be reviewed per service.

## Known gaps

- Whether the custom `DependencyManagement\Definition` class (which calls an `init()` method after construction) is wired into the container at this revision is listed as a gap in `docs/adr/reference/bootstrap-and-container.md`.
- The cost of eager construction per request was not measured.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
