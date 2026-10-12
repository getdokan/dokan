# PHPUnit requires a webpack build

The PHP unit suite cannot run against a checkout that has not been built. This is not
a property of the tests — no test touches the frontend — but of plugin bootstrap, and
it surprises everyone who meets it, because the failure is a bare PHP fatal during
bootstrap rather than a test failure.

The chain, all of it firing on WordPress's `init` hook, which the WP test bootstrap
runs before a single test executes:

1. `dokan-class.php:266` — `add_action( 'init', [ $this, 'init_classes' ], 4 )`.
2. `init_classes()` resolves the whole `container-service` tag from the DI container,
   which eagerly instantiates every tagged service — including
   `'scripts' => WeDevs\Dokan\Assets`.
3. `Assets::__construct()` (`includes/Assets.php:19`) registers
   `add_action( 'init', [ $this, 'register_all_scripts' ], 10 )`. Registering a
   priority-10 callback while `init` is running at priority 4 still fires it in the
   same cycle.
4. `register_all_scripts()` calls `get_styles()` and `get_scripts()`.
5. `get_scripts()` (`includes/Assets.php:424`) does
   `require DOKAN_DIR . '/assets/js/frontend.asset.php'` — a bare `require`, no
   `file_exists()` guard.

`assets/js/` and `assets/css/` are gitignored build output. With no build, step 5 is a
fatal error and the process dies with zero tests run.

Consequences worth knowing before "optimising" anything here:

- **Do not remove `npm run build` from CI.** `.github/workflows/phpunit.yml` builds
  before starting wp-env for exactly this reason. The cost is mitigated by caching
  `assets/js` + `assets/css` keyed on the sources that determine bundle output, not by
  skipping the build.
- Three other call sites share the same shape and would fatal the same way if reached:
  `includes/Admin/Dashboard/Pages/ProFeatures.php:105`,
  `includes/Admin/Dashboard/Pages/Status.php:64`, and
  `includes/Analytics/Assets.php:94`. Most other `.asset.php` reads in the codebase
  *are* guarded with `file_exists()`.
- `Assets::get_styles()` additionally calls `filemtime()` on generated CSS ~31 times.
  Those emit warnings rather than fatals, and because they fire during bootstrap rather
  than inside a test, `phpunit.xml`'s `convertWarningsToExceptions="true"` does not
  convert them. They are noise, not the cause — the bare `require` is.
- Any new eagerly-constructed service that reads build output at construction or on
  `init` extends this coupling. Guard such reads with `file_exists()`.

The alternative — guarding the four unguarded reads and the `filemtime()` calls so the
suite stops depending on webpack entirely — is the better end state and remains open.
It was not taken with the CI extraction because it touches ~35 production call sites in
asset-registration paths, which is its own change with its own review surface.
