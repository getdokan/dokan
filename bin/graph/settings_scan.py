#!/usr/bin/env python3
"""
Dokan settings scanner — the read/write half of the settings overlay.

Static AST pass over dokan-lite + dokan-pro PHP. No LLM, no API key, no network:
deterministic and cheap enough to run on every commit. Emits graphify-out/settings.json,
which is the source of truth for the overlay; merge_settings.py injects a cached view of
it into graph.json. Same relationship hooks.json has with the hook:: nodes.

Node identity is the *normalized address* — the (section, field) pair after the
rearrange map is applied. Not the bare field id: 17 field ids appear under more than one
section, and `enabled` alone spans four unrelated subsystems, so collapsing on field id
would merge them into one node and overstate what depends on each.

Run:  bin/graph/settings_scan.py [--json] [--quiet]
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
    sys.exit(
        "tree_sitter / tree_sitter_php not importable.\n"
        "Run with graphify's interpreter: $(cat graphify-out/.graphify_python) bin/graph/settings_scan.py"
    )

HERE = pathlib.Path(__file__).resolve()
LITE = HERE.parent.parent.parent
OUT = LITE / "graphify-out"
PLUGINS_JSON = OUT / "plugins.json"

# The dokan_ prefix is necessary but NOT sufficient to be a settings section — Dokan also
# prefixes capabilities, nonces and form keys with it. Used only as a cheap pre-filter;
# the authoritative test is membership in the registry from scan_sections().
SECTION_PREFIX_RE = re.compile(r"^dokan_")

SKIP_DIRS = {"vendor", "node_modules", "tests", "build", "dist", ".git", "languages"}

# Raw store accessors. WP's meta API takes the key as arg 2; WC's CRUD methods take it as
# arg 1. That asymmetry is why key_arg is per-API rather than a constant.
STORE_APIS = {
    # function name        -> (kind, store_kind, key_arg_index)
    "get_user_meta": ("read", "usermeta", 1),
    "update_user_meta": ("write", "usermeta", 1),
    "delete_user_meta": ("write", "usermeta", 1),
    "get_post_meta": ("read", "postmeta", 1),
    "update_post_meta": ("write", "postmeta", 1),
    "delete_post_meta": ("write", "postmeta", 1),
    "wc_get_order_item_meta": ("read", "itemmeta", 1),
    "wc_update_order_item_meta": ("write", "itemmeta", 1),
}
# WC/Dokan CRUD object methods — receiver type is unknown statically, so store_kind is
# resolved by looking the key up in chains.toml rather than guessed from the call.
MEMBER_STORE_APIS = {
    "get_meta": "read",
    "update_meta_data": "write",
    "delete_meta_data": "write",
    "add_meta_data": "write",
    "get_meta_data": "read",
    "update_meta": "write",
    "get_prop": "read",
}

PARSER = tree_sitter.Parser(tree_sitter.Language(tree_sitter_php.language_php()))


# --------------------------------------------------------------------------- ast helpers


def parse(path):
    src = path.read_bytes()
    return PARSER.parse(src), src


def text(node, src):
    return src[node.start_byte : node.end_byte].decode("utf8", "replace")


def literal_string(node, src):
    """The literal value of an expression node, or None if it isn't a plain string.

    None means "not statically resolvable" — a variable, a concatenation, a constant.
    Those become AMBIGUOUS records rather than being dropped, per graphify's honesty rules.
    """
    if node is None:
        return None
    # `argument` and `array_element_initializer` are both thin wrappers around the real
    # expression; unwrap either before testing for a string.
    while node.type in ("argument", "array_element_initializer"):
        kids = [c for c in node.children if c.is_named]
        if not kids:
            return None
        node = kids[0]
    if node.type in ("string", "encapsed_string"):
        parts = [c for c in node.children if c.type == "string_content"]
        if not parts:
            return ""  # empty string literal
        if len(parts) == 1:
            return text(parts[0], src)
    return None


def call_args(call):
    """Named argument nodes of a call, in order."""
    for c in call.children:
        if c.type == "arguments":
            return [a for a in c.children if a.type == "argument"]
    return []


def enclosing(node, src):
    """(class, function) names surrounding a node — for call-site attribution."""
    cls = fn = None
    cur = node
    while cur is not None:
        if fn is None and cur.type in ("function_definition", "method_declaration"):
            n = cur.child_by_field_name("name")
            if n is not None:
                fn = text(n, src)
        elif cur.type in ("anonymous_function_creation_expression", "arrow_function"):
            fn = fn or "{closure}"
        elif cur.type in ("class_declaration", "trait_declaration", "interface_declaration"):
            n = cur.child_by_field_name("name")
            if n is not None:
                cls = text(n, src)
            break
        cur = cur.parent
    return cls, fn


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


# -------------------------------------------------------------- pass 0: section registry


def scan_sections(files_by_repo):
    """Section ids declared in a registry array.

    Matched structurally — an array literal carrying both 'id' => 'dokan_*' and 'title' — not
    by enclosing function name. Pro's 22 dokan_settings_sections subscribers use arbitrary
    callback names, so a name filter finds Lite's 7 and misses the rest.

    This is only half the vocabulary. The other half is free: dokan_get_option's second
    argument IS a section by definition, so every resolvable read names one. main() unions
    the two. Registry-only sections are those declared but never read.
    """
    sections, provenance = set(), []
    for repo, files in files_by_repo.items():
        for path in files:
            raw = path.read_bytes()
            if b"'id'" not in raw and b'"id"' not in raw:
                continue
            tree, src = parse(path)
            for arr in walk(tree.root_node):
                if arr.type != "array_creation_expression":
                    continue
                pairs = {}
                for el in arr.children:
                    if el.type != "array_element_initializer":
                        continue
                    kids = [c for c in el.children if c.is_named]
                    if len(kids) == 2:
                        k = literal_string(kids[0], src)
                        if k is not None:
                            pairs[k] = (kids[1], el)
                if "id" not in pairs or "title" not in pairs:
                    continue
                sid = literal_string(pairs["id"][0], src)
                if sid and SECTION_PREFIX_RE.match(sid) and sid not in sections:
                    sections.add(sid)
                    provenance.append(
                        {
                            "section": sid,
                            "repo": repo,
                            "file": relpath(path, repo),
                            "line": pairs["id"][1].start_point[0] + 1,
                        }
                    )
    return sections, provenance


# ------------------------------------------------------------------- pass 1: rearrange map


def scan_rearrange_map(files_by_repo):
    """Extract the rearrange map from source rather than hardcoding it.

    The map aliases an old (field, section) address onto its current one. Lite declares 9
    entries; Pro appends 4 more through the dokan_admin_settings_rearrange_map filter, so a
    lite-only read of it is wrong. Extracting from the AST means it cannot drift.

    Shape hunted: 'field_section' => array( 'field', 'section' ) inside any function whose
    name contains rearrange_map.
    """
    amap, provenance = {}, []
    for repo, files in files_by_repo.items():
        for path in files:
            src_bytes = path.read_bytes()
            if b"rearrange_map" not in src_bytes:
                continue
            tree, src = parse(path)
            for node in walk(tree.root_node):
                if node.type not in ("function_definition", "method_declaration"):
                    continue
                name_node = node.child_by_field_name("name")
                if name_node is None or "rearrange_map" not in text(name_node, src):
                    continue
                for pair in walk(node):
                    if pair.type != "array_element_initializer":
                        continue
                    kids = [c for c in pair.children if c.is_named]
                    if len(kids) != 2:
                        continue
                    key = literal_string(kids[0], src)
                    if key is None or kids[1].type != "array_creation_expression":
                        continue
                    vals = [
                        literal_string(e, src)
                        for e in kids[1].children
                        if e.type == "array_element_initializer"
                    ]
                    if len(vals) == 2 and all(v is not None for v in vals):
                        amap[key] = (vals[0], vals[1])
                        provenance.append(
                            {
                                "alias": key,
                                "resolves_to": f"{vals[1]}.{vals[0]}",
                                "repo": repo,
                                "file": relpath(path, repo),
                                "line": pair.start_point[0] + 1,
                            }
                        )
    return amap, provenance


def normalize(field, section, amap):
    """Apply the rearrange map. Returns (field, section, was_rearranged)."""
    hit = amap.get(f"{field}_{section}")
    if hit:
        return hit[0], hit[1], True
    return field, section, False


# ------------------------------------------------------- pass 2: settings reads and writes


def scan_settings(files_by_repo, amap, chain_keys):
    records = []
    counters = Counter()

    for repo, files in files_by_repo.items():
        for path in files:
            raw = path.read_bytes()
            if not any(
                tok in raw
                for tok in (b"dokan_get_option", b"get_option", b"update_option", b"_meta")
            ):
                continue
            tree, src = parse(path)
            rel = relpath(path, repo)

            for node in walk(tree.root_node):
                if node.type == "function_call_expression":
                    name_node = node.child_by_field_name("function")
                    if name_node is None:
                        continue
                    fname = text(name_node, src)
                    args = call_args(node)
                    rec = None

                    if fname == "dokan_get_option":
                        rec = _dokan_get_option(node, args, src, amap)
                    elif fname in ("get_option", "update_option", "delete_option"):
                        rec = _raw_option(fname, node, args, src)
                        # ...and resolve the $row['field'] subscripts that follow, so the
                        # fields actually read through this row stop looking dead.
                        if rec and fname == "get_option":
                            cls_, fn_ = enclosing(node, src)
                            for f, ln in _whole_row_fields(node, src, rec["section"]):
                                nf, nsec, rear = normalize(f, rec["section"], amap)
                                records.append({
                                    "kind": "read", "api": "get_option[]",
                                    "setting": f"{nsec}.{nf}", "field": nf, "section": nsec,
                                    "declared_section": rec["section"] if rear else None,
                                    "rearranged": rear, "dynamic": False,
                                    "confidence": "EXTRACTED", "via_whole_row": True,
                                    "repo": repo, "file": rel, "line": ln,
                                    "class": cls_, "function": fn_,
                                })
                                counters["read"] += 1
                                counters["via_whole_row"] += 1
                    elif fname in STORE_APIS:
                        rec = _store_call(fname, node, args, src, chain_keys)

                    if rec:
                        cls, fn = enclosing(node, src)
                        rec.update(
                            repo=repo, file=rel, line=node.start_point[0] + 1,
                            **{"class": cls, "function": fn},
                        )
                        records.append(rec)
                        counters[rec["kind"]] += 1
                        if rec.get("dynamic"):
                            counters["ambiguous"] += 1

                elif node.type == "member_call_expression":
                    name_node = node.child_by_field_name("name")
                    if name_node is None:
                        continue
                    mname = text(name_node, src)
                    if mname not in MEMBER_STORE_APIS:
                        continue
                    args = call_args(node)
                    if not args:
                        continue
                    key = literal_string(args[0], src)
                    if key is None or key not in chain_keys:
                        continue  # only chain-participating keys are in scope (Q3)
                    cls, fn = enclosing(node, src)
                    obj = node.child_by_field_name("object")
                    records.append(
                        {
                            "kind": f"store_{MEMBER_STORE_APIS[mname]}",
                            "api": mname,
                            "store": chain_keys[key],
                            "key": key,
                            "dynamic": False,
                            "receiver": text(obj, src) if obj is not None else None,
                            "repo": repo,
                            "file": rel,
                            "line": node.start_point[0] + 1,
                            "class": cls,
                            "function": fn,
                        }
                    )
                    counters[f"store_{MEMBER_STORE_APIS[mname]}"] += 1

    return records, counters


def _dokan_get_option(node, args, src, amap):
    field = literal_string(args[0], src) if len(args) > 0 else None
    section = literal_string(args[1], src) if len(args) > 1 else None
    default = text(args[2], src).strip() if len(args) > 2 else None

    if field is None or section is None:
        return {
            "kind": "read",
            "api": "dokan_get_option",
            "setting": None,
            "field": field,
            "section": section,
            "dynamic": True,
            "confidence": "AMBIGUOUS",
            "expr": text(node, src)[:160].replace("\n", " "),
            "default": default,
        }

    nfield, nsection, rearranged = normalize(field, section, amap)
    return {
        "kind": "read",
        "api": "dokan_get_option",
        "setting": f"{nsection}.{nfield}",
        "field": nfield,
        "section": nsection,
        "declared_section": section if rearranged else None,
        "rearranged": rearranged,
        "dynamic": False,
        "confidence": "EXTRACTED",
        "default": default,
    }


def _whole_row_fields(call_node, src, section):
    """Resolve `$opts = get_option('dokan_x'); ... $opts['field']` into real field reads.

    Recording the row access and stopping was the single worst defect in this scanner: every
    field read through the whole-row idiom was invisible, which MANUFACTURED false
    `declared_never_read` findings — the one list the README advertised as sound. It was 0/17
    correct. Someone deleting `reported_by_logged_in_users_only` on that advice silently opens
    anonymous abuse reporting.

    Scoped to the enclosing function on purpose: SetupWizard.php reuses `$options` across
    several functions, so a file-wide scan mis-attributes fields to the wrong section.
    """
    assign = call_node.parent
    while assign is not None and assign.type != "assignment_expression":
        assign = assign.parent
        if assign is not None and assign.type in ("function_definition", "method_declaration"):
            return []
    if assign is None:
        return []
    lhs = assign.child_by_field_name("left")
    if lhs is None or lhs.type != "variable_name":
        return []
    var = text(lhs, src)

    fn = assign
    while fn is not None and fn.type not in ("function_definition", "method_declaration"):
        fn = fn.parent
    if fn is None:
        return []

    out = []
    for n in walk(fn):
        if n.type != "subscript_expression":
            continue
        kids = [c for c in n.children if c.is_named]
        if len(kids) != 2 or kids[0].type != "variable_name":
            continue
        if text(kids[0], src) != var:
            continue
        f = literal_string(kids[1], src)
        if f:
            out.append((f, n.start_point[0] + 1))
    return out


def _raw_option(fname, node, args, src):
    """get_option('dokan_selling') — bypasses dokan_get_option, so bypasses the rearrange map.

    In scope because Q1 chose impact analysis: omitting these would understate blast radius,
    which is the one failure mode that makes the answer worse than no answer.
    """
    if not args:
        return None
    section = literal_string(args[0], src)
    if section is None or not SECTION_PREFIX_RE.match(section):
        return None
    kind = "read" if fname == "get_option" else "write"
    return {
        "kind": kind,
        "api": fname,
        "setting": None,          # whole-row access: field is not named at the call site
        "field": None,
        "section": section,
        "dynamic": False,
        "confidence": "EXTRACTED",
        "whole_row": True,
        "bypasses_rearrange": fname == "get_option",
    }


def _store_call(fname, node, args, src, chain_keys):
    kind, store_kind, key_idx = STORE_APIS[fname]
    if len(args) <= key_idx:
        return None
    key = literal_string(args[key_idx], src)
    if key is None or key not in chain_keys:
        return None
    return {
        "kind": f"store_{kind}",
        "api": fname,
        "store": chain_keys[key],
        "key": key,
        "dynamic": False,
        "confidence": "EXTRACTED",
    }


# ------------------------------------------------------------- pass 2.5: save side effects

SAVE_HOOKS = {
    "dokan_after_saving_settings",
    "dokan_before_saving_settings",
    "dokan_save_settings_value",
}


def scan_side_effects(files_by_repo, known_sections):
    """Settings whose impact is a side effect of SAVING them, not of reading them.

    A read edge answers "who consults this value". It cannot see that saving
    dokan_selling.allow_vendor_create_manual_order grants the dokan_manage_manual_order role
    capability (Capabilities.php:53) which gates seven REST controllers — and is never
    revoked, so turning the setting off leaves the API open. Nothing reads the setting there;
    it reacts to the write.

    22 callbacks across both repos hook the save. They create products, insert shortcodes into
    pages, schedule crons, set default categories, grant capabilities. Every one is an impact
    invisible to a read-only model.

    The hooks fire per SECTION with the whole row, so attribution comes from the fields the
    callback subscripts out of $options — plus the `$option_name !== 'dokan_x'` early-return
    that most of them use to identify their section.
    """
    records = []
    for repo, files in files_by_repo.items():
        for path in files:
            raw = path.read_bytes()
            if not any(h.encode() in raw for h in SAVE_HOOKS):
                continue
            tree, src = parse(path)
            rel = relpath(path, repo)

            # hook registrations -> callback method names
            wanted = {}
            for node in walk(tree.root_node):
                if node.type != "function_call_expression":
                    continue
                fn = node.child_by_field_name("function")
                if fn is None or text(fn, src) not in ("add_action", "add_filter"):
                    continue
                args = call_args(node)
                if len(args) < 2:
                    continue
                hook = literal_string(args[0], src)
                if hook not in SAVE_HOOKS:
                    continue
                cb = None
                for s in walk(args[1]):
                    if s.type in ("string", "encapsed_string"):
                        v = literal_string(s, src)
                        if v and v not in ("this", "__CLASS__"):
                            cb = v
                if cb:
                    wanted[cb] = hook

            if not wanted:
                continue

            for fnode in walk(tree.root_node):
                if fnode.type not in ("function_definition", "method_declaration"):
                    continue
                nm = fnode.child_by_field_name("name")
                if nm is None or text(nm, src) not in wanted:
                    continue
                mname = text(nm, src)
                cls, _ = enclosing(fnode, src)

                # `if ( $option_name !== 'dokan_selling' ) { return; }` — the section guard
                section = next(
                    (
                        v for n2 in walk(fnode)
                        if n2.type == "binary_expression"
                        for v in [literal_string(c, src) for c in n2.children if c.is_named]
                        if v in known_sections
                    ),
                    None,
                )
                # fields the callback pulls out of the saved row
                fields = set()
                for sub in walk(fnode):
                    if sub.type != "subscript_expression":
                        continue
                    kids = [c for c in sub.children if c.is_named]
                    if len(kids) != 2 or kids[0].type != "variable_name":
                        continue
                    key = literal_string(kids[1], src)
                    if key and not key.startswith("dokan_"):
                        fields.add(key)

                # Capabilities granted from inside a save callback. This is what makes
                # "off isn't off" detectable: the grant is a side effect of writing the
                # setting, so whether it is ever undone is a property of the corpus, not of
                # this callback. scan_capability_usage() answers the other half.
                grants = []
                for c in walk(fnode):
                    if c.type != "member_call_expression":
                        continue
                    m = c.child_by_field_name("name")
                    if m is None or text(m, src) != "add_cap":
                        continue
                    a = call_args(c)
                    cap = literal_string(a[1], src) if len(a) > 1 else None
                    role = literal_string(a[0], src) if a else None
                    if cap:
                        grants.append({"cap": cap, "role": role,
                                       "line": c.start_point[0] + 1})

                for f in sorted(fields):
                    records.append({
                        "kind": "side_effect",
                        "api": wanted[mname],
                        "setting": f"{section}.{f}" if section else None,
                        "field": f,
                        "section": section,
                        "dynamic": section is None,
                        "confidence": "EXTRACTED" if section else "AMBIGUOUS",
                        "callback": f"{cls}::{mname}" if cls else mname,
                        "grants_caps": grants,
                        "repo": repo,
                        "file": rel,
                        "line": fnode.start_point[0] + 1,
                        "class": cls,
                        "function": mname,
                    })
    return records


def scan_capability_usage(files_by_repo):
    """Corpus-wide: which capabilities are ever revoked, and who checks them.

    The other half of the grant-without-revoke test. A capability granted by saving a setting
    and never revoked means turning that setting off cannot withdraw it — every consumer stays
    authorized. Consumers are what turn that from a curiosity into a finding: seven REST
    controllers checking a capability that "off" no longer removes is a real hole.
    """
    revoked, consumers = set(), defaultdict(list)
    for repo, files in files_by_repo.items():
        for path in files:
            raw = path.read_bytes()
            if not any(t in raw for t in (b"remove_cap", b"user_can", b"'permission'")):
                continue
            tree, src = parse(path)
            rel = relpath(path, repo)
            for n in walk(tree.root_node):
                if n.type == "member_call_expression":
                    m = n.child_by_field_name("name")
                    if m is not None and text(m, src) == "remove_cap":
                        a = call_args(n)
                        cap = literal_string(a[1], src) if len(a) > 1 else (
                            literal_string(a[0], src) if a else None)
                        if cap:
                            revoked.add(cap)
                elif n.type == "function_call_expression":
                    fn = n.child_by_field_name("function")
                    if fn is None:
                        continue
                    name = text(fn, src)
                    a = call_args(n)
                    cap = None
                    if name == "user_can" and len(a) > 1:
                        cap = literal_string(a[1], src)
                    elif name == "current_user_can" and a:
                        cap = literal_string(a[0], src)
                    if cap:
                        consumers[cap].append(
                            {"kind": name, "repo": repo, "file": rel,
                             "line": n.start_point[0] + 1}
                        )
                elif n.type == "array_element_initializer":
                    kids = [c for c in n.children if c.is_named]
                    if len(kids) == 2 and literal_string(kids[0], src) == "permission":
                        cap = literal_string(kids[1], src)
                        if cap:
                            consumers[cap].append(
                                {"kind": "route", "repo": repo, "file": rel,
                                 "line": n.start_point[0] + 1}
                            )
    return revoked, consumers


def find_discrepancies(side_effects, revoked, consumers):
    """Settings whose mechanisms disagree — flagged, not guessed.

    Only one class is mechanically detectable today: grant_without_revoke. Saving the setting
    grants a capability; nothing anywhere revokes it; therefore turning the setting back off
    leaves every consumer of that capability authorized. "Off" stops meaning off.

    Curated discrepancies (predicates that disagree inside one chain, filters whose return is
    dropped) live in chains.toml [[discrepancy]] — they need a human to assert them. This
    function only reports what the AST can prove.
    """
    # Group by (setting, cap) FIRST. One callback grants the same capability to several roles
    # with several add_cap calls, and the same record repeats per field the callback reads —
    # so naive dedup keeps whichever role happened to be last and silently understates the
    # blast radius of the grant. Which roles keep the capability is the finding.
    by_key = {}
    for r in side_effects:
        for g in r.get("grants_caps", []):
            if g["cap"] in revoked or not r.get("setting"):
                continue
            k = (r["setting"], g["cap"])
            entry = by_key.setdefault(k, {
                "type": "grant_without_revoke",
                "setting": r["setting"],
                "capability": g["cap"],
                "roles": [],
                "granted_at": [],
                "callback": r["callback"],
                "revoked_anywhere": False,
                "consumers": consumers.get(g["cap"], []),
            })
            if g["role"] and g["role"] not in entry["roles"]:
                entry["roles"].append(g["role"])
                entry["granted_at"].append(f"{r['repo']}/{r['file']}:{g['line']}")

    out = []
    for e in by_key.values():
        uses = e["consumers"]
        e["severity"] = "high" if len(uses) > 2 else "medium"
        e["summary"] = (
            f"Saving {e['setting']} grants '{e['capability']}' to "
            f"{', '.join(e['roles']) or '?'}. Nothing revokes it anywhere, so turning the "
            f"setting back off leaves {len(uses)} consumer(s) still authorized — "
            f"\"off\" is not off."
        )
        out.append(e)
    return sorted(out, key=lambda d: (d["severity"] != "high", d["setting"]))


# --------------------------------------------------------------- pass 3: field definitions


def _props(defnode, src):
    """Immediate 'key' => value props of a field-definition array."""
    out = {}
    for el in defnode.children:
        if el.type != "array_element_initializer":
            continue
        kids = [c for c in el.children if c.is_named]
        if len(kids) == 2:
            k = literal_string(kids[0], src)
            if k is not None:
                out[k] = kids[1]
    return out


def _storage_keys(defnode, src, array_key):
    """The option-row keys one field definition actually writes.

    The declared-field tree and the stored-key set are not the same shape, so the array key
    is not reliably the storage key:

      - 'type' => 'sub_section' is a UI header. It groups fields visually and stores nothing.
      - A composite field ('type' => 'commission_fixed') flattens its sub-fields into the
        row. Its 'fields' children each carry their own 'name', and THAT is the stored key —
        the sub-array's key is a UI id. This is how admin_percentage and additional_fee are
        declared: under array key 'commission_fixed_values', sub-keys 'percent_fee' and
        'fixed_fee', storing 'admin_percentage' and 'additional_fee'.
      - Otherwise the 'name' prop is the stored key; it usually equals the array key, but
        trusting 'name' is what makes the composite case fall out for free.
    """
    props = _props(defnode, src)

    # Field types that render but never store. Established empirically rather than guessed:
    # cross-referencing every declared field id against every read, `html` (16 declared, 0
    # ever read) and `warning` (4, 0) are never read anywhere, while every storing type
    # (switcher 70/70, text 42/38, select 27/23, radio 17/17, number 16/16 ...) is. Treating
    # them as settings put 20 phantom entries — the *_app_label / *_app_url link blurbs — in
    # the "dead settings" list.
    ftype = literal_string(props["type"], src) if "type" in props else None
    if ftype in ("sub_section", "html", "warning"):
        return set()
    # Renders AND stores — just not to the option row. `verification_methods` persists to
    # the dokan_vendor_verification_methods TABLE, so the row never holds it and calling it
    # a dead setting would be wrong in the other direction.
    if ftype in ("verification_methods",):
        return set()

    # Sub-fields, two shapes. `commission_fixed` nests them under a 'fields' prop; `social`
    # (11 uses across Pro) nests them under ARBITRARY prop names — enable_status,
    # google_app_label, google_app_id. Special-casing 'fields' meant every social container
    # was reported as one dead setting (`google_details`) while its 37 real sub-fields — the
    # OAuth credentials — were invisible. The tool reported the precise inverse of reality.
    #
    # General rule: a prop whose value is an array carrying its own 'name' key is a sub-field.
    # Verified safe against the two array-valued props that could false-match:
    #   'show_if' => ['commission_type' => ['equal' => 'fixed']]   — no 'name'
    #   'options' => ['seller' => 'Vendor', ...]                   — scalar values
    subs = set()
    containers = []
    fields = props.get("fields")
    if fields is not None and fields.type == "array_creation_expression":
        containers.append(fields)
    else:
        containers.append(defnode)

    for cont in containers:
        for el in cont.children:
            if el.type != "array_element_initializer":
                continue
            kids = [c for c in el.children if c.is_named]
            if len(kids) != 2 or kids[1].type != "array_creation_expression":
                continue
            if cont is defnode and "name" not in _props(kids[1], src):
                continue  # a plain array prop (options/show_if), not a sub-field
            subs |= _storage_keys(kids[1], src, literal_string(kids[0], src))
    if subs:
        return subs

    name = literal_string(props["name"], src) if "name" in props else None
    key = name or array_key
    return {key} if key else set()


def _field_keys(node, src, locals_map, depth=0, seen=None):
    """Field ids declared by an expression that evaluates to a fields array.

    Neither repo writes `'section' => ['field' => [...]]` directly. Both bind a section to
    local variables, often through array_merge and/or an apply_filters wrapper:

        $general_site_options = apply_filters( 'dokan_settings_general_site_options', [ ... ] );
        $settings_fields = [ 'dokan_general' => array_merge( $general_site_options, ... ) ];

    So resolving a section's fields means following locals through those wrappers. Bounded to
    one function scope and a small recursion depth — this is deliberately not a dataflow
    engine, and anything it cannot follow is counted as unresolved rather than guessed at.

    Returns (field_ids, resolved) — resolved=False means "give up honestly".
    """
    # depth counts VARIABLE hops only, not structural unwraps. The real chain in Lite's
    # get_settings_fields() is apply_filters -> array_merge -> $local -> apply_filters ->
    # literal, which burns ~8 node levels but only 1 variable hop; a node-level ceiling
    # cuts it off just short of the payload. `seen` guards cycles.
    if node is None or depth > 8:
        return set(), False
    if seen is None:
        seen = set()

    if node.type == "array_element_initializer":
        kids = [c for c in node.children if c.is_named]
        return _field_keys(kids[0], src, locals_map, depth, seen) if kids else (set(), False)

    if node.type == "array_creation_expression":
        # A field is a keyed element whose value is itself an array (the field definition).
        # Scalar-valued keys are a field's own props ('name' => 'x'), not fields. Immediate
        # children only — recursing would mistake a field's 'options' or 'show_if' array for
        # a field. What each definition *stores* is then _storage_keys()'s problem.
        out = set()
        for el in node.children:
            if el.type != "array_element_initializer":
                continue
            kids = [c for c in el.children if c.is_named]
            if len(kids) != 2:
                continue
            key = literal_string(kids[0], src)
            if key is not None and kids[1].type == "array_creation_expression":
                out |= _storage_keys(kids[1], src, key)
        return out, True

    if node.type == "variable_name":
        name = text(node, src)
        if name in seen:
            return set(), False  # cycle
        if name in locals_map:
            return _field_keys(locals_map[name], src, locals_map, depth + 1, seen | {name})
        return set(), False

    if node.type == "function_call_expression":
        fn_node = node.child_by_field_name("function")
        fn = text(fn_node, src) if fn_node is not None else ""
        args = call_args(node)
        if fn == "apply_filters" and len(args) >= 2:
            return _field_keys(args[1], src, locals_map, depth, seen)
        if fn in ("array_merge", "array_replace", "wp_parse_args"):
            out, ok = set(), bool(args)
            for a in args:
                keys, resolved = _field_keys(a, src, locals_map, depth, seen)
                out |= keys
                ok = ok and resolved
            return out, ok
        return set(), False

    if node.type == "argument":
        kids = [c for c in node.children if c.is_named]
        return _field_keys(kids[0], src, locals_map, depth, seen) if kids else (set(), False)

    if node.type == "subscript_expression":
        return set(), False  # $settings_fields['dokan_x'] — self-reference in a merge

    return set(), False


def _locals_in_scope(fn_node, src):
    """$var => assigned expression, for simple assignments inside one function."""
    out = {}
    for n in walk(fn_node):
        if n.type != "assignment_expression":
            continue
        lhs = n.child_by_field_name("left")
        rhs = n.child_by_field_name("right")
        if lhs is not None and rhs is not None and lhs.type == "variable_name":
            out[text(lhs, src)] = rhs
    return out


def scan_definitions(files_by_repo, known_sections):
    """Settings declared in a fields array, resolved through locals.

    Worth having despite the gaps: diffing declared against read surfaces settings that are
    declared but never read (dead) and read but never declared (silently returns the default
    forever). Neither is greppable. The scan reports its own coverage so the diff can be
    trusted — an unresolved section is very different from an empty one.
    """
    defs, unresolved, unattributed = [], Counter(), []

    for repo, files in files_by_repo.items():
        for path in files:
            raw = path.read_bytes()
            if b"settings_fields" not in raw and b"settings_sections" not in raw:
                continue
            tree, src = parse(path)
            rel = relpath(path, repo)

            for fn_node in walk(tree.root_node):
                if fn_node.type not in ("function_definition", "method_declaration"):
                    continue
                locals_map = _locals_in_scope(fn_node, src)

                for outer in walk(fn_node):
                    section = None
                    value = None
                    shape = None
                    line = None

                    # shape A: 'dokan_x' => <expr>
                    if outer.type == "array_element_initializer":
                        kids = [c for c in outer.children if c.is_named]
                        if len(kids) != 2:
                            continue
                        section = literal_string(kids[0], src)
                        value, shape, line = kids[1], "section_key", outer.start_point[0] + 1

                    # shape B: $settings_fields['dokan_x'] = <expr>
                    elif outer.type == "assignment_expression":
                        lhs = outer.child_by_field_name("left")
                        if lhs is None or lhs.type != "subscript_expression":
                            continue
                        kids = [c for c in lhs.children if c.is_named]
                        if len(kids) != 2:
                            continue
                        section = literal_string(kids[1], src)
                        value = outer.child_by_field_name("right")
                        shape, line = "subscript_assign", outer.start_point[0] + 1

                    if section is None or value is None:
                        continue
                    if section not in known_sections:
                        # $settings_fields['enable_tc_on_reg'] = [...] — Pro declares fields
                        # inside section-specific filter callbacks (dokan_settings_selling_
                        # option_vendor_capability etc), so the key here is a FIELD and the
                        # section is implied by which filter was hooked. Resolving that needs
                        # a filter->section map we do not build. Counted, never guessed.
                        if shape == "subscript_assign" and value.type == "array_creation_expression":
                            unattributed.append(
                                {"field": section, "repo": repo, "file": rel, "line": line}
                            )
                        continue

                    fields, resolved = _field_keys(value, src, locals_map)
                    if not resolved and not fields:
                        unresolved[f"{repo}:{section}"] += 1
                        continue
                    if not resolved:
                        unresolved[f"{repo}:{section}:partial"] += 1
                    # sorted(): `fields` is a set, and iterating it in hash order made
                    # settings.json churn ~1100 lines per run — fatal for the pre-commit use
                    # the README recommends, and it made "diff two scans" useless.
                    for field in sorted(fields):
                        defs.append(
                            {
                                "setting": f"{section}.{field}",
                                "section": section,
                                "field": field,
                                "repo": repo,
                                "file": rel,
                                "line": line,
                                "shape": shape,
                                "fully_resolved": resolved,
                            }
                        )

    # Dedupe: a section can be declared across several call sites.
    seen, deduped = set(), []
    for d in defs:
        if d["setting"] in seen:
            continue
        seen.add(d["setting"])
        deduped.append(d)
    return deduped, unresolved, unattributed


# ------------------------------------------------------------------------------- plumbing


def relpath(path, repo):
    parts = list(path.parts)
    for i in range(len(parts) - 1, -1, -1):
        if parts[i] == repo:
            return "/".join(parts[i + 1 :])
    return path.name


def load_chain_keys(chains):
    """key -> 'storekind.key' for every store named by a chain level. This is the Q3 bound:
    only meta reachable from a Source chain is in scope."""
    out = {}
    for chain in chains.get("chain", []):
        for level in chain.get("level", []):
            store = level.get("store")
            if not store or "." not in store:
                continue
            kind, key = store.split(".", 1)
            out[key] = store
        for w in chain.get("written_by", []):
            store = w.get("store")
            if store and "." in store:
                out[store.split(".", 1)[1]] = store
    return out


def main():
    ap = argparse.ArgumentParser(description="Scan Dokan admin settings into settings.json")
    ap.add_argument("--json", action="store_true", help="print the summary as JSON")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    import tomllib

    chains_path = HERE.parent / "chains.toml"
    chains = tomllib.loads(chains_path.read_text()) if chains_path.exists() else {}
    chain_keys = load_chain_keys(chains)

    plugins = json.loads(PLUGINS_JSON.read_text()) if PLUGINS_JSON.exists() else {}
    repos = {r: pathlib.Path(p) for r, p in plugins.items() if r.startswith("dokan")}
    if not repos:
        repos = {"dokan-lite": LITE}

    files_by_repo = {r: sorted(php_files(p)) for r, p in repos.items() if p.exists()}

    registry_sections, section_prov = scan_sections(files_by_repo)
    amap, amap_prov = scan_rearrange_map(files_by_repo)
    records, counters = scan_settings(files_by_repo, amap, chain_keys)
    # dokan_get_option's 2nd arg is a section by definition — that plus the registry is the
    # full vocabulary. Raw get_option('dokan_*') rows that match neither are ordinary options
    # (transients, caches), not settings rows, so they are dropped rather than invented.
    read_sections = {
        r["section"]
        for r in records
        if r["api"] == "dokan_get_option" and not r.get("dynamic") and r.get("section")
    }
    known_sections = read_sections | registry_sections
    before = len(records)
    records = [
        r for r in records
        if r["api"] == "dokan_get_option" or r.get("section") in known_sections
        or r.get("store")
    ]
    dropped_non_settings_rows = before - len(records)

    side = scan_side_effects(files_by_repo, known_sections)
    records.extend(side)
    revoked, cap_consumers = scan_capability_usage(files_by_repo)
    discrepancies = find_discrepancies(side, revoked, cap_consumers)
    for d in chains.get('discrepancy', []):
        d = dict(d)
        d.setdefault('type', 'declared')
        d['declared'] = True
        discrepancies.append(d)

    defs, unresolved, unattributed = scan_definitions(files_by_repo, known_sections)

    read_settings = {r["setting"] for r in records if r["kind"] == "read" and r["setting"]}
    declared = {d["setting"] for d in defs}

    # Only diff within sections whose declarations fully resolved. A section we could not
    # follow tells us nothing about whether its settings are declared — reporting its reads
    # as "never declared" would manufacture findings out of scanner limitations.
    unresolved_sections = {k.split(":")[1] for k in unresolved}
    trusted = lambda s: s.split(".")[0] not in unresolved_sections
    diff_declared = {s for s in declared if trusted(s)}
    diff_read = {s for s in read_settings if trusted(s)}

    # declared_never_read is sound: a setting we DID resolve and nothing reads is dead,
    # regardless of what else we missed. read_never_declared is not — an unattributed
    # declaration is indistinguishable from a missing one, so every unattributed field is a
    # potential false "always returns default". Suppress rather than mislead.
    read_diff_reliable = not unattributed

    payload = {
        "records": records,
        "sections": sorted(known_sections),
        "section_provenance": section_prov,
        "sections_registry_only": sorted(registry_sections - read_sections),
        "sections_read_only": sorted(read_sections - registry_sections),
        "definitions": defs,
        "rearrange_map": amap_prov,
        "chain_keys": chain_keys,
        "counters": {
            "files_scanned": sum(len(f) for f in files_by_repo.values()),
            "records": len(records),
            "settings_read": len(read_settings),
            "settings_declared": len(declared),
            "declared_never_read": len(diff_declared - diff_read),
            "read_never_declared": (len(diff_read - diff_declared) if read_diff_reliable else None),
            "unattributed_definitions": len(unattributed),
            "sections_unresolved": len(unresolved_sections),
            "sections": len(known_sections),
            "sections_in_registry": len(registry_sections),
            "sections_declared_never_read": len(registry_sections - read_sections),
            "dropped_non_settings_rows": dropped_non_settings_rows,
            "discrepancies": len(discrepancies),
            "side_effects": len(side),
            "side_effect_callbacks": len({r["callback"] for r in side}),
            "rearrange_entries": len(amap),
            "ambiguous": counters.get("ambiguous", 0),
            **{k: v for k, v in sorted(counters.items())},
        },
        "diff": {
            "_note": "Restricted to sections whose declarations fully resolved; see "
                     "unresolved_definition_shapes for sections excluded from the diff.",
            "declared_never_read": sorted(diff_declared - diff_read),
            "read_never_declared": (
                sorted(diff_read - diff_declared) if read_diff_reliable else None
            ),
            "read_never_declared_suppressed_because": (
                None if read_diff_reliable else
                f"{len(unattributed)} field declarations could not be attributed to a section "
                "(Pro declares fields inside section-specific filter callbacks). Any of them "
                "could account for a setting listed here, so the list would be mostly false."
            ),
        },
        "discrepancies": discrepancies,
        "unresolved_definition_shapes": dict(unresolved),
        "unattributed_definitions": unattributed,
    }

    OUT.mkdir(exist_ok=True)
    (OUT / "settings.json").write_text(json.dumps(payload, indent=1))

    if args.json:
        print(json.dumps(payload["counters"], indent=2))
    elif not args.quiet:
        c = payload["counters"]
        print(f"settings.json written — {c['files_scanned']:,} php files, {c['records']:,} records")
        print(f"  sections           {c['sections']:>4}" f"  ({c['sections_in_registry']} in registry, {c['sections_declared_never_read']} declared-never-read)")
        print(f"  settings read      {c['settings_read']:>4}")
        print(f"  settings declared  {c['settings_declared']:>4}")
        print(f"  rearrange entries  {c['rearrange_entries']:>4}  (lite 9 + pro 4)")
        print(f"  save side-effects  {c['side_effects']:>4}  across "
              f"{c['side_effect_callbacks']} callbacks (impact of WRITING, not reading)")
        print(f"  AMBIGUOUS reads    {c['ambiguous']:>4}  (dynamic args — kept, not dropped)")
        print(f"  declared never read {c['declared_never_read']:>3}  (dead settings)")
        rnd = c["read_never_declared"]
        print(
            f"  read never declared {rnd:>3}  (always returns default)"
            if rnd is not None
            else f"  read never declared   -  (suppressed: {c['unattributed_definitions']} "
                 "unattributed declarations)"
        )
        print(f"  sections unresolved {c['sections_unresolved']:>3}  (excluded from the diff)")
        if c["discrepancies"]:
            print(f"\n  !! {c['discrepancies']} DISCREPANCY(IES) — mechanisms that disagree:")
            for d in payload["discrepancies"]:
                one = " ".join(str(d.get("summary") or d.get("type")).split())
                tag = "declared" if d.get("declared") else "detected"
                print(f"     [{d.get('severity','?'):>6}/{tag}] {one[:150]}")


if __name__ == "__main__":
    main()
