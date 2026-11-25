# Dokan Lite owns the `wp dokan` namespace; extensions contribute via a filter

Dokan had no WP-CLI commands until Pro needed `wp dokan license` and
`wp dokan module`, which raised the question of who owns the `wp dokan`
namespace. WP-CLI would let each plugin bolt subcommands onto an implicitly
created `dokan` parent, but then the namespace has no owner: no single place
lists its commands, its root help is whatever WP-CLI synthesises, and the free
plugin — the one that defines the marketplace — has no say over a namespace
named after it, nor a home for its own future commands (`wp dokan vendor`,
`wp dokan withdraw`).

We decided that dokan-lite owns the namespace. `WeDevs\Dokan\CLI\Manager` is
the single registrar: it collects a `[ 'dokan <command>' => HandlerClass ]` map
through the `dokan_cli_commands` filter and forwards each entry to
`WP_CLI::add_command()`. Extensions — Pro first — add to the filter and never
call `WP_CLI::add_command()` for `dokan` themselves. Handlers stay in the repo
whose code they drive: the license and module commands live in Pro because they
depend on `dokan_pro()`; the registry lives in Lite because Pro depends on Lite
and never the reverse (ADR-0001).

The registry exists only under WP-CLI. It is a tagged `cli-service`, resolved
from `init_classes()` inside `defined( 'WP_CLI' ) && WP_CLI` — mirroring the
`ajax-service` / `DOING_AJAX` pattern — and its constructor bails without the
constant. Registration runs on `init` at priority 99 so that every plugin has
contributed to the filter first.

Commands carry no Dokan capability gate. WP-CLI runs with no acting user, and
shell access is the boundary — the same stance as `wp plugin activate`. Where a
reused handler enforces a capability of its own (Appsero's
`license_form_submit()` demands Site Admin, `manage_options`), the command
grants that capability through `user_has_cap` for the duration of the call. The
grant lives in the command class, not in the shared class it calls, so nothing
instantiated on a web request ever carries it. This is not an admin gate on
`manage_options` (ADR-0005): the gate is Appsero's, outside the marketplace
model; Dokan merely satisfies it.

## Considered options

- Each extension registers `wp dokan …` directly — rejected: the namespace
  would be defined implicitly by whichever subcommands happen to be registered,
  with no owner and no single place to find them, and the free plugin would own
  nothing.
- A `Hookable` class booted from `CommonServiceProvider` — not chosen: that
  loop runs on every request, and a CLI registry has nothing to do outside
  WP-CLI. The tagged provider keeps it out of the web boot path entirely, as
  `ajax-service` already does for AJAX handlers.
- Impersonating an administrator (`wp_set_current_user()`) to satisfy
  Appsero's check — rejected: it attributes the action to a real account, runs
  every current-user hook as that person, and depends on an administrator
  existing. The scoped grant is process-local and gone when the call returns.

## Consequences

Measured against a live install: on a web request the `WP_CLI` constant is
undefined, `dokan_cli_commands` has no callbacks, and neither handler class is
loaded; under `wp dokan` both command groups are listed. Nothing in this design
is reachable over HTTP — handlers extend `WP_CLI_Command`, which does not exist
on web requests, so they cannot even be autoloaded there.

- **Contribute before `init` 99.** Pro adds its filter callback from
  `init_classes()` at `init` 10. A plugin that contributes later registers
  nothing, silently.
- **Lite ships first.** Pro's `CLI\Manager` returns without registering when
  Lite's registry class is absent rather than claiming the namespace itself, so
  an older Lite paired with a newer Pro simply has no `wp dokan` commands.
- **Shared methods added for CLI reuse are web-reachable.** Public methods on
  classes such as `WeDevs\DokanPro\Update` are instantiated on every request;
  they must keep whatever authorization the underlying handler enforces and
  must never receive the CLI grant. Moving the grant into a shared class would
  turn a web-instantiated object into a privilege escalation.
- **Whatever exposes WP-CLI over HTTP inherits this power** — hosting web
  terminals, "run WP-CLI from wp-admin" plugins. That is the same power as
  `wp plugin activate` and is outside Dokan's model.
- Handlers run `@when after_wp_load`, so they may assume WordPress, Dokan and
  Pro are fully loaded.
