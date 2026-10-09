---
name: dokan-wp-env-worktrees
description: Configure and run wp-env across git worktrees with isolated or shared databases, and pair dokan-lite + dokan-pro worktrees for coordinated cross-repo changes — including creating a paired worktree straight from a GitHub PR link (auto-resolving the companion PR). Use when setting up wp-env in a new worktree, creating a worktree from a PR, hitting port conflicts running two environments at once, mounting dokan-pro as a dependency, or reusing a seeded database across checkouts.
---

# wp-env across git worktrees

How Dokan's `wp-env` environment behaves when the plugin is checked out into
multiple git worktrees, and how to make each worktree's database **isolated**
(the default) or **shared** (deliberate).

## How wp-env keys an instance (the one fact that explains everything)

From `@wordpress/env` (`lib/config/load-config.js`):

```js
cacheDirectoryPath = path.resolve( getCacheDirectory(), md5( configFilePath ) )
```

- **Instance identity = `md5( absolute path of .wp-env.json )`**, stored under
  `~/.wp-env/<md5>/` (or `$WP_ENV_HOME/<md5>/`).
- The Docker Compose project name is that directory, so the database volumes are
  named `<md5>_mysql` and `<md5>_mysql-test`.

Because every worktree lives at a **different absolute path**, each one hashes to
a different `<md5>` and therefore gets its **own containers and its own MySQL
volumes automatically**. Isolation is the default — you do not configure it.

```bash
docker volume ls | grep mysql     # one <md5>_mysql pair per worktree/checkout
ls ~/.wp-env                       # one <md5> dir per worktree/checkout
```

`WP_ENV_HOME` only changes the parent folder; the per-path `<md5>` leaf is
unchanged, so it does **not** make worktrees share a database.

## The only real conflict: ports

Two worktrees are isolated on disk but both default to `port: 8888` /
`testsPort: 8889`. Starting a second while the first runs fails with a port
clash. Give each worktree unique ports.

Config precedence (later wins): `.wp-env.json` → `.wp-env.override.json`.
`.wp-env.json` is **committed and shared** — CI (`phpunit.yml`, the e2e pinned
lane) reads it, so never edit it for local needs. Everything per-worktree goes
in `.wp-env.override.json`, which is gitignored.

### New worktree setup

Create `.wp-env.override.json` with ports unique to the worktree:

```jsonc
// .wp-env.override.json  (gitignored, per-worktree)
{
  "port": 8890,
  "testsPort": 8891,
  "mysqlPort": 33306,      // only if you connect to MySQL directly
  "phpmyadminPort": 9091   // only if you enable phpMyAdmin
}
```

Convention that avoids collisions: pick a per-worktree base `B` (8888, 8890,
8892, …) and use `port=B`, `testsPort=B+1`. `mysqlPort` may be left out —
wp-env assigns a random free port when it is `null`.

## Dependencies (dokan-pro, WooCommerce, add-ons)

wp-env has **no dependency concept** — every entry in `plugins[]` is just mounted
and activated. Dokan Pro requires Dokan Lite requires WooCommerce, so all three
must be listed explicitly, ideally in dependency order. Put the list in
`.wp-env.override.json`:

```jsonc
"plugins": [
  "https://downloads.wordpress.org/plugin/woocommerce.zip",
  ".",              // THIS worktree's dokan-lite
  "../dokan-pro"    // sibling dependency
]
```

Two gotchas that bite in worktrees:

1. **Providing a `plugins` array drops the implicit `.`.** wp-env only
   auto-mounts the current directory in *zero-config* mode
   (`shouldInferType: ! hasUserConfig` in `parse-config.js`). The moment a
   `.wp-env.json` exists, you must list `.` yourself. A config that lists
   `../dokan-pro` but forgets `.` activates Pro **without** Lite → broken env.
   The same applies to the override: wp-env's `merge-configs.js` *replaces*
   `plugins` wholesale (only `config`, `mappings`, `lifecycleScripts` and `env`
   are merged), so an override that adds pro must repeat WooCommerce and `.`.

2. **Relative sources resolve against the current working directory, not the
   config file.** `parse-source-string.js` does `path.resolve( sourceString )`,
   so `../dokan-pro` is relative to wherever you run `npm run env:start`
   (the worktree root). This works only when the worktree sits under
   `wp-content/plugins/` next to `dokan-pro`. For a worktree created elsewhere
   (`git worktree add ~/wt/foo`), `../dokan-pro` won't resolve — use an
   **absolute path** in that worktree's `.wp-env.override.json`.

**Sharing a dependency across worktrees:** point every lite worktree at the
**same** dokan-pro checkout (relative if co-located, absolute otherwise). You do
not need a parallel dokan-pro worktree — *unless* a lite branch needs matching
pro changes, in which case point that worktree's `.wp-env.override.json` at a
matching pro worktree by absolute path.

## Coordinated lite + pro changes (paired worktrees)

dokan-lite and dokan-pro are **separate git repos** that are often changed
together (a feature/bug that spans both). dokan-pro has no wp-env of its own —
**lite always drives the environment and mounts pro via `../dokan-pro`**. A
single shared `../dokan-pro` can only be on one branch at a time, so for a
coordinated change you pair worktrees.

**Convention:** use the **same branch name** in both repos, and place the two
worktrees side by side under one per-feature folder so `../dokan-pro` resolves to
the matching pro branch:

```
~/dokan-wt/feat-x/
├── dokan/        ← worktree of lite @ feat-x   (runs wp-env, port 8890)
└── dokan-pro/    ← worktree of pro  @ feat-x   (mounted via ../dokan-pro)
```

New path → new `md5` → own isolated DB automatically; just bump ports.

### From a PR link (recommended — resolves the companion PR automatically)

`worktree-from-pr.sh` takes **either** the lite PR **or** the pro PR, reads its
body for the companion ("Related PR" / "Companion Pro PR" link to the other
repo), and checks out the matching branch in **both** repos as paired worktrees.
Falls back to the same branch name in the other repo if the body has no link.
With no companion at all: a lite PR gets a lite-only env (pro mounted from the
shared main checkout, if one exists); a pro PR gets lite checked out detached at
`origin/develop`.

```bash
.claude/skills/dokan-wp-env-worktrees/worktree-from-pr.sh https://github.com/getdokan/dokan/pull/3141
# accepts:  3141  (bare number ⇒ lite repo)  |  getdokan/dokan-pro#5538  |  full URL
# optional 2nd arg = port, e.g. ... /pull/3141 8892
```

It resolves branch + base per repo via `gh`, fast-forwards each worktree to the
PR head, and writes `.wp-env.override.json` (ports, plugin list incl. pro, theme). Requires an
authenticated `gh` and `jq`. Run it from inside the dokan-lite main checkout.

### From a branch name (when the branch already exists / no PR yet)

```bash
.claude/skills/dokan-wp-env-worktrees/create-paired-worktree.sh feat-x develop 8890
```

Both scripts only *create + configure* the worktrees. They deliberately do **not**
install or build — do that with the bootstrap sequence below.

## Bootstrap a paired worktree (install + build)

> **Name the lite worktree folder `dokan`, not `dokan-lite`** (the helper scripts
> do). wp-env mounts a local plugin at
> `/var/www/html/wp-content/plugins/<folder-basename>`, and Dokan's
> `npm run phpunit` hardcodes `--env-cwd=wp-content/plugins/dokan`, so a
> `dokan-lite/` folder breaks `npm run phpunit`.
> dokan-pro's build is fine either way — `src/utils/dokan-path.js` looks for
> `../dokan-lite` and falls back to `../dokan`.

A fresh worktree has no `node_modules`, `vendor`, or built `assets/` (worktrees
don't share them with the main checkout). Run this order:

```bash
WT=~/dokan-wt/feat-x

# 1. LITE first, fully (composer → npm → build)
cd "$WT/dokan" && composer install && npm ci && npm run build

# 2. THEN pro
cd "$WT/dokan-pro" && composer install && npm ci && npm run build

# 3. Start the env from the LITE worktree
cd "$WT/dokan" && npx wp-env start               # http://localhost:8890
```

Why the order matters:

- **Lite before pro.** dokan-pro's `webpack.config.js` requires lite's
  `webpack-dependency-mapping.js` (from `../dokan-lite` or `../dokan`), which
  `require('lodash')` from **lite's** `node_modules`. Build pro before lite is installed and it dies
  with `[webpack-cli] Cannot find module 'lodash'`.
- `composer install` pulls ~90 packages (Google/Stripe/Mangopay SDKs, Mozart) —
  no auth needed for the public deps. This part works reliably.

### npm ci in a worktree

> ⚠️ **Intermittent — `npm ci` can fail on the `@getdokan/dokan-ui` git dep.**
> lite's `package.json` has `"@getdokan/dokan-ui": "github:getdokan/dokan-ui#dokan-plugin"`
> (cloned over SSH). It has failed with:
> ```
> npm error code 128
> npm error command git ... clone --mirror -q ssh://git@github.com/getdokan/dokan-ui.git .../_cacache/tmp/git-clone…/.git
> npm error fatal: destination path '.../git-clone…/.git' already exists and is not an empty directory.
> ```
> It looks like npm cloning the same git dep twice concurrently into one temp path.
>
> **History:**
> - 2026-07-07 (npm 11.17.0 / node 22.22.0): failed reproducibly in a fresh
>   paired worktree. Not auth/network — a raw `git clone --mirror` of the repo
>   and `ssh -T git@github.com` both succeeded. Did *not* help: clearing
>   `~/.npm/_cacache/tmp/git-clone*`, a fresh `--cache <dir>`, a warmed cache,
>   `npm install` instead of `npm ci`, `npm ci --maxsockets=1`.
> - 2026-10-02 (same npm 11.17.0 / node 22.22.0): a plain `npm ci` in a lite
>   worktree succeeded first try, `@getdokan/dokan-ui` included.
>
> **If it fails:** copy `node_modules` from a checkout where install succeeded
> (e.g. the lite main checkout) into the worktree, then run `npm run build`.
> Untested alternatives: an older npm (`npm i -g npm@10`), or pre-seeding just
> `node_modules/@getdokan/dokan-ui`.

Other notes:
- **Lite-only change:** skip the pro worktree and point at the shared main pro
  checkout (absolute path in the override's `plugins`). The shared pro is on one
  branch at a time, which is fine when you aren't touching it.
- If lite and pro versions are enforced (pro checks a minimum lite version),
  dev branches report dev versions and pass — no special handling needed.

## Open the site from a phone (LAN access)

wp-env publishes the dev port on all interfaces, so the site is reachable at
`http://<mac-lan-ip>:<port>` — but WordPress redirects to its configured URL
(`http://localhost:<port>` by default), which breaks on a phone. Point the
**development** environment at the LAN IP in `.wp-env.override.json`:

```jsonc
{
  "port": 8890,
  "testsPort": 8891,
  "env": {
    "development": {
      "config": {
        "WP_HOME": "http://192.168.x.y",     // no port — wp-env appends it
        "WP_SITEURL": "http://192.168.x.y"
      }
    }
  }
}
```

- Put it under `env.development`, **not** the root `config`. Root config is
  copied to every environment, which would move the tests site off `localhost`
  too.
- Leave the port off. wp-env's `post-process-config.js` appends each
  environment's own port to `WP_SITEURL` / `WP_HOME`.
- These become `wp-config.php` constants, which win over the DB `siteurl` /
  `home` options. When the IP changes, edit the override and re-run
  `npx wp-env start` — no `search-replace` needed.
- Get the IP with `ipconfig getifaddr en0` (Wi-Fi). Allow Docker through the
  macOS firewall if prompted.

## Mode 1 — Isolated database (default, recommended)

Each worktree = its own fresh WordPress + MySQL. Use for parallel branches that
must not see each other's data.

```bash
npm run env:start          # provisions this worktree's own DB
npm run phpunit            # runs against this worktree's own test DB
npm run env:stop
```

Nothing extra to configure beyond unique ports. The cost is re-provisioning
(WP install, WooCommerce, sample data) per worktree.

## Mode 2 — Shared / reusable database

wp-env cannot live-share one MySQL volume across two paths (the volume name is
derived from the config path). "Sharing" therefore means one of:

### 2a. One owner instance, code swapped by remount (true single DB)

Run the environment from **one** checkout only and point its plugin mount at
whichever worktree's code you want live — in the owner's
`.wp-env.override.json`:

```json
{
  "plugins": [
    "https://downloads.wordpress.org/plugin/woocommerce.zip",
    "/Users/you/dokan-wt/issue-b/dokan"
  ]
}
```

then `npx wp-env start` in the owner. Same data, issue B's code; edit the path
to switch again. A local plugin mounts under its folder basename, and the
scripts name every lite worktree `dokan`, so the plugin slug — and its active
state — survives the swap. Other worktrees don't run their own env. Only one
code tree is live at a time.

### 2b. Clone a DB from another checkout (recommended for "reuse the setup")

Provision one site the way you want it, then copy its database into each new
worktree's own (isolated) instance. You get fast provisioning **and**
independence — changes in one worktree don't reach the others.

It is **config-driven**: the worktree's `.wp-env.override.json` declares its
data source in `afterStart`, and `clone-db.sh` does the rest.

```jsonc
// .wp-env.override.json in the NEW worktree
{
  "port": 8892,
  "testsPort": 8893,
  "lifecycleScripts": {
    "afterStart": "npx wp-env run cli wp theme activate twentytwentyfive && .claude/skills/dokan-wp-env-worktrees/clone-db.sh /abs/path/to/source-checkout"
  }
}
```

The relative script path works when the worktree's branch already contains
this skill; otherwise use an absolute path (the creator scripts always do).
Or let the creator scripts write it:

```bash
DOKAN_CLONE_FROM=~/Development/Projects/core-dokan/wp-content/plugins/dokan-lite \
  .claude/skills/dokan-wp-env-worktrees/create-paired-worktree.sh fix/issue-123 develop 8892
```

What `clone-db.sh` does on `npx wp-env start`:

1. Finds both instances' containers from their paths — wp-env names them
   `md5(<checkout>/.wp-env.json)-mysql-1` / `-cli-1`.
2. Streams the source dev database straight into the target:
   `docker exec <src>-mysql-1 mariadb-dump --single-transaction wordpress | docker exec -i <dst>-mysql-1 mariadb wordpress`.
   No dump file, no MySQL ports, no host MySQL client, no `node_modules` needed.
3. Rewrites the source's `home` URL to the target's (`wp search-replace`, run
   in the target's `cli` container). Both are read from the databases, so a LAN
   `WP_HOME` on either side is handled.
4. Records a `dokan_wp_env_cloned_from` option in the target. wp-env runs
   `afterStart` on **every** start, so later starts see the marker and skip —
   your work in the worktree is never overwritten.

Notes:

- The **source environment must be running** for the first start of the
  target; otherwise the hook fails with a message saying so.
- Re-clone on purpose with
  `.claude/skills/dokan-wp-env-worktrees/clone-db.sh --force <source>` from the
  target's root.
- The copy carries the source's active-plugin list. If the source had Pro
  active and the target doesn't mount it, Pro simply doesn't load (WordPress
  drops it from the active list the next time the Plugins screen loads).
- Only the dev database is cloned — `npm run phpunit` rebuilds the tests DB on
  every run.
- Need a frozen snapshot instead of a live source? Dump to a file outside the
  repo and load it later:
  `docker exec <src>-mysql-1 mariadb-dump -uroot -ppassword --single-transaction wordpress > ~/dokan-wt/seed.sql`,
  then `docker exec -i <dst>-mysql-1 mariadb -uroot -ppassword wordpress < ~/dokan-wt/seed.sql`
  and a `wp search-replace` of the URL.

### Which mode

| Need | Mode |
|---|---|
| Parallel issues, no interference | 1 — fresh |
| Parallel issues, same realistic starting data | 2b — cloned (`clone-db.sh` via `afterStart`) |
| Same data, different code, one at a time | 2a — shared |

## Gotchas

- **Config changes need a `wp-env start` to take effect.** Plugin mounts live in
  the generated `docker-compose.yml`, which is only rewritten on `start`. Adding
  `.` (or any plugin) to a config while the env is already running does nothing
  until you `npx wp-env start` again. Symptom: a plugin listed in `plugins[]`
  (e.g. dokan-lite via `.`) is missing from wp-admin, so a dependent (dokan-pro)
  refuses to activate with "required plugins are missing or inactive".
- **Default theme:** wp-env has no active-theme option; set it with an
  `afterStart` lifecycle script. Twenty Twenty-Five ships with WP core (6.7+), so
  it only needs activating:
  ```jsonc
  "lifecycleScripts": {
    "afterStart": "npx wp-env run cli wp theme activate twentytwentyfive && npx wp-env run tests-cli wp theme activate twentytwentyfive"
  }
  ```
- `https://downloads.wordpress.org/plugin/woocommerce.zip` is not guaranteed to
  be a stable release — on 2026-10-02 it installed `11.2.0-beta.2`. Pin a
  versioned zip (`woocommerce.<version>.zip`) in your override when you need
  a specific or stable WooCommerce.
- Editing `~/.wp-env/<md5>/docker-compose.yml` by hand does not stick — wp-env
  regenerates it on every `start`. Configure via
  `.wp-env.override.json` instead.
- `npx wp-env destroy` removes **only the current worktree's** `<md5>` instance
  and volumes, not the others.
- Orphaned volumes from deleted worktrees: `docker volume ls | grep mysql`
  lists every `<md5>_mysql`; prune the ones whose `~/.wp-env/<md5>` worktree is
  gone.
- `phpunit` scripts use `--env-cwd=wp-content/plugins/dokan`, so container paths
  are under `/var/www/html/wp-content/plugins/dokan/`.
