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

The result display uses the requested centred heading and question-count subheading, a homepage-style comparison card with calculated ideology, personality and country comparisons, and a sentence panel reserved for a broad statement about the society the matched ideology envisions. The sentence must come from the ideology profile, not be assembled from axis preferences. Ideology matching now supplies the closest compatible profile’s statement, with separate statements for tied profiles. The line above the results heading is removed, and the subheading fits on one line at desktop widths while wrapping on smaller screens. Reference-style rows show the agreed endpoint names and icons, a midpoint tick, a position marker, and a tendency badge. Both poles use the same thresholds based on the displayed whole-percent deviation from 50: Balanced at 0–5 percentage points, “Leaning [pole]” at 6–15, “[pole]” at 16–25, and “Strongly [pole]” at 26–50. These labels describe placement, not confidence. The axis topic headings are navigation labels and do not replace the agreed names or definitions.

Longer formats offer broader question coverage; they do not guarantee greater accuracy. No population calibration, reliability study or construct-validation study has been carried out for this bank. The result page discloses that the development bank includes draft wording.

## Question provenance and review concerns

`frontend/src/data/questions.v4.json` contains 240 statements synchronised with `docs/questions/`. Bank 4.0.0 revises six Authority–Liberty records under the second coverage reassessment described below. Bank 3.0.0 previously revised nine Authority–Liberty records with owner authorisation on 6 October 2026. Bank 2.0.0 previously revised six Democracy–Autocracy statements under the owner’s 5 October clarification. Historical `questions.v1.json`, `questions.v2.json`, `questions.v3.json` and `axes.v1.json` remain unchanged. Four axes are explicitly locked, one has agreed ordering without a status line, and ten remain marked Draft. The JSON retains a per-question `status` and the overall bank is a development version.

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
with all 240 most-likely answers, using this same scoring version. The owner’s
5 October 2026 completion rule requires researched responses where available and
explicitly labelled educated assumptions where research leaves gaps; see the
shared procedure. An assumed answer affects the score like any other answer,
so its rationale and review must disclose the uncertainty. This changes assessment
guidance, not the scoring formula or quiz answer requirements. Their generated
catalogue data is separate from saved user results. Each assessment preserves its
evidence, question/axis/scoring versions and bank fingerprint; older revisions are
never overwritten. Catalogue pages expose sources and downloadable assessments.
The diagnostic profile-similarity formula and review threshold are documented in
[assessment tool reference](<personality assessments/README.md>). These are contributor review
tools, not user matching, confidence estimates or empirical validation.

## Personality and country ideology comparison

Authorised 5 October 2026. Catalogue generation records `closestIdeology` for
each personality and country using method `equal-axis-mae-v1`. The distance is
the mean absolute difference between the subject’s and ideology’s left-pole
percentages across all 15 axes. Each axis has equal weight; complementary right
percentages are not counted again. This reuses the assessment review’s existing
equal-axis distance. No political labels, identity, popularity or preferred
outcome affect the comparison.

Only visible, non-withdrawn ideologies with the same question-bank, axes and
scoring versions are candidates. Withdrawn subjects and empty compatible candidate
sets receive a null match. All minimum-distance ties (floating-point tolerance
1e-9) are retained, ordered by ID for stable presentation. Selection uses unrounded
distances; only the displayed average gap is rounded to one decimal place.
The generated record includes ideology IDs, names, revisions and the distance.
Regeneration recomputes matches when assessments or the candidate catalogue change;
the frontend validates stored matches against the current catalogue. Immutable
answer archives and researched classification metadata are preserved.

Profile pages link to their closest ideology or tied ideologies and show the
average gap in percentage points. This is resemblance among assessed profiles,
not an identity claim or confidence estimate. It inherits evidence uncertainty
and question-bank limitations. Even a distant nearest candidate is shown with
its gap; no arbitrary acceptance threshold is imposed. User-to-ideology comparison is now authorised; automatic quiz-result personality and country comparisons are authorised; compass presentation remains deferred.

The accuracy corrections of 5 October make the reference period and scope visible,
show all 15 individual gaps on profile pages, and show the next distinct candidate's
distance margin. Quiz results expose the reference scope and three largest gaps.
Cards display the ideology name without a prefix; the filter is labelled
Ideology. The detail page explains the numerical comparison. The margin is not a confidence interval or a
validated threshold. Complete disagreement on one axis, with agreement on the
other fourteen, still produces 93.3% similarity under the agreed formula; averaging
must not be read as agreement on each issue. No score, weight, tie rule, axis or
version was changed by these presentation corrections.

The catalogue's period-specific interpretations are not interchangeable with an
entire political tradition. For example, a profile scoped to a governing party in
a named period supplies that reference's score, rather than certifying every form
of the ideology. Government ownership and government planning also do not fully
describe cooperative ownership or voluntary collective coordination. These are
coverage limits, not grounds to reverse literal answers to obtain a desired match.

## Quiz result ideology comparison

Authorised 5 October 2026. Results use the same equal-axis mean absolute distance,
compatible-version filtering and tie retention as catalogue profile comparisons.
The closest ideology links to its assessment page and displays similarity (100 minus the average gap) to
one decimal place, alongside its supplied perspective statement. This is score
resemblance, not identity or confidence. Catalogue assessment assumptions and
question-bank limitations apply. Comparisons load locally from the current published
catalogue and are recomputed when a result is viewed; history scores and exports
remain unchanged. Loading failures offer retry; an empty compatible catalogue,
including older scoring versions, displays an unavailable explanation.

Results also offer an owner-authorised manual Compare picker for visible, compatible
ideology and personality profiles. Search uses case-insensitive name substrings,
with alphabetical suggestions in a scrollable modal list and arrow/Enter selection.
Chosen profiles add numbered dots to the user’s existing 15 axis graphics,
with a removable legend and equal-axis percentage similarity. The closest ideology
sets the results colour theme using its catalogue group colour; cross-group ties
use the neutral catalogue colour. The top comparison card and quote have equal width. Selection is temporary
and is not added to local history or exports. Escape closes the picker and restores
focus. Automatic personality and country matches are available in the results comparison card; manual country comparison remains deferred.

## Profile personality similarity

Authorised 5 October 2026. Personality profiles show “Similar Personality” as links to the nearest other compatible, non-withdrawn personality profiles using equally weighted mean absolute distance across all 15 axes. Self-matches are excluded; all ties within 1e-9 are retained. Matches are calculated from the current catalogue at display time. Similarity is 100 minus the mean gap. These comparisons inherit assessment uncertainty and do not imply affiliation or endorsement. Automatic quiz-result personality and country matching are authorised.

Political leaning labels are removed from profile detail pages and catalogue cards at the owner’s request on 5 October 2026. Catalogue browsing groups, immutable assessments and recorded metadata remain unchanged.

## Quiz result personality and country comparisons

Authorised 5 October 2026. Results show the closest compatible, non-withdrawn personality and country assessments, retaining all ties within 1e-9. Each of the 15 axes has equal weight; similarity is 100 minus mean absolute score distance, displayed to one decimal place. Matches link to catalogue profiles and are recomputed when viewed. Loading failures, empty catalogues and incompatible versions show unavailable explanations. These estimates inherit assessment and question-bank limitations and do not imply identity, affiliation or endorsement. Saved scores, exports, ideology colours and perspective statements are unchanged.

## Ideology profile person and country comparisons

Authorised 5 October 2026. Each ideology profile shows the most similar compatible, non-withdrawn person and country from the current catalogue, linking to their profiles. Comparisons use equal-weight mean absolute distance across all 15 axes, retain all ties within 1e-9, and show linked names with portraits and flags without visible category labels or similarity percentages. Withdrawn ideologies and missing compatible candidates show unavailable explanations. Matches are calculated when viewed and inherit assessment uncertainty; they do not imply affiliation or endorsement.

### Religious identity eligibility (6 October 2026)

Every quiz ends with one required, unscored question: “What religion do you identify with?” Options include Hinduism, Islam, Christianity, Judaism, Buddhism, Sikhism, another religion, no religion, and prefer not to say. The formats still contain 45/75/135/240 political statements, plus this final question. Its answer is stored locally and exported with the result; political statement answers remain unsaved. Existing saved results without an identity retain their original scores and exclude faith-specific ideology matches.

Explicitly Hindu, Islamic and Christian ideologies require the corresponding identity for automatic ideology matching. Identifying with a religion does not force a religious ideology: all general ideologies remain eligible and ranking still uses equal weights on the unchanged 15 axes. An ideology’s “no religion” response means no prerequisite, not atheist-only eligibility. Personality-to-ideology and religious-ideology-to-personality matches apply the same eligibility rule, using sourced, period-specific identity assessments. Country comparisons always permit general ideologies. Faith-specific ideologies require that faith to represent at least 20% of the country’s population in the sourced supplement. Multiple faiths may qualify; missing country evidence excludes faith-specific matches. This eligibility filter applies in both comparison directions and does not alter political scores. Manual score comparisons remain available across identities; they do not assign an ideology.

The separate, unscored responses are preserved in `profile-audit/religion-assessments/1.json` with evidence and uncertainty for every published ideology/personality. Country eligibility is stored separately in `profile-audit/country-religion-assessments/1.json`, using Pew’s 2020 population estimates (published 2025). The 20% threshold is a matching policy, not a scientific boundary or an official-state-religion classification. The aggregate “other religions” category does not qualify a specific faith. Previous 240-answer archives remain unchanged; incompatible bank versions never match. Hindu nationalism has the Right tag and Narendra Modi as its selected representative (a manual reference, distinct from a numerical closest match).

## Democracy–Autocracy wording revision (5–6 October 2026)

The owner requested a representative-democracy reference around 65% Democracy,
with stronger direct participation and public control further towards that pole.
Axes 2.0.0 therefore describes this axis as “Public participation and accountable
government versus concentrated decision-making power.” This is a broader,
owner-defined construct, not a validated regime index or a claim that lawful
representative delegation makes a country autocratic. No population remapping,
new weights, nonlinear formula or numerical target is applied to any profile.
Voter ID alone does not determine democratic placement: access, equal eligibility
and practical opportunities to vote remain relevant.

Bank 2.0.0 changes Democracy–Autocracy items 02, 04, 06, 08, 11 and 13. The new
items cover independent specialist decisions, temporary emergency lawmaking
subject to parliamentary rejection, citizen-triggered binding national law votes,
leadership replacement between elections, policy implementation within existing
law, and legally limited parliamentary emergency election postponement. Universal
suffrage, competitive opposition, judicial review, removal for abuse, recall and
unchecked rule remain covered. The original direction splits and inclusion
priorities are preserved for all four lengths. Short and medium sets now include
bounded delegation; the direct-initiative item first appears in long, with repeal
and recall still comprehensive-only. Coverage differences between lengths remain
a limitation. Scoring stays 2.0.0 because its implementation is unchanged.

Every stored profile receives a focused immutable successor: only the six changed
question records are reassessed, with the other 234 preserved verbatim. The six
new responses are conservatively disclosed as educated assumptions using retained
period-specific source dossiers and recorded supplemental primary references.
This is not a fresh verification of every earlier citation or other axis. The
separate review is a distinct same-agent pass; external peer review and empirical
calibration are not claimed. Catalogue exclusions remain in force. See the
[completion report](../profile-audit/reports/democracy-questions-2026-10-05/completion.md)
for revisions, assumption IDs, source limits and actual checks.

Saved bank 1.0.0/axes 1.0.0 results remain supported with their original scores
and versions. They are not recalculated because raw answers were not retained,
and compatible-version matching prevents comparison with the revised profiles.
At that revision, current results used bank 2.0.0/axes 2.0.0. Axis names, the fourteen other definitions
and scores, and the equal-axis comparison method remain unchanged.


## Authority–Liberty revision, 6 October 2026

Owner-authorised bank 3.0.0 revises Authority–Liberty records 01, 02, 03, 04, 07, 08, 11, 12 and 13. Four identical statements move within the axis: criticism of institutions and home-search warrants enter the short set, while personal drug choices and disruptive peaceful assembly remain in longer sets. Their responses follow the identical statement, rather than the old question ID. Five new statements cover bulk communications records from nonsuspects, compulsory identity carrying, movement restrictions without prompt independent challenge, personal searches without individual grounds outside emergencies, and permission to form peaceful civic associations. Metadata is not assumed to be communications content.

The previous wording often measured acceptance of safeguarded crime prevention, threat-specific restrictions and road-safety enforcement. Those choices can coexist with civil liberties. This revision distinguishes broader control, with fair opposing claims and preserved varied coverage. It is not calibrated to preferred placements for American conservatives or any other political group. Support for warrants, policing or national identity-document possession does not by itself answer the revised broader permissions.

The 8–8 comprehensive directions and nested 2–1, 3–2 and 5–4 splits are unchanged. Axes stay 2.0.0 and scoring stays 2.0.0; there are no new weights, cross-axis assumptions or remapping. All 209 existing subjects were recalculated: 105 personalities, 47 countries and 57 ideologies. The 208 focused successor assessments preserve the other 231 answer objects and fourteen scores. A concurrently completed full UK re-audit using this exact bank is retained unchanged, including its separately authorised wider reassessment. Exclusions remain in force.

New exact responses and strengths in the focused assessments are educated assumptions, including retained-wording relocations. Retained subject dossiers, logged retrieval passages and selected supplementary sources provide context; this is not a fresh certification of every earlier citation. Failed or sparse retrievals, historical analogies and jurisdiction differences remain disclosed. Neutral is used for substantive competing commitments, not automatically for uncertainty, and Strongly agree/disagree describe response intensity rather than source confidence. No empirical reliability or population-calibration study has been performed.

Saved bank 1.0.0/axes 1.0.0 , bank 2.0.0/axes 2.0.0 and bank 3.0.0/axes 2.0.0 results retain their original scores through loading, import and export. Current bank 4.0.0 profiles only match compatible results; old scores cannot be recalculated without raw answers. Immutable archives, images and religious evidence supplements are preserved.

The complete profile links, revisions, question counts, assumption IDs, source-access limitations and verification results are in [the reassessment report](../profile-audit/reports/authority-liberty-2026-10-06/completion.md). The standalone [answer review](../frontend/public/profiles/authority-liberty-review.html) exposes the nine revised answers and their citations for every subject.

## Second Authority–Liberty coverage revision

On 6 October 2026 the owner authorised another focused reassessment after the
previous revision made several ordinary democratic politicians appear too
Liberty-focused. Bank 4.0.0 changes records 03, 07, 08, 11, 12 and 15. The previous
bank overrepresented opposition to exceptional or unchecked powers. Opposition
to those powers alone did not adequately distinguish broader personal freedom
from acceptance of routine, legally limited restrictions.

Four new statements concern vaccination conditions for shared spaces during a
serious infectious outbreak, preventive movement restrictions with meaningful
regular court review, temporary searches in a designated serious-threat area,
and restrictions on nonviolent racial or religious hatred incitement. The
existing firearms and home-warrant statements exchange places. Firearm rights
therefore enter every length without acquiring extra comprehensive-quiz weight.
All 16 comprehensive questions retain equal weight within their direction
groups. Direction balance, nested selection, axes 2.0.0 and scoring 2.0.0 remain
unchanged. Support for bounded safety restrictions moves towards Authority; it
does not by itself indicate Autocracy, which is measured separately.

All 209 existing profiles, including excluded records, receive complete focused
revisions. The other 234 answer objects and fourteen other axis scores are
preserved for each subject. The four new exact responses and both relocated
responses are disclosed educated assumptions; retained subject-specific evidence,
periods, counter-evidence and selected supplementary primary sources provide
context. No profile receives a target score, party adjustment or gun-rights
bonus. A pro-firearms position can coexist with support for other state powers.
The review is a distinct same-agent review, not external peer certification or
an empirical calibration study. Source-access and historical-analogy limitations
remain explicit in the answer files and separate review.

The complete batch and per-subject answer links are recorded in
`profile-audit/reports/authority-liberty-policy-2026-10-06/`. Saved versions 1,
2 and 3 retain their recorded scores. Current profile matching requires exact
compatible versions; old results are not silently recalculated.
