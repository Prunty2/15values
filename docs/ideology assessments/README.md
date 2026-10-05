# Adding ideologies

Use `$new-ideology <name>` in Codex or `/new-ideology <name>` in Claude Code.
For an existing assessment, use `audit-ideology` with its ID. Follow the
[shared assessment procedure](<../personality assessments/NEW_PROFILE.md>) and
[tool reference](<../personality assessments/README.md>) alongside this guide.
The shared procedure supplies the evidence, scoring, review and archival rules;
this guide explains how they apply to ideologies.

## Completion requirement

Complete the authorised profiles through the full local workflow under the shared
procedure's completion requirement. Do not stop at a readiness report, partial
draft or remaining evidence gaps: resolve them with disclosed most-likely educated
assumptions, then review, validate, archive, generate and verify. Do not ask again
for permission already given. Report permanent answer-file links and 240/240 counts.
Report genuine technical blockers accurately while continuing other authorised work.

## Define the school of thought

Specify the doctrine or variant, including its historical or regional context.
Use `metadata.period` and `metadata.scope` to establish what the profile represents,
and `researchedAt` for the evidence cut-off. Do not blend incompatible branches
into a single supposedly definitive ideology. Explain the distinction from
similarly named schools before creating another entry.

Assess the ideas the school advocates. Do not equate one adherent's behaviour or
one government's record with the entire doctrine. When a broad school leaves an
axis open, investigate whether the request concerns a specific variant; do not
present an inferred position as established doctrine. If research leaves the
exact claim open, select the most likely answer and label the educated assumption.

## Research and answer

Use foundational writings, programmes and statements of doctrine, checked against
reliable scholarship. Cross-check at least three independent publishers and record
URLs, publication dates and access dates. Study each of the 15 axes independently,
including disagreements among proponents and evidence against the initial reading.

Complete all 240 questions, with a rationale and source references for each answer.
Separate direct evidence from inference and educated assumptions. Research first,
then select the most likely response for every remaining gap under the shared
procedure. Use `inferred` and an `Educated assumption:` rationale with contextual
citations, the reason for the choice and the evidence limitation. Flag the question
in chat and review. Neutral requires a most-likely mixed, conditional or neutral
interpretation; absence of a stated doctrine does not imply centrism. Completed
assessments must contain all 240 answers, with no `null` or `unknown` values.

Answer the current question wording under the agreed axis definitions. Do not
reinterpret a question to rescue an expected score, import 12Axes placements,
copy another ideology's answers, or add archetypes or special weights. Personal
religious belief does not by itself establish a doctrine's position on religion
in government; traditionalism does not determine Culture vs Nature.

## Metadata and ideology sentence

Fill in `name`, `description`, `category`, `period`, `scope` and `phrase`, plus the
common audit fields created by `init`. Category is descriptive and does not affect
scoring. Representative country and personality links are not required: the three
catalogues can grow independently. Do not add country-only or personality-only fields.

Write `phrase` as a broad, substantive statement of the society the ideology
advocates. Use its actual principles and institutions, expressed fairly and without
praise or ridicule. Explain the vision in plain language rather than concatenating
axis labels. The sentence must be distinct from other published ideology sentences
and consistent with the researched description and answers. Review any apparent
contradiction against the evidence; never change scores just to fit the sentence.
User matching remains deferred, but the sentence is displayed on the ideology page.

## Optional image and footer credit

An ideology image is optional. If one is included, find a relevant image on
**Wikimedia Commons**, verify the File description page and reuse terms, and follow
the existing Andy Burnham sourcing and credit example. Avoid implying that one
party symbol represents a broader doctrine unless the profile's scope supports it.

Save a local PNG, JPEG or WebP at or below 1 MB under
`frontend/public/profiles/images/`. Record alt text, creator, Commons File page,
licence and licence URL in `metadata.image`. Add the reference to the **Image
credits** page linked in the footer (`#/credits`, `Credits()` in
`frontend/src/App.tsx`), including the image title and any modification notes.
Metadata alone does not update that list. Preserve old images and required credits,
avoid duplicate references, and verify the footer link, source links and rendering.

## Run the workflow

Run these commands from `frontend/`, replacing `<id>` with the chosen slug:

```sh
npm run profiles -- status
npm run profiles -- init ideology <id>
npm run profiles -- prompt ideology <id>
```

Complete `profile-audit/drafts/ideology/<id>.json`, including the sentence and a
separate evidence review, then run:

```sh
npm run profiles -- validate ideology <id>
npm run profiles -- archive ideology <id>
npm run profiles -- build
```

Read every warning and the calculated neighbours. Similarity of at least 95%
requires an evidence-based review decision against the named neighbour revision.
Distinct doctrines may share measured positions; never tune answers to avoid the
threshold. Re-audits append revisions and preserve the earlier assessments.

Run the [contribution checks](../../CONTRIBUTING.md), including archive history
against the actual PR base. Inspect `#/ideologies`, search, the detail page,
sentence, all 15 axes, sources and assessment download on desktop and mobile.
Check image and footer credits if an image was included. Report the scope,
evidence, uncertainties, similarity decisions and actual checks. Open a PR when
requested; do not auto-merge or deploy.

## Withdrawing unreliable placements

Check institutional fit before assigning a value. A doctrine that abolishes both
institutions offered by a question does not thereby support the opposite pole or
a neutral midpoint. For example, abolishing a state does not establish competitive
elections, and rejecting government production targets does not establish a free
market. Research the actual choice, then select the most likely response and
explicitly describe any remaining institutional mismatch as an educated assumption.
Likewise, distinguish a national minimum guarantee from exclusive national control,
permission from preference, and a possible influence from a claim about which cause
matters more. Use incumbent acts only when they are relevant to the specified school
and period; do not substitute a government example for an entire doctrine.

A pending re-audit normally leaves the previous published revision visible. When
that revision is known to contain substantive evidence errors, record its exact
catalogue, ID, revision, date and reason in `profile-audit/withdrawals.json`. The
generator preserves its immutable archive and download but emits no active scores.
The catalogue and detail page display a withdrawal warning. A subsequently validated
revision restores placements automatically; the historical withdrawal record remains.

On 4 October 2026 all 25 initial ideology placements were withdrawn. The second
review found unsupported policy extrapolations, neutrality used for missing evidence,
and stateless ideals incorrectly mapped onto state institutions. Revision 2 drafts
retain question-level corrections and unknowns. Structural validation of a file is
not a substantive certification of its evidence. New completions must apply the
most-likely-answer rule and disclose educated assumptions; historical findings and
archives remain unchanged.
See `profile-audit/reports/ideologies-2026-10-04-reaudit.json` for findings and checks.

On 5 October 2026 the owner requested a complete redo and restoration of all 25
profiles. Revision 2 replaces all 6,000 response decisions and restores the local
catalogue placements. Every answer is conservatively labelled `inferred`, with an
`Educated assumption:` rationale and contextual citations. This includes uncertainty
about exact response intensity, modern applications of historical doctrines and
questions whose institutions do not fit stateless ideals. A distinct same-agent
review records every assumed ID and Neutral choice, and evidence-based decisions
retain three fresh pairs above the similarity threshold. External personal review
and empirical measurement validation are not claimed. The original archives,
research dossiers and withdrawal records are preserved. See
`profile-audit/reports/ideology-redo-2026-10-05/review-results.json` and the interactive
`frontend/public/profiles/ideology-review.html` for the complete question review.
