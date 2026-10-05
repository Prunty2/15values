# Contributing to 15 Values

Contributions must preserve the project's political impartiality and its agreed
15 axes. Read [AGENTS.md](AGENTS.md) before working. Keep changes focused and
preserve unrelated work. Discuss new features or measurement changes with the
owner before implementing them; a request to add a named profile authorises that
profile's research and integration.

## Add ideologies, countries or personalities

Use **Codex or Claude Code with the repository skills** to carry out the complete
research and assessment process. You remain responsible for checking the evidence
and reviewing the contribution. The process follows the question-by-question
approach used by [12Axes](https://github.com/RomanCypherpunk/12axes), adapted to this
project's own bank and scoring. Do not import 12Axes scores, profiles or questions.

| Task | Codex invocation | Claude Code invocation |
| --- | --- | --- |
| Add an ideology | `$new-ideology <name>` | `/new-ideology <name>` |
| Add a country/period | `$new-country <name and period>` | `/new-country <name and period>` |
| Add a personality | `$new-personality <name>` | `/new-personality <name>` |
| Re-audit an ideology | `$audit-ideology <id>` | `/audit-ideology <id>` |
| Re-audit a country | `$audit-country <id>` | `/audit-country <id>` |
| Re-audit a personality | `$audit-personality <id>` | `/audit-personality <id>` |
| Resume an unfinished assessment | `$audit-continue <id>` | `/audit-continue <id>` |

Use real names/IDs in place of the angle-bracket arguments. Open the repository
in your agent. Codex discovers `.agents/skills/`; Claude Code discovers
`.claude/skills/`. The small entrypoints refer to the same shared procedure,
[shared assessment procedure](<docs/personality assessments/NEW_PROFILE.md>), and
[tool reference](<docs/personality assessments/README.md>). If a skill is not discovered, explicitly
ask the agent to read its `SKILL.md` and follow it. See the official
[Codex skill documentation](https://learn.chatgpt.com/docs/build-skills) and
[Claude Code skill documentation](https://code.claude.com/docs/en/skills).

Catalogue-specific guides: [countries and historical regimes](<docs/country assessments/README.md>)
and [ideologies](<docs/ideology assessments/README.md>).

An example request: “Use the new-personality skill to research and add [name],
complete all 240 answers with evidence, validate the profile, and prepare a PR.”
Request the PR explicitly if you want the agent to open one.

Every published entry needs a defined scope/period, independently researched
evidence, all 240 most-likely answers with rationales and citations, a separate review,
calculated scores, an immutable assessment archive, and display metadata. Countries
and personalities also need an appropriately licensed real image from Wikimedia
Commons. Follow Andy Burnham's existing image credit: record the Commons File
description page, creator, licence and any modifications, and add the reference
to the **Image credits** list linked in the footer (`#/credits`). This shared-page
credit is required in addition to the profile's own image metadata and credit.
Ideologies need their own broad society-level sentence. Answer every question.
After research, choose the most likely response for any remaining evidence gap,
record it as `inferred` with an `Educated assumption:` rationale, cite the
contextual sources actually used, and explain the uncertainty and alternatives.
Flag those questions in chat and review. Missing evidence is not automatically
Neutral. Completed profiles must have no null/unknown answers and must still pass
review, validation and archival checks.

Profiles are assessed under the same 15 definitions and scoring function as the
quiz. Do not add archetype questions or tune answers to target a score or avoid a
similarity warning. Saved user answers remain subject to the existing privacy rules;
the public assessment archives contain only researched profile answers.

## Completion requirement

A request to add, complete or re-audit named profiles authorises the full local
workflow: research, all 240 answers, separate review, validation, immutable archive,
catalogue generation and verification. Continue until every requested profile is
complete. A readiness report, metadata, scores alone or a partially answered draft
is not completion. Fix routine validation errors and continue through the requested
batch rather than ending after an intermediate step.

Missing exact evidence is not a reason to stop or ask for renewed permission.
Research first, then choose the most likely of the five responses using contextual
evidence. Mark the educated assumption as `inferred`, begin its rationale with
`Educated assumption:`, cite actual sources and explain the choice and uncertainty.
Flag these question IDs in chat and review without waiting for approval. Do not
invent sources or documented positions, or automatically use Neutral. Resolve all
null/unknown placeholders before completion.

Only a concrete obstacle that cannot be resolved within the authorised workflow,
such as unavailable required tools, inaccessible files or materially ambiguous
identity, warrants reporting a blocker. State it accurately and continue all other
work that can proceed. An evidence gap covered by the educated-assumption rule is
not a blocker. Do not bypass validation or claim failed checks passed.

The final response must give each profile's permanent answer-file link, 240/240
answered-question count, revision, catalogue-generation result, educated-assumption
IDs and actual verification results. Save answers in repository JSON. A PR requires
a request; merging and deployment remain outside this local authorisation.

## Development and required checks

Install an accepted Node version (see `frontend/package.json`), then run these
commands from `frontend/`:

```sh
npm ci
npm run questions:check
npm run profiles:check
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

After changing an assessment, use `npm run profiles -- build` to regenerate its
public files before checking them. Run `npm run profiles -- history <base-ref>`
against the actual branch/commit your PR targets. Previous archives and images
must be preserved; re-audits append revisions. The CI workflow checks archive
history on PRs and runs data validation, tests, build and browser verification.
It does not deploy or configure repository branch-protection rules.

Check the affected index and detail pages in the browser, including narrow
screens, keyboard navigation, search, credits and audit download. An empty catalogue
must still show its empty state; tests use fictional fixtures without publishing
them. Report exactly what you ran and any checks you could not run.

## Pull requests

Keep each PR to one subject or an explicitly agreed batch. Include the period,
research cut-off, major sources, unresolved limitations, similarity review decisions
and verification results. Review the complete diff and stage only intended files.
Do not commit unrelated work, credentials or temporary outputs. Keep drafts only
when they are intentionally being shared for further work.

Never edit old assessment archives or generated score values directly. Source or
scoring changes need versioning and re-audit, not silent recalculation. The ideology
catalogue contains 53 requested profiles and the personality catalogue contains
35 requested profiles; the country catalogue contains 47 requested profiles, each with all 240 questions answered. See the [country completion report](profile-audit/reports/country-completion-2026-10-05/completion.md) for current permanent revisions, educated-assumption IDs, separate reviews and verification.
The original 25 ideology placements were restored in revision 2 on 5 October 2026 after
the owner's complete-redo request. All 6,000 responses were reassessed and are
conservatively disclosed as inferred educated assumptions. A distinct same-agent
review and structural validation are recorded; external personal review remains
pending, and earlier archives and withdrawal records remain unchanged.
The owner's subsequent 30-profile expansion added complete revision 1 assessments
on 5 October 2026. Each contains 240 responses disclosed as educated assumptions,
with a separate same-agent review in
`profile-audit/reports/ideology-expansion-2026-10-05/`. Existing Marxism was retained;
the previously requested Civic Nationalism exclusion remains in effect.
The 35 personality placements were restored with new complete revisions on
5 October 2026 under the owner's best-effort completion instruction. Their
formerly unresolved answers are disclosed provisional educated assumptions;
personal review remains pending. Historical withdrawn revisions remain available.
Future completions likewise require researched responses or disclosed most-likely
educated assumptions before review, validation and publication.
The personality review and independent peer-review records are in
`profile-audit/reports/personalities-2026-10-04/`.
The infrastructure supports adding approved profiles;
user matching and the political compass remain separate future work.
