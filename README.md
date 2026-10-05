<div align="center">

# 15 Values Quiz

A political quiz that places you across 15 axes.

![React](https://img.shields.io/badge/React-19-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6) ![Vite](https://img.shields.io/badge/Vite-8-646CFF) ![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18) ![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33)

</div>

## Overview

This is a political quiz that describes a person's political views
across 15 axes.

The aim is to capture combinations of beliefs that a single
left-right label can miss, such as traditional social views,
support for free markets, and opposition to foreign intervention, among others.

## User Experience

1. Choose a quiz length: short, medium (recommended), long, or comprehensive (most coverage).
2. Answer a varied set of political questions.
3. Receive a placement on each of the 15 political axes.

All four quiz lengths should cover every axis. Longer quizzes
should provide more evidence for each placement.

## Quiz Modes

The development question bank contains 240 original questions: 16 for each of
the 15 axes. Each axis has a fixed inclusion-priority order, with the
most important questions included in the shorter modes. Selection is
not random; each longer mode includes all questions from the shorter modes.

| Mode | Questions included per axis | Total |
| --- | --- | --- |
| Short | Core 3 | 45 |
| Medium — recommended | Core 3 + 2 | 75 |
| Long | Medium’s 5 + 4 | 135 |
| Comprehensive | All 16 | 240 |

These correspond to questions 1–3, 1–5, 1–9, and 1–16 in each axis's
inclusion-priority list. Inclusion priority does not determine scoring
weight. Questions appear in fixed rounds across the axes, by inclusion priority. Each agreement-direction group supplies half the score on its documented axis, with equal question weights within each group; see docs/SCORING.md.

Each axis's 16 questions must have balanced agreement directions: agreement
with 8 questions supports one pole and agreement with the other 8 supports
the opposing pole. The shorter sets use the closest possible splits:
2–1 for short, 3–2 for medium, and 5–4 for long. Question documentation
records which pole agreement supports. This is a balance of positions,
not a requirement to use negative wording or repeat every statement in
reverse. Questions should retain varied subject coverage.

## Political Axes

The agreed names and descriptions are recorded in docs/AXES.md.

There are currently 15 axes.

## Current Status

The frontend platform is implemented in `frontend/` using the selected
stack. It includes a home page with a brief example result. The Values
navigation link opens the home page’s 15 axes section; there is no separate
Values page.

Ideologies, Personalities, and Countries have dedicated pages. The Ideologies
catalogue contains 25 requested profiles, each scoped to a specified tradition.
Their revision 1 placements were withdrawn after the 4 October 2026 evidence
re-audit found unsupported policy inferences and false neutral answers. Revision 2
drafts record corrections and unresolved questions; they are not validated replacement
scores. Original assessments remain available with a withdrawal warning.
The Personalities catalogue contains 35 requested public figures with defined
periods and credited portraits. All 35 current assessments had their placements
withdrawn after the 4 October 2026 review of all 8,400 question-level answers found
unsupported causal and biomedical inferences. The next-revision drafts retain
supported answers and explicit unknowns; none is a complete validated replacement.
Separate assessment contexts and independent peer reviews record their actual
research boundaries. Original archives and portraits remain unchanged. See the
[personality audit report](profile-audit/reports/personalities-2026-10-04/summary.txt)
for findings, unresolved evidence and verification. Countries remain unpopulated.

The quiz flow is implemented for all four formats, with five responses from
Strongly agree to Strongly disagree, including Neutral. It scores all 15 axes
in the browser and automatically saves local result history with deletion and JSON
export/import. The results page includes an ideology-sentence placeholder and reference-style rows for all 15 axes. Ideology, personality and country comparisons remain explicitly labelled placeholders. Scoring version 2 balances agreement-direction groups to remove the extra-statement tilt in shorter formats; original saved scores are preserved under their original scoring version.

The versioned question bank preserves the existing source documents in
`docs/questions/`, including draft wording. The bank has not been empirically
validated; known measurement concerns and the assessment of 12Axes are recorded
in `docs/SCORING.md`.

## Contributing profiles

Use Codex or Claude Code with the repository's `new-ideology`, `new-country`,
`new-personality` and re-audit skills. Each entry requires independent research,
all 240 sourced answers, review, validation and a permanent assessment archive.
The tools calculate scores with the quiz's existing function, populate catalogue
pages and generate downloadable assessments. New catalogue entries require an
owner request. The first 25 ideology assessments and all 35 current personality
assessments failed substantive re-audit despite passing structural validation.
Their scores are withheld through revision-specific withdrawal records; missing
evidence cannot be replaced with Neutral. See
[CONTRIBUTING.md](CONTRIBUTING.md) for skill invocations and
[assessment tool reference](<docs/personality assessments/README.md>) for commands and the adapted
12Axes method. User-to-profile matching remains deferred.

## Frontend Development

Run commands from `frontend/`:

```sh
cd frontend
npm ci
npm run dev
```

`npm run build` checks generated profile data, type-checks the frontend and creates `frontend/dist/`.
`npm run preview` serves that production build locally.
`npm test` runs scoring and history checks. `npm run questions:check` verifies
that the versioned JSON matches the source question documents.
After building, run `npm run test:e2e` for desktop, mobile and Safari/WebKit browser checks.
Install the Playwright browsers with `npx playwright install chromium webkit`
if it is not already available.

For local-network testing, `npm run serve:lan` builds the app and serves it on
port 5173 on all network interfaces. Open the displayed network address on the
other device. This serves the production build without development hot reloads;
rebuild after code changes. Set `PLAYWRIGHT_BASE_URL` to the network URL to run
browser checks against that running server.

Home format choices start the selected quiz immediately. Advance-on-answer is
on by default and can be turned off. Quiz navigation has no separate loading page.
A direct quiz link with a valid
length opens the first question; refreshing starts a fresh quiz. Individual
answers still remain only in memory.

The static build uses relative assets and hash-based navigation to support
GitHub Pages project subdirectories without server rewrite rules. Publish
the contents of `frontend/dist/` when deployment is authorised; the site
has not been deployed by this implementation.

The versioned axis data is in `frontend/src/data/axes.v1.json`, with names
and descriptions copied from `docs/AXES.md`. The documentation remains the
agreed reference. Clarity City is the main typeface, served locally as a
variable font with its licence included under `frontend/public/fonts/`.
Question numbers use locally hosted Bitcount Ink, with its licence in the
same directory and a single-colour CSS palette.
The landing page displays all 15 agreed axes in a numbered card grid, using the
axis names and descriptions from `docs/political-quiz-axes.pdf` and `docs/AXES.md`.
The About page explains the quiz, impartiality, and privacy approach. The footer includes About, Privacy, Credits,
and Feedback pages. Feedback can be copied or downloaded locally; no public
contact destination has been configured, and messages are not submitted.

The four quiz formats use the agreed question counts above. Completion times remain
undecided. Social sharing includes a 1200×630 PNG and
Open Graph/Twitter metadata. Set `VITE_SITE_URL` to the final public site URL
(including its project subdirectory) when building for deployment, so sharing
metadata uses an absolute image URL. Local previews use a relative image URL.

Entrance and interaction animations respect the browser's reduced-motion
preference.

## Selected Stack

| Part | Selection |
| --- | --- |
| Interface | React |
| Language | TypeScript |
| Build tooling | Vite |
| Styling | CSS Modules and shared CSS variables |
| Questions and axis definitions | Versioned JSON files in the repository |
| Scoring | Pure TypeScript functions running in the browser |
| Verification | Vitest for scoring; Playwright for quiz flows |
| Hosting | GitHub Pages |
| Saved results | Browser localStorage |

There will be no database, account system, or backend API. 

The browser will calculate results locally.

## Saved Result History

Completed results save automatically in localStorage and appear as cards when
users return using the same browser and site address. Individual answers are
not persisted. Cards preview all 15 axes and open the full saved profile;
`#/results?id=<result-id>` also restores that profile after a refresh.
The history view is available at `#/results`; export/import and clear-all are
in its Manage history section, and each card supports deletion. Save failures
are reported without blocking the current result or its export. Unfinished answers remain in the open page only.

History is stored locally, not uploaded to a server. Clearing site data
removes it; private browsing generally removes it when the private
session ends. Changing the site's origin also changes which storage
is accessible.

## Decisions Still Needed

- Review and final approval of draft question wording and priorities.
- Empirical validation of question coverage, response behaviour and scoring.
- A validated way to describe uncertainty beyond question and neutral counts.
- Eventual comparisons and compass presentation.
- Whether a later version should retain raw answers with explicit consent.
- Migration rules when published question or scoring versions change.

The current direction-balanced method, fixed presentation order, versioned history
schema and implementation limits are documented in `docs/SCORING.md`.

## Documentation

- AGENTS.md: instructions for agents working in this repository.
- docs/AXES.md: agreed political axes and their meanings.
- docs/SCORING.md: assessment of 12Axes, implemented scoring, limitations and history schema.
