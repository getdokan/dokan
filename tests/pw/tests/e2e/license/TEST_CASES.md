# License — Test Cases & Edge Cases

Scope: the Dokan Pro license-management page (`Dokan → Help → License`),
covering activation, refresh, deactivation, and the menu-render smoke test.

Conventions:
- **A** = admin
- "License page" = the Pro module-licensing UI rendered under the help menu
- Tests tagged `@serial` run alone (excluded by `grepInvert` when other parallel tests run) because activation+deactivation hit the same shared license state

---

## 1. License page

| #    | Title                                              | Steps                                                              | Expected                                                              |
|------|----------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------|
| 1.1  | Admin views license menu page (TC: view)           | A → Dokan → Help → License                                          | License-page chrome, status badge, key input field visible            |
| 1.2  | Admin activates license (TC: activate)             | Paste a valid key → Activate                                       | Server returns 200; status badge flips to "Active"                    |
| 1.3  | Admin refreshes license (TC: refresh)              | While active, click Refresh                                         | Server reissues a token; status remains Active                        |
| 1.4  | Admin deactivates license (TC: deactivate)          | Click Deactivate                                                    | Status flips to "Inactive"; key field cleared                          |
| 1.5  | Activate with invalid key                          | Paste garbage → Activate                                            | Inline error from license server; status stays Inactive               |
| 1.6  | Activate with already-used key                      | Paste exhausted key                                                 | Inline error with seat-count message                                  |
| 1.7  | Activate offline                                    | Mock license server 5xx                                              | UI shows network error notice                                         |

## 2. Edge cases

- **Concurrent activate/deactivate:** two admins clicking simultaneously — server should serialize.
- **Capability:** `editor` role should not see the license page at all (gated by Dokan admin chrome).
- **Race:** clicking Deactivate immediately after Activate (before server response) — UI should disable the button until response.
- **Stale token:** if upstream rotates the license token, next refresh should pick it up without manual deactivation.

## 3. Suggested follow-ups (not in this PR)

1. Capability boundary: ensure non-admin gets 4xx on REST license endpoints.
2. Multi-license scenario (multiple Pro modules with separate keys).
3. Server-error UX: surface license-server downtime with actionable copy.
