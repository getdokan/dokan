# Cross-repo knowledge graph (dokan-lite + dokan-pro + woocommerce)

Developer tooling that builds a queryable knowledge graph of the three
codebases with **WordPress hooks as first-class nodes** — so questions like
"which Dokan handlers react to `woocommerce_new_order`?" become graph lookups
instead of grep archaeology.

## Setup (once)

```bash
uv tool install graphifyy        # or: pip install graphifyy
```

No API key required — extraction is pure AST (tree-sitter), zero LLM cost.

## Build

```bash
# from dokan-lite root, with dokan-pro and woocommerce as sibling plugin dirs
bash bin/graphify/rebuild-graph.sh
```

Takes ~3–5 minutes (subsequent runs are faster — extraction is cached).
Everything lands in `graphify-out/` (gitignored, ~100 MB):

| Output            | What it is                                            |
| ----------------- | ----------------------------------------------------- |
| `graph.json`      | the merged graph (~57k nodes, ~108k edges)            |
| `graph.html`      | interactive visualization (community-aggregated)      |
| `GRAPH_REPORT.md` | audit report: god nodes, communities, ambiguous edges |
| `hooks.json`      | raw hook scan (every fire/registration with location) |
| `hook-view.html`  | all-hooks viewer (see below)                          |

## All-hooks viewer

```bash
# one-time: the layout step needs scipy in graphify's env
uv pip install --python "$(cat graphify-out/.graphify_python)" scipy

python3 bin/graphify/wp_hook_view.py    # writes graphify-out/hook-view.html
```

Renders every `hook::` node (~6k hooks, ~14k nodes) with its firing call
sites and consumers. Layout is precomputed in Python (spring layout for the
giant connected component, shelf-packed radial stars for the rest) so the
browser runs with physics off. Sidebar: search, per-hook **Fired from /
Consumed by** lists with `file:line`, repo & edge-type filters, and a
"hooks with both firers & consumers" toggle. Template lives in
`wp_hook_view.tpl.html`. Note the edge convention: `handled_by` /
`registered_in` are stored function→hook, the same direction as `fires`.

## Query

```bash
graphify explain "woocommerce_add_to_cart_validation"   # who fires/handles a hook
graphify query "how does dokan pro extend commission?"  # BFS over the graph
graphify path "WC_Order" "OrderCache"                   # shortest path between symbols
```

## How it works

1. **Per-plugin AST extraction** (`graphify extract --code-only`) — classes,
   functions, methods, calls, imports. `.graphifyignore` files (written by the
   script) scope extraction to first-party source.
2. **Merge** — node IDs get repo prefixes (`dokan-lite::`, `woocommerce::`, …).
3. **Hook pass** (`wp_hook_scan.py` + `wp_hook_inject.py`) — tree-sitter scan
   for `do_action`/`apply_filters` (fires) and `add_action`/`add_filter`
   (registrations), injected as shared `hook::<name>` nodes with
   `fires`/`handled_by` edges. This is what stock graphify can't see: hook
   names and callbacks are string arguments, invisible to call-graph analysis.
   Dynamic hook names (`"dokan_{$status}_order"`) are kept as templates and
   tagged `AMBIGUOUS`; unresolvable callbacks get `registered_in` edges.
4. **Post-process** (`postprocess.py`) — repo-qualified source paths,
   Louvain clustering, deterministic community labels
   (`<repo>: <dir> · <top member>`), report generation.

## Caveats

- **Don't run `graphify update`** on the merged graph — the incremental flow
  doesn't understand repo prefixes or hook nodes. Re-run the script instead.
- The graph is a snapshot; small code drift is harmless, but rebuild after
  big merges or a WooCommerce update.
- Hook edges are static analysis: `remove_action`, conditional registration,
  and priorities are not modeled.
