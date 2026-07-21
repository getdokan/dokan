#!/usr/bin/env python3
"""
Inject the settings overlay into graphify-out/graph.json.

settings.json + chains.toml are the source of truth; the nodes this writes into graph.json
are a CACHED VIEW of them, stamped with the commit they were built from. Exactly the
relationship hooks.json has with the hook:: nodes. Re-run it whenever the base graph is
rebuilt; the sidecar stays fresh on its own.

WHY THIS EXISTS AT ALL
graph.json has 57k nodes and a real call graph, but zero settings — because a setting's
identity lives in a string literal argument, and AST extraction discards those. So all 549
read sites collapse onto one dokan_get_option node with no field identity.

More importantly, the merged "cross-repo" graph is not merged at the code level: the only
edges that cross a repo boundary are * -> hook. There are no dokan-pro -> dokan-lite code
edges at all. So "what depends on dokan_selling.admin_percentage?" answers from Lite alone
and silently omits Pro, which holds 352 of 592 read sites.

setting:: nodes fix that the same way hook:: nodes did — a shared string namespace both
repos point into. This pass is the second cross-repo bridge the graph has.

Node classes (vocabulary per CONTEXT.md — Source, Source chain, Defer):
    setting::<section>.<field>   a normalized settings address
    store::<kind>.<key>          a meta key reachable from a Source chain
    chain::<id>                  a Source chain
    source::<chain>.<source>     one Source within a chain

Run:  bin/graph/merge_settings.py [--dry-run] [--force]
"""

import argparse
import bisect
import json
import pathlib
import shutil
import subprocess
import sys
import tomllib
from collections import Counter, defaultdict

HERE = pathlib.Path(__file__).resolve()
LITE = HERE.parent.parent.parent
OUT = LITE / "graphify-out"
GRAPH = OUT / "graph.json"
SETTINGS = OUT / "settings.json"
CHAINS = HERE.parent / "chains.toml"

ORIGIN = "wp-settings-pass"


def git_head():
    try:
        return subprocess.run(
            ["git", "-C", str(LITE), "rev-parse", "HEAD"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except Exception:
        return None


def build_line_index(nodes):
    """source_file -> sorted [(line, node_id)], for resolving a call site to its enclosing node.

    The hook pass binds each `fires` edge to the enclosing function node rather than to the
    file, so read/write edges do the same: the nearest definition at or above the call line.
    """
    idx = defaultdict(list)
    for n in nodes:
        sf = n.get("source_file")
        loc = n.get("source_location") or ""
        if not sf or not loc.startswith("L"):
            continue
        try:
            idx[sf].append((int(loc[1:]), n["id"]))
        except ValueError:
            continue
    for sf in idx:
        idx[sf].sort()
    return idx


def enclosing_node(idx, repo, file, line):
    sf = f"{repo}/{file}"
    entries = idx.get(sf)
    if not entries:
        return None
    lines = [e[0] for e in entries]
    i = bisect.bisect_right(lines, line) - 1
    return entries[i][1] if i >= 0 else None


def mknode(nid, label, ntype, **extra):
    return {
        "id": nid,
        "label": label,
        "norm_label": label,
        "type": ntype,
        "file_type": "code",
        "_origin": ORIGIN,
        "repo": "settings",
        "local_id": nid.split("::", 1)[1],
        **extra,
    }


def mkedge(source, target, relation, context, src_file=None, line=None, **extra):
    e = {
        "relation": relation,
        "context": context,
        "confidence": extra.pop("confidence", "EXTRACTED"),
        "weight": 1.0,
        "source": source,
        "target": target,
        "confidence_score": extra.pop("confidence_score", 1.0),
    }
    if src_file:
        e["source_file"] = src_file
    if line:
        e["source_location"] = f"L{line}"
    e.update(extra)
    return e


def main():
    ap = argparse.ArgumentParser(description="Inject the settings overlay into graph.json")
    ap.add_argument("--dry-run", action="store_true", help="report, write nothing")
    ap.add_argument("--force", action="store_true", help="bypass the shrink guard")
    args = ap.parse_args()

    for p in (GRAPH, SETTINGS):
        if not p.exists():
            sys.exit(f"missing {p} — run bin/graph/settings_scan.py first")

    graph = json.loads(GRAPH.read_text())
    data = json.loads(SETTINGS.read_text())
    chains = tomllib.loads(CHAINS.read_text()) if CHAINS.exists() else {"chain": []}
    labels = chains.get("labels", {})

    # setting -> discrepancies, so a node can be flagged where it is defined rather than
    # requiring every consumer to re-derive "is this setting one of the broken ones".
    disc_by_setting = {}
    for d in data.get("discrepancies", []):
        if d.get("setting"):
            disc_by_setting.setdefault(d["setting"], []).append(d)

    before_nodes = len(graph["nodes"])

    # Idempotent: drop any previous pass output before re-adding. Without this a re-run
    # duplicates every node and edge.
    graph["nodes"] = [n for n in graph["nodes"] if n.get("_origin") != ORIGIN]
    graph["links"] = [l for l in graph["links"] if l.get("_origin") != ORIGIN]
    base_nodes = len(graph["nodes"])

    idx = build_line_index(graph["nodes"])
    new_nodes, new_edges = {}, []
    stats = Counter()

    def label_for(nid, default):
        # id is the address (a fact); label is the canonical domain term (the glossary's
        # job). CONTEXT.md's _Avoid_ list governs prose and labels, not physical db keys —
        # so setting::dokan_selling.commission_type is labelled "Commission formula (global)".
        return labels.get(nid.split("::", 1)[1], default)

    def ensure(nid, label, ntype, **extra):
        if nid not in new_nodes:
            key = nid.split("::", 1)[1]
            ds = disc_by_setting.get(key, [])
            if ds:
                extra["discrepancies"] = [
                    {"type": d.get("type"), "severity": d.get("severity"),
                     "summary": " ".join(str(d.get("summary", "")).split())}
                    for d in ds
                ]
                extra["max_severity"] = (
                    "high" if any(d.get("severity") == "high" for d in ds) else "medium"
                )
            new_nodes[nid] = mknode(nid, label_for(nid, label), ntype, **extra)
        return nid

    # ---------------------------------------------------------------- setting/store nodes
    for r in data["records"]:
        if r.get("dynamic"):
            stats["ambiguous_skipped"] += 1
            continue

        if r.get("setting"):
            nid = ensure(
                f"setting::{r['setting']}", r["field"], "setting",
                section=r["section"], field=r["field"],
            )
        elif r.get("store"):
            nid = ensure(f"store::{r['store']}", r["key"], "store",
                         store_kind=r["store"].split(".", 1)[0], key=r["key"])
        elif r.get("whole_row"):
            nid = ensure(f"setting::{r['section']}", r["section"], "settings_row",
                         section=r["section"], whole_row=True)
        else:
            continue

        src = enclosing_node(idx, r["repo"], r["file"], r["line"])
        if src is None:
            stats["unbound_call_site"] += 1
            continue

        # `triggers` runs setting -> callback, the opposite direction to `reads`. Nothing here
        # consults the value; the callback reacts to the WRITE. Saving
        # dokan_selling.allow_vendor_create_manual_order grants a role capability that gates
        # seven REST controllers and is never revoked. No read edge can express that.
        if r["kind"] == "side_effect":
            new_edges.append(
                mkedge(nid, src, "triggers", r["api"],
                       src_file=f"{r['repo']}/{r['file']}", line=r["line"],
                       confidence=r.get("confidence", "EXTRACTED"), _origin=ORIGIN)
            )
            stats["edge_triggers"] += 1
            continue

        rel = "reads" if r["kind"].endswith("read") else "writes"
        new_edges.append(
            mkedge(src, nid, rel, r["api"],
                   src_file=f"{r['repo']}/{r['file']}", line=r["line"], _origin=ORIGIN)
        )
        stats[f"edge_{rel}"] += 1

    # Settings that are declared but never read still deserve a node — a dead setting you
    # cannot see is a dead setting nobody deletes.
    for d in data.get("definitions", []):
        nid = ensure(f"setting::{d['setting']}", d["field"], "setting",
                     section=d["section"], field=d["field"])
        src = enclosing_node(idx, d["repo"], d["file"], d["line"])
        if src:
            new_edges.append(
                mkedge(src, nid, "declares", "settings_fields",
                       src_file=f"{d['repo']}/{d['file']}", line=d["line"], _origin=ORIGIN)
            )
            stats["edge_declares"] += 1

    # ------------------------------------------------------------------ Source chain nodes
    for chain in chains.get("chain", []):
        cid = ensure(f"chain::{chain['id']}", chain.get("label", chain["id"]), "chain",
                     resolver=chain.get("resolver"),
                     defer_predicate=chain.get("defer_predicate"),
                     repo_of_origin=chain.get("repo"),
                     writes_back_on_miss=chain.get("writes_back_on_miss", False))

        levels = sorted(chain.get("level", []), key=lambda l: l["rank"])
        prev = None
        for lv in levels:
            sid = ensure(
                f"source::{chain['id']}.{lv['source']}",
                f"{chain.get('label', chain['id'])}: {lv['source']}",
                "source",
                rank=lv["rank"], source=lv["source"], defer=lv.get("defer"),
                anchor=lv.get("anchor"),
            )
            # rank is on the edge as well as the node: a query walking chain -> sources
            # needs the order without re-sorting.
            new_edges.append(
                mkedge(cid, sid, "resolves_through", f"rank {lv['rank']}",
                       rank=lv["rank"], _origin=ORIGIN)
            )
            if prev is not None:
                new_edges.append(
                    mkedge(prev, sid, "defers_to", lv.get("defer") or "defer",
                           _origin=ORIGIN)
                )
            prev = sid
            stats["source"] += 1

            # What backs this Source. Both are "the value lives here", but a setting and a
            # meta key are different node classes, so the edge is the same and the target
            # differs.
            for key in ([lv["setting"]] if lv.get("setting") else []) + lv.get("also_settings", []):
                tid = ensure(f"setting::{key}", key.split(".", 1)[1], "setting",
                             section=key.split(".", 1)[0], field=key.split(".", 1)[1])
                new_edges.append(mkedge(sid, tid, "backed_by", "global source", _origin=ORIGIN))
            for key in ([lv["store"]] if lv.get("store") else []) + lv.get("also", []):
                if not key:
                    continue
                tid = ensure(f"store::{key}", key.split(".", 1)[1], "store",
                             store_kind=key.split(".", 1)[0], key=key.split(".", 1)[1])
                new_edges.append(mkedge(sid, tid, "backed_by", "meta source", _origin=ORIGIN))

            # A gate is a setting that can switch a whole Source off — usually from an
            # unrelated section, which is exactly why nobody finds it by reading the chain.
            # dokan_product_subscription.enable_pricing disables manual_order's pack Source.
            # It is not part of the chain and it does not supply a value, so it is neither a
            # Source nor backed_by; it needs its own edge or the impact is invisible.
            if lv.get("gate_setting"):
                gk = lv["gate_setting"]
                gid = ensure(f"setting::{gk}", gk.split(".", 1)[1], "setting",
                             section=gk.split(".", 1)[0], field=gk.split(".", 1)[1])
                new_edges.append(
                    mkedge(gid, sid, "gates", "disables this Source when off",
                           confidence="DECLARED", _origin=ORIGIN)
                )
                stats["gates"] += 1

        # The write-ins. These are why chains.toml is hand-curated: the subscription module
        # rewrites commission's vendor Source through $vendor->save_commission_settings(),
        # a domain method no meta-key scanner would ever see.
        for w in chain.get("written_by", []):
            tid = ensure(f"store::{w['store']}", w["store"].split(".", 1)[1], "store",
                         store_kind=w["store"].split(".", 1)[0])
            anchor = w.get("anchor", "")
            repo, _, rest = anchor.partition("/")
            file, _, line = rest.rpartition(":")
            src = enclosing_node(idx, repo, file, int(line)) if line.isdigit() else None
            new_edges.append(
                mkedge(src or cid, tid, "materializes_into", w.get("via", "write-in"),
                       src_file=f"{repo}/{file}" if file else None,
                       line=int(line) if line.isdigit() else None,
                       confidence="DECLARED", _origin=ORIGIN)
            )
            stats["materializes_into"] += 1

    # ------------------------------------------------------------------------------ write
    graph["nodes"].extend(new_nodes.values())
    graph["links"].extend(new_edges)
    graph["built_at_commit_settings_pass"] = git_head()

    total = len(graph["nodes"])
    by_type = Counter(n["type"] for n in new_nodes.values())
    flagged = [n for n in new_nodes.values() if n.get("discrepancies")]

    print(f"settings overlay: +{len(new_nodes)} nodes, +{len(new_edges)} edges")
    for t, c in sorted(by_type.items()):
        print(f"    {t:14s} {c:>4}")
    print(f"  edges: " + ", ".join(f"{k.replace('edge_','')}={v}" for k, v in sorted(stats.items())))
    if flagged:
        print(f"  !! {len(flagged)} setting(s) flagged with discrepancies:")
        for n in flagged:
            for d in n["discrepancies"]:
                print(f"     [{d['severity']:>6}] {n['id'].split('::',1)[1]} — {d['type']}")
    print(f"  graph: {before_nodes:,} -> {total:,} nodes")

    if args.dry_run:
        print("  (dry run — nothing written)")
        return

    # graphify's shrink guard (#479), scoped to what this pass can actually damage.
    #
    # The guard protects the base graph — an expensive artifact (3 repos, LLM extraction, no
    # documented one-liner to rebuild). This pass only ever strips its OWN prior output and
    # appends, so base nodes cannot be lost; asserting that is the check that matters.
    #
    # Comparing against the previous MERGED total instead would fail on any legitimate
    # overlay shrink — e.g. deleting a chain level that turned out not to exist. That is a
    # correction, not corruption, and a guard that blocks corrections trains people to pass
    # --force reflexively, which is how a guard stops guarding anything.
    if total < base_nodes and not args.force:
        sys.exit(
            f"refusing to write: base graph lost nodes ({base_nodes:,} -> {total:,}). "
            "Something is wrong upstream; re-run the base build."
        )
    if total < before_nodes:
        print(f"  note: overlay shrank by {before_nodes - total} node(s) vs the previous pass")

    backup = GRAPH.with_suffix(".json.bak")
    shutil.copy2(GRAPH, backup)
    tmp = GRAPH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(graph))
    tmp.replace(GRAPH)
    print(f"  wrote {GRAPH}  (backup: {backup.name})")


if __name__ == "__main__":
    main()
