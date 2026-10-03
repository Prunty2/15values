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

1. Choose a quiz length: short, medium, or long.
2. Answer a varied set of political questions.
3. Receive a placement on each of the 15 political axes.

All three quiz lengths should cover every axis. Longer quizzes
should provide more evidence for each placement.

## Political Axes

The agreed names and descriptions are recorded in docs/AXES.md.

There are currently 15 axes.

## Current Status

The technology stack has been selected and its dependencies installed.
Quiz design remains in the definition stage. No application, question
bank, scoring algorithm, or result-history feature has been implemented.

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

There will be no database, account system, or backend API. The browser
will calculate results locally. CSS Modules are supported by Vite;
shared CSS variables and localStorage need no additional dependencies.

The agreed axis definitions currently remain in docs/AXES.md. JSON
definitions will be added during implementation without changing their
meaning. Question counts, scoring rules, and weights are not yet agreed.

## Saved Result History

Users will be able to opt in to saving completed quiz results and see
their history when they return using the same browser and site address.
Each saved result should include its completion date, quiz length,
all 15 axis scores, and question-bank and scoring versions.

History will be stored locally, not uploaded to a server. It will not
automatically sync between browsers or devices. Clearing site data
removes it; private browsing generally removes it when the private
session ends. Changing the site's origin also changes which storage
is accessible.

Provide deletion controls and JSON export/import for backup and transfer.
Validate imported and stored data before use. Storage failures or invalid
history must not prevent users from completing the quiz or viewing a new
result. Raw-answer retention and the detailed storage schema remain open
decisions; saving results does not imply saving every answer.

## Development Dependencies

Use Node.js 22.12+ within the Node 22 release line, Node 24, or Node 26+,
as declared in package.json, with npm. The initial installation was
verified using Node.js 22.23.3 and npm 12.1.0.

Install the locked dependencies with `npm ci`. Commit package-lock.json
alongside package.json to keep installations reproducible.

React and React DOM are runtime dependencies. Development dependencies
include TypeScript, Vite, the Vite React plugin, React/React DOM/Node type
definitions, Vitest, and Playwright Test.

Application entry points, tool configuration, scripts, and test suites
will be added when implementation is requested. No development server
or deployment is configured yet. Playwright browser binaries can be
installed with `npx playwright install` when browser tests are introduced.

## Hosting Plan

Build a static site for GitHub Pages. Configure Vite's base path for
the eventual repository URL or custom domain. Quiz navigation should
use internal state or hash-based routes so refreshing a screen does
not require server-side routing. Deployment setup is still pending.

## Decisions Still Needed

- Number of questions in each quiz length.
- Answer choices and how neutral or uncertain answers work.
- Question selection and ordering.
- Question coverage for each axis.
- Scoring, weighting, and treatment of questions that affect
  more than one axis.
- How results explain uncertainty and mixed positions.
- Results layout and eventual compass presentation.
- Whether raw answers are retained alongside saved results.
- Detailed result-history schema, retention limits, and migration behaviour.

These are open decisions, not permission to implement them.

## Documentation

- AGENTS.md: instructions for agents working in this repository.
- docs/AXES.md: agreed political axes and their meanings.
