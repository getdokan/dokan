# Fatal prevention layers

## Context

Between July and October 2026 eight PHP fatals shipped to customers in Lite and Pro
(getdokan/plugin-internal-tasks#2452). Reading the eight fix PRs gave a clear picture
of what would and would not have caught them:

| Layer | Would have caught |
|---|---|
| PHPStan level 5 or 6 with WordPress and WooCommerce stubs | 1 of 8 |
| PHPStan level 8 | 4 of 8 |
| PHPStan at any level | never more than 4 of 8 |
| An integration test hitting the code path with the right fixture | 7 of 8 |

Pro already ran PHPStan at level 5 on changed files, non-blocking, with every unknown
Dokan symbol ignored. It flagged nothing on any of the four Pro fatals. The four
shapes no static analysis can see are a dropped query argument, a hook fired with
the wrong argument count, a hook callback type-hinted narrower than what a third
party passes, and arithmetic on a generic string.

Roughly a fifth of customers run PHP 7.4. Several of these fatals are warnings on
7.4 and TypeErrors on 8, so a developer testing on 7.4 never sees them.

## Decision

Five layers, in yield order, with the two that matter most mechanical and blocking:

1. **Integration smoke walkers over a poison world** (`tests/php/src/Smoke/`,
   `tests/php/src/Helpers/PoisonWorld.php`). The poison world seeds the data shapes
   that produced the shipped fatals: a refund, an order whose product was deleted, a
   product without a price, a live download permission and one on a deleted product,
   a stale AI engine and model id, a seller role with no store, a vendor with selling
   disabled, a multi-vendor order with suborders. `RestRouteSmokeTest` walks every
   readable Dokan route as guest, customer, vendor and admin, on an empty install and
   on the poison world, substituting every seeded id plus one that does not exist.
   `DashboardPageSmokeTest` renders every vendor dashboard page the same way.
   Throwables, PHP warnings, 5xx responses and `_doing_it_wrong()` fail the walk;
   notices are printed. Pro extends the walkers with module fixtures.
2. **PHPStan at level 8 as a blocking ratchet** in both repos: full-tree analysis
   with a committed baseline that may only shrink, docblocks not treated as certain
   (so a defensive `instanceof` after a lying `@return` is never reported as
   redundant), `phpVersion` 7.4, the WordPress extension loaded. Pro's CI checks out
   Lite so Dokan symbols resolve.
3. **Write-time guidance**: a `dokan-fatal-safety` skill with one entry per root-cause
   class and its 7.4-syntax safe form, a `fatal-hunter` review agent that pairs
   changed `do_action` sites with their listeners, and a PHPCS sniff that asks for a
   parameter docblock on every `do_action` and `apply_filters`.
4. **Runtime nets only at non-interactive boundaries**: cron, Action Scheduler and
   email triggers are wrapped so a Throwable is logged and reported instead of
   repeating every day in silence. REST and page rendering stay fail-loud; a 500
   reaches a support ticket, a swallowed error does not.
5. **A monthly audit** that regenerates the fatal report and names, for each new
   fatal, the layer that should have caught it and the fixture or rule to add.

Every gate runs on PHP 7.4 and on the newest stable PHP.

## Consequences

- The first walk of the REST routes found a guest-reachable fatal
  (`GET /dokan/v1/orders/{missing}/notes/{missing}`), two endpoints that returned
  500 for an unauthenticated user, two term endpoints that bypassed WooCommerce's
  existence check, an undefined-variable path in store reviews without Pro, and a
  withdraw default that stored an empty date. All were fixed in the same change.
  Expect the walkers to keep finding things; that is their job.
- A PHP-only PR now runs about a thousand REST probes in roughly ten seconds. The
  walk is GET-only; write routes and background handlers are covered by hand-written
  tests until the handler registry lands.
- PHPStan's baseline will hold thousands of entries. That is accepted: the ratchet
  stops new findings, and the baseline is a backlog, not a to-do for this change.
  Only lookups the walkers prove fatal are fixed; the rest stay in the baseline.
- Runtime nets deliberately do not cover REST. A future reader tempted to add a
  catch-all in the REST dispatcher should re-read the second row of the table above.
- Supporting PHP 7.4 means none of the safe patterns may use the nullsafe operator,
  union types, `match` or named arguments.

## Related

- ADR 0005 (PHPUnit requires a webpack build) still applies to the walkers.
- getdokan/plugin-internal-tasks#2452 is the originating report.
