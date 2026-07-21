#!/usr/bin/env python3
"""
"What depends on this setting?" — answered from the sidecars, not from graph.json.

WHY IT NO LONGER READS graph.json
It used to. graph.json declares `"directed": false`, so its edges carry arbitrary
source/target; reversing `calls` to find callers walked the file, not the call graph — 100%
of its same-file `calls` edges run source-declared-before-target. It also has no edge at all
for a static `Foo::bar()` call, which is how most Dokan helpers are invoked. The resulting
blast radius was inflated ~100x for settings near a hub and ~0 for the ones this tool was
advertised on: it had no consistent relationship to reality in either direction.

Now: settings.json (reads/writes/side effects) + callgraph.json (a real DIRECTED call graph
built from the same AST pass) + chains.toml (Source chains). All three regenerate in ~15s and
are the declared source of truth — so the freshness claim is delivered rather than asserted
while quietly reading a stale cached graph.

WHAT THE NUMBERS MEAN
Blast radius is a LOWER BOUND and says so on every line that prints it. ~30% of
Dokan-targeting call sites are ambiguous (`$obj->method()`, receiver type unknown, method
name not unique). They are counted and reported, never fanned out into N speculative edges —
fanning out is how a number gets inflated, which is the defect this file exists to undo.

    bin/graph/impact.py dokan_selling.admin_percentage
    bin/graph/impact.py --audit [--section X] [--csv]
    bin/graph/impact.py --list-chains
"""

import argparse
import bisect
import collections
import json
import pathlib
import sys
import textwrap
import tomllib

HERE = pathlib.Path(__file__).resolve()
OUT = HERE.parent.parent.parent / "graphify-out"
SETTINGS = OUT / "settings.json"
CALLGRAPH = OUT / "callgraph.json"
CHAINS = HERE.parent / "chains.toml"


def load():
    for p in (SETTINGS, CALLGRAPH):
        if not p.exists():
            sys.exit(f"missing {p} — run settings_scan.py and callgraph.py first")
    return (
        json.loads(SETTINGS.read_text()),
        json.loads(CALLGRAPH.read_text()),
        tomllib.loads(CHAINS.read_text()) if CHAINS.exists() else {"chain": []},
    )


def symbol_index(cg):
    """(repo, file) -> sorted [(defline, sym_id)] — binds a call site to its function.

    Line-proximity binding used to be unsound: settings records were scanned from the working
    tree while the node index came from a graph extracted at a different commit, so any line
    drift bound a read to the wrong function, silently. Both sides now come from one scan of
    one tree. The residual error is nested closures and anonymous classes.
    """
    idx = collections.defaultdict(list)
    for sid, s in cg["symbols"].items():
        idx[(s["repo"], s["file"])].append((s["line"], sid))
    for k in idx:
        idx[k].sort()
    return idx


def bind(idx, repo, file, line):
    entries = idx.get((repo, file))
    if not entries:
        return None
    lines = [e[0] for e in entries]
    i = bisect.bisect_right(lines, line) - 1
    return entries[i][1] if i >= 0 else None


def callers_index(cg):
    rev = collections.defaultdict(set)
    for e in cg["edges"]:
        rev[e["callee"]].add(e["caller"])
    return rev


def build(data, cg):
    idx = symbol_index(cg)
    per = collections.defaultdict(lambda: {"reads": [], "writes": [], "declares": [],
                                           "side": [], "syms": set(), "unbound": 0})
    for r in data["records"]:
        key = r.get("setting") or (r.get("section") if r.get("whole_row") else None)
        if not key:
            continue
        p = per[key]
        if r["kind"] == "side_effect":
            p["side"].append(r)
            continue
        if r.get("dynamic"):
            continue
        p["reads" if r["kind"].endswith("read") else "writes"].append(r)
        s = bind(idx, r["repo"], r["file"], r["line"])
        if s:
            p["syms"].add(s)
        else:
            p["unbound"] += 1
    for d in data.get("definitions", []):
        per[d["setting"]]["declares"].append(d)
    return per, idx


def radius(syms, rev, depth=None):
    """Reverse-reachable callers. Converges by default — no arbitrary depth.

    The old default of 2 was arbitrary, and arbitrary truncation is indistinguishable from
    "that is all there is" to a reader. It is affordable to just converge: full closure for
    all 238 settings takes <0.1s, median 4 symbols, p90 21, max 1559, and no setting reaches
    10% of the corpus. `depth` remains available as an explicit cap.
    """
    seen, frontier, tiers = set(syms), set(syms), []
    while frontier and (depth is None or len(tiers) < depth):
        nxt = set()
        for x in frontier:
            nxt |= rev[x]
        nxt -= seen
        if not nxt:
            break
        seen |= nxt
        frontier = nxt
        tiers.append(nxt)
    return seen, tiers


def chain_index(chains):
    """setting/store key -> (chain, level). From chains.toml — the declared truth (Q6)."""
    out = {}
    for c in chains.get("chain", []):
        for lv in c.get("level", []):
            keys = ([lv.get("setting")] if lv.get("setting") else []) + lv.get("also_settings", [])
            keys += ([lv.get("store")] if lv.get("store") else []) + lv.get("also", [])
            for k in keys:
                if k:
                    out[k] = (c, lv)
    return out


def behavior_index(chains):
    """setting -> [(behavior, entry, role)]. The use-case layer: which user-visible
    behaviors a setting gates or shapes. Read-radius measures code; this measures
    consequence — selection_required has radius 2 and is still the switch for 'customers
    must pick a delivery slot before they can pay'."""
    out = collections.defaultdict(list)
    for b in chains.get("behavior", []):
        for role in ("gate", "shape"):
            for e in b.get(role, []):
                if e.get("setting"):
                    out[e["setting"]].append((b, e, role))
    return out


def _wrap(text, indent):
    for line in textwrap.wrap(" ".join(str(text).split()), 92 - len(indent)):
        print(f"{indent}{line}")


def _resolution(entry, behavior, chains):
    """How this gate/shape setting resolves — through a chain (vendor may override) or a
    flat read. A flat read on a behavior that HAS a chain is the interesting case: the
    setting is admin-only and the override does not apply."""
    cid = entry.get("via_chain")
    if cid:
        c = next((x for x in chains.get("chain", []) if x["id"] == cid), None)
        if c:
            path = " -> ".join(f"{x['rank']}:{x['source']}"
                               for x in sorted(c["level"], key=lambda x: x["rank"]))
            return f"resolved through chain '{cid}' ({path}) — vendor CAN override"
        return f"resolved through chain '{cid}' (not in chains.toml!)"
    if behavior.get("chain"):
        return (f"FLAT READ — admin-only; the '{behavior['chain']}' vendor override does "
                f"NOT apply to this setting")
    return "flat read — admin global only"


def show_usecases(key, bidx):
    hits = bidx.get(key)
    if not hits:
        return
    print(f"\nUSE CASES ({len(hits)}) — user-visible behavior this setting controls")
    for b, e, role in hits:
        verb = "gates " if role == "gate" else "shapes"
        print(f"   {verb}  [{b.get('actor')}] {b['label']}")
        detail = e.get("when") or e.get("effect")
        if detail:
            _wrap(detail, "           ")
    print("   full story: impact.py <behavior-id>  ·  list: impact.py --behaviors")


def show_behavior(b, chains):
    print("=" * 78)
    print(f"  USE CASE — {b['label']}")
    print(f"  actor: {b.get('actor')} · surface: {b.get('surface')} · id: {b['id']}")
    print("=" * 78)
    gates = b.get("gate", [])
    if gates:
        print("\nHAPPENS ONLY WHEN — every gate must hold")
        for i, e in enumerate(gates, 1):
            print(f"\n   {i}. {e.get('question', e['setting'])}")
            print(f"      setting: {e['setting']}")
            print(f"      {_resolution(e, b, chains)}")
            _wrap("when: " + str(e.get("when", "")), "      ")
            if e.get("note"):
                _wrap("note: " + str(e["note"]), "      ")
            print(f"      anchor:  {e['anchor']}")
    shapes = b.get("shape", [])
    if shapes:
        print("\nSHAPED BY — parameters, not switches")
        for e in shapes:
            print(f"\n   {e['setting']}")
            print(f"      {_resolution(e, b, chains)}")
            _wrap(str(e.get("effect", "")), "      ")
            print(f"      anchor:  {e['anchor']}")
    if b.get("outcome"):
        print("\nOUTCOME — what a successful pass persists")
        _wrap(b["outcome"], "   ")
        if b.get("outcome_anchor"):
            print(f"   anchor:  {b['outcome_anchor']}")
    if b.get("notes"):
        print("\nNOTES")
        _wrap(b["notes"], "   ")


def disc_index(data):
    out = collections.defaultdict(list)
    for d in data.get("discrepancies", []):
        if d.get("setting"):
            out[d["setting"]].append(d)
    return out


def show_chain(key, cidx):
    hit = cidx.get(key)
    if not hit:
        return
    c, lv = hit
    levels = sorted(c.get("level", []), key=lambda x: x["rank"])
    print(f"\nSOURCE CHAIN — {c.get('label')}   (this is rank {lv['rank']} of {len(levels)})")
    for x in levels:
        here = "  <--" if x["rank"] == lv["rank"] else ""
        print(f"   {x['rank']}  {x['source']:17s} defer: {str(x.get('defer')):30.30s}{here}")
    shadows = [x["source"] for x in levels if x["rank"] < lv["rank"]]
    if shadows:
        print(f"\n   IMPACT IS CONDITIONAL — applies only when {', '.join(shadows)} all Defer.")
        print(f"   Defer: {c.get('defer_predicate')}")
        print("   '0' is NOT a Defer: a more specific Source set to 0 wins and yields 0.")
    if c.get("writes_back_on_miss"):
        print("   NB: this chain WRITES BACK on a read miss — reading it persists the value.")


def main():
    ap = argparse.ArgumentParser(description="What depends on a setting?")
    ap.add_argument("target", nargs="?")
    ap.add_argument("--depth", type=int, default=None,
                    help="cap traversal depth (default: converge)")
    ap.add_argument("--audit", action="store_true")
    ap.add_argument("--section")
    ap.add_argument("--csv", action="store_true")
    ap.add_argument("--list-chains", action="store_true")
    ap.add_argument("--behaviors", action="store_true",
                    help="list declared use cases (the behavior layer)")
    args = ap.parse_args()

    data, cg, chains = load()
    per, idx = build(data, cg)
    rev = callers_index(cg)
    cidx, didx = chain_index(chains), disc_index(data)
    bidx = behavior_index(chains)
    behaviors = {b["id"]: b for b in chains.get("behavior", [])}

    if args.behaviors:
        print(f"{len(behaviors)} declared use cases — impact.py <id> for the full story")
        for b in behaviors.values():
            print(f"\n{b['label']}  ({b['id']})")
            print(f"  actor: {b.get('actor')} · surface: {b.get('surface')}")
            gs = ", ".join(e["setting"] for e in b.get("gate", []))
            if gs:
                print(f"  gated by: {gs}")
        return
    cc = cg["counters"]
    dok = cc["exact"] + cc["unique_name"] + cc["ambiguous"]
    conf = f"{100 * (cc['exact'] + cc['unique_name']) / max(dok, 1):.0f}%"

    if args.list_chains:
        for c in chains.get("chain", []):
            lv = sorted(c.get("level", []), key=lambda x: x["rank"])
            print(f"\n{c.get('label')}  ({c['id']})")
            print(f"  resolver: {c.get('resolver')}")
            print("  " + " -> ".join(f"{x['rank']}:{x['source']}" for x in lv))
        return

    if args.audit:
        rows = []
        for key, p in per.items():
            if args.section and not key.startswith(args.section):
                continue
            seen, _ = radius(p["syms"], rev, args.depth)
            direct = p["reads"] + p["writes"]
            repos = collections.Counter(r["repo"] for r in direct)
            hit = cidx.get(key)
            rows.append({
                "setting": key, "direct": len(direct), "radius": len(seen),
                "lite": repos.get("dokan-lite", 0), "pro": repos.get("dokan-pro", 0),
                "rank": hit[1]["rank"] if hit else None,
                "side": len(p["side"]), "disc": len(didx.get(key, [])),
                "uc": len(bidx.get(key, [])),
                "unbound": p["unbound"],
            })
        rows.sort(key=lambda r: (not r["disc"], -r["radius"], -r["direct"], r["setting"]))
        if args.csv:
            import csv as _csv
            w = _csv.DictWriter(sys.stdout, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
            return
        print(f"{len(rows)} settings · radius is a LOWER BOUND "
              f"({conf} of {dok:,} Dokan call sites resolved; "
              f"{cc['ambiguous']:,} ambiguous, counted not guessed)\n")
        print(f"  {'radius':>6} {'direct':>6} {'lite':>4} {'pro':>4}  {'chain':<7} {'save':<4}"
              f" {'disc':<4} {'uc':<2} setting")
        print("  " + "-" * 100)
        for r in rows[:45]:
            ch = f"rank {r['rank']}" if r["rank"] else ""
            print(f"  {r['radius']:>6} {r['direct']:>6} {r['lite']:>4} {r['pro']:>4}"
                  f"{' *' if r['pro'] and r['lite'] else '  '} {ch:<7}"
                  f" {'SAVE' if r['side'] else '':<4} {'!!' if r['disc'] else '':<4}"
                  f" {'UC' if r['uc'] else '':<2} {r['setting']}")
        if len(rows) > 45:
            print(f"  ... {len(rows)-45} more — --csv for all, --section to narrow")
        print(f"\n  {sum(1 for r in rows if r['pro'] and r['lite'])} read by BOTH repos")
        print(f"  {sum(1 for r in rows if r['disc'])} with discrepancies")
        print(f"  {sum(1 for r in rows if r['uc'])} gate or shape a declared use case (UC)")
        print(f"  {sum(1 for r in rows if r['direct'] == 0)} with no read/write edge")
        return

    if not args.target:
        ap.error("give a setting address, or --audit / --list-chains")

    key = args.target
    if key in behaviors:
        show_behavior(behaviors[key], chains)
        return
    if key not in per:
        cands = sorted(k for k in per if args.target.lower() in k.lower())
        bcands = sorted(k for k in behaviors if args.target.lower() in k.lower())
        if len(bcands) == 1 and not cands:
            show_behavior(behaviors[bcands[0]], chains)
            return
        if len(cands) == 1 and not bcands:
            key = cands[0]
        elif cands or bcands:
            print(f"'{args.target}' is ambiguous:")
            for c in cands[:25]:
                print("  ", c)
            for c in bcands[:25]:
                print("  ", c, "(use case)")
            return
        else:
            sys.exit(f"no setting or use case matches {args.target!r}")
    p = per[key]

    print("=" * 78)
    print(f"  {key}")
    print("=" * 78)
    for d in didx.get(key, []):
        print(f"\n  !! DISCREPANCY [{d.get('severity')}] {d.get('type')}")
        for line in textwrap.wrap(" ".join(str(d.get("summary", "")).split()), 84):
            print(f"     {line}")

    direct = p["reads"] + p["writes"] + p["declares"]
    repos = collections.Counter(r["repo"] for r in direct)
    print(f"\nDIRECT ({len(direct)})  " + "  ".join(f"{k}={v}" for k, v in repos.most_common()))
    for kind, rows in (("reads", p["reads"]), ("writes", p["writes"]), ("declares", p["declares"])):
        for r in rows:
            who = f"{r.get('class') or ''}::{r.get('function') or '?'}"
            print(f"   {kind:9s} {who:42.42s} {r['repo']}/{r['file']}:{r['line']}")

    if p["side"]:
        print(f"\nSIDE EFFECTS OF SAVING ({len(p['side'])}) — these react to the WRITE")
        for r in p["side"]:
            print(f"   {r['api']:31s} {r['callback']:32.32s} {r['repo']}/{r['file']}:{r['line']}")

    seen, tiers = radius(p["syms"], rev, args.depth)
    span = f"depth {args.depth}" if args.depth else f"converged in {len(tiers)} hops"
    print(f"\nBLAST RADIUS (lower bound) — {len(seen)} symbols, {span}")
    for i, t in enumerate(tiers, 1):
        rr = collections.Counter(x.split("/")[0] for x in t)
        print(f"   +{i}: {len(t):>4} callers   " + "  ".join(f"{k}={v}" for k, v in rr.most_common()))
    if p["unbound"]:
        print(f"   ({p['unbound']} call site(s) could not be bound to a function)")
    print(f"   Lower bound: {cc['ambiguous']:,} Dokan call sites corpus-wide are ambiguous")
    print("   (receiver type unknown, method name not unique) and are never guessed at.")

    show_chain(key, cidx)
    show_usecases(key, bidx)


if __name__ == "__main__":
    main()
