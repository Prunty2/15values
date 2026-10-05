# Add or re-audit a profile

Use this process with the repository skills in Codex or Claude Code. Read
[AGENTS.md](../../AGENTS.md), [AXES.md](../AXES.md), [SCORING.md](../SCORING.md)
and the [tool reference](README.md) first. Complete only the requested entries.
Use the same standards of evidence and scrutiny across political positions.

## Establish the subject

Inspect the working tree and run `npm run profiles -- status` from `frontend/`.
Check for an existing entry or unfinished draft before choosing an ID. Preserve
unrelated work; on a shared checkout, do not stage everything. Use a scoped branch
when preparing a contribution. A new subject uses `new-ideology`, `new-country`
or `new-personality`; corrections use the corresponding `audit-*` skill.

Define what the profile covers:

- **Ideology:** a specified school or variant, with its historical or regional
  context. Foundational writings, programmes and serious scholarship should
  establish the doctrine. Do not treat one adherent as the whole ideology.
- **Country:** actual institutions and implemented policy in a named period,
  with a research cut-off. Distinguish the constitution, governing party's
  promises, enforcement and public opinion. This is not a profile of all citizens.
- **Personality:** documented positions and conduct in a named period. Use
  writings, speeches, interviews, voting records and actions; distinguish personal
  positions from party platforms, coalition compromises and changed positions.

Resolve routine metadata through research. Ask only when identity or scope is
materially ambiguous and cannot be established from the request.

## Research before answering

Create the draft with `profiles init <catalogue> <id>`. Research every axis using
specific evidence, including evidence that conflicts with the usual label for the
subject. For living people and contemporary countries, verify current positions
and date the cut-off. Cross-check at least three independent publishers; recycled
reporting is not independent evidence. Prefer primary sources, checked against
reliable contextual research. Record the actual sources read, with dates and URLs.

Write the metadata, sources, and an axis brief describing what the evidence supports.
Record contradictory evidence and how period, scope or changed positions resolve
it. Where none was found, state what was checked; do not invent contradictions.
Use this research as the assessment context, not just a short public biography.

Do not infer religion's role in government from personal faith, immigration policy
from assimilation preferences, or Culture vs Nature from traditionalism. Read each
axis definition independently. Historical analogies to modern questions must be
explicit inferences supported by the subject's ideas; anachronism does not justify
fabricating a position. If the subject has no defensible position, keep it unknown.

## Answer the 240 questions independently

Generate the current prompt with `profiles prompt <catalogue> <id>`; it obtains the
exact questions from the versioned bank. Work through each question under its own
axis definition. Record its answer, basis, rationale and source IDs in the draft.
Answer in the subject's documented perspective, not the agent's or contributor's.
Do not target scores, copy another profile, infer an entire axis from a label,
reinterpret inconvenient wording, add archetypes, or modify the bank during an audit.

When delegation is available and authorised, a separate assessment/review context
can help reduce anchoring. Supply the subject's research and current questions,
not neighbour answers or desired scores. Otherwise perform a distinct review pass
and record it honestly. No specific model vendor, paid API or fixed batch size is
required. Do not launch additional subjects merely to fill a batch.

All five agreement choices are legitimate. Use `0` only for a supported neutral,
mixed or conditional response whose rationale explains why. Use `null` and `unknown`
for missing evidence. If research cannot resolve it, report the gap and leave the
profile as a draft; do not weaken the validator to get it published.

## Prepare display information and review

Write a concise, factual description. For ideologies, write the broad society-level
sentence the ideology actually advocates, in its own terms and without praise or
ridicule. It is supplied by the profile, never assembled from axis percentages.
Representative countries/people are not mandatory links: do not invent examples
to satisfy a mapping. These three catalogues can grow independently.

Find the image on **Wikimedia Commons** (`commons.wikimedia.org`): an authentic
portrait for a personality, or a flag appropriate to the represented period for
a country. Follow the existing Andy Burnham photograph as the sourcing and credit
example. Open the Commons **File description page** to verify the subject, creator
and reuse terms; use that page as `image.sourceUrl`, not a Wikipedia article,
search result or raw thumbnail URL. If no suitable Commons image is available,
report that gap instead of silently substituting another source or a generated image.

Record creator, source and licence with alt text, save the image under
`frontend/public/profiles/images/`, and resize/compress to at most 1 MB using
available image tools. PNG, JPEG and WebP are supported. Never claim a download
or permission that was not verified. Use a new filename for changed images;
preserve old ones. Apply these same requirements to any optional ideology image.

**Add the image reference to the shared Image credits page linked in the footer**
(`#/credits`, implemented by `Credits()` in
`frontend/src/App.tsx`). Follow its existing **Andy Burnham photograph** entry:
include the subject/image title, creator, licence or public-domain status, a link
to the Commons File description page, a licence link where applicable, and notes
on cropping or other modifications. Profile metadata and the detail-page credit
alone do not fulfil this requirement; catalogue generation does not update this
shared list. Reuse an existing credit for the same source image rather than adding
a duplicate, and retain credits for images still used by earlier assessments.

Verify the local image renders, then follow **Image credits** from the footer and
check that the reference appears and its source and licence links are correct.

Perform a separate evidence review, including wording interpretation, agreement
direction, all inferences, counter-evidence and metadata. Record the real reviewer
(including agent/tool identity for an AI review), review date and substantive notes.
Run `profiles validate <catalogue> <id>`. Read every error, warning and neighbour.
For similarity of at least 95%, investigate the evidence and record a reason for
retaining both entries against the named neighbour revision. Correct unsupported
answers when evidence warrants it; never change them solely to reduce similarity.

## Archive, verify and prepare the contribution

Run `profiles archive <catalogue> <id>`, then `profiles build`. The former appends
the reviewed source record; the latter generates the public data. Archive does
not deploy. Never hand-edit generated percentages or overwrite previous archives.
If interrupted after archiving, rerun generation instead of repeating archive.

Run the checks in [CONTRIBUTING.md](../../CONTRIBUTING.md), including history against
the correct PR base. Inspect the actual catalogue index, search, detail page,
15 axis rows, image, credits and downloaded assessment on desktop and mobile.
Use the generated scores in reports; do not estimate them or claim that diagnostic
similarity is a user match. Confirm no unintended catalogue entries were added.

Prepare a narrowly scoped contribution containing the new archive, generated
catalogue/downloads, image and any necessary corrections. When the user requests
a PR, create one with the subject/period, evidence summary, uncertainties,
similarity decisions and actual verification results. Do not auto-merge or deploy.
If the checkout contains unrelated unfinished work, disclose base/dependency issues
instead of including those changes silently. Report drafts and blocked evidence
honestly; validation alone does not certify research accuracy.
