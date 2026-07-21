# Settings graph overlay

Adds admin settings, meta stores and Source chains to the graphify knowledge graph, so you
can ask **"what depends on this setting?"** and get an answer that includes Pro.

```bash
PY=$(cat ../../graphify-out/.graphify_python)

$PY settings_scan.py     # -> graphify-out/settings.json    reads/writes/side-effects
$PY callgraph.py         # -> graphify-out/callgraph.json   a DIRECTED php call graph
$PY check_anchors.py     # verify chains.toml still matches the code (fails on drift)

$PY impact.py --audit                          # every setting, ranked
$PY impact.py --audit --csv > impacts.csv
$PY impact.py dokan_selling.admin_percentage   # one setting, in depth
$PY impact.py --list-chains

# optional — only for graphify query / settings-view.html:
$PY merge_settings.py && $PY build_view.py
```

`impact.py` is the entry point and reads **only the sidecars** — never `graph.json`.

`settings.json`, `callgraph.json` and `chains.toml` are the source of truth AND the only thing
`impact.py` reads. That was previously false: the README claimed the sidecars were truth while
`impact.py` opened `graph.json` and nothing else, so the "always fresh" property was
decoration. The whole pipeline regenerates in ~17s with no LLM, no API key and no network, and
both sidecars are byte-deterministic (they were not — a set-iteration leak churned ~1100 lines
per run, which is fatal for the pre-commit use this file recommends).

`merge_settings.py` and `build_view.py` are now **optional**: they exist to feed
`graphify query` and `settings-view.html`. Nothing in the answer path depends on them.

## Why the call graph is ours and not graphify's

`graph.json` declares `"directed": false`. Every edge's source/target is arbitrary — 43% of
its `calls` edges are same-file and **100% of those run source-declared-before-target**,
because networkx serialises undirected edges in adjacency order. Reversing them to find
callers walked the file, not the call graph. It also has **no edge at all** for a static
`Foo::bar()` call, which is how most Dokan helpers are invoked.

Built on that, blast radius was inflated ~100x for settings near a hub and ~0 for the ones
this README advertised: `GlobalSetting::get()` had zero incoming call edges, so
`admin_percentage` — the flagship example — reported a radius of 2. The number had no
consistent relationship to reality in either direction.

`callgraph.py` builds a real directed graph from the same AST pass: 16,219 symbols,
22,695 edges, **70% of 36,566
Dokan-targeting call sites resolved**. It resolves `Foo::bar()`, `self::`/`parent::`,
`$this->m()` through the inheritance chain, `$x = new Foo()` local types, typed properties and
typed params, plus virtual dispatch (`Base::m -> Sub::m`) — without which every override is
invisible and the commission engine reports a radius of 3.

**Radius is a LOWER BOUND and every line that prints it says so.** 11,080 call
sites are ambiguous (`$obj->method()`, receiver unknown, method name not unique). They are
counted, never fanned out into N speculative edges — fanning out is how a number gets
inflated, which is the defect this replaced.

## Why it exists

`graph.json` has 57k nodes and a real call graph, but had **zero settings** — a setting's
identity lives in a string literal argument (`dokan_get_option( 'admin_percentage',
'dokan_selling' )`) and AST extraction discards those. Every read site collapsed onto one
`dokan_get_option` node with no field identity.

Worse, the "merged cross-repo graph" was not merged at the code level. The only edges
crossing a repo boundary were `* -> hook`; there were **no `dokan-pro -> dokan-lite` code
edges at all**. So "what depends on `dokan_selling.admin_percentage`?" answered from Lite and
silently omitted Pro — 352 of 592 read sites, 65% of the real blast radius. For impact
analysis, understating blast radius is the one failure that makes the answer worse than no
answer.

`setting::` nodes fix this the way `hook::` nodes did: a **shared string namespace** both
repos point into. This pass is the graph's second cross-repo bridge (`dokan-pro -> setting`:
502 edges).

## Node classes

Vocabulary per `CONTEXT.md`; semantics per `docs/adr/0005`.

| Node | Meaning |
|---|---|
| `setting::<section>.<field>` | A normalized settings address |
| `store::<kind>.<key>` | A meta key reachable from a Source chain |
| `chain::<id>` | A Source chain |
| `source::<chain>.<source>` | One Source within a chain |

Edges: `reads`, `writes`, `declares`, `resolves_through` (carries `rank`), `defers_to`,
`backed_by`, `materializes_into`, `gates`, `triggers`.

**`triggers` — the impact of WRITING a setting.** 15 callbacks across both repos hook
`dokan_after_saving_settings` / `dokan_before_saving_settings` / `dokan_save_settings_value`,
covering **33 settings**. Saving them creates products, inserts shortcodes into pages,
schedules crons, sets default categories, grants role capabilities. Nothing *reads* the
setting on those paths — the callback reacts to the write — so a read-only model scores
them as low impact and is badly wrong.

The worked example: `dokan_selling.allow_vendor_create_manual_order` has **one** read edge.
Its real impact is that saving it `add_cap( 'seller', 'dokan_manage_manual_order' )`
(`Capabilities.php:53`), and that capability gates **seven REST controllers**. Read-radius
alone would call it a 3-node setting.

`gates` is the one to know about: a setting that switches a whole Source off, usually from
an unrelated section. `dokan_product_subscription.enable_pricing` disables `manual_order`'s
subscription-pack Source — nothing in the manual-order code mentions subscriptions, so
reading that chain top to bottom will never show you it.

**Blast radius counts callers, not containers.** It follows `calls`/`indirect_call` only.
Reversing `contains`/`method` answers "what encloses the reader" — the class, the file —
which inflated `dokan_pages.dashboard` from 184 real dependents to 232. For a number whose
job is to be trusted when someone asks "is this safe to change", inflated is as bad as
missing.

**`id` is the address; `label` is the canonical domain term.** The address is a fact we
extract; the term is the glossary's job. So `setting::dokan_selling.commission_type` is
labelled *"Commission formula (global)"* — `CONTEXT.md` tells us to avoid "commission type",
but the database column really is `commission_type`, and the glossary does not get to rename
a legacy column. The map lives in `chains.toml [labels]`.

## Why identity is the normalized address

Not the bare field id. **17 field ids appear under more than one section**, and they are three
different phenomena:

- **True aliases (2).** `store_map`, `store_open_close` — both in the rearrange map. Two
  addresses, *one* setting. Normalizing merges them (242 raw pairs -> 240 nodes).
- **True collisions (6).** `enabled` spans four unrelated subsystems (email verification,
  reverse withdrawal, shipping status, social API). Keying on the field id would merge them
  and answer "what depends on `enabled`?" with the union of four subsystems.
- **Unclear (9).** `fb_app_id`, `google_app_id`, `twitter_*`, `linkedin_*` under both
  `dokan_social_api` and `dokan_verification`, not in the rearrange map. Either two real
  settings or a section bug — **worth a look from someone who knows**.

Address-keying gets all three right without adjudicating any of them: an address is a fact
we can extract; a concept is a judgement we would have to make.

The rearrange map is extracted from source, never hardcoded — it is **13 entries** (Lite's 9
plus 4 that Pro appends via the `dokan_admin_settings_rearrange_map` filter), so reading only
Lite's copy gets it wrong.

## Behaviors — the use-case layer

A chain answers "which value wins"; a **behavior** answers "what does a real person
experience because of it". The gap it closes: read-radius scored
`dokan_delivery_time.selection_required` at 2, near the bottom of the audit, yet it is the
switch for *customers must pick a delivery slot before they can pay*. Radius measures code;
behaviors measure consequence. The audit marks participants with `UC`.

```bash
$PY impact.py --behaviors                          # list declared use cases
$PY impact.py checkout.delivery_slot_selection     # full story: gates -> shapes -> outcome
$PY impact.py dokan_delivery_time.selection_required  # setting view gains a USE CASES section
```

A behavior declares an **actor** and **surface**, its **gates** (settings that switch it on/
off or mandatory/optional), its **shapes** (settings that parameterize it), and its
**outcome** (what a successful pass persists). Each gate/shape says how its setting
resolves: `via_chain` means a vendor can override it; a flat read on a behavior that HAS a
chain is itself the finding — the setting is admin-only and the override does not apply.
That distinction is the whole "admin enables, vendor overrides, customer must select" story:
`delivery_support` resolves through the chain, `selection_required` deliberately does not.

Hand-written in `chains.toml` for the same reason chains are: "this validation callback
blocks checkout" is not derivable from an AST. Same trust contract too — every anchor
(behavior, each gate/shape, each `also_anchors` entry, the outcome) is verified by
`check_anchors.py`. Three behaviors exist (checkout slot selection, vendor schedule
override, vendor updating a placed order's delivery time); when you declare a fourth,
nothing will find it for you.

## Why chains.toml is hand-written

Nine chains exist. **Only `commission` has formal structure** a scanner could detect. The
other eight are inline `if`-ladders with no shared base class and six different Defer
encodings. A scanner would find 1 of 9 while looking authoritative.

It also holds edges no scanner could reach: the subscription module rewrites Commission's
vendor Source through `$vendor->save_commission_settings()` — a domain method, not a meta
call (`chains.toml`, `[[chain.written_by]]`).

Curation drifts, so every anchor carries an `anchor_contains` fingerprint and
`check_anchors.py` verifies it. Wire it into CI — it caught six errors in the manifest's
first hour.

One warning learned the hard way: a failing fingerprint means **the fingerprint is wrong**,
not that the code is absent. `manual_order`'s pack Source was briefly deleted from this file
because its anchor searched for `dokan_vendor_enable_manual_order` when the real filter is
`dokan_manual_orders_is_enabled`. The level was there the whole time. Two similarly named
filters exist and only one is a chain:

| Filter | Fired at | Subscribers |
|---|---|---|
| `dokan_manual_orders_is_enabled` | `Manager.php:98` | subscription + vendor-staff — **the chain** |
| `dokan_vendor_enable_manual_order` | `Settings.php:184` | none — store-payload path only |

Confirm against the code before deleting anything from this file.

## Discrepancies

Places where two mechanisms that should agree do not. Flagged on the setting node, printed by
`impact.py`, and sorted **above blast radius** in `--audit` — because a setting with 3 readers
whose "off" does not turn anything off matters more than a widely-read one that behaves.

**Auto-detected — `grant_without_revoke`.** Saving a setting grants a role capability; nothing
anywhere revokes it; therefore turning the setting back off leaves every consumer of that
capability authorized. Fully mechanical: `add_cap` inside a save callback, no matching
`remove_cap` in the corpus, then count who checks the capability.

The live one: saving `dokan_selling.allow_vendor_create_manual_order` grants
`dokan_manage_manual_order` to seller, administrator and shop_manager (`Capabilities.php:53`).
There is no `remove_cap` for it anywhere, and the capability appears nowhere in Lite, so the
settings side-effect is its only source. Turning the setting off hides the vendor UI —
`Manager.php:48` uses the value chain — but **8 consumers still authorize**, including seven
REST controllers that check only `user_can( …, 'dokan_manage_manual_order' )`. Two gates, one
switch, and only one of them responds.

**Declared** — in `chains.toml [[discrepancy]]`, for claims an AST cannot prove. Each carries
an anchor, so `check_anchors.py` fails when the code moves out from under the claim: a stale
"this is broken" note is worse than none, because someone will go fix a bug that is already
gone.

Currently declared: `manual_order`'s two halves Defer on different predicates (empty VALUE vs
row EXISTS) and silently skip the pack Source; two code paths answer the same question and
only one walks the whole chain; `Product.php:69` discards a filter's return value.

## Known gaps

Reported honestly by the scanner rather than papered over — see `settings.json`.

- **`read_never_declared` is suppressed.** Pro declares fields inside *section-specific*
  filter callbacks, so the section is implied by which filter was hooked; 57
  declarations are unattributed and the list would be mostly false. `declared_never_read` is
  now **0** — it was 17, and an adversarial review found all 17 were
  wrong while this file called the list "sound". Two causes, both fixed: whole-row
  `get_option()['field']` reads were recorded then stripped of their field, and `html` /
  `warning` / `sub_section` / `verification_methods` fields were counted as settings when they
  store nothing to the option row.
- **14 AMBIGUOUS reads** where the field or section is a variable
  (`REST/AdminMiscController.php:92` is dynamic by design — a public read escape hatch).
  Recorded, never dropped.
- **6 sections excluded from the diff** because their declarations could not be resolved.
- Transitive reachability comes from the base graph and is as fresh as
  `built_at_commit_settings_pass`. Direct dependents (depth 1-2, where most of the value is)
  come from the sidecar and are always fresh.
