# Help — Test Cases & Edge Cases

Scope: the admin Help submenu page (`Dokan → Help`) and the in-app Get Help
dropdown shown across the Dokan admin shell.

Conventions:
- **A** = admin
- "Help page" = `/wp-admin/admin.php?page=dokan#/help`
- "Get Help dropdown" = the `?` icon in the Dokan admin header that opens a contextual menu

---

## 1. Help menu page

| #    | Title                                              | Steps                                                              | Expected                                                              |
|------|----------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------|
| 1.1  | Admin views Help menu page (TC: admin can view)    | A → Dokan → Help                                                   | Page chrome rendered; categorized help cards / search visible          |
| 1.2  | Get Help dropdown (TC: get help dropdown, `test.skip`) | Click `?` icon in admin header                                     | Dropdown menu opens with links: Documentation, Support, Roadmap, etc.  |

## 2. Edge cases

- **Capability:** non-admin should not see the Help menu.
- **Slow/unavailable docs.dokan.co:** cards should still render even if the doc-feed fetch fails.
- **i18n:** all help strings translatable; English fallback when locale missing.

## 3. Known issues

- TC1.2 (`get help dropdown`) is `test.skip` — the dropdown selector changed
  in the React shell rewrite and was not updated. Re-enable when stable.

## 4. Suggested follow-ups (not in this PR)

1. Doc-feed mock + cards-render assertion.
2. Search-filter behavior assertion.
3. Re-enable the Get Help dropdown test once the React shell selector is locked.
