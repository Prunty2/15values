# 15 Values Quiz

A political quiz that describes your views across 15 axes.

[Try the quiz](https://prunty2.github.io/15values/)

## The quiz

| Length | Political questions |
| --- | ---: |
| Short | 45 |
| Medium — recommended | 75 |
| Long | 135 |
| Comprehensive | 240 |

Every format covers all 15 axes using fixed, nested question sets.
A final, unscored religion question determines eligibility for faith-specific
ideology matches.

Results show your axis scores and closest compatible ideology, personality
and country profiles. You can also compare scores manually with ideologies
and personalities.

Scoring runs in your browser. Completed results save locally, with deletion
and JSON export/import. Political statement answers are not saved.
There are no accounts, database or backend API.
The site automatically follows your system’s light or dark theme.

## Accuracy and limitations

The quiz aims to describe political views impartially. Its question bank
and scoring have not been empirically validated, and some wording remains
draft. Profile assessments include disclosed educated assumptions;
structural validation does not establish their accuracy.

See [the axes](docs/AXES.md) and [scoring and limitations](docs/SCORING.md).

## Development

Built with React, TypeScript, Vite, CSS Modules, Vitest and Playwright.

Run from `frontend/`:

```sh
npm ci
npm run dev
```

## Contributing

New profiles require an owner request, research, all 240 answers,
a separate review, validation and an immutable archive.

See the [contribution guide](CONTRIBUTING.md) and
[profile assessment tools](docs/personality%20assessments/README.md).
