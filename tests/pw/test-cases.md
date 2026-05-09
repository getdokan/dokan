# Dokan Test Cases — Author Sheet

> **For QA:** Fill this file out and the Claude skill will scaffold matching specs and page objects under `tests/e2e/<slug>/` (or `tests/api/<slug>.spec.ts` for API features).
>
> **For the skill:** Read this file in full, then create one folder + spec + page object per `## Feature` block. Match the templates in `setup.md` §3 and §4 exactly. Skip blocks where `Status: skip`.

---

## How to add test cases

You have **two ways** to add test cases:

1. **Edit this file directly** — fill in a `## Feature:` block using the template below and save.
2. **Ask Claude** — say "add test cases for <feature>" and the skill will interview you (slug, gate, roles, scenarios) and write the block into this file. The skill **always** writes here first; it never scaffolds straight into `tests/e2e/`.

The skill will not scaffold any spec until the feature block lives in this file with `Status: build`.

---

## Section rules — every feature block has up to three sections

Every `## Feature:` block must include scenarios under these three sections:

| Section            | Required? | What goes in it                                                              |
|--------------------|-----------|------------------------------------------------------------------------------|
| **Happy Paths**    | **Mandatory** | The golden, expected flows. The user does the right thing and the feature works. At least one case. |
| **Edge Cases**     | Optional  | Boundary or unusual conditions: empty state, max length, large quantity, race conditions, slow network. |
| **Negative Cases** | Optional  | The user does the wrong thing or violates a rule. Validation errors, permission denials, 4xx/5xx API responses. |

Edge and Negative sections are **optional** — leave them out (or empty) if not relevant. Happy Paths is **never** optional. The skill will refuse to scaffold a feature with zero Happy Path cases.

When the skill builds specs, it `test.describe`-groups cases by section so the report keeps the structure visible.

---

## Feature template — copy this for every feature

```
## Feature: <human-readable feature name>
- Slug: <kebab-case-folder-name>          # used as folder + file name
- Type: e2e | api                          # which folder it lands in
- Plugin gate: lite | liteOnly | pro      # picks the @lite / @liteOnly / @pro tag
- Roles: admin, vendor, customer, guest   # one or more — picks @role tags
- Storage state: admin, vendor, vendor2, customer, customer2, guest  # which auth files to load
- REST seed: yes | no                      # whether the page object needs a REST helper
- Status: build | skip                     # `skip` means don't generate yet

### Happy Paths
1. <role> can <action>
   - Steps:
     1. <step>
     2. <step>
   - Expected: <observable outcome>
   - Tag extras: @exploratory, @visual    # optional — added on top of @<gate> + @<role>

### Edge Cases    # optional — delete this section if you have no edge cases
1. <role> <handles boundary condition>
   - Steps: ...
   - Expected: ...

### Negative Cases    # optional — delete this section if you have no negative cases
1. <role> cannot <forbidden action>
   - Steps: ...
   - Expected: <error / validation / 4xx>
```

---

## Example — already wired, do NOT regenerate

## Feature: Abuse Reports
- Slug: abuse-reports
- Type: e2e
- Plugin gate: pro
- Roles: admin, customer
- Storage state: admin, customer
- REST seed: yes
- Status: skip

### Happy Paths
1. admin can view abuse reports list
   - Steps:
     1. Log in as admin
     2. Navigate to /wp-admin/admin.php?page=dokan#/abuse-reports
   - Expected: Reports table renders with seeded report rows

2. customer can submit an abuse report from a single product page
   - Steps:
     1. Open a vendor's single product
     2. Click "Report abuse"
     3. Pick a reason, submit
   - Expected: Toast confirms submission; report appears in admin list

### Edge Cases
1. admin sees empty state when no reports exist
   - Steps:
     1. Delete all seeded reports via REST
     2. Reload the abuse reports page
   - Expected: Empty-state placeholder is shown, not a broken table

### Negative Cases
1. customer cannot submit an abuse report without selecting a reason
   - Steps:
     1. Open the report dialog
     2. Leave reason empty, click submit
   - Expected: Inline validation error; no network request fires

2. guest cannot open the report dialog
   - Steps:
     1. Visit a single product as a guest
   - Expected: "Report abuse" link is hidden or redirects to login

---

<!-- ============================================================
     ADD YOUR FEATURES BELOW. Delete this comment when you start.
     Remember: Happy Paths is mandatory, the other two are optional.
     ============================================================ -->

## Feature: <REPLACE ME>
- Slug: <replace-me>
- Type: e2e
- Plugin gate: lite
- Roles: vendor
- Storage state: vendor
- REST seed: no
- Status: skip

### Happy Paths
1. vendor can <REPLACE ME>
   - Steps:
     1. <step>
   - Expected: <outcome>
