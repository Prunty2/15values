# Agent Instructions

## Project

This repository is for a political quiz website.

Users will choose a short, medium, or long quiz. Their answers
will inform an algorithm that places them on multiple political axes.

Read README.md for the project overview and docs/AXES.md for
the agreed axis names and descriptions.

## Current Stage

The stack has been selected. Dependency installation and documentation
updates have been authorised. Quiz design remains in the definition
stage; application and quiz implementation have not been authorised yet.

Do not scaffold an application, install dependencies, implement
the quiz, or start services unless the owner requests that work.

When asked to draft documentation for review, show the proposed
contents before creating or modifying the files.

Later explicit requests can authorise implementation work.

## Agreed Requirements

- Offer three quiz lengths: short, medium, and long.
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
- Offer opt-in result history using localStorage, with deletion and JSON
  export/import. Save the completion date, quiz length, 15 axis scores,
  and question-bank and scoring versions. Raw-answer retention is undecided.
- Handle unavailable storage and invalid saved/imported data gracefully.
- Focus current planning on the axes and quiz design.
  The political compass presentation is deferred.

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
