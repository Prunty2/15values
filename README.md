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

There will be no database, account system, or backend API. 

The browser will calculate results locally.

## Saved Result History

Users will be able to opt in to saving completed quiz results and see
their history when they return using the same browser and site address.

History will be stored locally, not uploaded to a server. Clearing site data
removes it; private browsing generally removes it when the private
session ends. Changing the site's origin also changes which storage
is accessible.

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

## Documentation

- AGENTS.md: instructions for agents working in this repository.
- docs/AXES.md: agreed political axes and their meanings.
