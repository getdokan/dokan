#!/usr/bin/env python3
"""Generate graphify-out/hook-view.html — an interactive view of ALL WordPress
hook nodes in the merged graph, with their firing sources (do_action /
apply_filters call sites) and consumers (add_action / add_filter callbacks).

Layout is precomputed here (spring for the giant component, radial stars for
the small ones, shelf-packed) so the browser renders 14k nodes with physics off.

Usage: python3 bin/graphify/wp_hook_view.py  (from dokan-lite root)
"""
import json
import math
import html
from pathlib import Path

import networkx as nx

OUT = Path("graphify-out")
GRAPH = OUT / "graph.json"

REPO_COLORS = {
    "dokan-lite": "#4E79A7",
    "dokan-pro": "#59A14F",
    "woocommerce": "#E15759",
}
HOOK_COLOR = "#EDC948"
OTHER_COLOR = "#9AA0A6"
REL_COLORS = {
    "fires": "#E15759",
    "handled_by": "#76B7B2",
    "registered_in": "#8A8A9E",
    "fires_and_handles": "#B07AA1",
}


def load_subgraph():
    data = json.loads(GRAPH.read_text(encoding="utf-8"))
    all_edges = data.get("edges") or data.get("links")
    node_by_id = {str(n["id"]): n for n in data["nodes"]}

    edges = []
    node_ids = set()
    for e in all_edges:
        s, t = str(e["source"]), str(e["target"])
        if s.startswith("hook::") or t.startswith("hook::"):
            edges.append(e)
            node_ids.add(s)
            node_ids.add(t)
    nodes = {nid: node_by_id.get(nid, {"id": nid, "label": nid}) for nid in node_ids}
    return nodes, edges


def star_layout(G, comp):
    """Radial layout for a small component: highest-degree node centered."""
    order = sorted(comp, key=lambda n: G.degree(n), reverse=True)
    pos = {order[0]: (0.0, 0.0)}
    rest = order[1:]
    ring, placed, radius = 1, 0, 0.0
    i = 0
    while i < len(rest):
        cap = 10 * ring
        radius = 70.0 * ring
        ring_nodes = rest[i : i + cap]
        for j, n in enumerate(ring_nodes):
            a = 2 * math.pi * j / len(ring_nodes) + 0.5 * ring
            pos[n] = (radius * math.cos(a), radius * math.sin(a))
        i += cap
        ring += 1
    return pos, radius + 70.0


def compute_layout(nodes, edges):
    G = nx.Graph()
    G.add_nodes_from(nodes)
    for e in edges:
        G.add_edge(str(e["source"]), str(e["target"]))

    comps = sorted(nx.connected_components(G), key=len, reverse=True)
    blocks = []  # (radius, {node: (x,y)})
    for comp in comps:
        if len(comp) == 1:
            blocks.append((40.0, {next(iter(comp)): (0.0, 0.0)}))
        elif len(comp) > 300:
            sub = G.subgraph(comp)
            p = nx.spring_layout(sub, seed=42, iterations=50)
            scale = 42.0 * math.sqrt(len(comp))
            pos = {n: (x * scale, y * scale) for n, (x, y) in p.items()}
            blocks.append((scale + 80.0, pos))
        else:
            pos, r = star_layout(G, comp)
            blocks.append((r, pos))

    # Shelf-pack blocks left-to-right in rows, targeting a roughly square canvas.
    blocks.sort(key=lambda b: b[0], reverse=True)
    total_area = sum((2 * r) ** 2 for r, _ in blocks)
    row_width = max(2.2 * blocks[0][0], math.sqrt(total_area) * 1.15) if blocks else 4000.0
    final = {}
    x_cursor, y_cursor, row_h = 0.0, 0.0, 0.0
    pad = 120.0
    for r, pos in blocks:
        w = 2 * r
        if x_cursor + w > row_width and x_cursor > 0:
            x_cursor = 0.0
            y_cursor += row_h + pad
            row_h = 0.0
        cx, cy = x_cursor + r, y_cursor + r
        for n, (x, y) in pos.items():
            final[n] = (round(x + cx, 1), round(y + cy, 1))
        x_cursor += w + pad
        row_h = max(row_h, 2 * r)
    return final


def build_payload(nodes, edges, pos):
    G_deg = {}
    for e in edges:
        for nid in (str(e["source"]), str(e["target"])):
            G_deg[nid] = G_deg.get(nid, 0) + 1

    out_nodes = []
    for nid, n in nodes.items():
        is_hook = nid.startswith("hook::")
        repo = "hook" if is_hook else (n.get("repo") or nid.split("::")[0])
        deg = G_deg.get(nid, 1)
        x, y = pos[nid]
        out_nodes.append({
            "id": nid,
            "label": n.get("label", nid),
            "x": x,
            "y": y,
            "group": repo,
            "size": (7 + 2.2 * math.sqrt(deg)) if is_hook else 5,
            "file": n.get("source_file", ""),
            "community": n.get("community_name", ""),
        })

    out_edges = []
    for e in edges:
        out_edges.append({
            "from": str(e["source"]),
            "to": str(e["target"]),
            "rel": e.get("relation", ""),
            "loc": f"{e.get('source_file', '')} {e.get('source_location', '')}".strip(),
            "conf": e.get("confidence", ""),
        })
    return out_nodes, out_edges


def render_html(out_nodes, out_edges):
    n_hooks = sum(1 for n in out_nodes if n["group"] == "hook")
    stats = f"{len(out_nodes):,} nodes ({n_hooks:,} hooks) · {len(out_edges):,} edges"
    tpl = Path(__file__).with_name("wp_hook_view.tpl.html").read_text(encoding="utf-8")
    return (
        tpl.replace("__NODES__", json.dumps(out_nodes, ensure_ascii=False))
        .replace("__EDGES__", json.dumps(out_edges, ensure_ascii=False))
        .replace("__REPO_COLORS__", json.dumps({**REPO_COLORS, "hook": HOOK_COLOR, "other": OTHER_COLOR}))
        .replace("__REL_COLORS__", json.dumps(REL_COLORS))
        .replace("__STATS__", html.escape(stats))
    )


def main():
    nodes, edges = load_subgraph()
    print(f"hook subgraph: {len(nodes)} nodes, {len(edges)} edges")
    pos = compute_layout(nodes, edges)
    out_nodes, out_edges = build_payload(nodes, edges, pos)
    (OUT / "hook-view.html").write_text(render_html(out_nodes, out_edges), encoding="utf-8")
    print(f"wrote {OUT / 'hook-view.html'}")


if __name__ == "__main__":
    main()
