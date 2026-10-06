# Contributing to 15 Values

Keep contributions politically impartial and preserve the agreed 15 axes.
Read [AGENTS.md](AGENTS.md) before working. Discuss new features or
measurement changes with the owner first.

## Profiles

New profiles require an owner request. Use the repository skills in
Codex or Claude Code:

| Task | Codex | Claude Code |
| --- | --- | --- |
| Add a profile | `$new-ideology`, `$new-country`, `$new-personality` | `/new-ideology`, `/new-country`, `/new-personality` |
| Re-audit a profile | `$audit-ideology`, `$audit-country`, `$audit-personality` | `/audit-ideology`, `/audit-country`, `/audit-personality` |
| Resume an assessment | `$audit-continue` | `/audit-continue` |

Follow each command with the subject name or existing profile ID.

Complete all 240 answers with research, rationales and citations, then
review, validate, archive, regenerate the catalogue and verify it.
For evidence gaps, choose the most likely response and disclose it as
`inferred`, with a rationale beginning `Educated assumption:`.
Cite the contextual evidence and flag the question IDs in the review
and completion report. Uncertainty does not automatically mean Neutral.

Preserve previous revisions and image credits. Never tune answers to
target scores or edit generated scores directly.

See the [full assessment procedure](docs/personality%20assessments/NEW_PROFILE.md)
and [tool reference](docs/personality%20assessments/README.md).

## Checks

Run from `frontend/`:

```sh
npm run questions:check
npm run profiles:check
npm test
npm run build
npm run test:e2e
```

After profile changes, run `npm run profiles -- build` before checking.
Check affected pages and report the verification results.

### Additional religion identity question

The final religion question is unscored and kept separately from the 240 political statements. Every new personality or ideology also needs a sourced, period-specific response in the latest supplement under `profile-audit/religion-assessments/`. Add the next sequential numbered JSON revision with the full set of answers and a separate evidence review; preserve previous revisions. For personalities, `none` means no religion and `undisclosed` means not publicly established or disputed. For ideologies, `none` means no religious prerequisite, so general conservatism and other general traditions remain eligible for all identities. Countries do not answer this question. Mark educated assumptions as `inferred` with a rationale beginning `Educated assumption:`. Catalogue generation validates coverage and recalculates eligible ideology matches; it never changes political scores to obtain a preferred neighbour.
