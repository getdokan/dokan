"""Post-process the merged cross-repo graph: prefix source paths with the
plugin dir, cluster, auto-label communities, and write GRAPH_REPORT.md.

Usage: python postprocess.py <graph.json> <out-dir>
"""
import json
import sys
from collections import Counter
from pathlib import Path

from networkx.readwrite import json_graph
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json

REPOS = {'dokan-lite', 'dokan-pro', 'woocommerce'}
REPO_SHORT = {'dokan-lite': 'lite', 'dokan-pro': 'pro', 'woocommerce': 'woo', 'hooks': 'hooks'}


def prefix_paths(d, links_key):
    n_fixed = e_fixed = 0
    for n in d['nodes']:
        sf, repo = n.get('source_file'), n.get('repo')
        if sf and repo in REPOS and not sf.startswith(repo + '/'):
            n['source_file'] = f'{repo}/{sf}'
            n_fixed += 1
    for e in d[links_key]:
        sf = e.get('source_file')
        if not sf:
            continue
        repo = str(e['source']).split('::', 1)[0]
        if repo == 'hook':
            repo = str(e['target']).split('::', 1)[0]
        if repo in REPOS and not sf.startswith(repo + '/'):
            e['source_file'] = f'{repo}/{sf}'
            e_fixed += 1
    print(f'path prefix: {n_fixed} nodes, {e_fixed} edges')


def auto_label(G, cid, members):
    repos = Counter(G.nodes[m].get('repo', '?') for m in members)
    repo = next((r for r, _ in repos.most_common() if r != 'hooks'), 'hooks')
    dirs = Counter()
    for m in members:
        sf = G.nodes[m].get('source_file') or ''
        parts = sf.split('/')
        if len(parts) > 2:
            dirs['/'.join(parts[1:3] if parts[2:] and '.' not in parts[2] else parts[1:2])] += 1
        elif len(parts) == 2:
            dirs[parts[1]] += 1
    top_dir = dirs.most_common(1)[0][0] if dirs else ''
    top = ''
    for m in sorted(members, key=lambda x: G.degree(x), reverse=True):
        lb = str(G.nodes[m].get('label', ''))
        clean = lb.lstrip('.').rstrip('()').rsplit('/', 1)[-1]
        if clean and clean != '?' and len(clean) > 2:
            top = clean
            break
    short = REPO_SHORT.get(repo, repo)
    if top_dir and top:
        return f'{short}: {top_dir} · {top}'
    return f'{short}: {top or f"community {cid}"}'


def main():
    graph_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    d = json.loads(graph_path.read_text())
    lk = 'links' if 'links' in d else 'edges'

    prefix_paths(d, lk)
    graph_path.write_text(json.dumps(d))

    G = json_graph.node_link_graph(d, edges=lk)
    communities = cluster(G)
    cohesion = score_all(G, communities)
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    labels = {cid: auto_label(G, cid, m) for cid, m in communities.items()}
    questions = suggest_questions(G, communities, labels)

    n_files = len({G.nodes[n].get('source_file') for n in G.nodes if G.nodes[n].get('source_file')})
    detection = {'total_files': n_files, 'total_words': 0}
    report = generate(G, communities, cohesion, labels, gods, surprises, detection,
                      {'input': 0, 'output': 0},
                      'wp-content/plugins (dokan-lite + dokan-pro + woocommerce)',
                      suggested_questions=questions)
    (out_dir / 'GRAPH_REPORT.md').write_text(report)
    (out_dir / '.graphify_labels.json').write_text(
        json.dumps({str(k): v for k, v in labels.items()}))
    to_json(G, communities, str(graph_path), force=True, community_labels=labels)
    print(f'clustered: {len(communities)} communities; report + labels written')


if __name__ == '__main__':
    main()
