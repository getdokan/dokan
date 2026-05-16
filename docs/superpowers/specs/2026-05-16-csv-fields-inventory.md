# CSV-derived settings field inventory

**Source:** `Settings.Mapping.-.fields_extracted_fixed.csv` (225 fields)
**Generated:** 2026-05-16

## Top-level destinations (post-typo-fix)

| Top tab | Fields |
| --- | --- |
| Vendors | 46 |
| Transactions | 32 |
| Product | 28 |
| General | 22 |
| Shipment | 21 |
| Appearance | 20 |
| Moderation | 18 |
| Compliance | 11 |
| AI Assist | 5 |
| Verification | 5 |
| (unmapped) | 17 |

## Unmapped fields — decisions

| Section | FieldKey | Type | Decision | Reason |
| --- | --- | --- | --- | --- |
| dokan_general | site_options | sub_section | DROP | UI header, no value |
| dokan_general | vendor_store_options | sub_section | DROP | UI header |
| dokan_general | product_page_options | sub_section | DROP | UI header |
| dokan_selling | commission | sub_section | DROP | UI header |
| dokan_selling | fee-recipients | sub_section | DROP | UI header |
| dokan_selling | selling_capabilities | sub_section | DROP | UI header |
| dokan_selling | catalog_mode_settings | sub_section | DROP | UI header |
| dokan_appearance | appearance_options | sub_section | DROP | UI header |
| dokan_social_api | section_title | sub_section | DROP | UI header |
| dokan_selling | catalog_mode_hide_product_price | switcher | KEEP-BRIDGE-ONLY | Real field, no new home in CSV — bridge preserves DB value but no new-UI control until product owner assigns a destination |
| dokan_appearance | store_map | switcher | KEEP-BRIDGE-ONLY | Same as above |
| dokan_geolocation | location | gmap | KEEP-BRIDGE-ONLY-NESTED | Complex nested shape; Task 7 handles it |
| dokan_product_subscription | cancelling_email_subject | textarea | KEEP-BRIDGE-ONLY | Email template — likely moves to email settings |
| dokan_product_subscription | cancelling_email_body | textarea | KEEP-BRIDGE-ONLY | Email template |
| dokan_product_subscription | alert_email_subject | textarea | KEEP-BRIDGE-ONLY | Email template |
| dokan_product_subscription | alert_email_body | textarea | KEEP-BRIDGE-ONLY | Email template |
| dokan_product_advertisement | vendor_subscription_enabled | switcher | KEEP-BRIDGE-ONLY | Needs new-tab decision |

## Reserved unmapped → bridge-only protocol

Bridge-only fields:
- Appear in the bridge mapping (`legacy_key` declared).
- Do NOT appear in `SettingsSchema::get_schema()` as visible elements.
- Their stored values are preserved across the new flat option and legacy options.
- A follow-on task adds a `bridge_only: true` annotation on the schema entry so the bridge picks them up.

## Migration status

**As of 2026-05-16:** All bridge plumbing and per-tab parity tests are landed. The feature flag `dokan_csv_schema_enabled` remains **off by default** in production until the REST PUT parent-chain gap below is resolved.

### Completed (Tasks 0–14)

| Task | Outcome | Commit |
| --- | --- | --- |
| Task 0 | CSV parser + inventory frozen | `8cc49f9ef` |
| Task 1 | Bridge: deep paths, reverse propagation, transformers, bridge-only | `95e24082b` (+ lint `7421c5be0`) |
| Task 2 | CSV→schema generator, off by default | `a644f079f` |
| Task 2.1 | Generator quote-stripping fix | `5037940e7` |
| Task 3 | AI Assist tab (5 fields) wired | `a4b9f9482` |
| Task 4 | Verification tab (5 fields) wired | `0e16247f5` |
| Task 5 | Compliance tab (11 fields) wired | `03559ddcf` |
| Task 6 | General tab (22 fields) wired | `495476b8d` |
| Task 7 | Appearance tab (20 fields) wired | `8801bb88a` |
| Task 8 | Moderation tab (18 fields) wired | `725e71ff7` |
| Task 9 | Vendors tab (46 fields) wired | `802c641dd` |
| Task 10 | Product tab (28 fields) wired | `f1ab93904` |
| Task 11 | Shipment tab (21 fields) wired | `d7bc23686` |
| Task 12 | Transactions tab (32 fields) wired | `f894aa880` |
| Task 13 | Lite/Pro gating via `is_lite` | `87fc405c7` |
| Task 14 | REST↔legacy round-trip tests | `557c72753` |

**Test coverage:** 121 tests / 2255 assertions, all green.

**Total fields wired (visible):** 208 fields across 10 new top-level tabs (Vendors, Product, Transactions, General, Shipment, Appearance, Moderation, Compliance, AI Assist, Verification).

**Bridge-only fields:** 8 (no UI visibility, DB-preservation only).

**Dropped fields:** 9 (sub_section UI headers).

### Deferred — blocking flag flip

**Task 15 (flip flag default to `true`) is deferred** pending resolution of:

#### REST PUT parent-chain linkage

The REST endpoint `PUT /dokan/v1/admin/settings/{page_id}` walks the schema from a `page_id` through `subpage_id`/`section_id` parent-chain attributes to collect descendant fields. The CSV-driven generator emits `top_tab` + `sub_path` strings instead of those parent-chain ids, so the REST PUT cannot address CSV-derived fields by their generated id.

**Symptoms when flag is flipped:**
- 60+ `SchemaValidator` warnings: "cannot trace a parent chain back to a page element"
- REST PUT silently drops CSV-derived fields from save payloads
- Legacy AJAX save still works (bridge propagation tested in Task 14)
- Direct `update_option('dokan_settings', ...)` works (bridge listener tested in Task 14)

**Fix options:**

A. **Emit parent-chain attrs in the generator.** Modify `tools/migration/generate_schema_fragment.php` to derive `page_id` / `subpage_id` / `section_id` from `top_tab` / `sub_path` and include them on each emitted field. Regenerate the fragment. Minimal REST controller changes; the existing `collect_page_descendants` walk just works. Trade-off: generator gains complexity; fragment grows in size.

B. **Extend the REST controller** to accept `top_tab` / `sub_path` as an alternative addressing scheme. Generator stays simple; REST controller `AdminSettingsController::collect_page_descendants` (and related) gains a CSV-shape branch. Trade-off: REST controller complexity; two parallel addressing schemes coexist.

C. **Hybrid:** generator emits both attrs; controller prefers `top_tab`/`sub_path` when present, falls back to `page_id` chain otherwise. Trade-off: most complex but cleanest migration path.

Recommended: **Option A.** It's a contained change in the generator and avoids dual addressing schemes in the REST controller.

### Other deferred follow-ups (REST/UI layer, not bridge)

These were surfaced during per-tab tests and are intentionally NOT addressed at the bridge layer — they belong to the new REST write/read path or the UI layer:

#### Sanitization / validation (REST writer's `sanitize_callback`)

- `dokan_ai_*_api_key` — trim whitespace; treat all-whitespace as empty
- `dokan_ai_engine` / `*_model` selects — allow-list enforcement
- `dokan_privacy.privacy_policy` (wpeditor) — apply `wp_kses_post`
- `dokan_geolocation.location.{latitude,longitude}` — clamp to ±90 / ±180
- `dokan_appearance.store_color_pallete` nested keys — apply `sanitize_hex_color` / `sanitize_key`
- `dokan_pages.*` page-id fields — verify `get_post()` existence
- `dokan_appearance` `radio_image` / `croppable_image` — validate attachment id existence
- `dokan_product_advertisement` `total_available_slot` / `expire_after_days` / `cost` — port the legacy fail-closed validator (rejects invalid values with HTTP 400)
- `dokan_reverse_withdrawal` — port 5 fail-closed validators (boundary, billing_type-conditional, etc.)
- `dokan_delivery_time` — port 7 fail-closed validators
- `dokan_selling.commission_fixed_values` (admin_percentage) — port `[0, 100]` clamp AND fix the legacy empty-string fallback bug (returns `""` instead of `"0"`)

#### Response masking (REST GET response `sanitize_callback`)

- `dokan_live_chat.app_id` / `app_secret` — mask in GET response
- `dokan_social_api.*_details.*_secret` / `key_content` — mask compound credentials
- `dokan_verification_sms_gateways.twilio_details.auth_token` — mask
- `dokan_printful.app.printful_secret_key` — mask (also fix the asymmetric half-pair: legacy masks `secret_key` but not `client_id`)

#### Read-time normalization (REST GET output transformer)

- `dokan_colors.store_color_pallete` palette-name normalization (`'purple plus' → 'purple pulse'`, `'default' → 'majestic orange'`) — replicate via REST output transformer or fix the underlying DB rows once
- `dokan_selling.commission_type` empty → `'fixed'` — enforce default on write (preferred) instead of normalizing on read
- `dokan_selling.new_seller_enable_selling` legacy `'on'`/`'off'` → `'automatically'`/`'manually'` — apply mapper consistently on both GET and save-response

#### Save-time side effects (REST writer)

- `dokan_general.custom_store_url` change → `flush_rewrite_rules()`
- `dokan_product_subscription` save → `Shortcode::insert_shortcode_into_page` (destructive `wp_posts` rewrite — decide whether to keep)
- `dokan_spmv` save → dispatch visibility-recalc background job (gate on `show_order` diff to avoid unconditional dispatch)
- `dokan_rma` save → per-row `dokan_pro_register_rms_reason` action dispatch
- `dokan_reverse_withdrawal` save → Action Scheduler cron schedule/cancel
- `dokan_delivery_time` save → write `_dokan_delivery_slot_settings` side option + re-`update_option` with int-coerced numerics
- `dokan_product_advertisement` save → `create_advertisement_base_product` (`wp_posts` insertion if id missing)

#### Other

- `dokan_germanized` — `CustomFields/Billing.php` emits `<input name="billing_dokan_*">` literally; if any field key drops the `billing_` prefix, checkout breaks. CSV-driven migration preserves the legacy field names so this is not a current risk — but flag for any future schema rename.
- `dokan_rma` orphan `RmaSettingsSchema.php` — remove in a cleanup task once CSV-driven schema is fully adopted.
- 16 over-wide CSV rows have unparseable `OtherInfoJSON` and default `is_lite: false` (fail-closed). They're filtered out when Pro is inactive. Fix the CSV's JSON escaping if you want those rows surfaced in Lite installs.

### When to flip the flag

After Option A (or B/C) lands and the REST PUT round-trip test asserts CSV-derived fields can be saved by id through the PUT endpoint without warnings, set `dokan_csv_schema_enabled = true` via an upgrade hook on next release.

Until then, the migration is **plumbing-complete and tested** but not user-facing. The legacy AJAX page continues to serve all 30 tabs as before.
