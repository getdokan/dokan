#!/usr/bin/env python3
"""Reconcile the PayPal catalogue against what a run actually executed.

Three populations must agree, and the interesting answer is always the gap:
  CATALOGUED  — every `### - [ ] PP-XXX-NN` in test-cases.md
  IMPLEMENTED — every id named in a test() / test.fail() / test.fixme() title in a spec
  EXECUTED    — every id that produced a ✓ or ✘ line in the run log

A case can be implemented and still never execute (serial cascade, beforeAll abort, grep
filter), which is the failure this script exists to make visible: the run summary counts it
as "not a failure", so a green summary can hide it. Anything IMPLEMENTED-but-not-EXECUTED
is reported loudly, because that is coverage the suite claims and did not deliver.
"""
import re, sys, glob, os, collections

CAT = 'test-cases.md'
ID = re.compile(r'PP-[A-Z0-9]+-\d+')


def strip_ansi(s):
    return re.sub(r'\x1b\[[0-9;]*m', '', s)


def catalogued():
    s = open(CAT, encoding='utf-8').read()
    return [(m.group(2), m.group(1) == 'x')
            for m in re.finditer(r'^### - \[( |x)\] (PP-[A-Z0-9]+-\d+)', s, re.M)]


def implemented():
    """id -> spec file. Only ids appearing in a TEST TITLE count; a mention in a comment
    is not an implementation."""
    out = {}
    for f in sorted(glob.glob('*.spec.ts')):
        s = open(f, encoding='utf-8').read()
        # test('…'), test.fail('…'), test.fixme('…'), and ids in a parametrised table
        for m in re.finditer(r"test(?:\.\w+)?\(\s*['\"`]([^'\"`]+)", s):
            for i in ID.findall(m.group(1)):
                out.setdefault(i, f)
        # parametrised loops list ids in an array literal alongside their event constant
        for m in re.finditer(r"\[\s*'(PP-[A-Z0-9]+-\d+)'\s*,", s):
            out.setdefault(m.group(1), f)
    return out


def real_failures(s):
    """The ids Playwright itself counted as failures, taken from the numbered failure blocks
    at the end of the report — NOT from the ✘ glyph.

    A `test.fail()` test whose body fails is the EXPECTED outcome, so Playwright scores it as
    passed, yet the list reporter still prints ✘ for it. Trusting the glyph therefore invents
    a failure that did not happen (it misreported PP-WHK-18 on 2026-07-31). The failure blocks
    are the authority; the glyph is decoration."""
    ids = set()
    for b in re.split(r'\n\s*\d+\)\s+\[\w+\]', s)[1:]:
        found = ID.findall(b.split('\n')[0])
        if found:
            ids.add(found[0])
    return ids


def executed(logpath):
    """id -> outcome, from the reporter lines. Retries collapse into the final verdict."""
    s = strip_ansi(open(logpath, encoding='utf-8', errors='replace').read())
    failed = real_failures(s)
    out = {}
    for line in s.split('\n'):
        m = re.match(r'\s*([✓✘])\s+\d+\s+\[', line)
        if not m:
            continue
        ids = ID.findall(line)
        if not ids:
            continue
        i = ids[0]
        # ✘ on an id Playwright did not count as failed == an expected-fail that behaved.
        outcome = 'failed' if i in failed else 'passed'
        if out.get(i) != 'passed':
            out[i] = outcome
    return out


def main():
    log = sys.argv[1]
    cat = catalogued()
    impl = implemented()
    ex = executed(log)

    cat_ids = [c for c, _ in cat]
    missing_impl = [c for c in cat_ids if c not in impl]
    impl_not_exec = [c for c in cat_ids if c in impl and c not in ex]
    ghost = [i for i in impl if i not in cat_ids]

    by_area = collections.defaultdict(lambda: [0, 0, 0, 0])  # cat, impl, passed, failed
    for c in cat_ids:
        a = c.rsplit('-', 1)[0]
        by_area[a][0] += 1
        if c in impl:
            by_area[a][1] += 1
        if ex.get(c) == 'passed':
            by_area[a][2] += 1
        if ex.get(c) == 'failed':
            by_area[a][3] += 1

    print(f'{"area":9} {"cases":>5} {"impl":>5} {"pass":>5} {"fail":>5} {"NOT RUN":>8}')
    for a in sorted(by_area):
        c, i, p, f = by_area[a]
        notrun = i - p - f
        flag = '  <== never executed' if notrun else ''
        print(f'{a:9} {c:>5} {i:>5} {p:>5} {f:>5} {notrun:>8}{flag}')
    tc, ti, tp, tf = (sum(x) for x in zip(*by_area.values()))
    print(f'{"TOTAL":9} {tc:>5} {ti:>5} {tp:>5} {tf:>5} {ti-tp-tf:>8}')

    print()
    print(f'catalogued but NOT implemented ({len(missing_impl)}):')
    print('   ', ', '.join(missing_impl) if missing_impl else '(none)')
    print(f'implemented but NEVER EXECUTED ({len(impl_not_exec)}):')
    print('   ', ', '.join(impl_not_exec) if impl_not_exec else '(none)')
    print(f'in a spec but NOT in the catalogue ({len(ghost)}):')
    print('   ', ', '.join(sorted(ghost)) if ghost else '(none)')
    print()
    failed = sorted(i for i, o in ex.items() if o == 'failed')
    print(f'FAILED ({len(failed)}):')
    print('   ', ', '.join(failed) if failed else '(none)')


if __name__ == '__main__':
    main()
