#!/usr/bin/env python3
"""
Emit graphify-out/settings-view.html — the settings overlay, rendered.

Mirrors hook-view.html: same vis-network build (pinned + SRI), same dark palette, same
sidebar-and-search shape. Reads graph.json, so run merge_settings.py first.

The view leads with Source chains because precedence is the thing that is genuinely hard to
hold in your head — nine chains, and the winner is whichever Source is most specific, not a
merge of all of them. Rank is encoded as a colour ramp: dark = most specific = wins.

Run:  bin/graph/build_view.py [--open]
"""

import argparse
import collections
import json
import pathlib
import subprocess
import sys

OUT = pathlib.Path(__file__).resolve().parent.parent.parent / "graphify-out"
GRAPH = OUT / "graph.json"
SETTINGS = OUT / "settings.json"
VIEW = OUT / "settings-view.html"
ORIGIN = "wp-settings-pass"

# Rank ramp: dark = rank 1 = most specific = wins. Reads as "weight of authority".
RANK_COLORS = ["#7D3C4A", "#A14C5A", "#C4726B", "#DDA07E", "#E8C89B"]
TYPE_COLORS = {
    "chain": "#F28E2B",
    "setting": "#4E79A7",
    "settings_row": "#3B5F82",
    "store": "#76B7B2",
}
REPO_COLORS = {"dokan-lite": "#59A14F", "dokan-pro": "#B07AA1", "woocommerce": "#9C755F"}
REL_COLORS = {
    "reads": "#4E79A7",
    "writes": "#E15759",
    "declares": "#8E8E9E",
    "resolves_through": "#F28E2B",
    "defers_to": "#EDC948",
    "backed_by": "#76B7B2",
    "materializes_into": "#FF3B30",
}


def build():
    if not GRAPH.exists():
        sys.exit(f"missing {GRAPH} — run merge_settings.py first")
    g = json.loads(GRAPH.read_text())
    data = json.loads(SETTINGS.read_text()) if SETTINGS.exists() else {"counters": {}}
    N = {n["id"]: n for n in g["nodes"]}

    overlay = {i: n for i, n in N.items() if n.get("_origin") == ORIGIN}
    edges = [l for l in g["links"] if l.get("_origin") == ORIGIN]

    # Pull in the call sites that touch the overlay — they are base-graph nodes, and they are
    # the whole point: they are what shows Pro reaching into Lite's settings.
    callers = {}
    for l in edges:
        if l["source"] not in overlay and l["source"] in N:
            callers[l["source"]] = N[l["source"]]

    nodes = []
    for i, n in overlay.items():
        t = n.get("type")
        if t == "source":
            color = RANK_COLORS[min(int(n.get("rank", 1)) - 1, len(RANK_COLORS) - 1)]
        else:
            color = TYPE_COLORS.get(t, "#888")
        nodes.append({
            "id": i, "label": n.get("label", i), "type": t, "color": color,
            "shape": {"chain": "diamond", "source": "hexagon", "store": "triangle"}.get(t, "dot"),
            "size": {"chain": 26, "source": 20, "store": 13}.get(t, 11),
            "rank": n.get("rank"), "section": n.get("section"), "field": n.get("field"),
            "defer": n.get("defer"), "anchor": n.get("anchor"),
            "resolver": n.get("resolver"), "defer_predicate": n.get("defer_predicate"),
            "writes_back": n.get("writes_back_on_miss"), "store_kind": n.get("store_kind"),
        })
    for i, n in callers.items():
        repo = i.split("::")[0]
        nodes.append({
            "id": i, "label": n.get("label", i), "type": "caller",
            "color": REPO_COLORS.get(repo, "#888"), "shape": "square", "size": 7,
            "repo": repo, "file": n.get("source_file"), "line": n.get("source_location"),
        })

    out_edges = [{
        "from": l["source"], "to": l["target"], "rel": l["relation"],
        "color": REL_COLORS.get(l["relation"], "#555"),
        "ctx": l.get("context"), "file": l.get("source_file"),
        "line": (l.get("source_location") or "")[1:], "rank": l.get("rank"),
    } for l in edges]

    chains = {}
    for i, n in overlay.items():
        if n.get("type") != "chain":
            continue
        lv = sorted(
            (N[e["to"]] if False else overlay[e["target"]]
             for e in edges if e["source"] == i and e["relation"] == "resolves_through"),
            key=lambda x: x.get("rank", 0),
        )
        chains[i] = {
            "label": n.get("label"), "resolver": n.get("resolver"),
            "defer_predicate": n.get("defer_predicate"),
            "writes_back": n.get("writes_back_on_miss"),
            "levels": [{"rank": x.get("rank"), "source": x.get("source"),
                        "defer": x.get("defer"), "id": x["id"]} for x in lv],
        }

    cross = collections.Counter()
    for l in edges:
        s, t = l["source"].split("::")[0], l["target"].split("::")[0]
        if s != t and s in REPO_COLORS:
            cross[s] += 1

    meta = {
        "counters": data.get("counters", {}),
        "cross": dict(cross),
        "commit": g.get("built_at_commit_settings_pass", "")[:9],
        "sections": sorted({n["section"] for n in nodes if n.get("section")}),
    }
    return nodes, out_edges, chains, meta


HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dokan settings graph — settings, stores &amp; Source chains</title>
<script src="https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js"
        integrity="sha384-Ux6phic9PEHJ38YtrijhkzyJ8yQlH8i/+buBR8s3mAZOJrP1gwyvAcIYl3GWtpX1"
        crossorigin="anonymous"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0f1a; color: #e0e0e0;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         display: flex; height: 100vh; overflow: hidden; }
  #graph { flex: 1; }
  #sidebar { width: 340px; background: #1a1a2e; border-left: 1px solid #2a2a4e;
             display: flex; flex-direction: column; overflow: hidden; }
  #head { padding: 12px 14px; border-bottom: 1px solid #2a2a4e; }
  #head h1 { font-size: 13px; letter-spacing: .04em; text-transform: uppercase; color: #9aa; }
  #head .sub { font-size: 11px; color: #667; margin-top: 3px; font-variant-numeric: tabular-nums; }
  #search-wrap { padding: 10px 12px; border-bottom: 1px solid #2a2a4e; }
  #search { width: 100%; background: #0f0f1a; border: 1px solid #3a3a5e; color: #e0e0e0;
            padding: 7px 10px; border-radius: 6px; font-size: 13px; outline: none; }
  #search:focus { border-color: #4E79A7; }
  #results { max-height: 150px; overflow-y: auto; padding: 4px 12px; display: none;
             border-bottom: 1px solid #2a2a4e; }
  .ritem { padding: 4px 6px; cursor: pointer; border-radius: 4px; font-size: 12px;
           white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ritem:hover { background: #2a2a4e; }
  #filters { padding: 10px 12px; border-bottom: 1px solid #2a2a4e; display: flex;
             flex-wrap: wrap; gap: 5px; }
  .chip { font-size: 11px; padding: 3px 8px; border-radius: 11px; cursor: pointer;
          border: 1px solid #3a3a5e; color: #99a; user-select: none; }
  .chip:hover { border-color: #4E79A7; color: #cde; }
  .chip.on { background: #4E79A7; border-color: #4E79A7; color: #fff; }
  #info { padding: 14px; overflow-y: auto; flex: 1; }
  #info h3 { font-size: 13px; color: #fff; margin-bottom: 2px; word-break: break-word; }
  #info .id { font-size: 10px; color: #667; font-family: ui-monospace, Menlo, monospace;
              word-break: break-all; margin-bottom: 10px; }
  .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .07em; color: #778;
         margin: 12px 0 5px; }
  .row { font-size: 11px; padding: 3px 0; border-bottom: 1px solid #23233c;
         display: flex; gap: 7px; }
  .row .r { color: #8ab; min-width: 62px; }
  .row .m { color: #99a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lvl { display: flex; align-items: center; gap: 7px; font-size: 11px; padding: 4px 6px;
         border-radius: 4px; margin-bottom: 2px; }
  .lvl.here { background: #2a2a4e; }
  .dot { width: 9px; height: 9px; border-radius: 50%; flex: none; }
  .warn { background: #2a1f1f; border-left: 2px solid #E15759; padding: 8px 10px;
          font-size: 11px; color: #d9a; margin-top: 10px; line-height: 1.5; border-radius: 3px; }
  .note { font-size: 11px; color: #778; line-height: 1.55; margin-top: 8px; }
  code { font-family: ui-monospace, Menlo, monospace; font-size: 10px; color: #8ab;
         word-break: break-all; overflow-wrap: anywhere; }
  .note, .warn { overflow-wrap: anywhere; }
  .lvl .df { color: #667; margin-left: auto; font-size: 10px; text-align: right;
             max-width: 46%; overflow-wrap: anywhere; }
  #legend { padding: 9px 12px; border-top: 1px solid #2a2a4e; font-size: 10px; color: #778;
            display: flex; flex-wrap: wrap; gap: 8px; }
  #legend span { display: flex; align-items: center; gap: 4px; }
</style>
</head>
<body>
<div id="graph"></div>
<div id="sidebar">
  <div id="head">
    <h1>Dokan settings graph</h1>
    <div class="sub" id="stats"></div>
  </div>
  <div id="search-wrap"><input id="search" placeholder="search settings, stores, chains..."></div>
  <div id="results"></div>
  <div id="filters"></div>
  <div id="info"><div class="note">Click any node. Chains are diamonds, Sources hexagons
    (darker&nbsp;=&nbsp;more specific&nbsp;=&nbsp;wins), settings dots, stores triangles,
    call sites squares (green&nbsp;Lite, purple&nbsp;Pro).</div></div>
  <div id="legend"></div>
</div>
<script>
const NODES = __NODES__, EDGES = __EDGES__, CHAINS = __CHAINS__, META = __META__;

const byId = {}; NODES.forEach(n => byId[n.id] = n);
const inn = {}, outg = {};
EDGES.forEach(e => { (inn[e.to] = inn[e.to] || []).push(e); (outg[e.from] = outg[e.from] || []).push(e); });

document.getElementById('stats').textContent =
  `${META.counters.settings_read || 0} settings · ${Object.keys(CHAINS).length} Source chains · `
  + `pro→setting ${META.cross['dokan-pro'] || 0} · @${META.commit}`;

const LEG = [['chain','#F28E2B'],['source','#A14C5A'],['setting','#4E79A7'],['store','#76B7B2'],
             ['lite','#59A14F'],['pro','#B07AA1']];
document.getElementById('legend').innerHTML = LEG.map(([k,c]) =>
  `<span><i class="dot" style="background:${c}"></i>${k}</span>`).join('');

const ds = { nodes: new vis.DataSet(NODES.map(n => ({
      id: n.id, label: n.label, color: { background: n.color, border: n.color,
        highlight: { background: n.color, border: '#fff' } },
      shape: n.shape, size: n.size,
      font: { color: '#c8c8d8', size: n.type === 'chain' ? 17 : 13, strokeWidth: 3,
              strokeColor: '#0f0f1a', vadjust: 1 },
    }))),
  edges: new vis.DataSet(EDGES.map((e, i) => ({
      id: i, from: e.from, to: e.to, color: { color: e.color, opacity: .5, highlight: '#fff' },
      width: e.rel === 'materializes_into' ? 2.5 : 1,
      dashes: e.rel === 'materializes_into' || e.rel === 'defers_to',
      arrows: { to: { enabled: true, scaleFactor: .4 } },
    }))) };

const net = new vis.Network(document.getElementById('graph'), ds, {
  physics: { stabilization: { iterations: 300 },
             barnesHut: { gravitationalConstant: -3200, springLength: 70,
                          springConstant: .05, avoidOverlap: .5, damping: .5 } },
  interaction: { hover: true, tooltipDelay: 150 },
  // drawThreshold 1: keep labels legible when zoomed out. A graph of unlabelled dots
  // is a lava lamp, not a map.
  nodes: { borderWidth: 0, scaling: { label: { drawThreshold: 1, maxVisible: 26 } } },
});

const esc = s => String(s == null ? '' : s).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

function show(id) {
  const n = byId[id]; if (!n) return;
  const I = inn[id] || [], O = outg[id] || [];
  let h = `<h3>${esc(n.label)}</h3><div class="id">${esc(id)}</div>`;

  if (n.type === 'chain') {
    const c = CHAINS[id];
    h += `<div class="lbl">resolution order — one Source wins</div>`;
    c.levels.forEach(l => { const s = byId[l.id];
      h += `<div class="lvl"><i class="dot" style="background:${s.color}"></i>`
         + `<b>${l.rank}</b> ${esc(l.source)}<span class="df">${esc(l.defer)}</span></div>`; });
    h += `<div class="note">Defer: <code>${esc(c.defer_predicate)}</code></div>`;
    h += `<div class="note">Resolver: <code>${esc(c.resolver)}</code></div>`;
    if (c.writes_back) h += `<div class="warn">Writes back on a read miss — reading this
      chain persists the resolved value.</div>`;
  }

  if (n.type === 'source') {
    const ce = (inn[id] || []).find(e => e.rel === 'resolves_through');
    const c = ce && CHAINS[ce.from];
    if (c) {
      h += `<div class="lbl">rank ${n.rank} of ${c.levels.length} — ${esc(c.label)}</div>`;
      c.levels.forEach(l => { const s = byId[l.id];
        h += `<div class="lvl${l.id === id ? ' here' : ''}">`
           + `<i class="dot" style="background:${s.color}"></i><b>${l.rank}</b> ${esc(l.source)}</div>`; });
      const sh = c.levels.filter(l => l.rank < n.rank).map(l => l.source);
      if (sh.length) h += `<div class="warn"><b>Conditional.</b> Applies only when
        ${esc(sh.join(', '))} all Defer. <code>0</code> is not a Defer — a more specific
        Source set to 0 wins and yields 0.</div>`;
    }
    if (n.anchor) h += `<div class="note"><code>${esc(n.anchor)}</code></div>`;
  }

  const deps = I.filter(e => ['reads','writes','declares'].includes(e.rel));
  if (deps.length) {
    const r = {}; deps.forEach(e => { const k = e.from.split('::')[0]; r[k] = (r[k]||0)+1; });
    h += `<div class="lbl">dependents (${deps.length}) — `
       + Object.entries(r).map(([k,v]) => `${k} ${v}`).join(' · ') + `</div>`;
    deps.slice(0, 40).forEach(e => {
      h += `<div class="row"><span class="r" style="color:${REL(e.rel)}">${esc(e.rel)}</span>`
         + `<span class="m" title="${esc(e.file)}:${esc(e.line)}">`
         + `${esc((byId[e.from]||{}).label || e.from)} <span style="color:#556">`
         + `${esc((e.file||'').split('/').pop())}:${esc(e.line)}</span></span></div>`; });
  }

  const mat = I.filter(e => e.rel === 'materializes_into');
  mat.forEach(e => { h += `<div class="warn"><b>Write-in.</b> <code>${esc(e.ctx)}</code>
    rewrites this store from outside the chain —<br><code>${esc(e.file)}:${esc(e.line)}</code></div>`; });

  const backs = O.filter(e => e.rel === 'backed_by');
  if (backs.length) { h += `<div class="lbl">backed by</div>`;
    backs.forEach(e => h += `<div class="row"><span class="m">${esc((byId[e.to]||{}).label)}</span></div>`); }

  document.getElementById('info').innerHTML = h;
}
const REL = r => ({reads:'#4E79A7',writes:'#E15759',declares:'#8E8E9E'}[r] || '#889');

net.on('click', p => { if (p.nodes.length) show(p.nodes[0]); });

// search
const si = document.getElementById('search'), sr = document.getElementById('results');
si.addEventListener('input', () => {
  const q = si.value.toLowerCase().trim();
  if (!q) { sr.style.display = 'none'; return; }
  const hits = NODES.filter(n => n.type !== 'caller' &&
      ((n.label||'').toLowerCase().includes(q) || n.id.toLowerCase().includes(q))).slice(0, 30);
  sr.innerHTML = hits.map(n => `<div class="ritem" data-id="${esc(n.id)}">
      <i class="dot" style="background:${n.color};display:inline-block;margin-right:5px"></i>
      ${esc(n.label)}</div>`).join('') || '<div class="ritem">no match</div>';
  sr.style.display = 'block';
  sr.querySelectorAll('.ritem[data-id]').forEach(el => el.onclick = () => {
    const id = el.dataset.id; net.selectNodes([id]); net.focus(id, { scale: 1.1, animation: true });
    show(id); sr.style.display = 'none'; si.value = '';
  });
});

// chain filters — default to Commission, the chain that motivated all this
const fw = document.getElementById('filters');
let active = null;
function chip(label, id) {
  const el = document.createElement('div'); el.className = 'chip'; el.textContent = label;
  el.onclick = () => { active = (active === id) ? null : id;
    [...fw.children].forEach(c => c.classList.toggle('on', c === el && active));
    apply(); };
  fw.appendChild(el); return el;
}
const chips = {};
Object.entries(CHAINS).forEach(([id, c]) => chips[id] = chip(c.label, id));
function refit(ids) {
  net.fit({ nodes: ids && ids.length ? ids : undefined,
            animation: { duration: 420, easingFunction: 'easeOutQuad' } });
}
let keepSet = new Set();
function apply() {
  if (!active) {
    keepSet = new Set(NODES.map(n => n.id));
    ds.nodes.update(NODES.map(n => ({ id: n.id, hidden: false })));
    refit(); return;
  }
  const keep = new Set([active]);
  (CHAINS[active].levels || []).forEach(l => { keep.add(l.id);
    (outg[l.id] || []).forEach(e => keep.add(e.to));
    (inn[l.id] || []).forEach(e => keep.add(e.from)); });
  [...keep].forEach(k => (inn[k] || []).forEach(e => keep.add(e.from)));
  keepSet = keep;
  ds.nodes.update(NODES.map(n => ({ id: n.id, hidden: !keep.has(n.id) })));
  refit([...keep]);
}
const cid = 'chain::commission';
let frozen = false;
function freeze() {
  if (frozen) return;
  frozen = true;
  net.setOptions({ physics: false });          // stop the drift; positions are now fixed
  if (CHAINS[cid]) { chips[cid].click(); show(cid); } else { refit(); }
}
net.once('stabilizationIterationsDone', freeze);
setTimeout(freeze, 6000);   // fallback: fires if the solver never reports done

// Re-run the solver on demand — useful after filtering, since frozen nodes keep the
// positions they were given while every other node was still on screen.
const relayout = document.createElement('div');
relayout.className = 'chip';
relayout.style.marginLeft = 'auto';
relayout.textContent = '\u27f3 relayout';
relayout.onclick = () => {
  const vis_ = NODES.filter(n => !active || keepSet.has(n.id)).map(n => n.id);
  net.setOptions({ physics: { enabled: true } });
  net.stabilize(220);
  net.once('stabilizationIterationsDone', () => {
    net.setOptions({ physics: false });
    refit(vis_);
  });
};
fw.appendChild(relayout);
</script>
</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser(description="Render the settings overlay to HTML")
    ap.add_argument("--open", action="store_true", help="open it when done")
    args = ap.parse_args()

    nodes, edges, chains, meta = build()
    html = (HTML
            .replace("__NODES__", json.dumps(nodes))
            .replace("__EDGES__", json.dumps(edges))
            .replace("__CHAINS__", json.dumps(chains))
            .replace("__META__", json.dumps(meta)))
    VIEW.write_text(html)
    size = VIEW.stat().st_size / 1024
    print(f"{VIEW}  ({size:.0f} KB)")
    print(f"  {len(nodes)} nodes ({sum(1 for n in nodes if n['type']=='caller')} call sites), "
          f"{len(edges)} edges, {len(chains)} chains")
    if args.open:
        subprocess.run(["open", str(VIEW)], check=False)


if __name__ == "__main__":
    main()
