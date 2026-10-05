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
catalogue contains 53 requested profiles, each scoped to a specified tradition.
The original 25 profiles' revision 1 placements were withdrawn after the 4 October 2026 evidence
re-audit found unsupported policy inferences and false neutral answers. On 5 October,
the owner requested a complete redo and restoration. All 25 revision 2 assessments
now contain 240 fresh responses each (6,000 total), and catalogue generation restores
their placements. Every response is conservatively labelled as an inferred assessment
with an educated-assumption rationale, contextual citations and evidence limits.
A distinct same-agent review records neutral choices, institutional mismatches and
three close-profile pairs; external personal review remains pending. The
[interactive ideology review](frontend/public/profiles/ideology-review.html) links to
each permanent full assessment. See the
[separate review](profile-audit/reports/ideology-redo-2026-10-05/review-results.json)
for all assumption IDs and similarity decisions. Original archives and withdrawal
records remain unchanged.
On 5 October 2026, a further owner-requested batch added 30 revision 1 profiles
with 240 answers each. Marxism's existing revision 2 was retained and the duplicate
Zionism request was consolidated. The existing Civic Nationalism catalogue exclusion
remains in effect. Christian Accelerationism uses the owner's supplied definition;
Peter Thiel is contextual evidence, not an exact representative of that variant.
All 7,200 new responses are disclosed educated assumptions. Separate same-agent
reviews, source-access limitations, neutral-choice reasoning and similarity decisions
are recorded in [the expansion reports](profile-audit/reports/ideology-expansion-2026-10-05/).
The Personalities catalogue contains 35 requested public figures with defined
periods and credited portraits. Their earlier placements were withdrawn after
the 4 October 2026 evidence review. On 5 October, the owner requested best-effort
completion of every question, using broader evidence where direct answers were
unavailable. New revisions provide all 8,400 responses and restore placements;
formerly unresolved responses are explicitly labelled provisional educated
assumptions. These are estimates awaiting the owner's personal review, not a
claim that all evidence gaps have been resolved. A distinct same-agent review
and structural validation are recorded honestly. Original archives and portraits
remain unchanged. The [interactive answer review](frontend/public/profiles/personality-review.html)
shows every question, answer, rationale and contextual source. See the
[completion review](profile-audit/reports/personality-completion-2026-10-05/review-results.json)
for assumed question IDs, corrections and similarity decisions. The Countries catalogue now contains all 47 requested country profiles, each with 240 answered questions, a credited flag and an immutable assessment revision. The [country completion report](profile-audit/reports/country-completion-2026-10-05/completion.md) lists permanent answer files, revisions, all educated-assumption IDs and actual verification. These are sourced institutional assessments with disclosed estimates, not a claim that every response is a documented position; distinct same-agent reviews are recorded.

The quiz flow is implemented for all four formats, with five responses from
Strongly agree to Strongly disagree, including Neutral. It scores all 15 axes
in the browser and automatically saves local result history with deletion and JSON
export/import. The results page shows the closest compatible catalogue ideology (including ties), its supplied perspective statement and its percentage similarity across 15 equally weighted axes, with the ideology’s catalogue colour used for the results theme. A Compare button opens a searchable, scrollable ideology and personality picker with keyboard suggestions. Chosen profiles add numbered dots to the existing axis graphics and a removable legend. Automatic personality and country matches remain placeholders. Scoring version 2 balances agreement-direction groups to remove the extra-statement tilt in shorter formats; original saved scores are preserved under their original scoring version.

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
owner request. The first 25 ideology assessments and the earlier 35 personality
assessments failed substantive re-audit despite passing structural validation.
Historical unreliable revisions retain revision-specific withdrawal records; missing
evidence must now be resolved to the most likely response, with educated
assumptions explicitly labelled, cited and reviewed; it is not automatically
Neutral. This owner-authorised rule of 5 October 2026 applies to future completions
and does not retrospectively certify old assessments. See
[CONTRIBUTING.md](CONTRIBUTING.md) for skill invocations and
[assessment tool reference](<docs/personality assessments/README.md>) for commands and the adapted
12Axes method. Personality and country profile pages now show their closest catalogue ideology using equal-weight mean absolute distance across all 15 axes, retaining ties and displaying the average score gap. Matches are regenerated with the catalogue; see docs/SCORING.md. Quiz results now compare with compatible ideology profiles; manual personality comparison is available; automatic personality and country matching remain deferred.

Complete the authorised profiles through the full local workflow under the shared
procedure's completion requirement. Do not stop at a readiness report, partial
draft or remaining evidence gaps: resolve them with disclosed most-likely educated
assumptions, then review, validate, archive, generate and verify. Do not ask again
for permission already given. Report permanent answer-file links and 240/240 counts.
Report genuine technical blockers accurately while continuing other authorised work.

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
the contents of `frontend/dist/` through the publishing workflow described below.

### Automatic publishing

The `Validate and publish website` GitHub Actions workflow validates questions and
profiles and builds the site. Pull requests and pushes to `dev` also run unit tests
and desktop, mobile and Safari browser checks. Deployments from `main` skip the
test suites and browser installation; after validation and the build pass, every
push to `main` publishes to GitHub Pages. Pull requests do not publish.
Local commits publish only after they are pushed to GitHub. The workflow can also
be run manually from the Actions tab on `main`.

One-time setup: in the GitHub repository, open **Settings → Pages** and select
**GitHub Actions** as the build and deployment source. Push the workflow to `main`
or run it manually to publish. The expected site address is
https://prunty2.github.io/15values/; the deployment's environment link confirms
the actual address. The workflow uses the Pages URL for social-preview metadata.
Failed checks prevent publishing and leave the previous website available.

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
- User-to-personality/country comparisons and compass presentation.
- Whether a later version should retain raw answers with explicit consent.
- Migration rules when published question or scoring versions change.

The current direction-balanced method, fixed presentation order, versioned history
schema and implementation limits are documented in `docs/SCORING.md`.

## Documentation

- AGENTS.md: instructions for agents working in this repository.
- docs/AXES.md: agreed political axes and their meanings.
- docs/SCORING.md: assessment of 12Axes, implemented scoring, limitations and history schema.
