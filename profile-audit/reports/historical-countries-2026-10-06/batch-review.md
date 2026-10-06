# Historical countries: completed local contribution

20 historical country profiles, 240/240 responses each, revision 1. All archives and generated downloads contain the same answers. The country catalogue now contains 67 profiles (47 contemporary and 20 historical), within 265 total profiles.

Question bank 4.0.0; axes and scoring 2.0.0. No bank wording, direction, weight or scoring function changed. Religious-population validation now accepts positive historical census years, enabling Venice’s 1770 evidence; the eligibility threshold is unchanged.

## Permanent answer files

| Country | Period | Answers | Revision | Archive |
|---|---|---:|---:|---|
| Rhodesia | 1965–May 1979 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/rhodesia/1.json) |
| British Empire | 1919–1939 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/british-empire/1.json) |
| Nazi Germany | 1933–1945 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/nazi-germany/1.json) |
| Soviet Union | 1928–1953 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/soviet-union/1.json) |
| Russian Empire | 1906–1914 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/russian-empire/1.json) |
| Republic of Venice | 1718–1797 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/republic-of-venice/1.json) |
| Ottoman Empire | 1839–1876 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/ottoman-empire/1.json) |
| Austria-Hungary | 1867–1914 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/austria-hungary/1.json) |
| German Empire | 1871–1914 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/german-empire/1.json) |
| Japanese Empire | 1931–1945 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/japanese-empire/1.json) |
| Qing China | 1861–1911 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/qing-china/1.json) |
| Dutch Republic | 1650–1702 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/dutch-republic/1.json) |
| First French Empire | 1804–1814 (before abdication) | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/first-french-empire/1.json) |
| Weimar Germany | 1919–January 1933 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/weimar-germany/1.json) |
| Fascist Italy | 1925–1943 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/fascist-italy/1.json) |
| Francoist Spain | 1939–1959 (before the Stabilisation Plan) | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/francoist-spain/1.json) |
| Estado Novo Portugal | 1933–1968 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/estado-novo-portugal/1.json) |
| East Germany | 1971–1989 (before October) | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/east-germany/1.json) |
| Yugoslavia | 1963–1980 | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/yugoslavia/1.json) |
| Czechoslovakia (First Republic) | 1920–1938 (before October) | 240/240 | 1 | [JSON](../../../profile-audit/answers/country/czechoslovakia-first-republic/1.json) |

## Educated assumptions

All 240 bank question IDs are inferred for every profile: each of the 15 axis prefixes with suffixes 01–16. The exact 4,800 subject/question IDs are enumerated in completion.json and separately in every subject-review.md. These are historical translations from institutional practice, including particularly uncertain present-day technology, welfare mechanisms and causal-trait propositions. They are not documented authored responses. Each rationale begins Educated assumption:, supplies contextual source IDs, explains the selected response and states uncertainty. No answer is null or unknown.

British Empire has five Neutral immigration responses; the validator warns about the count. They represent the mixed administrative policies of a dispersed empire and specific mechanisms, not automatic substitutes for missing evidence. Its separate review identifies all five IDs.

The only mandatory close-pair review is British Empire versus Turkey revision 5, at 95.42%. The separate review records their different governing scope and period and shared institutional mechanisms. No responses were changed to reduce similarity, and Turkey’s archive was preserved.

## Research and images

Sources include historical primary laws/constitutions, institutional histories and specialist scholarship, with Wikipedia secondary context. Each profile has three distinct publishing organisations, access dates, 15 subject-specific briefs and counter-evidence. Paywalled material was used only to the extent of available abstracts/indexed passages. Some direct downloads failed due to TLS restrictions, access restrictions or PDF extraction; retrieval.json records these rather than claiming success. Browser access recovered institutional pages and Soviet constitutional text; Oxford scholarly chapters remained abstract-only. No unseen whole publication was claimed as read. Temporary full-text caches were removed.

All 20 flags were verified from Commons File pages, rasterised locally below 1 MB, visually inspected and added to the shared footer credits. Austria-Hungary uses an explicitly described merchant ensign, not an invented common national flag. Some flags represent part of the assessed period; the relevant dated variant appears in its source/alt description.

Religious-population supplement revision 2 preserves revision 1 and all contemporary entries. Five historical profiles have sourced within-period numerical Christian shares. The other fifteen have explicitly unestablished shares, remaining eligible for general ideologies and excluded from faith-specific matches under the existing missing-evidence rule. A religion-review.md documents the limits.

## Actual verification

- All 20 profile validations and archives passed. Generated audits match permanent answer JSON.
- Catalogue build/check passed: 265 profiles with placements, 0 withdrawn; 67 countries.
- Question-bank check passed: 240 questions across 15 axes.
- Production TypeScript/Vite build passed, with the bundle-size warning retained.
- Unit tests: 540 passed across 12 files.
- Archive/image history check passed against 43c449fd347ca0b38978e0710c1aff6e738d9564. The system Git initially failed on the Xcode licence; the bundled Git completed this check and the unit Git-lifecycle test.
- Individual browser checks passed for all 20 new headings, loaded flags and revision-1 downloadable 240-answer assessments; browser-check.log records the results. Rhodesia search and 390px mobile overflow checks passed. Credit references and desktop/mobile screenshots were checked.
- Focused existing catalogue/current-audit/religion browser checks: 7 passed, 2 intentionally skipped, 0 failed across desktop, mobile and Safari.
- Full existing browser suite: 203 passed, 2 skipped, 17 failed. This is not a fully passing browser suite. Three personality-card failures expect Head of government but receive Dictator from the fixture classification. Fourteen other failures concern quiz completion/navigation/storage assertions and long timeouts. Their cause was not resolved in this country-content contribution; no claim is made that they passed or were proven pre-existing.

The initial catalogue build was attempted before all archives existed and failed on an as-yet-unarchived country religion entry; after every archive existed, generation passed. The first unit run used the system Git and failed its lifecycle test; with bundled Git, all 540 passed. The initial CLI browser launch lacked system Chrome; the installed Chromium runtime completed the browser checks. A credit-check locator initially omitted the word flag; the correct heading locators passed.

The task remains a local contribution; no PR, merge or deployment was performed.
