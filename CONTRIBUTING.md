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
evidence, all 240 answers with rationales and citations, a separate review,
calculated scores, an immutable assessment archive, and display metadata. Countries
and personalities also need an appropriately licensed real image from Wikimedia
Commons. Follow Andy Burnham's existing image credit: record the Commons File
description page, creator, licence and any modifications, and add the reference
to the **Image credits** list linked in the footer (`#/credits`). This shared-page
credit is required in addition to the profile's own image metadata and credit.
Ideologies need their own broad society-level sentence. Missing evidence is not
Neutral: unresolved profiles stay in drafts and do not enter the catalogue.

Profiles are assessed under the same 15 definitions and scoring function as the
quiz. Do not add archetype questions or tune answers to target a score or avoid a
similarity warning. Saved user answers remain subject to the existing privacy rules;
the public assessment archives contain only researched profile answers.

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
catalogue contains 25 requested profiles and the personality catalogue contains
35 requested profiles; the country catalogue remains unpopulated.
The current ideology and personality placements are withdrawn following evidence
reviews. Their historical downloads remain available, while incomplete replacement
drafts retain unknown answers and cannot be archived or scored for publication.
The personality review and independent peer-review records are in
`profile-audit/reports/personalities-2026-10-04/`.
The infrastructure supports adding approved profiles;
user matching and the political compass remain separate future work.
