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
and verification through the shared procedure. Answer every remaining question:
after research, choose the most likely response for evidence gaps, label each
educated assumption as `inferred` with an `Educated assumption:` rationale,
contextual citations and limitations, and flag it in chat and review. Do not leave
null/unknown answers in completed assessments. Report any remaining validation
or verification blockers. No automatic merge or deployment.

Complete the authorised profiles through the full local workflow under the shared
procedure's completion requirement. Do not stop at a readiness report, partial
draft or remaining evidence gaps: resolve them with disclosed most-likely educated
assumptions, then review, validate, archive, generate and verify. Do not ask again
for permission already given. Report permanent answer-file links and 240/240 counts.
Report genuine technical blockers accurately while continuing other authorised work.
