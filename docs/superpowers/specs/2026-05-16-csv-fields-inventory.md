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
