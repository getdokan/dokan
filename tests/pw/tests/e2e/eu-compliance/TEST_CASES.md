# EU Compliance — Test Cases & Edge Cases

Scope: GDPR / EU compliance settings (privacy policy linkage, B2B / B2C
toggle, VAT options, GDPR notice on registration). Admin settings UI plus
front-end customer touch-points.

Conventions: see `tests/pw/CONVENTIONS.md`.

## React UI

No major React rewrite in 5.0.0 for this surface — settings render via the
admin Dokan settings shell (which IS React, but the EU-compliance form
fields themselves are still WP form controls). All current tests stay valid.

## Active tests

- admin can enable EU compliance fields module
- admin can enable EU compliance fields for vendors
- admin can enable EU compliance fields on vendor registration
- admin can enable EU compliance fields for customers
- admin can enable germanized support for vendors
- admin can enable override invoice number permission for vendors
- admin can add EU compliance data while adding a vendor
- admin can add EU compliance data on user profile (customer) edit
- admin can update EU compliance data on user profile (customer) edit
- admin can add EU compliance data on user profile (vendor) edit
- admin can update EU compliance data on user profile (vendor) edit
- admin can update update EU compliance data on vendor profile edit
- admin can hide vendors EU compliance data from single store page
- vendor can add EU compliance data on store settings
- vendor can add EU compliance data on registration
- vendor can update EU compliance data
- (skipped) vendor can add product EU compliance data
- (skipped) vendor can update product EU compliance data
- (skipped) vendor can remove product EU compliance data
- customer can add EU Compliance data on billing address
- customer can update EU compliance data
- customer can add EU compliance data (vendor) while become a vendor
- customer can view vendor EU compliance data on single store page
- (skipped) customer can view product EU compliance data on single product page
- admin can disable EU compliance fields module

## Conventions applied

- Self-contained page object (modal helper inlined per CONVENTIONS.md §4).
- All tests tagged with `@lite` / `@pro` plus role tag.

## Suggested follow-ups

1. GDPR data-export request flow (right to be forgotten).
2. Multi-language compliance copy (i18n).
3. Stripe SCA / 3DS interaction with EU compliance.
