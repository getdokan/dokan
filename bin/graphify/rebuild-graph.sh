#!/usr/bin/env bash
# Rebuild the cross-repo knowledge graph (dokan-lite + dokan-pro + woocommerce)
# with WordPress hooks as first-class nodes. See README.md in this directory.
#
# Prerequisites:
#   - graphify installed:  uv tool install graphifyy   (or: pip install graphifyy)
#   - dokan-pro and woocommerce as sibling dirs under wp-content/plugins/
#
# Usage (from dokan-lite root):  bash bin/graphify/rebuild-graph.sh
# Takes ~3-5 min. No API key needed (AST extraction only).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LITE="$(cd "$SCRIPT_DIR/../.." && pwd)"               # dokan-lite root
PLUGINS="$(dirname "$LITE")"
PRO="$PLUGINS/dokan-pro"
WOO="$PLUGINS/woocommerce"
OUT="$LITE/graphify-out"

for d in "$PRO" "$WOO"; do
  [ -d "$d" ] || { echo "missing sibling plugin: $d" >&2; exit 1; }
done
mkdir -p "$OUT"

# Resolve the python interpreter graphify runs on (has tree-sitter-php).
PYTHON="$(cat "$OUT/.graphify_python" 2>/dev/null || true)"
if [ -z "$PYTHON" ] || ! "$PYTHON" -c 'import graphify' 2>/dev/null; then
  PYTHON="$(uv tool run --from graphifyy python -c 'import sys; print(sys.executable)' 2>/dev/null)" \
    || { echo 'graphify not installed: uv tool install graphifyy' >&2; exit 1; }
  echo "$PYTHON" > "$OUT/.graphify_python"
fi

# .graphifyignore per plugin scopes extraction to first-party source.
cat > "$LITE/.graphifyignore" <<'EOF'
vendor/
lib/
node_modules/
assets/
languages/
tests/
bin/
docs/
*.min.js
*.asset.php
EOF
cat > "$PRO/.graphifyignore" <<'EOF'
vendor/
dependencies/
node_modules/
assets/
dist/
build/
languages/
tests/
docs/
*.min.js
*.asset.php
EOF
cat > "$WOO/.graphifyignore" <<'EOF'
vendor/
lib/
node_modules/
assets/
i18n/
sample-data/
*.min.js
*.asset.php
EOF

echo '== 1/5 per-plugin AST extraction (cached: fast on re-runs) =='
# dokan-lite's graph.json holds the MERGED cross-repo graph after a previous
# run. Restore the solo graph first, or incremental extraction keeps the
# merged one and the merge below double-counts dokan-pro/woocommerce.
if [ -f "$OUT/graph.dokan-lite-solo.json" ]; then
  cp "$OUT/graph.dokan-lite-solo.json" "$OUT/graph.json"
fi
for d in "$LITE" "$PRO" "$WOO"; do
  (cd "$d" && graphify extract . --code-only --no-cluster | tail -1)
done
# Refuse to treat an already-merged graph as the solo backup (repo-prefixed ids).
"$PYTHON" - <<EOF
import json, sys
d = json.loads(open("$OUT/graph.json").read())
if any('::' in str(n.get('id', '')) for n in d['nodes'][:200]):
    sys.exit("ERROR: dokan-lite graph.json contains repo-prefixed ids (already merged). "
             "Delete graphify-out/graph.json and graph.dokan-lite-solo.json, then re-run.")
EOF
cp "$OUT/graph.json" "$OUT/graph.dokan-lite-solo.json"

echo '== 2/5 merge =='
graphify merge-graphs \
  "$OUT/graph.dokan-lite-solo.json" \
  "$PRO/graphify-out/graph.json" \
  "$WOO/graphify-out/graph.json" \
  --out "$OUT/graph.json"

echo '== 3/5 WordPress hook scan =='
"$PYTHON" - <<EOF
import json; json.dump({"dokan-lite": "$LITE", "dokan-pro": "$PRO", "woocommerce": "$WOO"}, open("$OUT/plugins.json", "w"))
EOF
"$PYTHON" "$SCRIPT_DIR/wp_hook_scan.py" "$OUT/plugins.json" "$OUT/hooks.json"

echo '== 4/5 inject hook nodes/edges =='
"$PYTHON" "$SCRIPT_DIR/wp_hook_inject.py" "$OUT/graph.json" "$OUT/hooks.json"

echo '== 5/5 cluster + label + report + html =='
"$PYTHON" "$SCRIPT_DIR/postprocess.py" "$OUT/graph.json" "$OUT"
(cd "$LITE" && graphify export html | tail -1)

echo "Done. Open $OUT/graph.html, or query with: graphify query \"...\""
