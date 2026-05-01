# Announcements — Test Cases & Edge Cases

Scope: the legacy admin announcements list (`/wp-admin/admin.php?page=dokan#/announcement`),
the new admin announcements dashboard (`/wp-admin/admin.php?page=dokan-dashboard#/announcement`),
the legacy vendor announcements page (`/dashboard/announcement`), the new vendor dashboard
announcements (`/dashboard/new/#announcement`), the announcement modal that pops on every
vendor dashboard load until dismissed, and the REST controller (`dokan/v1/announcement*`).

Conventions:
- **A** = admin (`administrator`)
- **V1** = vendor (`seller`)
- "Legacy admin UI" = the older Vue-based table at `?page=dokan#/announcement`
- "New admin dashboard" = the React DataViews UI at `?page=dokan-dashboard#/announcement`
- "Legacy vendor page" = `/dashboard/announcement` (HTML list)
- "New vendor dashboard" = `/dashboard/new/#announcement` (React)
- "Modal" = the `.vendor-announcement-modal` that surfaces on first vendor dashboard load

---

## 1. Module activation

| #   | Title                                                 | Steps                                                 | Expected                                                                       |
|-----|-------------------------------------------------------|-------------------------------------------------------|--------------------------------------------------------------------------------|
| 1.1 | Module activation registers `announcement` post type  | Activate Pro → check post type registry              | `dokan_announcement` post type registered with `read`/`edit` caps              |
| 1.2 | REST controller mounted                                | `GET /wp-json/dokan/v1/announcement`                 | 200 with admin auth, 401 without                                               |
| 1.3 | Background processor wired                            | Send announcement → queue inspection                  | `Announcement\BackgroundProcess` enqueues per-recipient row creation           |

## 2. Legacy admin UI (Old Test Cases 1–8)

| #   | Title                                                                  | Steps                                                                        | Expected                                                              |
|-----|------------------------------------------------------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| 2.1 | Page chrome renders (header, tabs, table, bulk-actions)                 | A → `Dokan → Announcements`                                                  | Header + All/Published/Pending/Scheduled/Draft/Trash + table columns  |
| 2.2 | Add announcement (publish to all sellers)                              | A → Add Announcement → fill → publish                                        | Row appears with status `publish`                                     |
| 2.3 | Add announcement (scheduled to all sellers)                            | A → Add Announcement → set future date → publish                             | Row appears with status `future`                                      |
| 2.4 | Edit existing draft and publish it                                     | A creates draft → edit row → change title → publish                          | Row reappears as `publish` with new title                             |
| 2.5 | Trash a published announcement                                          | A creates → row action `Trash`                                               | Row visible under Trash tab                                            |
| 2.6 | Restore from trash                                                       | A trashes → row action `Restore`                                             | Row reappears under Published tab                                      |
| 2.7 | Permanently delete from trash                                            | A trashes → row action `Delete Permanently`                                  | Row gone from Trash                                                    |
| 2.8 | Bulk trash                                                                | A creates → bulk-action `Trash`                                              | Row visible under Trash tab                                            |

Edge cases for §2:
- Same title submitted twice → both rows created (no dedupe).
- Save-as-draft keeps the form open; navigation back to list is required.
- Bulk-action requires explicit Apply click — pressing Enter doesn't trigger it.

## 3. Legacy vendor UI (Old Test Cases 9–11)

| #   | Title                                                          | Steps                                                                | Expected                                                              |
|-----|----------------------------------------------------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------|
| 3.1 | Vendor sees published announcement on legacy page              | A publishes → V1 visits `/dashboard/announcement`                    | Announcement card visible with title + date                           |
| 3.2 | Vendor opens announcement detail                                | V1 clicks card                                                        | Detail page shows title, date, content, "Back to all Notice" link     |
| 3.3 | Vendor deletes announcement from their dashboard               | V1 clicks remove → confirm                                            | Announcement disappears from vendor list (delete is per-vendor only)  |

Known issues for §3:
- The vendor "delete" only removes the announcement from that vendor's view; the row stays in DB for other recipients.
- 5.0.0 added a **modal** that auto-pops on every dashboard load. Tests must dismiss it (page object handles this via `page.addLocatorHandler`).

## 4. New admin React dashboard (Test Cases 12–21)

| #    | Title                                                                          | Steps                                                                                          | Expected                                                                                    |
|------|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| 4.1  | Empty trash before tests run (cleanup hook)                                    | TC12                                                                                            | Trash tab is empty before subsequent tests                                                  |
| 4.2  | Create published announcement via new admin form                               | TC13: title + description → create as published                                                | Row appears in Published tab with the title                                                 |
| 4.3  | Create draft announcement via new admin form                                   | TC15                                                                                            | Row appears in Draft tab with the title                                                     |
| 4.4  | Verify draft still visible after save                                          | TC16                                                                                            | Title + status badge "Draft" visible                                                         |
| 4.5  | Create scheduled announcement via new admin form                               | TC17: future-date date-picker                                                                  | Row appears with status badge "Scheduled"                                                    |
| 4.6  | Draft status badge text rendered                                               | TC18                                                                                            | "Draft" text appears in the list                                                              |
| 4.7  | Scheduled status badge text rendered                                           | TC19                                                                                            | "Scheduled" text appears in the list                                                          |
| 4.8  | Trash + permanently delete drafts and scheduled                                | TC20                                                                                            | Items move to trash, then disappear permanently after delete-permanently                     |
| 4.9  | Empty Trash from new admin dashboard (post-test cleanup)                       | TC21                                                                                            | Trash tab returns to empty state                                                              |

Known issues / edge cases for §4:
- The DataViews `Actions` button (3-dot menu) only appears for non-trashed rows; trashed rows show their own action set. Selectors must scope by status to avoid strict-mode violations.
- Date-picker's "future date" must be computed at run-time, not hard-coded.
- Pluralization on confirm copy ("delete this 1 announcement" / "delete these N announcements") — check both branches.
- The 5.0.0 announcement modal also pops on the *admin* dashboard occasionally if the admin is also flagged as a recipient; the page object dismisses it.

## 5. New vendor React dashboard (currently stubbed)

| #    | Title                                                                          | Steps                                                                                          | Expected                                                                                    |
|------|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| 5.1  | Vendor sees announcement card in new dashboard                                 | TC14 (currently `test.skip`)                                                                    | `<article>` card with title + content visible at `/dashboard/new/#announcement`            |
| 5.2  | Vendor opens detail panel                                                      | TC14 second half                                                                                | `<h1>`/`<h2>`/`<h3>` with the title visible in the detail panel                              |
| 5.3  | Modal auto-dismiss flow                                                        | First visit triggers modal; second visit does not                                              | `addLocatorHandler` registered modal closer fires automatically; subsequent visits bypass    |

The vendor new-dashboard tests (TC14) are skipped while the matching React UI is in flux.
Re-enable when `dokan-pro/src/features/announcement/AnnouncementList.tsx` settles.

## 6. REST API — `dokan/v1/announcement`

| #    | Title                                                | Request                                                              | Expected                                       |
|------|------------------------------------------------------|----------------------------------------------------------------------|-------------------------------------------------|
| 6.1  | GET announcements as admin                            | `GET /announcement`                                                  | 200 array                                      |
| 6.2  | POST creates announcement                             | `POST /announcement` with title + content + recipient_type           | 201 with new id; row in DB                     |
| 6.3  | DELETE moves to trash (default)                       | `DELETE /announcement/{id}`                                          | 200; row goes to `trash` post status            |
| 6.4  | Force-DELETE removes permanently                      | `DELETE /announcement/{id}?force=true`                               | 200; row gone from DB                           |
| 6.5  | Vendor cannot create                                  | Vendor token POST                                                     | 401/403                                         |
| 6.6  | Vendor can list their own announcements                | Vendor token GET                                                      | 200; only rows targeted at this vendor          |
| 6.7  | Schema rejects invalid recipient_type                  | `recipient_type=foo`                                                  | 400 schema rejection                             |

## 7. Pop-up modal (`.vendor-announcement-modal`)

| #    | Title                                                            | Steps                                                                | Expected                                                                |
|------|------------------------------------------------------------------|----------------------------------------------------------------------|-------------------------------------------------------------------------|
| 7.1  | Modal renders when an unread announcement exists                  | A publishes → V1 visits dashboard                                    | Modal visible with announcement preview                                 |
| 7.2  | Close button dismisses the modal                                 | V1 clicks `[aria-label="Close"]`                                     | Modal hidden; subsequent navigations don't re-open                      |
| 7.3  | Escape key dismisses the modal                                    | V1 presses `Escape`                                                  | Modal hidden                                                              |
| 7.4  | Once dismissed, modal does not return on the same vendor session  | V1 navigates to a different dashboard route                          | Modal stays hidden                                                        |
| 7.5  | Page object handler auto-dismisses                                | Test that does not call modal directly                               | `addLocatorHandler` fires when modal blocks an action; test continues   |

Note: page object's `closeAnnouncementModal` (inlined; see `announcementsPage.ts:16`) is
fire-and-forget and idempotent — re-calling on the same `Page` is a cheap no-op.

## 8. Edge cases & known issues

- **Same-title rows across runs:** the suite generates `test announcement_<timestamp>` titles; if a test crashes mid-run, leftovers persist and can shadow future selectors. The DataViews actions button is scoped with `not(.//*[normalize-space()='Trash'])` so trashed orphans are excluded.
- **`'networkidle'` waits:** ESLint `playwright/no-networkidle` rule rejects them. The page object now uses `'load'` plus explicit `waitForResponse` for create/trash actions.
- **Modal install is per-Page:** every new `Page` instance must run `closeAnnouncementModal` once. The page object constructor handles this for `AnnouncementsPage` instances; tests that open a vendor page without going through the page object will not get the auto-close.
- **`networkidle` in a comment** (one occurrence in the page object) — kept as docstring context only.
- **Vendor delete is per-recipient:** `vendor.removeAnnouncement` does *not* delete the underlying announcement; admin-side actions still reflect the row.

## 9. Suggested follow-ups (not in this PR)

1. Re-enable TC14 once new vendor dashboard React UI is stable.
2. REST tests for §6 (currently no automated REST coverage in this folder).
3. Modal-dismissal regression test that asserts the `addLocatorHandler` was the dismisser (not e.g. an unrelated nav).
4. Pluralization assertion for "delete this/these N" copy (mirrors abuse-reports §7.4 issue).
5. Schedule date-picker edge cases (past date, far-future date, DST boundary).
