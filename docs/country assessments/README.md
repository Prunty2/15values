# Adding countries and historical regimes

Use `$new-country <name and period>` in Codex or `/new-country <name and period>`
in Claude Code. For an existing assessment, use `audit-country` with its ID.
Follow the [shared assessment procedure](<../personality assessments/NEW_PROFILE.md>)
and [tool reference](<../personality assessments/README.md>) alongside this guide.
The shared procedure supplies the evidence, scoring, review and archival rules;
this guide explains how they apply to countries.

## Completion requirement

Complete the authorised profiles through the full local workflow under the shared
procedure's completion requirement. Do not stop at a readiness report, partial
draft or remaining evidence gaps: resolve them with disclosed most-likely educated
assumptions, then review, validate, archive, generate and verify. Do not ask again
for permission already given. Report permanent answer-file links and 240/240 counts.
Report genuine technical blockers accurately while continuing other authorised work.

## Define the country and period

Specify the territory, institutions or regime being assessed and the period they
represent. Use `researchedAt` for the evidence cut-off and `metadata.period` for
the period covered. Set `metadata.historical` explicitly to `true` or `false`.
A present-day profile needs dated research too. Avoid combining incompatible
regimes into one lifetime average; materially different periods should have
separate, clearly labelled profiles.

Assess institutions and implemented policies. Distinguish constitutional rules,
actual enforcement, government promises and public opinion. Do not describe the
result as the beliefs of every citizen, or assume that a governing party's
ideology determines all 15 axes. State the scope in the public description.

## Research and answer

Research each of the 15 agreed axes independently. Use constitutions, legislation,
policy documents, official statistics and implementation records, checked against
independent scholarship or reporting. Record at least three independent publishers,
with source URLs, publication dates and access dates. Official statements alone
may not establish how institutions operate in practice.

Explain differences between law and practice, changes during the period, and
regional variation in the relevant axis brief and counter-evidence notes. Do not
infer Culture vs Nature from environmental policy, or support for religious law
from the population's private faith. Where the evidence cannot support a response,
choose the most likely response as a clearly labelled educated assumption,
following the shared procedure. Explain the contextual evidence and its limits;
do not describe the assumption as an adopted national position.

Complete the same 240 questions as every other profile: 16 per axis, using the
existing five agreement choices. Give every answer its own rationale and source
references. Mark inference explicitly. Every completed assessment must have 240 numeric
answers, including a most-likely choice for gaps remaining after research. Record
these as `inferred` with an `Educated assumption:` rationale, contextual citations
and the evidence limitation. Flag them in chat and review. Neutral is appropriate
only when it is the most likely mixed, conditional or neutral response.
Do not copy another country, import 12Axes scores or select a target placement.

## Metadata and flag

Fill in `name`, `description`, `category`, `period`, `scope` and `historical` in
metadata, plus the common audit fields created by `init`. Category describes the
political system; it does not affect scoring. Do not add personality-only fields
or a required ideology sentence to the country record.

Find a flag on **Wikimedia Commons** appropriate to the territory and period.
Verify its File description page and reuse terms. Save a local PNG, JPEG or WebP
at or below 1 MB under `frontend/public/profiles/images/`; record alt text, creator,
Commons File page, licence and licence URL in `metadata.image`. Use a new filename
when replacing an image. If a suitable Commons image cannot be found, report the
gap instead of silently substituting another source.

Add the reference to the **Image credits** page linked in the footer (`#/credits`,
`Credits()` in `frontend/src/App.tsx`). Follow the existing Andy Burnham credit:
image title, creator, source, licence/public-domain status and modification notes.
Profile metadata alone does not update that list. Reuse an existing reference for
the same image, preserve credits still needed, and check the footer link and image.

## Run the workflow

Run these commands from `frontend/`, replacing `<id>` with the chosen slug:

```sh
npm run profiles -- status
npm run profiles -- init country <id>
npm run profiles -- prompt country <id>
```

Complete `profile-audit/drafts/country/<id>.json`, then perform and record a
separate evidence review before proceeding:

```sh
npm run profiles -- validate country <id>
npm run profiles -- archive country <id>
npm run profiles -- build
```

Read validation warnings and the calculated neighbours. A similarity of at least
95% requires an evidence-based review decision for the named neighbour revision,
not altered answers to make the country look different. Drafts are temporary working records; resolve research gaps using
the educated-assumption rule and continue through completion. Re-audits append a revision and preserve earlier assessments and images.

Run the [contribution checks](../../CONTRIBUTING.md), including archive history
against the actual PR base. Inspect `#/countries`, search, the detail page, all
15 axis rows, flag, credits and downloaded assessment on desktop and mobile.
Include period, research cut-off, sources, limitations and verification in the
contribution summary. Open a PR when requested; do not auto-merge or deploy.
