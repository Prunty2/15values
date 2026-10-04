# Adding ideologies

Use `$new-ideology <name>` in Codex or `/new-ideology <name>` in Claude Code.
For an existing assessment, use `audit-ideology` with its ID. Follow the
[shared assessment procedure](<../personality assessments/NEW_PROFILE.md>) and
[tool reference](<../personality assessments/README.md>) alongside this guide.
The shared procedure supplies the evidence, scoring, review and archival rules;
this guide explains how they apply to ideologies.

## Define the school of thought

Specify the doctrine or variant, including its historical or regional context.
Use `metadata.period` and `metadata.scope` to establish what the profile represents,
and `researchedAt` for the evidence cut-off. Do not blend incompatible branches
into a single supposedly definitive ideology. Explain the distinction from
similarly named schools before creating another entry.

Assess the ideas the school advocates. Do not equate one adherent's behaviour or
one government's record with the entire doctrine. When a broad school leaves an
axis open, investigate whether the request concerns a specific variant; do not
invent a fixed position merely to fill the questionnaire.

## Research and answer

Use foundational writings, programmes and statements of doctrine, checked against
reliable scholarship. Cross-check at least three independent publishers and record
URLs, publication dates and access dates. Study each of the 15 axes independently,
including disagreements among proponents and evidence against the initial reading.

Complete all 240 questions, with a rationale and source references for each answer.
Separate direct evidence from inference. A neutral response requires support for a
mixed, conditional or neutral position; absence of a doctrinal position is unknown,
not automatic centrism. Keep unsupported answers `null` and leave the profile as
a draft if research cannot resolve them.

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
market. Record the mismatch as unknown unless a source addresses the actual choice.
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
not a substantive certification of its evidence. Do not fill gaps merely to publish.
See `profile-audit/reports/ideologies-2026-10-04-reaudit.json` for findings and checks.
