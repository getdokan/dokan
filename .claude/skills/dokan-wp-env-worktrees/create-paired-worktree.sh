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
#   PRO_BASE        base branch for a NEW pro branch  (default: develop)
#
# Run from anywhere inside the dokan-lite main checkout.
set -euo pipefail

BRANCH="${1:?usage: create-paired-worktree.sh <branch> [base-branch] [port]}"
BASE="${2:-develop}"
PORT="${3:-8890}"
TESTS_PORT=$(( PORT + 1 ))

# Resolve the two main checkouts. dokan-pro is expected next to dokan-lite.
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

add_worktree "$LITE_MAIN" "$DEST/dokan-lite" "$BRANCH" "$BASE"
add_worktree "$PRO_MAIN"  "$DEST/dokan-pro"  "$BRANCH" "${PRO_BASE:-develop}"

cat > "$DEST/dokan-lite/.wp-env.json" <<JSON
{
  "core": null,
  "phpVersion": "7.4",
  "plugins": [
    "https://downloads.wordpress.org/plugin/woocommerce.zip",
    ".",
    "../dokan-pro"
  ],
  "lifecycleScripts": {
    "afterStart": "npx wp-env run cli wp theme activate twentytwentyfive && npx wp-env run tests-cli wp theme activate twentytwentyfive"
  }
}
JSON

cat > "$DEST/dokan-lite/.wp-env.override.json" <<JSON
{ "port": $PORT, "testsPort": $TESTS_PORT }
JSON

cat <<EOF

Paired worktree ready: $DEST
  lite: $DEST/dokan-lite  ($BRANCH)   ← runs wp-env on port $PORT
  pro:  $DEST/dokan-pro   ($BRANCH)   ← mounted via ../dokan-pro

Next (build LITE first — pro's webpack.config.js requires ../dokan-lite/node_modules):
  cd "$DEST/dokan-lite" && composer install && npm ci && npm run build
  cd "$DEST/dokan-pro"  && composer install && npm ci && npm run build
  cd "$DEST/dokan-lite" && npx wp-env start           # http://localhost:$PORT
  # If npm ci fails on the @getdokan/dokan-ui git clone
  # (code 128 / "destination path ... already exists"):  rm -rf ~/.npm/_cacache/tmp/git-clone*  and retry.

Tear down when merged:
  git -C "$LITE_MAIN" worktree remove "$DEST/dokan-lite"
  git -C "$PRO_MAIN"  worktree remove "$DEST/dokan-pro"
  (cd "$DEST/dokan-lite" && npx wp-env destroy)        # drop its DB volumes
EOF
