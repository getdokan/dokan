#!/usr/bin/env bash
#
# Clone the development database of another wp-env checkout into THIS one,
# streaming container to container (no dump file, no MySQL ports needed).
#
# Meant to be driven from .wp-env.override.json so a worktree declares where its
# data comes from:
#
#   "lifecycleScripts": {
#     "afterStart": ".claude/skills/dokan-wp-env-worktrees/clone-db.sh /abs/path/to/source-checkout"
#   }
#
# wp-env runs afterStart on every start, so the clone happens ONCE: afterwards a
# marker option in this database makes later runs a no-op. Re-clone with --force.
#
# Usage (from the target checkout's root, which is where wp-env runs hooks):
#   clone-db.sh [--force] <source-checkout-path>
#
# Both environments must be running (the target is, inside afterStart).
set -euo pipefail

FORCE=0
if [[ "${1:-}" == "--force" ]]; then FORCE=1; shift; fi
SRC="${1:?usage: clone-db.sh [--force] <source-checkout-path>}"
SRC="$( cd "$SRC" && pwd )"
DST="$( pwd )"
MARKER="dokan_wp_env_cloned_from"

[[ "$SRC" != "$DST" ]] || { echo "clone-db: source and target are the same checkout"; exit 1; }

# wp-env names an instance md5(<abs path of .wp-env.json>); its dev containers are
# <md5>-mysql-1 (database) and <md5>-cli-1 (WP-CLI). Talking to them directly keeps
# this script independent of the checkout's node_modules.
src_db="$( md5 -q -s "$SRC/.wp-env.json" )-mysql-1"
dst_hash="$( md5 -q -s "$DST/.wp-env.json" )"
dst_db="$dst_hash-mysql-1"
dst_cli="$dst_hash-cli-1"

sql() { # <container> <query>
  docker exec "$1" mariadb -uroot -ppassword -N -B wordpress -e "$2" 2>/dev/null
}

if [[ "$FORCE" == 0 ]] && [[ "$( sql "$dst_db" "SELECT option_value FROM wp_options WHERE option_name='$MARKER'" || true )" == "$SRC" ]]; then
  echo "clone-db: already cloned from $SRC (use --force to re-clone)"
  exit 0
fi

docker ps --format '{{.Names}}' | grep -qx "$src_db" \
  || { echo "clone-db: source environment is not running — run 'npx wp-env start' in $SRC first"; exit 1; }

# Read both URLs before the import overwrites the target. wp-env installs with
# the configured WP_SITEURL, so the target's stored home is its real address.
src_url="$( sql "$src_db" "SELECT option_value FROM wp_options WHERE option_name='home'" )"
dst_url="$( sql "$dst_db" "SELECT option_value FROM wp_options WHERE option_name='home'" )"
[[ -n "$src_url" && -n "$dst_url" ]] || { echo "clone-db: could not read site URLs (src='$src_url' dst='$dst_url')"; exit 1; }

echo "clone-db: streaming $SRC → $DST"
docker exec "$src_db" mariadb-dump -uroot -ppassword --single-transaction wordpress \
  | docker exec -i "$dst_db" mariadb -uroot -ppassword wordpress

if [[ "$src_url" != "$dst_url" ]]; then
  echo "clone-db: rewriting $src_url → $dst_url"
  docker exec "$dst_cli" wp search-replace "$src_url" "$dst_url" --all-tables --skip-plugins --skip-themes --quiet
fi

sql "$dst_db" "INSERT INTO wp_options (option_name, option_value, autoload) VALUES ('$MARKER', '$SRC', 'no')
               ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)"
echo "clone-db: done"
