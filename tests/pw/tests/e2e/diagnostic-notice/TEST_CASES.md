# Diagnostic Notice — Test Cases & Edge Cases

Scope: the admin opt-in/opt-out for Dokan diagnostic data sharing (the
"Help us make Dokan better" notice that appears on first install / after
upgrades).

Conventions:
- **A** = admin
- "Diagnostic notice" = the dismissible info notice with Allow / Disallow CTAs
- "Tracking option" = `dokan_appsero_data_tracking` user/site option

---

## 1. Notice rendering

| #    | Title                                                         | Steps                                                              | Expected                                                              |
|------|---------------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------|
| 1.1  | Admin views Dokan diagnostic notice (currently `test.skip`)    | A → any Dokan admin page after fresh install / upgrade             | Notice visible with title, body, Allow / Disallow buttons             |
| 1.2  | Allow tracking (TC: admin can allow Dokan diagnostic tracking) | Click Allow                                                         | `dokan_appsero_data_tracking` set to `yes`; notice dismissed          |
| 1.3  | Disallow tracking [lite] (TC: admin can disallow…)             | Click Disallow                                                      | Option set to `no`; notice dismissed                                  |

## 2. Edge cases

- **Multi-admin:** admin A allows, admin B sees no notice (sitewide flag, not per-user).
- **Dismissed notice on upgrade:** does the notice re-appear after a major version bump?
- **Capability:** non-admin should not see the notice at all (handled by `dokan-admin-notices` cap check).
- **Network failure on Allow:** if the upstream tracker URL is unreachable, the local option should still flip and the notice still dismiss.

## 3. Known issues

- TC: "view diagnostic notice" is `test.skip` — the notice can be auto-suppressed in test envs that have already opted in. Hard to reach a deterministic visible-state without DB reset.

## 4. Suggested follow-ups (not in this PR)

1. Add a DB-reset fixture to make TC1 reachable.
2. Verify outbound tracker payload is anonymized (no email / store URL).
3. Cypress / Playwright network mock for the tracker endpoint to avoid third-party flake.
