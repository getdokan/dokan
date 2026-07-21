#!/usr/bin/env python3
"""
A directed PHP call graph — the thing graphify-out/graph.json cannot provide.

WHY THIS EXISTS
graph.json declares `"directed": false`. Every edge's source/target is therefore arbitrary:
43% of its `calls` edges are same-file, and 100% of those run source-declared-before-target,
because networkx serialises undirected edges in adjacency order. Reversing them to build a
"caller index" walks the file, not the call graph. It also has NO edge at all for a static
`Foo::bar()` call, which is how most Dokan helpers are invoked. The result was a blast radius
inflated up to ~100x for settings near a hub and ~0 for the ones we advertised on.

So: build the call graph from the same AST we already parse, with real direction, and be
honest about what could not be resolved.

RESOLUTION IS REPORTED, NOT ASSUMED
PHP is dynamically typed; `$obj->method()` cannot always be resolved statically. Each edge
carries how it was resolved:
    exact        the callee is pinned (Foo::bar, self::bar, $this->bar, unique global fn)
    unique_name  the receiver type is unknown but exactly ONE method of that name exists
    ambiguous    N>1 candidates — NO edge is emitted, the call site is counted instead
    unresolved   no candidate in this corpus (WordPress/WooCommerce/PHP builtins)
Ambiguous calls are never expanded into N edges: that is how you manufacture an inflated
number, which is the exact failure this file exists to undo. They are counted so callers can
say "at least N, with M unresolved".

Run:  bin/graph/callgraph.py [--stats]
Out:  graphify-out/callgraph.json
"""

import argparse
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict

try:
    import tree_sitter
    import tree_sitter_php
except ImportError:
    sys.exit("run with graphify's interpreter: $(cat graphify-out/.graphify_python)")

HERE = pathlib.Path(__file__).resolve()
LITE = HERE.parent.parent.parent
OUT = LITE / "graphify-out"
PLUGINS_JSON = OUT / "plugins.json"
SKIP_DIRS = {"vendor", "node_modules", "build", "dist", ".git", "languages"}

PARSER = tree_sitter.Parser(tree_sitter.Language(tree_sitter_php.language_php()))


def parse(path):
    src = path.read_bytes()
    return PARSER.parse(src), src


def text(node, src):
    return src[node.start_byte : node.end_byte].decode("utf8", "replace")


def walk(node):
    stack = [node]
    while stack:
        n = stack.pop()
        yield n
        stack.extend(n.children)


def php_files(root):
    for p in root.rglob("*.php"):
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        yield p


def relpath(path, repo):
    parts = list(path.parts)
    for i in range(len(parts) - 1, -1, -1):
        if parts[i] == repo:
            return "/".join(parts[i + 1 :])
    return path.name


def norm(fqcn):
    return (fqcn or "").lstrip("\\")


# ------------------------------------------------------------------------ pass A: symbols


def file_namespace(root, src):
    for n in walk(root):
        if n.type == "namespace_definition":
            nm = n.child_by_field_name("name")
            if nm is not None:
                return text(nm, src)
    return ""


def file_uses(root, src):
    """alias -> FQCN, from `use A\\B\\C;` and `use A\\B\\C as D;`.

    Without this, class resolution collapses to short names — and Dokan has many classes
    called Settings, Helper, Manager and Hooks. Short-name matching would silently fuse them.
    """
    uses = {}
    for n in walk(root):
        if n.type != "namespace_use_declaration":
            continue
        for c in walk(n):
            if c.type != "namespace_use_clause":
                continue
            kids = [k for k in c.children if k.is_named]
            if not kids:
                continue
            fq = norm(text(kids[0], src))
            alias = text(kids[1], src) if len(kids) > 1 else fq.split("\\")[-1]
            uses[alias] = fq
    return uses


def collect_symbols(files_by_repo):
    symbols = {}
    parents = {}
    fn_by_name = defaultdict(list)
    method_by_fqcn = defaultdict(list)
    method_by_name = defaultdict(list)
    file_meta = {}

    for repo, files in files_by_repo.items():
        for path in files:
            tree, src = parse(path)
            rel = relpath(path, repo)
            ns = file_namespace(tree.root_node, src)
            uses = file_uses(tree.root_node, src)
            file_meta[(repo, rel)] = {"ns": ns, "uses": uses}

            for n in walk(tree.root_node):
                if n.type in ("class_declaration", "trait_declaration", "interface_declaration"):
                    nm = n.child_by_field_name("name")
                    if nm is None:
                        continue
                    cls = text(nm, src)
                    fqcn = norm(f"{ns}\\{cls}" if ns else cls)
                    # extends AND implements. Interfaces matter here: Dokan's commission
                    # Sources are typed as InterfaceSetting, so a call through the interface
                    # must be able to reach the implementations.
                    sup = []
                    for c in n.children:
                        if c.type not in ("base_clause", "class_interface_clause"):
                            continue
                        for k in c.children:
                            if not k.is_named:
                                continue
                            pn = text(k, src)
                            sup.append(norm(uses.get(pn, f"{ns}\\{pn}" if ns and not pn.startswith("\\") else pn)))
                    if sup:
                        parents[fqcn] = sup
                    for m in walk(n):
                        if m.type != "method_declaration":
                            continue
                        mn = m.child_by_field_name("name")
                        if mn is None:
                            continue
                        meth = text(mn, src)
                        sid = f"{repo}/{rel}#{fqcn}::{meth}"
                        symbols[sid] = {
                            "id": sid, "repo": repo, "file": rel, "line": m.start_point[0] + 1,
                            "kind": "method", "class": fqcn, "short_class": cls, "name": meth,
                        }
                        method_by_fqcn[(fqcn, meth)].append(sid)
                        method_by_name[meth].append(sid)

                elif n.type == "function_definition":
                    nm = n.child_by_field_name("name")
                    if nm is None:
                        continue
                    fn = text(nm, src)
                    sid = f"{repo}/{rel}#{fn}"
                    symbols[sid] = {
                        "id": sid, "repo": repo, "file": rel, "line": n.start_point[0] + 1,
                        "kind": "function", "class": None, "name": fn,
                    }
                    fn_by_name[fn].append(sid)

    return symbols, parents, fn_by_name, method_by_fqcn, method_by_name, file_meta


def enclosing_symbol(node, src, repo, rel, ns):
    """(sym_id, fqcn) of the definition a node sits inside."""
    cls = fqcn = meth = fn = None
    cur = node
    while cur is not None:
        if meth is None and fn is None and cur.type == "method_declaration":
            n = cur.child_by_field_name("name")
            meth = text(n, src) if n is not None else None
        elif meth is None and fn is None and cur.type == "function_definition":
            n = cur.child_by_field_name("name")
            fn = text(n, src) if n is not None else None
        elif cur.type in ("class_declaration", "trait_declaration", "interface_declaration"):
            n = cur.child_by_field_name("name")
            cls = text(n, src) if n is not None else None
            break
        cur = cur.parent
    if cls:
        fqcn = norm(f"{ns}\\{cls}" if ns else cls)
    if meth and fqcn:
        return f"{repo}/{rel}#{fqcn}::{meth}", fqcn
    if fn:
        return f"{repo}/{rel}#{fn}", None
    return None, fqcn


def type_hints(fn_node, src, resolve_class):
    """$var -> FQCN, for the three shapes PHP makes statically knowable.

    Without this, every `$obj->method()` falls back to name matching, and a method named
    `get()` has ~200 candidates so it resolves to nothing. That is why GlobalSetting::get()
    — the flagship example — had zero callers even after the call graph was directed.

    Three shapes, in order of how much they buy here:
      $x = new Foo(...)      1159 sites   the dominant Dokan idiom
      protected ?Foo $x;       33 sites   typed properties (recorded as `$this->x`)
      function m( Foo $x )                typed parameters
    """
    types = {}
    for n in walk(fn_node):
        if n.type == "simple_parameter":
            t = next((c for c in n.children if c.type in ("named_type", "nullable_type")), None)
            v = next((c for c in n.children if c.type == "variable_name"), None)
            if t is not None and v is not None:
                nm = next((c for c in walk(t) if c.type == "name"), None)
                if nm is not None:
                    types[text(v, src)] = resolve_class(text(nm, src))
        elif n.type == "assignment_expression":
            lhs = n.child_by_field_name("left")
            rhs = n.child_by_field_name("right")
            if lhs is None or rhs is None or rhs.type != "object_creation_expression":
                continue
            cls = next((c for c in rhs.children if c.type in ("name", "qualified_name")), None)
            if cls is None:
                continue
            key = None
            if lhs.type == "variable_name":
                key = text(lhs, src)
            elif lhs.type == "member_access_expression":
                key = text(lhs, src)  # $this->foo = new Bar()
            if key:
                types[key] = resolve_class(text(cls, src))
    return types


def property_types(class_node, src, resolve_class):
    """`protected ?Setting $settings;` -> {'$this->settings': FQCN}"""
    out = {}
    for n in walk(class_node):
        if n.type != "property_declaration":
            continue
        t = next((c for c in n.children if c.type in ("named_type", "nullable_type")), None)
        if t is None:
            continue
        nm = next((c for c in walk(t) if c.type == "name"), None)
        if nm is None:
            continue
        fq = resolve_class(text(nm, src))
        for el in n.children:
            if el.type != "property_element":
                continue
            v = next((c for c in el.children if c.type == "variable_name"), None)
            if v is not None:
                out[f"$this->{text(v, src).lstrip('$')}"] = fq
    return out


def lookup_method(fqcn, meth, method_by_fqcn, parents, depth=0, seen=None):
    """Walk the supertype chain — a call to $this->m() may land on a parent or an interface."""
    if not fqcn or depth > 8:
        return []
    seen = seen or set()
    if fqcn in seen:
        return []
    seen = seen | {fqcn}
    hit = method_by_fqcn.get((fqcn, meth))
    if hit:
        return hit
    for p in parents.get(fqcn, []):
        hit = lookup_method(p, meth, method_by_fqcn, parents, depth + 1, seen)
        if hit:
            return hit
    return []


def dispatch_edges(symbols, parents, method_by_fqcn):
    """Base::m -> Sub::m, for every override.

    Virtual dispatch. `AbstractStrategy::__construct()` calls `$this->set_settings()`, which
    binds STATICALLY to the abstract declaration on the base class — but at runtime it
    executes GlobalStrategy::set_settings. Without this edge, every caller of the base method
    is invisible to the override, and the whole commission engine reports a blast radius of 3.

    This over-approximates: a call typed to Base may reach any subclass. That is SOUND
    over-approximation (the runtime type IS Base-or-a-subclass), unlike guessing by method
    name, which is unbounded. Marked `dispatch` so it can be filtered.
    """
    out = []
    for sid, s in symbols.items():
        if s["kind"] != "method":
            continue
        cls, meth = s["class"], s["name"]
        stack, seen = list(parents.get(cls, [])), set()
        while stack:
            anc = stack.pop()
            if not anc or anc in seen:
                continue
            seen.add(anc)
            for base in method_by_fqcn.get((anc, meth), []):
                if base != sid:
                    out.append({"caller": base, "callee": sid, "how": "dispatch", "line": s["line"]})
            stack.extend(parents.get(anc, []))
    return out


# --------------------------------------------------------------------- pass B: call sites


def scan_calls(files_by_repo, symbols, parents, fn_by_name, method_by_fqcn, method_by_name, file_meta):
    edges = []
    stats = Counter()

    for repo, files in files_by_repo.items():
        for path in files:
            tree, src = parse(path)
            rel = relpath(path, repo)
            meta = file_meta.get((repo, rel), {"ns": "", "uses": {}})
            ns, uses = meta["ns"], meta["uses"]

            def resolve_class(name):
                n = name.strip()
                if n.startswith("\\"):
                    return norm(n)
                if n in uses:
                    return uses[n]
                return norm(f"{ns}\\{n}" if ns else n)

            # Type maps are per-scope, so build them once per definition rather than per
            # call site — the walk is the expensive part of this pass.
            prop_types, local_types = {}, {}
            for cn in walk(tree.root_node):
                if cn.type in ("class_declaration", "trait_declaration"):
                    prop_types.update(property_types(cn, src, resolve_class))
            for fn_node in walk(tree.root_node):
                if fn_node.type in ("function_definition", "method_declaration"):
                    sid, _ = enclosing_symbol(fn_node, src, repo, rel, ns)
                    if sid:
                        local_types[sid] = type_hints(fn_node, src, resolve_class)

            for n in walk(tree.root_node):
                if n.type not in ("function_call_expression", "scoped_call_expression",
                                  "member_call_expression"):
                    continue

                caller, encl_fqcn = enclosing_symbol(n, src, repo, rel, ns)
                if caller is None:
                    stats["call_outside_symbol"] += 1
                    continue
                scope_types = local_types.get(caller, {})

                cands, how = [], "unresolved"

                if n.type == "function_call_expression":
                    f = n.child_by_field_name("function")
                    if f is None or f.type != "name":
                        stats["dynamic_fn"] += 1
                        continue
                    name = text(f, src)
                    hits = fn_by_name.get(name, [])
                    if len(hits) == 1:
                        cands, how = hits, "exact"
                    elif len(hits) > 1:
                        how = "ambiguous"
                    else:
                        how = "unresolved"  # wp/wc/php builtin

                elif n.type == "scoped_call_expression":
                    sc = n.child_by_field_name("scope")
                    nm = n.child_by_field_name("name")
                    if sc is None or nm is None:
                        stats["dynamic_scoped"] += 1
                        continue
                    scope, meth = text(sc, src), text(nm, src)
                    if scope in ("self", "static"):
                        target_cls = encl_fqcn
                    elif scope == "parent":
                        _p = parents.get(encl_fqcn or "", [])
                        target_cls = _p[0] if _p else None
                    else:
                        target_cls = resolve_class(scope)
                    hits = lookup_method(target_cls, meth, method_by_fqcn, parents)
                    if hits:
                        cands, how = hits, "exact"
                    else:
                        byname = method_by_name.get(meth, [])
                        if len(byname) == 1:
                            cands, how = byname, "unique_name"
                        elif len(byname) > 1:
                            how = "ambiguous"

                else:  # member_call_expression
                    ob = n.child_by_field_name("object")
                    nm = n.child_by_field_name("name")
                    if nm is None or nm.type != "name":
                        stats["dynamic_member"] += 1
                        continue
                    meth = text(nm, src)
                    obj = text(ob, src) if ob is not None else ""
                    hits = []
                    if obj == "$this" and encl_fqcn:
                        hits = lookup_method(encl_fqcn, meth, method_by_fqcn, parents)
                    else:
                        # $x->m() where $x = new Foo(), or a typed param, or $this->prop->m()
                        # where prop is a typed property. This is what makes the DI-heavy
                        # Dokan code resolvable at all.
                        recv = scope_types.get(obj) or prop_types.get(obj)
                        if recv:
                            hits = lookup_method(recv, meth, method_by_fqcn, parents)
                            if hits:
                                stats["via_type_inference"] += 1
                    if hits:
                        cands, how = hits, "exact"
                    else:
                        byname = method_by_name.get(meth, [])
                        if len(byname) == 1:
                            cands, how = byname, "unique_name"
                        elif len(byname) > 1:
                            # NEVER fan out to N candidates. That is how a number gets
                            # inflated, which is the defect this file exists to fix.
                            how = "ambiguous"

                stats[how] += 1
                for c in cands:
                    if c == caller:
                        continue  # self-recursion adds nothing to a blast radius
                    edges.append({
                        "caller": caller, "callee": c, "how": how,
                        "line": n.start_point[0] + 1,
                    })

    # dedupe: one edge per (caller, callee, how); call COUNT is not the point, reachability is
    seen, uniq = set(), []
    for e in edges:
        k = (e["caller"], e["callee"], e["how"])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(e)
    return uniq, stats


def main():
    ap = argparse.ArgumentParser(description="Build a directed PHP call graph")
    ap.add_argument("--stats", action="store_true")
    args = ap.parse_args()

    plugins = json.loads(PLUGINS_JSON.read_text()) if PLUGINS_JSON.exists() else {}
    repos = {r: pathlib.Path(p) for r, p in plugins.items() if r.startswith("dokan")}
    if not repos:
        repos = {"dokan-lite": LITE}
    files_by_repo = {r: sorted(php_files(p)) for r, p in repos.items() if p.exists()}

    symbols, parents, fn_by_name, method_by_fqcn, method_by_name, file_meta = collect_symbols(files_by_repo)
    edges, stats = scan_calls(files_by_repo, symbols, parents, fn_by_name,
                              method_by_fqcn, method_by_name, file_meta)
    disp = dispatch_edges(symbols, parents, method_by_fqcn)
    edges = edges + disp
    stats["dispatch"] = len(disp)

    total = sum(stats[k] for k in ("exact", "unique_name", "ambiguous", "unresolved"))
    payload = {
        "symbols": symbols,
        "edges": edges,
        "parents": parents,
        "counters": {
            "files": sum(len(f) for f in files_by_repo.values()),
            "symbols": len(symbols),
            "edges": len(edges),
            "call_sites": total,
            "exact": stats["exact"],
            "unique_name": stats["unique_name"],
            "ambiguous": stats["ambiguous"],
            "unresolved": stats["unresolved"],
            "dispatch_edges": stats["dispatch"],
            "via_type_inference": stats["via_type_inference"],
            "resolution_rate": round(100 * (stats["exact"] + stats["unique_name"]) / max(total, 1), 1),
        },
    }
    # sorted() everywhere a set could leak in: the previous scanner was non-deterministic
    # because it iterated a set, so settings.json churned 1104 lines per run.
    payload["edges"] = sorted(edges, key=lambda e: (e["caller"], e["callee"], e["how"]))
    OUT.mkdir(exist_ok=True)
    (OUT / "callgraph.json").write_text(json.dumps(payload, indent=1, sort_keys=True))

    c = payload["counters"]
    print(f"callgraph.json — {c['symbols']:,} symbols, {c['edges']:,} directed edges")
    print(f"  call sites   {c['call_sites']:>7,}")
    print(f"    exact      {c['exact']:>7,}")
    print(f"    unique_name{c['unique_name']:>7,}")
    print(f"    ambiguous  {c['ambiguous']:>7,}  (no edge emitted — never fanned out)")
    print(f"    unresolved {c['unresolved']:>7,}  (wp/wc/php builtins)")
    print(f"  type-inferred{c['via_type_inference']:>7,}  ($x = new Foo() / typed prop / typed param)")
    print(f"  dispatch     {c['dispatch_edges']:>7,}  (Base::m -> Sub::m, virtual dispatch)")
    print(f"  resolution   {c['resolution_rate']:>6}% of call sites landed on a known symbol")


if __name__ == "__main__":
    main()
