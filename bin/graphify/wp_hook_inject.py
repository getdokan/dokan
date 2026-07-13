"""Inject WordPress hook nodes/edges into the merged graphify graph.json.

Hook nodes are shared (unprefixed `hook::<name>` ids) so they bridge repos.

Edge orientation is CANONICAL: every hook edge is stored function -> hook,
regardless of relation. The graph is undirected downstream (merge-graphs and
postprocess both coerce to a simple nx.Graph, which canonicalizes endpoint
order), so stored orientation cannot carry meaning — the relation name does:
  fires             the function calls do_action/apply_filters for the hook
  handled_by        the function is registered as the hook's callback
  registered_in     registration site when the callback is unresolvable
  fires_and_handles the same function both fires and handles the hook
The canonical orientation also makes (fn, hook) a stable aggregation key, so
a function that both fires and handles a hook is merged here instead of being
destructively collapsed by networkx's simple-graph edge dedup.
Dynamic (interpolated) hook names are tagged AMBIGUOUS.
"""
import json
import sys
from collections import defaultdict
from pathlib import Path


def main():
    graph_path = Path(sys.argv[1])
    hooks_path = Path(sys.argv[2])
    g = json.loads(graph_path.read_text())
    hooks = json.loads(hooks_path.read_text())["records"]

    nodes = g["nodes"]
    links = g["links"]

    # --- indices over existing nodes ---
    by_file_label = {}   # (repo, source_file, label) -> id
    file_node = {}       # (repo, source_file) -> id
    class_files = defaultdict(list)   # (repo, Class) -> [source_file]
    func_label = defaultdict(list)    # (repo, 'name()') -> [id]
    method_label_repo = defaultdict(list)  # (repo, '.m()') -> [(id, source_file)]
    for n in nodes:
        repo, sf, lb = n.get("repo"), n.get("source_file"), n.get("label")
        if not repo or not sf or not lb:
            continue
        by_file_label[(repo, sf, lb)] = n["id"]
        base = sf.rsplit("/", 1)[-1]
        if lb == base:
            file_node[(repo, sf)] = n["id"]
        elif lb.startswith(".") and lb.endswith("()"):
            method_label_repo[(repo, lb)].append((n["id"], sf))
        elif lb.endswith("()"):
            func_label[(repo, lb)].append(n["id"])
        elif lb[:1].isalpha() and "(" not in lb and "." not in lb:
            class_files[(repo, lb)].append(sf)

    repos = ["dokan-lite", "dokan-pro", "woocommerce"]
    stats = defaultdict(int)

    def resolve_scope(r):
        """Node for the code location containing this call."""
        repo, f, cls, fn = r["repo"], r["file"], r["class"], r["function"]
        if fn:
            for lb in ((f".{fn}()", f"{fn}()") if cls else (f"{fn}()", f".{fn}()")):
                nid = by_file_label.get((repo, f, lb))
                if nid:
                    return nid
        nid = file_node.get((repo, f))
        if nid:
            return nid
        stats["scope_unresolved"] += 1
        return None

    def resolve_method(repo, cls, meth, same_file=None):
        lb = f".{meth}()"
        if same_file:
            nid = by_file_label.get((repo, same_file, lb))
            if nid:
                return nid, "EXTRACTED"
        if cls:
            for rp in [repo] + [x for x in repos if x != repo]:
                for sf in class_files.get((rp, cls), []):
                    nid = by_file_label.get((rp, sf, lb))
                    if nid:
                        return nid, "EXTRACTED"
        cands = method_label_repo.get((repo, lb), [])
        if len(cands) == 1:
            return cands[0][0], "AMBIGUOUS"
        return None, None

    def resolve_callback(r):
        """(node_id, confidence) for the handler, or (None, None)."""
        cb = r.get("callback") or {"type": "unknown"}
        repo, f = r["repo"], r["file"]
        t = cb["type"]
        if t == "method":
            return resolve_method(repo, cb.get("class"), cb["method"], same_file=f)
        if t == "static":
            return resolve_method(repo, cb.get("class"), cb["method"])
        if t == "function":
            lb = cb["name"] + "()"
            for rp in [repo] + [x for x in repos if x != repo]:
                ids = func_label.get((rp, lb), [])
                if len(ids) == 1:
                    return ids[0], "EXTRACTED" if rp == repo else "AMBIGUOUS"
                if len(ids) > 1:
                    return ids[0], "AMBIGUOUS"
            return None, None
        if t in ("instance_var", "expr_instance"):
            return resolve_method(repo, None, cb["method"], same_file=f)
        if t == "closure":
            nid = resolve_scope(r)
            return (nid, "EXTRACTED") if nid else (None, None)
        return None, None

    # --- build hook nodes and aggregated edges ---
    hook_nodes = {}          # hook name -> node dict
    agg = {}                 # (src, tgt) -> edge dict

    def hook_id(name):
        return f"hook::{name}"

    def touch_hook(name, kind, dynamic):
        h = hook_nodes.get(name)
        if h is None:
            h = {
                "id": hook_id(name), "label": name, "type": "hook",
                "file_type": "code", "_origin": "wp-hook-pass",
                "hook_kind": kind, "repo": "hooks", "local_id": name,
            }
            if dynamic:
                h["dynamic"] = True
                h["confidence"] = "AMBIGUOUS"
            hook_nodes[name] = h
        elif h["hook_kind"] != kind:
            h["hook_kind"] = "mixed"
        return h["id"]

    CONF_RANK = {"AMBIGUOUS": 0, "INFERRED": 1, "EXTRACTED": 2}

    def add_edge(src, tgt, relation, context, confidence, r):
        key = (src, tgt)
        e = agg.get(key)
        if e is None:
            agg[key] = {
                "source": src, "target": tgt, "relation": relation,
                "context": context, "confidence": confidence,
                "source_file": f"{r['repo']}/{r['file']}",
                "source_location": f"L{r['line']}", "weight": 1.0,
            }
        else:
            e["weight"] += 1.0
            if e["relation"] != relation and e["relation"] != "fires_and_handles":
                e["relation"] = "fires_and_handles"
                stats["relation_merged"] += 1
            # keep the strongest confidence, and move provenance with it so
            # the surviving file:line points at the best-evidenced record
            if CONF_RANK[confidence] > CONF_RANK[e["confidence"]]:
                e["confidence"] = confidence
                e["context"] = context
                e["source_file"] = f"{r['repo']}/{r['file']}"
                e["source_location"] = f"L{r['line']}"
        stats[relation] += 1

    for r in hooks:
        if not r.get("hook"):
            stats["skipped_fully_dynamic"] += 1
            continue
        kind = "filter" if "filter" in r["api"] else "action"
        conf = "AMBIGUOUS" if r["dynamic"] else "EXTRACTED"
        hid = touch_hook(r["hook"], kind, r["dynamic"])
        if r["kind"] == "fire":
            src = resolve_scope(r)
            if src:
                add_edge(src, hid, "fires", r["api"], conf, r)
            else:
                stats["fire_dropped_no_scope"] += 1
        else:
            cb_node, cb_conf = resolve_callback(r)
            if cb_node:
                ctx = r["api"] + (":closure" if (r.get("callback") or {}).get("type") == "closure" else "")
                add_edge(cb_node, hid, "handled_by", ctx,
                         "AMBIGUOUS" if (r["dynamic"] or cb_conf == "AMBIGUOUS") else "EXTRACTED", r)
            else:
                site = resolve_scope(r)
                stats["callback_unresolved"] += 1
                if site:
                    add_edge(site, hid, "registered_in", r["api"], "AMBIGUOUS", r)

    # cross-repo bridge stats (all edges are function -> hook)
    fire_repos, listen_repos = defaultdict(set), defaultdict(set)
    for (src, tgt), e in agg.items():
        repo = src.split("::", 1)[0]
        if e["relation"] in ("fires", "fires_and_handles"):
            fire_repos[tgt].add(repo)
        if e["relation"] in ("handled_by", "registered_in", "fires_and_handles"):
            listen_repos[tgt].add(repo)
    bridges = [h for h in hook_nodes.values()
               if fire_repos.get(h["id"]) and listen_repos.get(h["id"])
               and (fire_repos[h["id"]] | listen_repos[h["id"]]) - fire_repos[h["id"]]]

    existing_ids = {n["id"] for n in nodes}
    new_nodes = [h for h in hook_nodes.values() if h["id"] not in existing_ids]
    nodes.extend(new_nodes)
    links.extend(agg.values())

    graph_path.write_text(json.dumps(g))
    print(f"Injected {len(new_nodes)} hook nodes, {len(agg)} edges "
          f"(fires {stats['fires']}, handled_by {stats['handled_by']}, registered_in {stats['registered_in']})")
    print(f"Unresolved: {stats['callback_unresolved']} callbacks, {stats['scope_unresolved']} scopes, "
          f"{stats['skipped_fully_dynamic']} fully-dynamic skipped, {stats['relation_merged']} relation-merged")
    print(f"Cross-repo bridge hooks (fired in one repo, handled in another): {len(bridges)}")
    print(f"Graph now: {len(nodes)} nodes, {len(links)} links")


if __name__ == "__main__":
    main()
