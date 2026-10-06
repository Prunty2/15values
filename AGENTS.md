# Agent Instructions

## Project

This repository is for a political quiz website.

Users will choose a short, medium, long, or comprehensive quiz. Their answers
will inform an algorithm that places them on multiple political axes.

Read README.md for the project overview and docs/AXES.md for
the agreed axis names and descriptions.

## Current Stage

The stack has been selected. The owner has authorised the frontend
platform, which is implemented in `frontend/`. It includes the home,
Ideologies, Personalities, and Countries pages,
with Values linking to the home page’s 15 axes section,
plus a functioning quiz and results flow. Ideologies, Personalities, and Countries
must remain unpopulated unless the owner requests content for them.
The owner has authorised Social democracy, Andy Burnham, and Switzerland
as homepage comparison placeholders only; these do not populate the catalogue pages
or constitute researched profiles or calculated matches.

The owner has authorised the quiz flow, five-point agreement responses,
scoring assessment and results interface. All four lengths are implemented
using the existing 240-question bank, preserving its wording and recorded
agreement directions. Some source question files remain drafts. The current
direction-balanced scoring and known measurement concerns are in docs/SCORING.md.
Results show the 15 axes, the closest compatible ideology’s supplied perspective statement, and automatically saved local history. The sentence will be a broad statement supplied by the matched ideology profile, not generated from axis scores. The results comparison card calculates closest ideology comparisons across 15 equally weighted axes, retaining ties and displaying percentage similarity; automatic personality and country matches use the same equal-axis distance, compatible-version filtering and tie retention. Scoring version 2 gives each agreement-direction group half the axis weight and equal question weights within groups; version 1 saved results retain their original scores.

Frontend development and services needed to verify it are authorised.
Do not introduce dependencies outside the selected stack or populate
comparison catalogues unless the owner requests that work.

When asked to draft documentation for review, show the proposed
contents before creating or modifying the files.

The owner has authorised the profile contribution infrastructure: sourced audits,
validation, immutable revisions, generated catalogue browsing and Codex/Claude Code
skills. Use CONTRIBUTING.md and docs/personality assessments/NEW_PROFILE.md for additions or
re-audits. Profile assessments must answer all 240 questions. Research first, then choose
the most likely agreement response for any remaining evidence gap. Record an
educated assumption as `inferred`, begin its rationale with `Educated assumption:`,
cite the contextual sources actually used, explain the choice and uncertainty,
and flag the question in chat and the separate review. Do not leave null/unknown
answers in a completed assessment or use Neutral automatically for uncertainty.
Do not present assumptions as documented positions. Apply this rule equally to
countries, ideologies and personalities; preserve historical archives and reviews.

The catalogue contents still require a request for the named subjects.
The owner has authorised closest-ideology comparisons for personality and country
profiles using equally weighted scores across all 15 axes; see docs/SCORING.md.
The owner has authorised quiz-result ideology comparisons using the same equal-axis distance and compatible-version rules. Quiz-result personality and country matching are authorised; compass presentation remains deferred.

Later explicit requests can authorise implementation work.

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

## Agreed Requirements

- Offer four quiz lengths: short (45 questions), medium (recommended,
  75 questions), long (135 questions), and comprehensive (240 questions).
- Use a bank of 240 original questions, with 16 per axis. Select fixed,
  nested sets by inclusion priority: the first 3, 5, 9, or all 16 questions
  per axis respectively. Do not randomly select questions. Inclusion
  priority does not determine scoring weight.
- Balance agreement directions within each axis: agreement with 8 of its
  16 questions must support each pole. For the fixed shorter sets, use
  the closest possible splits: 2–1, 3–2, and 5–4 for 3, 5, and 9 questions.
  Record each question's agreement direction. Balance refers to the
  position supported by agreement, not whether the sentence contains a
  negative. Preserve varied coverage rather than filling the bank with
  duplicate statements and their negations.
- Ask a wide variety of political questions.
- Measure the user on all 15 agreed axes.
- Include Culture vs Nature as a core axis.
- Use Innovation vs Caution for the combined technology,
  development, and preservation axis.
- Keep axis names simple and understandable.
- Use React, TypeScript, and Vite, with CSS Modules and shared CSS variables.
- Keep questions and axis definitions in versioned repository JSON when
  implemented; docs/AXES.md remains the current agreed axis reference.
- Run scoring as pure TypeScript functions in the browser.
- Use Vitest for scoring and Playwright for quiz-flow verification.
- Host the static application on GitHub Pages.
- Do not add a database, account system, or backend API.
- Automatically save completed result history using localStorage, with deletion and JSON
  export/import. Save the completion date, quiz length, 15 axis scores,
  and question-bank and scoring versions. Raw-answer retention is undecided.
- Handle unavailable storage and invalid saved/imported data gracefully.
- Keep results descriptive and preserve the documented axis definitions.
  Quiz-result personality and country matching are authorised; the political compass presentation remains deferred.

Do not rename, remove, merge, or add axes without the owner's
agreement.

## Impartiality and Measurement Accuracy

This project must be fully politically impartial. Its purpose
is to give users a truly accurate reading of their political
positions, not to persuade them or move them towards any
political leaning.

This requirement applies to question wording, answer choices,
axis descriptions, scoring, question selection, results,
visual design, and recommendations.

Agents must:

- Avoid explicit and subtle political biases.
- Never favour an ideology, party, or political position.
- Avoid loaded language, unequal scrutiny, selective examples,
  and assumptions that make one position appear more reasonable
  or respectable than another.
- Give opposing positions equally fair and understandable treatment.
- Never reward or penalise answers because an agent or the owner
  agrees or disagrees with them.
- Never adjust scoring to produce a preferred political outcome.
- Present results descriptively, without praise, blame, or
  suggestions that users should change their beliefs.
- Review proposed questions and scoring for unintended bias,
  including bias introduced through framing or omitted perspectives.
- Make scoring decisions explainable and document their rationale.

Accuracy takes priority over ideological preferences, engagement,
and producing a particular distribution of results.

Measure each axis on its own evidence. Do not assume that a
position on one axis determines a position on another.

Distinguish personal religious belief from support for religion's
role in government.

Culture vs Nature concerns beliefs about the causes of human
traits and behaviour, not environmental policy.

Do not invent question counts, scoring rules, weights, or a
technology stack and present them as agreed requirements.

## Working Practices

- Preserve unrelated files and changes.
- Keep changes within the scope of the owner's request.
- Check the existing repository before choosing implementation tools.
- Verify changes appropriately and report what was actually checked.
- Update project documentation when an authorised change alters
  an agreed requirement.

The owner has authorised manual quiz-result comparisons with ideology and personality
profiles through a searchable, scrollable picker. Compare the unchanged scores on all
15 axes using equal weights and compatible versions; retain the documented evidence
limitations. Automatic personality and country matches are available in the results comparison card; manual country comparison remains deferred.

Manual comparisons add numbered profile dots to the existing axis graphics with a
removable legend, rather than a separate results section. Results use their closest
ideology’s catalogue colour and show similarity as 100 minus equal-axis average gap.

The owner clarified Democracy vs Autocracy on 5 October 2026: representative
democracy is an interpretive reference around 65% Democracy, with stronger direct
public control and participation further towards Democracy. The broader axis
description and six revised questions are versioned in axes/bank 2.0.0; this is
not a fixed score for a regime or empirical population calibration. Voter ID alone
is not evidence of autocracy. Keep scoring 2.0.0 unchanged, preserve older saved
results and immutable archives, and assess changed questions from subject-specific
evidence rather than tuning scores. The owner authorised focused reassessment of
all existing profiles, preserving answers to unchanged questions.

The owner has authorised one additional, required, unscored religious-identity question at the end of every quiz, including no religion and prefer not to say. Faith-specific ideology eligibility requires the corresponding identity; general ideologies remain available to everyone. Apply this eligibility rule to personality-to-ideology and religious-ideology-to-personality comparisons using sourced, period-specific answers for every personality and ideology. Countries always remain eligible for general ideologies; faith-specific comparisons require a sourced country population share of at least 20% for that faith, in both directions. Multiple faiths may qualify; missing evidence excludes faith-specific matches. Preserve the existing 240 scored answers and immutable profile revisions, storing the additional answers in a separate versioned evidence supplement. Hindu nationalism has the Right tag and Modi as an explicitly selected representative.

The owner authorised the first Authority–Liberty revision on 6 October 2026: historical question bank 3.0.0 revises nine records (01–04, 07–08, 11–13), including four literal statement relocations and five broader-control mechanisms. Keep axes/scoring 2.0.0, historical banks and results unchanged, and assess the changed statements from subject-specific evidence without preferred placement targets. See docs/SCORING.md and the focused reassessment report.

The owner authorised a second Authority–Liberty revision on 6 October 2026:
current bank 4.0.0 revises records 03, 07, 08, 11, 12 and 15. Firearms and
home-warrant statements exchange places, and four new statements measure
bounded health, preventive-security, policing and nonviolent incitement
restrictions. Ordinary free-society restrictions must be distinguished from
broader personal freedom without equating Authority with Autocracy. Keep axes
and scoring 2.0.0, all historical banks/results and immutable archives unchanged.
Reassess all existing subjects from their own evidence, preserving the other
234 answers and fourteen axes; do not set preferred politician scores.
