#!/usr/bin/env bash
#
# Clone a database into THIS wp-env checkout's development site, driven by its
# own wp-env config. Declare the source under env.development.config in
# .wp-env.override.json and run this script from afterStart with no arguments:
#
#   "env": { "development": { "config": {
#     "DOKAN_CLONE_DB_FROM":   "/abs/path/to/source",   // wp-env checkout dir OR a wp-config.php
#     "DOKAN_CLONE_DB_HOST":   "127.0.0.1",             // explicit MySQL source instead of FROM
#     "DOKAN_CLONE_DB_PORT":   3306,
#     "DOKAN_CLONE_DB_NAME":   "dokan_core",
#     "DOKAN_CLONE_DB_USER":   "admin",
#     "DOKAN_CLONE_DB_PASS":   "secret",
#     "DOKAN_CLONE_DB_PREFIX": "wp_"
#   } } },
#   "lifecycleScripts": { "afterStart": "... && /abs/path/to/clone-db.sh" }
#
# Source resolution, first match wins:
#   1. DOKAN_CLONE_DB_NAME set           -> explicit MySQL (HOST/PORT/USER/PASS/PREFIX,
#                                           defaults 127.0.0.1 / 3306 / - / "" / wp_)
#   2. DOKAN_CLONE_DB_FROM = wp-config.php -> credentials read from that file; any
#                                           explicit HOST/PORT/USER/PASS/PREFIX override it
#   3. DOKAN_CLONE_DB_FROM = wp-env dir   -> that checkout's running dev DB, streamed
#                                           container-to-container
#   none                                 -> no-op
#
# The clone happens ONCE: a marker option in the target records the source and
# later starts skip. Re-clone with --force. A positional path overrides
# DOKAN_CLONE_DB_FROM for a one-off manual clone.
#
# Usage (from the target checkout's root, which is where wp-env runs hooks):
#   clone-db.sh [--force] [source-path]
set -euo pipefail

FORCE=0
if [[ "${1:-}" == "--force" ]]; then FORCE=1; shift; fi
ARG_SRC="${1:-}"
DST="$( pwd )"
MARKER="dokan_wp_env_cloned_from"

# wp-env names an instance md5(<abs path of .wp-env.json>); its dev containers are
# <md5>-mysql-1 (database) and <md5>-cli-1 (WP-CLI). Talking to them directly keeps
# this script independent of the checkout's node_modules.
hash_of() {
  if command -v md5 >/dev/null 2>&1; then md5 -q -s "$1"; else printf '%s' "$1" | md5sum | cut -d' ' -f1; fi
}
dst_hash="$( hash_of "$DST/.wp-env.json" )"
dst_db="$dst_hash-mysql-1"
dst_cli="$dst_hash-cli-1"

docker ps --format '{{.Names}}' | grep -qx "$dst_db" \
  || { echo "clone-db: this checkout's wp-env is not running ($dst_db)"; exit 1; }

dst_wp() { docker exec "$dst_cli" wp "$@" --skip-plugins --skip-themes; }
cfg()    { dst_wp config get "$1" 2>/dev/null | tr -d '\r' || true; }

# --- resolve the source ---------------------------------------------------------
FROM="${ARG_SRC:-$( cfg DOKAN_CLONE_DB_FROM )}"
C_HOST="$( cfg DOKAN_CLONE_DB_HOST )"; C_PORT="$( cfg DOKAN_CLONE_DB_PORT )"
C_NAME="$( cfg DOKAN_CLONE_DB_NAME )"; C_USER="$( cfg DOKAN_CLONE_DB_USER )"
C_PASS="$( cfg DOKAN_CLONE_DB_PASS )"; C_PREFIX="$( cfg DOKAN_CLONE_DB_PREFIX )"

# Pull DB_* defines and $table_prefix out of a wp-config.php without executing it.
wpc() { sed -nE "s/^[[:space:]]*define[[:space:]]*\([[:space:]]*['\"]$2['\"][[:space:]]*,[[:space:]]*['\"]([^'\"]*)['\"].*/\1/p" "$1" | head -1; }

src_name="" src_user="" src_pass="" src_host="" src_port="" src_prefix=""
if [[ -n "$C_NAME" && -z "$ARG_SRC" ]]; then
  MODE=mysql
  src_name="$C_NAME"; src_user="$C_USER"; src_pass="$C_PASS"
  src_host="$C_HOST"; src_port="$C_PORT"; src_prefix="$C_PREFIX"
  LABEL="mysql://${src_user}@${src_host:-127.0.0.1}:${src_port:-3306}/${src_name}"
elif [[ -z "$FROM" ]]; then
  echo "clone-db: no DOKAN_CLONE_DB_* source configured — nothing to clone"
  exit 0
elif [[ -f "$FROM" && "$( basename "$FROM" )" == "wp-config.php" ]]; then
  MODE=mysql
  FROM="$( cd "$( dirname "$FROM" )" && pwd )/wp-config.php"
  src_name="$( wpc "$FROM" DB_NAME )"; src_user="$( wpc "$FROM" DB_USER )"
  src_pass="$( wpc "$FROM" DB_PASSWORD )"; src_host="$( wpc "$FROM" DB_HOST )"
  src_prefix="$( sed -nE "s/^[[:space:]]*\\\$table_prefix[[:space:]]*=[[:space:]]*['\"]([^'\"]*)['\"].*/\1/p" "$FROM" | head -1 )"
  # host[:port] in DB_HOST; explicit constants override whatever the file says.
  src_port="${src_host##*:}"; [[ "$src_port" != "$src_host" ]] || src_port=""
  src_host="${src_host%%:*}"
  src_host="${C_HOST:-$src_host}"; src_port="${C_PORT:-$src_port}"; src_user="${C_USER:-$src_user}"
  src_pass="${C_PASS:-$src_pass}"; src_prefix="${C_PREFIX:-$src_prefix}"
  LABEL="$FROM"
elif [[ -d "$FROM" && -f "$FROM/.wp-env.json" ]]; then
  MODE=wpenv
  FROM="$( cd "$FROM" && pwd )"
  [[ "$FROM" != "$DST" ]] || { echo "clone-db: source and target are the same checkout"; exit 1; }
  src_prefix="wp_"
  LABEL="$FROM"
else
  echo "clone-db: DOKAN_CLONE_DB_FROM must be a wp-env checkout dir or a wp-config.php path: $FROM"; exit 1
fi

if [[ "$FORCE" == 0 ]] && [[ "$( dst_wp option get "$MARKER" 2>/dev/null | tr -d '\r' || true )" == "$LABEL" ]]; then
  echo "clone-db: already cloned from $LABEL (use --force to re-clone)"
  exit 0
fi

# Target URL, read before the import overwrites it. wp-env installs with the
# configured WP_SITEURL, so the stored home is the target's real address.
dst_url="$( dst_wp option get home 2>/dev/null | tr -d '\r' )"
[[ -n "$dst_url" ]] || { echo "clone-db: could not read the target site URL"; exit 1; }

# --- source-specific: how to dump, and the source's home URL ----------------------
if [[ "$MODE" == wpenv ]]; then
  src_db="$( hash_of "$FROM/.wp-env.json" )-mysql-1"
  docker ps --format '{{.Names}}' | grep -qx "$src_db" \
    || { echo "clone-db: source environment is not running — run 'npx wp-env start' in $FROM first"; exit 1; }
  src_url="$( docker exec "$src_db" mariadb -uroot -ppassword -N -B wordpress \
                -e "SELECT option_value FROM wp_options WHERE option_name='home'" 2>/dev/null )"
  dump() { docker exec "$src_db" mariadb-dump -uroot -ppassword --single-transaction wordpress; }
else
  [[ -n "$src_name" && -n "$src_user" ]] || { echo "clone-db: need DB name and user (DOKAN_CLONE_DB_NAME/USER or a readable wp-config.php)"; exit 1; }
  src_prefix="${src_prefix:-wp_}"; src_port="${src_port:-3306}"
  # 'localhost' means a socket to the MySQL client; this script runs on the host, so use TCP.
  [[ -n "$src_host" && "$src_host" != localhost ]] || src_host=127.0.0.1

  DUMP_BIN="$( command -v mysqldump || command -v mariadb-dump || true )"
  CLI_BIN="$( command -v mysql || command -v mariadb || true )"
  [[ -n "$DUMP_BIN" && -n "$CLI_BIN" ]] || { echo "clone-db: need mysqldump/mysql (or mariadb-dump/mariadb) on the host"; exit 1; }

  export MYSQL_PWD="$src_pass"
  src_url="$( "$CLI_BIN" -h"$src_host" -P"$src_port" -u"$src_user" -N -B "$src_name" \
                -e "SELECT option_value FROM ${src_prefix}options WHERE option_name='home'" 2>/dev/null )"
  dump() {
    # --set-gtid-purged is MySQL-only; mariadb-dump rejects it.
    local extra=(); "$DUMP_BIN" --help 2>/dev/null | grep -q -- '--set-gtid-purged' && extra=(--set-gtid-purged=OFF)
    "$DUMP_BIN" -h"$src_host" -P"$src_port" -u"$src_user" --single-transaction --no-tablespaces ${extra[@]+"${extra[@]}"} "$src_name"
  }
fi
[[ -n "$src_url" ]] || { echo "clone-db: could not read the source site URL from $LABEL (connection or credentials?)"; exit 1; }

echo "clone-db: streaming $LABEL → $DST"
dump | docker exec -i "$dst_db" mariadb -uroot -ppassword wordpress

# A source with a different table prefix needs the target to use it too.
if [[ "$src_prefix" != "wp_" ]]; then
  echo "clone-db: setting table_prefix to $src_prefix"
  dst_wp config set table_prefix "$src_prefix" --type=variable --quiet
fi

if [[ "$src_url" != "$dst_url" ]]; then
  echo "clone-db: rewriting $src_url → $dst_url"
  dst_wp search-replace "$src_url" "$dst_url" --all-tables --quiet
fi

# The source's active_plugins names plugins by ITS folder names (e.g.
# dokan-lite/dokan.php); here lite is mounted as dokan/. Re-activate what this
# environment actually mounts so the site comes up working. Plugins must load
# for this step (no --skip-plugins): Dokan's activation hook needs WooCommerce.
mounted="$( dst_wp plugin list --field=name 2>/dev/null | tr -d '\r' )"
for p in woocommerce dokan dokan-pro; do
  grep -qx "$p" <<<"$mounted" && docker exec "$dst_cli" wp plugin activate "$p" --quiet
done

dst_wp option update "$MARKER" "$LABEL" --autoload=no --quiet
echo "clone-db: done — $dst_url now has the data from $LABEL"
