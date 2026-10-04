---
name: audit-continue
description: Resume an unfinished 15 Values profile assessment from its saved draft and archive status without adding new subjects.
---

# Resume a profile assessment

Read [AGENTS.md](../../../AGENTS.md), [CONTRIBUTING.md](../../../CONTRIBUTING.md),
and [the shared profile procedure](<../../../docs/personality assessments/NEW_PROFILE.md>).
Run `npm run profiles -- status` from `frontend/`; inspect the actual drafts and
latest archives rather than inferring completion from a prior conversation.

Resume the requested ID. If only one draft is pending, use it. If several are
pending and no subject or batch was specified, ask which to resume. Do not invent
candidates or expand an authorised batch. Preserve completed archives and unfinished
research. If the draft is already archived, check generated output and finish
outstanding verification instead of archiving it again.

Verify that the bank fingerprint and versions still match. On a stale draft,
retain the old evidence and reassess against the current questionnaire; do not just
replace its fingerprint. Continue research, answers, review, validation, archiving
and verification through the shared procedure. Report exact remaining gaps if
publication is blocked by missing evidence. No automatic merge or deployment.
