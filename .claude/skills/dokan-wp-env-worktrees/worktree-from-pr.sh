#!/usr/bin/env bash
#
# Create paired dokan-lite + dokan-pro worktrees straight from a GitHub PR link.
#
# Give it EITHER the lite PR or the pro PR — it reads that PR's body, finds the
# companion PR (the "Related PR" / "Companion Pro PR" link to the other repo),
# and checks out the matching branch in both repos as side-by-side worktrees so
# "../dokan-pro" resolves correctly and the DB is isolated. Falls back to the
# same branch name in the other repo if the body has no companion link.
#
# Usage:
#   worktree-from-pr.sh <pr-url | pr-number | owner/repo#number> [port]
#
# Examples:
#   worktree-from-pr.sh https://github.com/getdokan/dokan/pull/3141
#   worktree-from-pr.sh 3141                 # bare number ⇒ lite repo
#   worktree-from-pr.sh getdokan/dokan-pro#5538 8892
#
# Env overrides:
#   DOKAN_WT_HOME   parent dir for worktrees (default: ~/dokan-wt)
#
# Requires: gh (authenticated), jq. Run from inside the dokan-lite main checkout.
set -euo pipefail

LITE_REPO="getdokan/dokan"
PRO_REPO="getdokan/dokan-pro"

INPUT="${1:?usage: worktree-from-pr.sh <pr-url|number|owner/repo#number> [port]}"
PORT="${2:-8890}"
TESTS_PORT=$(( PORT + 1 ))

command -v gh >/dev/null || { echo "gh CLI required"; exit 1; }
command -v jq >/dev/null || { echo "jq required"; exit 1; }

# --- parse input into <repo> + <number> ---
repo="" num=""
if [[ "$INPUT" =~ github\.com/([^/]+/[^/]+)/pull/([0-9]+) ]]; then
  repo="${BASH_REMATCH[1]}"; num="${BASH_REMATCH[2]}"
elif [[ "$INPUT" =~ ^([^#]+/[^#]+)#([0-9]+)$ ]]; then
  repo="${BASH_REMATCH[1]}"; num="${BASH_REMATCH[2]}"
elif [[ "$INPUT" =~ ^[0-9]+$ ]]; then
  repo="$LITE_REPO"; num="$INPUT"
else
  echo "Cannot parse PR reference: $INPUT"; exit 1
fi

# --- fetch this PR ---
meta="$( gh pr view "$num" --repo "$repo" --json headRefName,baseRefName,body )"
this_branch="$( jq -r .headRefName <<<"$meta" )"
this_base="$( jq -r .baseRefName <<<"$meta" )"
body="$( jq -r .body <<<"$meta" )"

if [[ "$repo" == "$PRO_REPO" ]]; then
  this_side="pro";  other_repo="$LITE_REPO"
else
  this_side="lite"; other_repo="$PRO_REPO"
fi

# --- find the companion PR number in the body (URL or owner/repo#N form) ---
other_num="$( grep -oiE "(${other_repo}/pull/|${other_repo}#)[0-9]+" <<<"$body" \
              | grep -oE '[0-9]+' | head -1 || true )"

other_branch=""
if [[ -n "$other_num" ]]; then
  other_branch="$( gh pr view "$other_num" --repo "$other_repo" --json headRefName -q .headRefName )"
  echo "Companion PR: $other_repo#$other_num  (branch: $other_branch)"
elif git ls-remote --exit-code --heads "https://github.com/${other_repo}.git" "$this_branch" >/dev/null 2>&1; then
  other_branch="$this_branch"
  echo "No companion PR in body; matched same branch name in $other_repo."
elif [[ "$this_side" == "lite" ]]; then
  echo "No companion PR and no matching branch in $other_repo — creating a lite-only env."
else
  echo "No companion PR and no matching branch in $LITE_REPO — lite will be checked out detached at origin/develop."
fi

# --- map to lite/pro branch names ---
if [[ "$this_side" == "lite" ]]; then
  lite_branch="$this_branch"; pro_branch="$other_branch"
else
  pro_branch="$this_branch";  lite_branch="$other_branch"
fi

# --- resolve main checkouts (dokan-pro expected next to the lite main checkout) ---
LITE_MAIN="$( git rev-parse --show-toplevel )"
PLUGINS_DIR="$( dirname "$LITE_MAIN" )"
PRO_MAIN="$PLUGINS_DIR/dokan-pro"
if [[ "$this_side" == "pro" && ! -d "$PRO_MAIN/.git" ]]; then
  echo "dokan-pro not found at $PRO_MAIN"; exit 1
fi

SLUG="${this_branch//\//-}"
DEST="${DOKAN_WT_HOME:-$HOME/dokan-wt}/$SLUG"
mkdir -p "$DEST"

# add_worktree <repo-main> <path> <branch> [base]
add_worktree() {
  local main="$1" path="$2" br="$3" base="${4:-develop}"
  git -C "$main" fetch --quiet origin "$br" 2>/dev/null || true
  if git -C "$main" show-ref --verify --quiet "refs/heads/$br"; then
    git -C "$main" worktree add "$path" "$br"
    git -C "$path" merge --ff-only "origin/$br" 2>/dev/null || true   # match PR head (no-op if ahead)
  elif git -C "$main" show-ref --verify --quiet "refs/remotes/origin/$br"; then
    git -C "$main" worktree add -b "$br" "$path" "origin/$br"
  else
    git -C "$main" worktree add -b "$br" "$path" "$base"
  fi
}

if [[ -n "$lite_branch" ]]; then
  add_worktree "$LITE_MAIN" "$DEST/dokan" "$lite_branch" "$this_base"
else
  # Pro PR with no lite counterpart: run it against lite's develop, detached so
  # the main checkout can keep develop checked out.
  git -C "$LITE_MAIN" fetch --quiet origin develop
  git -C "$LITE_MAIN" worktree add --detach "$DEST/dokan" origin/develop
fi

PRO_ENTRY=""
if [[ -n "$pro_branch" && -d "$PRO_MAIN/.git" ]]; then
  add_worktree "$PRO_MAIN" "$DEST/dokan-pro" "$pro_branch" develop
  PRO_ENTRY=$',\n    "../dokan-pro"'
elif [[ -d "$PRO_MAIN" ]]; then
  PRO_ENTRY=$',\n    "'"$PRO_MAIN"'"'   # lite-only: mount the shared main pro checkout by absolute path
fi

cat > "$DEST/dokan/.wp-env.json" <<JSON
{
  "core": null,
  "phpVersion": "7.4",
  "plugins": [
    "https://downloads.wordpress.org/plugin/woocommerce.zip",
    "."${PRO_ENTRY}
  ],
  "lifecycleScripts": {
    "afterStart": "npx wp-env run cli wp theme activate twentytwentyfive && npx wp-env run tests-cli wp theme activate twentytwentyfive"
  }
}
JSON

cat > "$DEST/dokan/.wp-env.override.json" <<JSON
{ "port": $PORT, "testsPort": $TESTS_PORT }
JSON

if [[ -d "$DEST/dokan-pro" ]]; then
  PRO_LABEL="$DEST/dokan-pro  ($pro_branch)"
elif [[ -n "$PRO_ENTRY" ]]; then
  PRO_LABEL="mounted from $PRO_MAIN (shared main checkout)"
else
  PRO_LABEL="not mounted (no dokan-pro checkout at $PRO_MAIN)"
fi

cat <<EOF

Worktree ready: $DEST
  lite: $DEST/dokan  (${lite_branch:-origin/develop, detached})   ← runs wp-env on port $PORT
  pro:  $PRO_LABEL

Next (build LITE first — pro's webpack.config.js loads lite's webpack-dependency-mapping from ../dokan):
  cd "$DEST/dokan" && composer install && npm ci && npm run build
  ${pro_branch:+cd "$DEST/dokan-pro"  && composer install && npm ci && npm run build}
  cd "$DEST/dokan" && npx wp-env start           # http://localhost:$PORT
  # If npm ci fails on the @getdokan/dokan-ui git clone (code 128 / "destination path ... already exists"),
  # see "npm ci in a worktree" in SKILL.md for workarounds.
EOF
