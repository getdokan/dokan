# `docs/superpowers/` — transient planning artifacts

This directory holds **per-feature scaffolding**, not permanent developer
documentation. The files under `plans/` and `specs/` are written before and
during a feature's implementation to align on scope, design, and execution
order. Once the feature ships and the relevant runtime / test code has been
merged to `develop`, the files are **archived (deleted from the tree)** —
the merged commits + PR descriptions + canonical user-facing docs become
the lasting record.

## Lifecycle

| Phase              | Location                                            | Lifetime                                         |
| ------------------ | --------------------------------------------------- | ------------------------------------------------ |
| Discovery / design | `specs/<YYYY-MM-DD>-<slug>-design.md` (etc.)        | Lives on the feature branch                      |
| Implementation     | `plans/<YYYY-MM-DD>-<slug>.md`                      | Lives on the feature branch                      |
| Feature merged     | Files removed in a cleanup commit before the next release | Deleted — see commit history for the trail |

The cleanup commit is conventionally titled
`chore(docs): archive <feature> plan + spec` and removes the matching pair
of files for a closed feature.

## What lives where (permanent vs. transient)

- **Permanent** — developer-facing reference docs that survive across
  features:
  - `CLAUDE.md` (root) — codebase orientation for AI / new contributors
  - `docs/` (subdirs other than `superpowers/`) — architectural references
  - In-code docblocks, README files, `@since` annotations
- **Transient** — `docs/superpowers/{plans,specs}/` — pre-merge scaffolding
  only; never depend on these from runtime code or other docs.

## For reviewers

If a PR touches a file under `docs/superpowers/`, it's expected to be either:

1. **Add / update** — feature is in flight; the doc reflects the active
   plan or design. Read it for context but treat it as draft.
2. **Delete** — feature has landed; the doc is being archived. No code
   should still reference it.

Anything else (e.g. a settled-feature plan file growing new content months
later) is a smell — flag it.
