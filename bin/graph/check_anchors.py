#!/usr/bin/env python3
"""
Verify every anchor in chains.toml still points at the code it claims.

chains.toml is hand-written (nine Source chains, only one of which a scanner could detect).
Hand-written means it drifts, and a drifted chain description is worse than none — the file's
entire value is that you can trust it without re-reading six modules.

So every anchor carries an `anchor_contains` fingerprint, and this checks that the cited line
still contains it. Cheap enough for CI or a pre-commit hook; needs no graph and no scan.

Exit 0 = all anchors good. Exit 1 = at least one drifted; the chain it belongs to is now
suspect and should be re-verified against the code before anyone trusts the graph built
from it.

Run:  bin/graph/check_anchors.py [--quiet]
"""

import argparse
import json
import pathlib
import sys
import tomllib

HERE = pathlib.Path(__file__).resolve()
LITE = HERE.parent.parent.parent
CHAINS = HERE.parent / "chains.toml"
PLUGINS = LITE / "graphify-out" / "plugins.json"

# How far to look around the cited line before calling it drift. Anchors rot by a few lines
# constantly (an import added above); that is not worth failing CI over, but it IS worth
# reporting so the file can be corrected while the fix is cheap.
SLACK = 12


def repo_roots():
    if PLUGINS.exists():
        return {r: pathlib.Path(p) for r, p in json.loads(PLUGINS.read_text()).items()}
    return {"dokan-lite": LITE, "dokan-pro": LITE.parent / "dokan-pro"}


def check(anchor, needle, roots):
    """-> (status, detail). status in {ok, weak, moved, drifted, missing, no_file, malformed}

    The previous version could not fail for 26 of 36 anchors, which made Q4's "curation is
    safe because CI verifies it" argument 72% theatre. Two defects, both fixed here:

      1. A needle matching many lines in its own file cannot pin anything. When the cited line
         died, the whole-file fallback found an unrelated match, said "moved", and passed.
         Now: a non-unique needle is reported as `weak` — the anchor is unfit, fix the needle.
      2. A match found only OUTSIDE the drift window is not drift; it is a different piece of
         code that happens to contain the same text. That is now `drifted` and it fails.

    Only a match within SLACK of the cited line is benign movement.
    """
    if not anchor or ":" not in anchor:
        return "malformed", anchor or "(none)"
    path_part, _, line_s = anchor.rpartition(":")
    repo, _, rel = path_part.partition("/")
    if repo not in roots or not line_s.isdigit():
        return "malformed", anchor
    f = roots[repo] / rel
    if not f.exists():
        return "no_file", str(f)
    lines = f.read_text(errors="replace").splitlines()
    n = int(line_s)
    if not needle:
        return ("ok", "") if 1 <= n <= len(lines) else ("missing", "line out of range")

    hits = [i + 1 for i, l in enumerate(lines) if needle in l]
    if not hits:
        return "missing", f"{needle!r} not found anywhere in {rel}"

    # Uniqueness is only required WITHIN the drift window, not across the file. An anchor
    # pins "this line, ± SLACK"; a needle that also appears 400 lines away cannot cause a
    # false pass, because a match that far out is not accepted. The old code searched the
    # whole file as a fallback and called a distant coincidence "moved" — which passed CI on
    # deleted code. Requiring whole-file uniqueness instead was over-strict: it failed on 5
    # anchors whose lines are simply duplicated elsewhere in the same file.
    near = [h for h in hits if abs(h - n) <= SLACK]

    if not near:
        return "drifted", (f"{needle!r} is not within {SLACK} lines of {n} (nearest: "
                           f"{hits[:3]}). The cited code is probably gone.")
    if len(near) > 1:
        return "weak", (f"{needle!r} matches {len(near)} lines within ±{SLACK} of {n} "
                        f"({near[:4]}) — cannot pin; use a longer needle")
    if near[0] == n:
        return "ok", ""
    return "moved", f"found at line {near[0]} (anchor says {n}, drift {near[0] - n:+d})"


def main():
    ap = argparse.ArgumentParser(description="Verify chains.toml anchors against the code")
    ap.add_argument("--quiet", action="store_true", help="only print problems")
    args = ap.parse_args()

    chains = tomllib.loads(CHAINS.read_text())
    roots = repo_roots()
    results = []

    for chain in chains.get("chain", []):
        cid = chain["id"]
        results.append((cid, "resolver", *check(chain.get("resolver"), chain.get("anchor_contains"), roots)))
        for lv in chain.get("level", []):
            results.append(
                (cid, f"rank {lv['rank']} ({lv['source']})",
                 *check(lv.get("anchor"), lv.get("anchor_contains"), roots))
            )
        for w in chain.get("written_by", []):
            results.append(
                (cid, f"written_by {w.get('via', '?')}",
                 *check(w.get("anchor"), w.get("anchor_contains"), roots))
            )

    # Behaviors are the use-case layer: claims that a setting produces a user-visible
    # consequence. Same trust contract as chains — every gate, shape, also_anchor and
    # outcome is pinned, because "this blocks checkout" that silently stopped being true
    # sends someone to reassure a merchant with stale facts.
    for b in chains.get("behavior", []):
        bid = b["id"]
        results.append((bid, "behavior", *check(b.get("anchor"), b.get("anchor_contains"), roots)))
        if b.get("outcome_anchor"):
            results.append((bid, "outcome",
                            *check(b.get("outcome_anchor"), b.get("outcome_anchor_contains"), roots)))
        for role in ("gate", "shape"):
            for e in b.get(role, []):
                results.append((bid, f"{role} {e.get('setting', '?')}",
                                *check(e.get("anchor"), e.get("anchor_contains"), roots)))
                for extra in e.get("also_anchors", []):
                    results.append((bid, f"{role} {e.get('setting', '?')} (also)",
                                    *check(extra.get("anchor"), extra.get("anchor_contains"), roots)))

    # Discrepancies are claims about code that disagrees with itself. If the anchor rots, the
    # claim may already be fixed — and a stale "this is broken" note is worse than none,
    # because someone will go fix a bug that no longer exists.
    for d in chains.get("discrepancy", []):
        results.append(
            (d.get("chain", "-"), f"discrepancy {d.get('type', '?')}",
             *check(d.get("anchor"), d.get("anchor_contains"), roots))
        )

    bad = [r for r in results if r[2] != "ok"]
    moved = [r for r in bad if r[2] == "moved"]
    weak = [r for r in bad if r[2] == "weak"]
    broken = [r for r in bad if r[2] not in ("moved", "weak")]

    if not args.quiet:
        print(f"chains.toml: {len(chains.get('chain', []))} chains, "
              f"{len(chains.get('behavior', []))} behaviors, "
              f"{len(chains.get('discrepancy', []))} discrepancies, {len(results)} anchors")
    for cid, what, status, detail in bad:
        icon = {"moved": "~", "weak": "?"}.get(status, "!")
        print(f"  {icon} [{cid}] {what}: {status.upper()} — {detail}")

    if not bad:
        if not args.quiet:
            print(f"  all {len(results)} anchors verified and uniquely pinned")
        return 0
    print(f"\n  {len(results) - len(bad)} ok · {len(moved)} moved · {len(weak)} weak · "
          f"{len(broken)} broken")
    if broken:
        print("  BROKEN: chains.toml no longer describes the code. Fix before trusting")
        print("  anything built from it.")
        return 1
    if weak:
        print("  WEAK: these needles match several lines, so they cannot detect deletion —")
        print("  the anchor passes even if the cited code is gone. Pick unique needles.")
        return 1
    print("  Anchors drifted a few lines — update chains.toml when convenient.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
