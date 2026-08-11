"""Scan WordPress plugins for hook fires (do_action/apply_filters) and
registrations (add_action/add_filter) using tree-sitter PHP.

Emits JSON records with hook name, dynamic flag, enclosing scope, and callback.
"""
import json
import re
import sys
from pathlib import Path

import tree_sitter_php
from tree_sitter import Language, Parser

LANG = Language(tree_sitter_php.language_php())
PARSER = Parser(LANG)

FIRE_FNS = {
    "do_action", "do_action_ref_array", "do_action_deprecated",
    "apply_filters", "apply_filters_ref_array", "apply_filters_deprecated",
}
LISTEN_FNS = {"add_action", "add_filter"}

SKIP_DIRS = {
    "vendor", "lib", "dependencies", "node_modules", "assets", "tests",
    "i18n", "sample-data", "languages", "docs", "bin", "dist", "build",
    ".git", "graphify-out",
}


def text(node, src):
    return src[node.start_byte:node.end_byte].decode("utf-8", "replace")


def string_value(node, src):
    """Return (value, dynamic) for a PHP string-ish argument node, else (None, True)."""
    t = node.type
    if t == "string":  # single-quoted
        return text(node, src)[1:-1], False
    if t == "encapsed_string":  # double-quoted, may interpolate
        parts, dynamic = [], False
        for c in node.named_children:
            if c.type == "string_content":
                parts.append(text(c, src))
            elif c.type == "escape_sequence":
                parts.append(text(c, src))
            else:  # variable_name / member access etc.
                inner = text(c, src).strip("{}$")
                parts.append("{" + inner + "}")
                dynamic = True
        return "".join(parts), dynamic
    if t == "binary_expression":  # 'prefix_' . $var
        parts, dynamic = [], False
        for c in node.children:
            if c.type in (".",):
                continue
            v, d = string_value(c, src)
            if v is None:
                parts.append("{expr}")
                dynamic = True
            else:
                parts.append(v)
                dynamic = dynamic or d
        return "".join(parts), dynamic
    if t == "class_constant_access_expression":
        return None, True
    return None, True


def enclosing_scope(node, src):
    """Walk up: return (class_name, function_name, via_closure)."""
    cls = None
    fn = None
    via_closure = False
    cur = node.parent
    while cur is not None:
        if cur.type in ("anonymous_function_creation_expression", "anonymous_function", "arrow_function") and fn is None:
            via_closure = True
        elif cur.type in ("function_definition", "method_declaration") and fn is None:
            name = cur.child_by_field_name("name")
            fn = text(name, src) if name else None
        elif cur.type in ("class_declaration", "trait_declaration", "interface_declaration", "enum_declaration") and cls is None:
            name = cur.child_by_field_name("name")
            cls = text(name, src) if name else None
        cur = cur.parent
    return cls, fn, via_closure


def parse_callback(node, src, encl_cls):
    """Classify an add_action/add_filter callback argument."""
    t = node.type
    if t in ("string", "encapsed_string"):
        val, dyn = string_value(node, src)
        if val is None or dyn:
            return {"type": "unknown"}
        if "::" in val:
            c, m = val.split("::", 1)
            return {"type": "static", "class": c.lstrip("\\"), "method": m}
        return {"type": "function", "name": val.lstrip("\\")}
    if t == "array_creation_expression":
        elems = [c for c in node.named_children if c.type == "array_element_initializer"]
        if len(elems) == 2:
            obj = elems[0].named_children[0] if elems[0].named_children else None
            meth = elems[1].named_children[0] if elems[1].named_children else None
            mval = None
            if meth is not None and meth.type in ("string", "encapsed_string"):
                mval, mdyn = string_value(meth, src)
                if mdyn:
                    mval = None
            if obj is not None and mval:
                ot = obj.type
                otext = text(obj, src)
                if ot == "variable_name" and otext == "$this":
                    return {"type": "method", "class": encl_cls, "method": mval, "instance": True}
                if ot == "class_constant_access_expression" and otext.endswith("::class"):
                    cname = otext[:-7].lstrip("\\")
                    if cname in ("self", "static"):
                        cname = encl_cls
                    return {"type": "static", "class": cname, "method": mval}
                if ot in ("string", "encapsed_string"):
                    cval, cdyn = string_value(obj, src)
                    if cval and not cdyn:
                        return {"type": "static", "class": cval.split("\\")[-1], "method": mval, "fqcn": cval.lstrip("\\")}
                if ot == "variable_name":
                    return {"type": "instance_var", "var": otext, "method": mval}
                if ot in ("member_access_expression", "scoped_property_access_expression", "function_call_expression", "member_call_expression", "scoped_call_expression"):
                    return {"type": "expr_instance", "expr": otext[:80], "method": mval}
        return {"type": "unknown"}
    if t in ("anonymous_function_creation_expression", "anonymous_function", "arrow_function"):
        return {"type": "closure"}
    if t in ("member_call_expression", "scoped_call_expression") and text(node, src).rstrip().endswith("(...)"):
        # first-class callable syntax: $this->cb(...) / Foo::cb(...)
        name = node.child_by_field_name("name")
        mval = text(name, src) if name else None
        if mval:
            obj = node.child_by_field_name("object") or node.child_by_field_name("scope")
            otext = text(obj, src) if obj else ""
            if otext == "$this":
                return {"type": "method", "class": encl_cls, "method": mval, "instance": True}
            if otext in ("self", "static"):
                return {"type": "static", "class": encl_cls, "method": mval}
            if otext and not otext.startswith("$"):
                return {"type": "static", "class": otext.split("\\")[-1], "method": mval}
        return {"type": "unknown"}
    if t == "name":  # first-class callable? bare constant
        return {"type": "unknown"}
    return {"type": "unknown"}


def scan_file(path: Path, root: Path, repo: str, records: list, counters: dict):
    try:
        src = path.read_bytes()
    except OSError:
        return
    tree = PARSER.parse(src)
    rel = str(path.relative_to(root))

    def walk(node):
        if node.type == "function_call_expression":
            fn_node = node.child_by_field_name("function")
            if fn_node is not None and fn_node.type == "name":
                fname = text(fn_node, src)
                if fname in FIRE_FNS or fname in LISTEN_FNS:
                    args_node = node.child_by_field_name("arguments")
                    args = [a.named_children[0] for a in args_node.named_children
                            if a.type == "argument" and a.named_children] if args_node else []
                    if args:
                        hook, dynamic = string_value(args[0], src)
                        line = node.start_point[0] + 1
                        cls, fn, via_closure = enclosing_scope(node, src)
                        if hook is None:
                            counters["fully_dynamic"] += 1
                            hook_expr = text(args[0], src)[:80]
                            records.append({
                                "kind": "fire" if fname in FIRE_FNS else "listen",
                                "api": fname, "hook": None, "hook_expr": hook_expr,
                                "dynamic": True, "repo": repo, "file": rel, "line": line,
                                "class": cls, "function": fn, "via_closure": via_closure,
                            })
                        else:
                            rec = {
                                "kind": "fire" if fname in FIRE_FNS else "listen",
                                "api": fname, "hook": hook, "dynamic": dynamic,
                                "repo": repo, "file": rel, "line": line,
                                "class": cls, "function": fn, "via_closure": via_closure,
                            }
                            if fname in LISTEN_FNS:
                                rec["callback"] = parse_callback(args[1], src, cls) if len(args) > 1 else {"type": "unknown"}
                            records.append(rec)
                            counters["dynamic" if dynamic else "static"] += 1
        for c in node.children:
            walk(c)

    walk(tree.root_node)


def main():
    plugins = json.loads(Path(sys.argv[1]).read_text())  # {repo: root_path}
    out_path = Path(sys.argv[2])
    records = []
    counters = {"static": 0, "dynamic": 0, "fully_dynamic": 0, "files": 0}
    for repo, root in plugins.items():
        root = Path(root)
        for path in sorted(root.rglob("*.php")):
            if any(part in SKIP_DIRS for part in path.relative_to(root).parts[:-1]):
                continue
            counters["files"] += 1
            scan_file(path, root, repo, records, counters)
    out_path.write_text(json.dumps({"records": records, "counters": counters}, indent=1))
    fires = sum(1 for r in records if r["kind"] == "fire")
    listens = sum(1 for r in records if r["kind"] == "listen")
    print(f"Scanned {counters['files']} PHP files: {fires} fires, {listens} listens "
          f"({counters['static']} static, {counters['dynamic']} interpolated, {counters['fully_dynamic']} fully-dynamic)")


if __name__ == "__main__":
    main()
