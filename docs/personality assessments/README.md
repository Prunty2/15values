# Profile assessment tools

This is the shared workflow for researched ideologies, countries and personalities.
Start with [NEW_PROFILE.md](NEW_PROFILE.md), or use one of the repository skills
listed in [CONTRIBUTING.md](../../CONTRIBUTING.md). A profile request authorises only
the named subjects. The catalogues start empty; homepage examples are not profiles.

The approach is inspired by [12Axes](https://github.com/RomanCypherpunk/12axes),
particularly its [new-profile process](https://github.com/RomanCypherpunk/12axes/blob/main/profile-audit/NEW_PROFILE.md)
and [audit workflow](https://github.com/RomanCypherpunk/12axes/blob/main/profile-audit/README.md).
These are independently written instructions and tools for this repository, not
copies of its code, question bank or profile data.

Catalogue-specific guidance is also available for
[countries and historical regimes](<../country assessments/README.md>) and
[ideologies](<../ideology assessments/README.md>).

## Completion requirement

Complete the authorised profiles through the full local workflow under the shared
procedure's completion requirement. Do not stop at a readiness report, partial
draft or remaining evidence gaps: resolve them with disclosed most-likely educated
assumptions, then review, validate, archive, generate and verify. Do not ask again
for permission already given. Report permanent answer-file links and 240/240 counts.
Report genuine technical blockers accurately while continuing other authorised work.

## What is retained and what is adapted

Like 12Axes, research each subject independently, answer the entire questionnaire,
calculate placements from those answers, inspect validation warnings, and archive
the evidence for review. Here the bank is **15 axes × 16 questions**, the five
responses are **-2, -1, 0, 1, 2**, and the calculation calls the same TypeScript
function as the browser quiz. There are no extra archetype questions, religious
filters, copied vectors, cross-axis adjustments, or backend service.

Every completed assessment must choose the most likely response for all 240
questions. Research gaps require disclosed educated assumptions under
[NEW_PROFILE.md](NEW_PROFILE.md), recorded as `inferred` with an
`Educated assumption:` rationale, contextual citations and limitations. Neutral
is a substantive choice, never an automatic replacement for missing evidence.
Many neutral answers still trigger review warnings.
The 95% similarity review threshold is a project diagnostic, not an empirical
measure of validity and not an instruction to make profiles numerically distinct.

## Commands

Use a Node version accepted by `frontend/package.json` and run `npm ci` in
`frontend/`. All commands below run from `frontend/`; no additional packages,
API keys or separate Python scoring implementation are required.

| Command | Effect |
| --- | --- |
| `npm run profiles -- init personality <id>` | Creates a draft with 240 unresolved answers. Also accepts `ideology` and `country`. Refuses to overwrite a draft. |
| `npm run profiles -- prompt personality <id>` | Prints the current questions verbatim, pole directions, axis definitions, versions and assessment instructions. |
| `npm run profiles -- validate personality <id>` | Checks the draft, images, evidence references, review and nearest profiles. Prints errors, warnings and calculated scores. Writes nothing. |
| `npm run profiles -- archive personality <id>` | Revalidates and appends the next immutable revision. Retains the draft. Does not publish or deploy. |
| `npm run profiles -- build` | Validates active archives and generates the static catalogue and downloadable assessments. |
| `npm run profiles -- check` | Validates archives and fails if generated files differ or are missing. Included in the application build. |
| `npm run profiles -- status` | Derives published and pending entries from archives and drafts. |
| `npm run profiles -- history <base-ref>` | Rejects edits/deletions of previously committed archives or profile images compared with a verified Git base. |

Replace `<id>` with a unique lowercase hyphenated identifier. Do not type the angle
brackets literally. `status` is the source of progress information; there is no
manually maintained STATE.json that can disagree with the files. Here “published”
in status means archived for inclusion in a local build, not deployed to a website.
Pending counts reflect draft files, not an authorised candidate list or research completeness.

## Files and generated output

- `profile-audit/drafts/<catalogue>/<id>.json`: editable work in progress, including
  sources, metadata, all answers and review. Drafts do not enter the site build.
- `profile-audit/answers/<catalogue>/<id>/<revision>.json`: permanent assessments.
  Sources and research notes are embedded so an archive stands on its own.
- `frontend/public/profiles/images/`: real portraits and flags sourced from
  Wikimedia Commons, with credits and licences in metadata and the footer-linked
  Image credits page (`Credits()` in `frontend/src/App.tsx`). Follow the existing
  Andy Burnham credit. Generation does not update that shared list; contributors
  must add the reference as part of the profile change. Use a new filename for a changed image; old revisions may
  reference the old file. Keep each image at or below 1 MB and verify it visually.
- `frontend/public/profiles/catalogue.v1.json`: generated metadata, sources and
  scores for the latest revision of each entry. Never hand-edit scores here.
- `frontend/public/profiles/audits/`: generated downloadable copies of all archives.

Build output is deterministic. A build fails on a stale current profile, orphaned
download, malformed data, duplicate ideology sentence, or unreviewed close pair.
New drafts and unfinished re-audits leave the last published revision intact.
Archive writes refuse replacement; generation can be rerun after interruption.
Do not run archive/build mutations concurrently in the same checkout.

## Schema and scoring

`frontend/src/profiles/types.ts` defines the record shapes. `init` creates the exact
editable structure. The executable validator is `frontend/src/profiles/audit.ts`.
Each answer contains its question ID, numeric value or null, `basis` (`direct`,
`inferred`, `unknown`), a rationale, and source IDs. Null/unknown values are
temporary initial-draft placeholders only; resolve them to most-likely numeric
answers before completion. Educated assumptions use `inferred` and the explicit
rationale prefix described in the shared procedure. Each axis has a brief and
counter-evidence review. Each source includes title, URL, publisher, publication
date (or `undated`), and access date. Dates use YYYY-MM-DD.

All entries require identity, description, category, period, scope, author,
research date and change note. Ideologies also require a substantive `phrase`;
personalities require role, lifespan and portrait; countries require an explicit
historical flag and an appropriate flag image. Category is descriptive metadata,
not a score input. Images require alt text, source URL, creator, licence and licence
URL. Use only images whose reuse terms you have checked.

There must be at least three sources from distinct publishers. This is a minimum
research gate, not proof that publishers are independent or that the evidence
supports the answers. The reviewer must check those facts. There is no automatic
claim that a URL was visited or that a nonempty rationale is correct.

Published assessments require all 240 answers and all 15 axis reviews. Missing,
duplicate, misplaced and invalid responses fail validation. Resolve all initial
null/unknown placeholders through research or disclosed educated assumptions
before archiving. The record pins question-bank, axis and scoring versions,
plus a SHA-256 fingerprint of the axes, questions and scoring version. Never
change a fingerprint just to bypass stale-data errors. A scoring implementation
change must bump its version, even if the question bank is unchanged.

`scoreAnswers('comprehensive', answers)` is the sole calculation. The generated
15 scores have complementary percentages and preserve the quiz's direction-group
weighting. `profile-audit` does not alter the user scoring function or saved history.

Similarity diagnostics compare entries in the same catalogue: `100 − mean of
the 15 absolute differences in left-pole percentages`. Each axis has equal weight.
The unrounded value determines whether the 95% review threshold is met. For every
close neighbour, record its ID, revision and an evidence-based reason for retaining
both profiles in `review.similarity`. Exact duplicate scores also require review;
different subjects can legitimately answer alike. Never tune answers to avoid a
threshold. On generation, either current assessment may document the pair.
These diagnostics are not user matching, probabilities, or recommendations.

## Re-audits and review

Use the same ID when correcting the same subject and period. Preserve all archives.
If an archived draft still exists, first verify it matches its archive; move it
aside before running `init` again. Keep an unfinished draft instead of replacing it.
`init` takes the next revision and retains metadata, but resets the answers so the
new assessment is independent. A different historical period may warrant a new ID.

After an authorised bank/axis/scoring change, latest profiles must be re-audited
before generation succeeds. Stale peers are excluded from draft diagnostics during
that migration; the final build checks the complete current catalogue. Older
archives retain their original version references; the corresponding Git version
of the questionnaire and scorer is needed to reproduce them. They are never
silently recalculated with newer questions.

Technical validation cannot establish political impartiality or measurement
accuracy. A separate review must read the cited material, check each rationale,
challenge inferences and contradictions, and verify that the description and
ideology phrase reflect the evidence. `review` records who performed this pass,
when, what was checked and similarity decisions; do not fabricate a human review.
AI-assisted assessment and review remain subject to contributor and PR review.

Catalogue browsing is implemented; user-to-profile matching and the political
compass remain deferred. Results and homepage example cards retain their existing
placeholder behaviour. These profiles are interpreted assessments, never claims
that a person, nation or movement personally submitted the quiz.
