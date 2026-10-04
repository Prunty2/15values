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
Results show the 15 axes, an ideology-sentence placeholder, and automatically saved local history. The sentence will be a broad statement supplied by the matched ideology profile, not generated from axis scores. The results comparison card uses placeholders; calculated comparisons remain deferred. Scoring version 2 gives each agreement-direction group half the axis weight and equal question weights within groups; version 1 saved results retain their original scores.

Frontend development and services needed to verify it are authorised.
Do not introduce dependencies outside the selected stack or populate
comparison catalogues unless the owner requests that work.

When asked to draft documentation for review, show the proposed
contents before creating or modifying the files.

The owner has authorised the profile contribution infrastructure: sourced audits,
validation, immutable revisions, generated catalogue browsing and Codex/Claude Code
skills. Use CONTRIBUTING.md and docs/personality assessments/NEW_PROFILE.md for additions or
re-audits. The catalogue contents still require a request for the named subjects;
user matching and compass presentation remain deferred.

Later explicit requests can authorise implementation work.

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
  User-to-profile matching and the political compass presentation are deferred.

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
