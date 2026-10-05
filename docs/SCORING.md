# Quiz implementation and scoring assessment

Implemented 4 October 2026. These are implementation decisions made for the authorised quiz flow, not claims that every draft question has been approved or empirically validated.

## Assessment of 12Axes

Reviewed the local `12Axes` checkout at commit `c2bb017f64398724e720fabbf6d4ea48c62a4c69`, specifically:

- `backend/src/main/java/com/twelveaxes/model/AnswerValue.java`
- `backend/src/main/java/com/twelveaxes/service/ScoringService.java`
- `backend/src/main/resources/data/questions-pool.json`

This is an assessment of that pinned checkout, not a claim about the currently deployed service.

12Axes maps Strongly agree, Agree, Neutral, Disagree and Strongly disagree to 1, 0.75, 0.5, 0.25 and 0. It reverses the contribution when agreement supports the other pole, computes a weighted mean for each axis, multiplies by 100, rounds to one decimal place, and reports the other pole as its complement. The inspected pool has 240 questions and every question has weight 1.

This is a transparent, symmetric method. Opposite responses have opposite effects, neutral contributes the midpoint, and each response has an explainable contribution. It is appropriate as a straightforward initial scoring method. It does not establish that wording measures its intended construct, that five response categories are truly equally spaced, or that reported placements have known statistical accuracy.

The reference also adds archetype-option effects to multiple axes, each as another weight-1 contribution. This can materially alter a short quiz and makes independence less clear. Its displayed intensity categories are fixed distances from the midpoint, not confidence estimates. An exact tie chooses the left pole as `dominantPole`. The inspected `validateAnswers` checks unknown IDs but does not reject duplicates or incomplete answer distributions. These behaviours are not carried into this implementation.

## Implemented method

All 15 axes retain their agreed names and meanings. The first 3, 5, 9 or 16 questions per axis are used for short, medium, long or comprehensive quizzes. Questions are presented in fixed rounds: priority 1 across all axes, then priority 2, and so on. This produces deterministic nested sequences of 45, 75, 135 and 240 questions. There is no random selection.

Scoring version 2.0.0 balances the two agreement-direction groups within each axis. The input value is +2 for Strongly agree, +1 for Agree, 0 for Neutral, -1 for Disagree, and -2 for Strongly disagree.

Let `L` be the mean input value of questions whose agreement supports the left pole, and `R` the mean input value of questions whose agreement supports the right pole.

`displacement = 12.5 × (L − R)`

`leftPercent = 50 + sign(displacement) × roundToOneDecimal(abs(displacement))`

`rightPercent = 100 − leftPercent`

Rounding displacement rather than the absolute placement preserves exact symmetry when every response is reversed, including half-decimal ties. Floating-point artefacts are removed before storage. The interface also rounds distance from the midpoint to whole percentage points and displays complementary percentages; exact stored scores are available through each axis's information control and JSON export.

Each direction group supplies half the axis evidence. Questions have equal weight within their group, independent of inclusion priority. In a short quiz with a 2–1 split, each of the two items in the larger group supplies one quarter of the total weight, and the single item in the other group supplies one half. This is an explicit design trade-off: it removes the systematic tilt caused by blanket agreement, but a question in the smaller group has more influence. It does not prove better reliability, correct a respondent's individual response style, or compensate for biased question wording.

Version 1.0.0 weighted every question equally. With an extra left-supporting statement, blanket Strongly agree produced 66.7%, 60%, and 55.6% left on the short, medium and long versions. Under version 2.0.0, any uniform response produces 50/50 in all four formats. Consistent support for either pole still reaches 100/0 or 0/100, and ordinary agreement/disagreement directed consistently towards one pole produces 75/25. With the comprehensive bank's 8–8 split, the unrounded formula is unchanged; symmetric tie rounding can differ by 0.1 percentage point from the old rounding convention.

Short scores now have 17 possible placements (6.25-point unrounded steps) instead of 13 (8⅓-point steps). Three five-choice questions still cannot produce continuous precision. There is no random jitter, invented decimal detail, population-based adjustment, cross-axis evidence or nonlinear remapping to make scores appear more varied. Repeated placements are still possible and expected. The inspected 12Axes base scoring has the same finite-resolution issue; its additional archetype contributions can introduce more score variation, but those are not part of this project's question bank.

“Left” and “right” refer to display order, not political left and right. Each question affects only its documented axis; there are no archetype adjustments, ideology matches, personality matches or country matches. Scoring requires exactly the expected question IDs and one valid response for every question in the chosen format. A missing response is never silently treated as Neutral. No result is calculated for an incomplete quiz.

## Reading a result

A percentage is a placement between poles, not a probability, a proportion of the population, or a confidence rating. Exact ties do not pick a dominant pole. A midpoint may represent all Neutral responses, offsetting opposing responses, or a combination. Each axis has an expandable information control with its definition, question count, neutral count and stored percentages. Entirely neutral axes are also labelled directly on the chart. These counts are descriptive, not a validated uncertainty model.

The result display uses the requested centred heading and question-count subheading, a homepage-style comparison card with explicit placeholders, and a sentence panel reserved for a broad statement about the society the matched ideology envisions. The sentence must come from the ideology profile, not be assembled from axis preferences. Since ideology matching remains deferred, this panel is explicitly a placeholder. The line above the results heading is removed, and the subheading fits on one line at desktop widths while wrapping on smaller screens. Reference-style rows show the agreed endpoint names and icons, a midpoint tick, a position marker, and a tendency badge. Both poles use the same thresholds: Balanced within 10 percentage points of 50, Leaning above 10 and below 25, Strong at least 25. These labels describe placement, not confidence. The axis topic headings are navigation labels and do not replace the agreed names or definitions.

Longer formats offer broader question coverage; they do not guarantee greater accuracy. No population calibration, reliability study or construct-validation study has been carried out for this bank. The result page discloses that the development bank includes draft wording.

## Question provenance and review concerns

`frontend/src/data/questions.v1.json` preserves the existing 240 statements, inclusion priorities and recorded agreement directions from `docs/questions/`. The source documents were not rewritten for this implementation. Four axes are explicitly locked, one has agreed ordering without a status line, and ten remain marked Draft. The JSON retains a per-question `status` and the overall bank is a development version.

`npm run questions:check` verifies exact synchronisation. `npm run questions:sync` regenerates the JSON after an authorised wording change; review and update the bank version whenever published content changes.

Several existing items merit a separate wording review before making stronger measurement claims:

- Culture vs Nature 16 attributes the gender pay gap to “economic value” rather than social expectations. That does not identify an inherited or biological explanation, so agreement is not unambiguous evidence for Nature.
- Culture vs Nature 2 and 14 frame group differences as inherited/biological versus social explanations without establishing the factual premise or allowing other explanations. Item 15 introduces “inherited racial tendencies” into a general question about self-control. These may conflate factual assumptions, stereotypes and causal beliefs. Their framing requires careful review; the quiz should not present the premises as established facts.
- Restricted Immigration 14 and 16 also concern cultural selection; item 15 concerns benefit eligibility. These may measure assimilation or redistribution alongside immigration openness.
- Militarist 8 combines autonomous weapons, efficiency and national security, which can also measure technological caution. The wording of item 6 can also pick up views about sex-specific obligations.
- Progressive vs Traditionalist 8 includes parental authority over schooling, which need not follow from general attitudes towards traditional norms.

Documented direction balance is a structural check, not proof of impartial wording or valid axis measurement. Resolving these concerns should be explicit, with question-version changes and review of shorter-set coverage, rather than hidden weight adjustments.

## Results, history and privacy

Quiz answers remain in React memory in the open page. Refreshing, closing the tab, or leaving the quiz/results area discards those answers. The active quiz warns before a browser reload and before using its home link to leave. Home format buttons start the chosen quiz directly. Browser Back returns to the actual previous page; when that is the format selector, it retains the in-memory session and offers Continue quiz. Direct or refreshed quiz URLs with a valid length start at the first question with no answers selected. Missing or invalid lengths show the format selector. No incomplete result is manufactured. Quiz routes load with the main application, so internal navigation does not show a separate loading screen.

Completed results save automatically in this browser when the user submits the final answer. Saved-result cards preview all 15 axes and open the full profile at a result-specific hash URL that survives refresh. Save failures leave the current profile available with a visible error and a manual save action. Exporting the current result does not require browser storage. History supports individual card deletion; Manage history contains clear-all with confirmation, JSON export and import. Raw individual answers are neither saved nor exported in this implementation; retaining them remains a future product decision.

The owned key is `15-values:history:v1`, with schema version 1. Each record includes an ID, ISO completion date, quiz length, all 15 complementary axis scores, question and neutral counts, and question-bank, scoring and axis versions. Imports are validated and rebuilt from known fields before writing. Unsupported schemas or unknown data versions, invalid dates, malformed scores, duplicate IDs and conflicting imported records are rejected. Existing storage is not silently erased or overwritten on read failures. Clearing this history does not clear unrelated browser storage.

A maximum of 100 results and a 1 MB import limit bound storage and file handling. Exceeding the result limit is reported without silently trimming data. Repeat imports of identical results are deduplicated. Browser storage denial and quota failures produce visible messages; the quiz and current-result export remain available.

History accepts scoring versions 1.0.0 and 2.0.0 with the current bank and axis versions. Old results are preserved verbatim and labelled “Original scoring”; their calculation explanation remains specific to version 1. They cannot be recalculated because raw answers were never retained. Export/import retains the original scoring version, including files containing both versions. Unknown versions are rejected. A future incompatible schema needs an explicit migration.

## Interface and verification

The quiz uses Clarity City text and locally hosted Bitcount Ink question numbers. The Bitcount Ink colour palette is overridden to a single muted tone using CSS, without modifying the font. Both fonts include their SIL Open Font licences. Bitcount Ink source: https://github.com/google/fonts/tree/main/ofl/bitcountink.

The question card uses most of the desktop viewport width and scales its text and answer rows with the available space. The question and answers stay together in a content-sized card without an expanding gap. The active quiz fits the available window height with compact typography and controls; short landscape windows place the question beside the answers. Topic labels do not reveal which pole agreement supports. All five choices use the same size and typography. Green ticks indicate agreement, red crosses indicate disagreement, and a muted dash indicates neutral; these icons describe the response, not whether a political position is correct. The selection treatment is shared by all responses. Advance-on-answer is enabled by default and briefly shows the selection; users can turn it off for manual navigation. Final submission always requires “See my results”. Native radio controls support keyboard selection, arrow-key browsing does not auto-advance, focus moves to each new question, and reduced-motion preferences are honoured.

Vitest verifies source fidelity, per-axis balance, fixed nested selection, neutral/extreme/symmetric scoring, all 125 short-axis response patterns for range and monotonicity, direction-group weighting, axis independence, symmetric display rounding and tendency labels, invalid answers and mixed-version history validation/storage failure. Playwright verifies completion of all four quiz lengths on desktop and mobile, calculated exports, editing, keyboard and automatic advance, restart, direct-route starts, Back/Forward navigation, history persistence/import/export/deletion, blocked storage, loaded fonts, narrow screens and large desktop use. Production browser tests run under `/political-quiz/` to exercise GitHub Pages subdirectory assets.

## Researched catalogue profiles

The authorised profile contribution tools call `scoreAnswers('comprehensive', answers)`
with all 240 researched answers, using this same scoring version. Their generated
catalogue data is separate from saved user results. Each assessment preserves its
evidence, question/axis/scoring versions and bank fingerprint; older revisions are
never overwritten. Catalogue pages expose sources and downloadable assessments.
The diagnostic profile-similarity formula and review threshold are documented in
[assessment tool reference](<personality assessments/README.md>). These are contributor review
tools, not user matching, confidence estimates or empirical validation.
