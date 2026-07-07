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
Keep the live config **local/per-worktree** — only `.wp-env.json.example` is
committed. Both `.wp-env.json` and `.wp-env.override.json` are gitignored.

### New worktree setup

```bash
cp .wp-env.json.example .wp-env.json      # or edit an existing local copy
```

Then set ports unique to the worktree. Put ports in `.wp-env.override.json` so
the base `.wp-env.json` (plugin mounts) stays uniform across worktrees:

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
must be listed explicitly, ideally in dependency order:

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

2. **Relative sources resolve against the current working directory, not the
   config file.** `parse-source-string.js` does `path.resolve( sourceString )`,
   so `../dokan-pro` is relative to wherever you run `npm run env:start`
   (the worktree root). This works only when the worktree sits under
   `wp-content/plugins/` next to `dokan-pro`. For a worktree created elsewhere
   (`git worktree add ~/wt/foo`), `../dokan-pro` won't resolve — use an
   **absolute path** in that worktree's local config.

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
├── dokan-lite/   ← worktree of lite @ feat-x   (runs wp-env, port 8890)
└── dokan-pro/    ← worktree of pro  @ feat-x   (mounted via ../dokan-pro)
```

New path → new `md5` → own isolated DB automatically; just bump ports.

### From a PR link (recommended — resolves the companion PR automatically)

`worktree-from-pr.sh` takes **either** the lite PR **or** the pro PR, reads its
body for the companion ("Related PR" / "Companion Pro PR" link to the other
repo), and checks out the matching branch in **both** repos as paired worktrees.
Falls back to the same branch name in the other repo if the body has no link,
and to a lite-only env (pro mounted from the shared main checkout) if there is
no companion at all.

```bash
.claude/skills/dokan-wp-env-worktrees/worktree-from-pr.sh https://github.com/getdokan/dokan/pull/3141
# accepts:  3141  (bare number ⇒ lite repo)  |  getdokan/dokan-pro#5538  |  full URL
# optional 2nd arg = port, e.g. ... /pull/3141 8892
```

It resolves branch + base per repo via `gh`, fast-forwards each worktree to the
PR head, and writes `.wp-env.json` + `.wp-env.override.json` (ports). Requires an
authenticated `gh` and `jq`. Run it from inside the dokan-lite main checkout.

### From a branch name (when the branch already exists / no PR yet)

```bash
.claude/skills/dokan-wp-env-worktrees/create-paired-worktree.sh feat-x develop 8890
```

Both scripts only *create + configure* the worktrees. They deliberately do **not**
install or build — do that with the bootstrap sequence below.

## Bootstrap a paired worktree (install + build)

> **Name the lite worktree folder `dokan`, not `dokan-lite`.** wp-env mounts a
> local plugin at `/var/www/html/wp-content/plugins/<folder-basename>`, and
> Dokan's `npm run phpunit` hardcodes `--env-cwd=wp-content/plugins/dokan`. A
> folder named `dokan-lite` mounts at `.../plugins/dokan-lite`, so
> `npm run phpunit` (and the Mode 2b seed paths below) break. The helper scripts
> currently create `dokan-lite/` — rename to `dokan/` or adjust `--env-cwd`.

A fresh worktree has no `node_modules`, `vendor`, or built `assets/` (worktrees
don't share them with the main checkout). Run this order:

```bash
WT=~/dokan-wt/feat-x

# 1. LITE first, fully (composer → npm → build)
cd "$WT/dokan-lite" && composer install && npm ci && npm run build

# 2. THEN pro
cd "$WT/dokan-pro" && composer install && npm ci && npm run build

# 3. Start the env from the LITE worktree
cd "$WT/dokan-lite" && npx wp-env start          # http://localhost:8890
```

Why the order matters:

- **Lite before pro.** dokan-pro's `webpack.config.js` requires
  `../dokan-lite/webpack-dependency-mapping.js`, which `require('lodash')` from
  **dokan-lite's** `node_modules`. Build pro before lite is installed and it dies
  with `[webpack-cli] Cannot find module 'lodash'`.
- `composer install` pulls ~90 packages (Google/Stripe/Mangopay SDKs, Mozart) —
  no auth needed for the public deps. This part works reliably.

> ⚠️ **UNRESOLVED BLOCKER — `npm ci`/`npm install` fails in a worktree.**
> lite's `package.json` has a private git dep
> `"@getdokan/dokan-ui": "github:getdokan/dokan-ui#dokan-plugin"` (cloned over
> SSH). In a linked git worktree, both `npm ci` and `npm install` fail
> **reproducibly** with:
> ```
> npm error code 128
> npm error command git ... clone --mirror -q ssh://git@github.com/getdokan/dokan-ui.git .../_cacache/tmp/git-clone…/.git
> npm error fatal: destination path '.../git-clone…/.git' already exists and is not an empty directory.
> ```
> It looks like npm cloning the same git dep twice concurrently into one temp path.
>
> **Verified this is NOT auth/network:** a raw
> `git clone --mirror ssh://git@github.com/getdokan/dokan-ui.git <dir>/.git`
> succeeds, and `ssh -T git@github.com` greets you.
>
> **Tried and did NOT help** (2026-07-07, npm 11.17.0 / node 22.22.0):
> `rm -rf ~/.npm/_cacache/tmp/git-clone*`, a fresh `--cache <dir>`, a warmed
> cache, `npm install` instead of `npm ci`, and `npm ci --maxsockets=1`.
> Pro's own `npm ci` sometimes succeeds (it runs second and reuses leftover
> cache state), which is misleading — lite, running first against a cold state,
> always fails.
>
> **Untested leads / candidate workarounds** (confirm before trusting):
> - Does `npm ci` work in a **non-worktree** checkout of the same branch? If so,
>   the bug is git-worktree-specific → install there and copy `node_modules` in.
> - Try an older npm (`npm i -g npm@10`) — the concurrent-git-clone races differ
>   by npm major.
> - Pre-seed `node_modules/@getdokan/dokan-ui` from a checkout where it installed.

Other notes:
- **Lite-only change:** skip the pro worktree and point at the shared main pro
  checkout (absolute path in `.wp-env.override.json`). The shared pro is on one
  branch at a time, which is fine when you aren't touching it.
- If lite and pro versions are enforced (pro checks a minimum lite version),
  dev branches report dev versions and pass — no special handling needed.

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

Run the environment from **one** checkout only and point its `plugins` /
`mappings` at whichever worktree's code you want live. Other worktrees do not
run their own env; their tooling targets the owner's port. Simple, but only one
code tree is active at a time.

### 2b. Clone a seeded DB into a new worktree (recommended for "reuse the setup")

Provision once, then snapshot and restore into each new worktree's own
(isolated) instance. You get fast provisioning **and** independence. The dump
path must be inside a **bind-mounted** dir so both `cli` and `tests-cli`
containers (and the host) can see it — the plugin mount works. Replace `dokan`
below with your actual lite worktree folder name if it differs.

```bash
P=/var/www/html/wp-content/plugins/dokan        # = the lite mount (folder basename)

# In the seeded/owner worktree — export both DBs:
npx wp-env run cli -- wp db export "$P/.wp-env-seed.sql"
npx wp-env run tests-cli -- wp db export "$P/.wp-env-seed-tests.sql"

# In a fresh worktree after `npm run env:start` — import them:
npx wp-env run cli -- wp db import "$P/.wp-env-seed.sql"
npx wp-env run cli -- wp search-replace 'http://localhost:8888' 'http://localhost:8890' --all-tables
npx wp-env run tests-cli -- wp db import "$P/.wp-env-seed-tests.sql"
```

Adjust the `search-replace` URLs to the source and target `port`. Add
`.wp-env-seed*.sql` to `.gitignore` if you keep dumps in the tree.

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
- Editing `~/.wp-env/<md5>/docker-compose.yml` by hand does not stick — wp-env
  regenerates it on every `start`. Configure via `.wp-env.json` /
  `.wp-env.override.json` instead.
- `npx wp-env destroy` removes **only the current worktree's** `<md5>` instance
  and volumes, not the others.
- Orphaned volumes from deleted worktrees: `docker volume ls | grep mysql`
  lists every `<md5>_mysql`; prune the ones whose `~/.wp-env/<md5>` worktree is
  gone.
- `phpunit` scripts use `--env-cwd=wp-content/plugins/dokan`, so container paths
  are under `/var/www/html/wp-content/plugins/dokan/`.
