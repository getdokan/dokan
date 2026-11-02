#!/usr/bin/env bash
#
# Create a paired dokan-lite + dokan-pro worktree for a coordinated feature that
# touches both repos. The two worktrees are placed side by side so the lite
# worktree's "../dokan-pro" mount resolves to the matching pro branch, and the
# new path gets its own isolated wp-env database automatically.
#
# Usage:
#   create-paired-worktree.sh <branch> [base-branch] [port]
#
# Env overrides:
#   DOKAN_WT_HOME   parent dir for worktrees (default: ~/dokan-wt)
#   DOKAN_CLONE_DB_FROM / _HOST / _PORT / _NAME / _USER / _PASS / _PREFIX
#                   clone the dev DB on first start; written to the override as
#                   env.development.config (see clone-db.sh for the semantics)
#   PRO_BASE        base branch for a NEW pro branch  (default: develop)
#
# Run from anywhere inside the dokan-lite main checkout.
set -euo pipefail

SKILL_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BRANCH="${1:?usage: create-paired-worktree.sh <branch> [base-branch] [port]}"
BASE="${2:-develop}"
PORT="${3:-8890}"
TESTS_PORT=$(( PORT + 1 ))

# Resolve the two main checkouts. dokan-pro is expected next to the lite main checkout.
LITE_MAIN="$( git rev-parse --show-toplevel )"
PLUGINS_DIR="$( dirname "$LITE_MAIN" )"
PRO_MAIN="$PLUGINS_DIR/dokan-pro"
[ -d "$PRO_MAIN/.git" ] || { echo "dokan-pro not found at $PRO_MAIN"; exit 1; }

SLUG="${BRANCH//\//-}"
DEST="${DOKAN_WT_HOME:-$HOME/dokan-wt}/$SLUG"
mkdir -p "$DEST"

add_worktree() { # <repo> <path> <branch> <base>
  local repo="$1" path="$2" branch="$3" base="$4"
  if git -C "$repo" show-ref --verify --quiet "refs/heads/$branch"; then
    git -C "$repo" worktree add "$path" "$branch"
  else
    git -C "$repo" worktree add -b "$branch" "$path" "$base"
  fi
}

add_worktree "$LITE_MAIN" "$DEST/dokan" "$BRANCH" "$BASE"
add_worktree "$PRO_MAIN"  "$DEST/dokan-pro"  "$BRANCH" "${PRO_BASE:-develop}"

# afterStart: activate the theme, then clone-db.sh — a no-op unless the
# override configures a DOKAN_CLONE_DB_* source.
AFTER_START="npx wp-env run cli wp theme activate twentytwentyfive && npx wp-env run tests-cli wp theme activate twentytwentyfive && $SKILL_DIR/clone-db.sh"
CLONE_CFG=""
for k in FROM HOST PORT NAME USER PASS PREFIX; do
  name="DOKAN_CLONE_DB_$k"; v="${!name:-}"
  [[ -n "$v" ]] || continue
  if [[ "$k" == FROM ]]; then   # store an absolute path
    if [[ -f "$v" ]]; then v="$( cd "$( dirname "$v" )" && pwd )/$( basename "$v" )"; else v="$( cd "$v" && pwd )"; fi
  fi
  if [[ "$k" == PORT ]]; then j="$v"; else v="${v//\\/\\\\}"; v="${v//\"/\\\"}"; j="\"$v\""; fi
  CLONE_CFG="$CLONE_CFG${CLONE_CFG:+, }\"$name\": $j"
done
CLONE_ENV=""
[[ -z "$CLONE_CFG" ]] || CLONE_ENV=$',\n  "env": { "development": { "config": { '"$CLONE_CFG"' } } }'

# The committed .wp-env.json stays untouched (CI reads it). Everything
# worktree-specific goes in the gitignored override; its "plugins" list
# replaces the base list wholesale, so it repeats WooCommerce and ".".
cat > "$DEST/dokan/.wp-env.override.json" <<JSON
{
  "port": $PORT,
  "testsPort": $TESTS_PORT,
  "plugins": [
    "https://downloads.wordpress.org/plugin/woocommerce.zip",
    ".",
    "../dokan-pro"
  ],
  "lifecycleScripts": {
    "afterStart": "$AFTER_START"
  }${CLONE_ENV}
}
JSON

cat <<EOF

Paired worktree ready: $DEST
  lite: $DEST/dokan  ($BRANCH)   ← runs wp-env on port $PORT
  pro:  $DEST/dokan-pro   ($BRANCH)   ← mounted via ../dokan-pro

Next (build LITE first — pro's webpack.config.js loads lite's webpack-dependency-mapping from ../dokan):
  cd "$DEST/dokan" && composer install && npm ci && npm run build
  cd "$DEST/dokan-pro"  && composer install && npm ci && npm run build
  cd "$DEST/dokan" && npx wp-env start           # http://localhost:$PORT
  # If npm ci fails on the @getdokan/dokan-ui git clone (code 128 / "destination path ... already exists"),
  # see "npm ci in a worktree" in SKILL.md for workarounds.

Tear down when merged:
  git -C "$LITE_MAIN" worktree remove "$DEST/dokan"
  git -C "$PRO_MAIN"  worktree remove "$DEST/dokan-pro"
  (cd "$DEST/dokan" && npx wp-env destroy)        # drop its DB volumes
EOF
