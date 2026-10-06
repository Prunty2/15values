# Five historical ideology accuracy corrections

The owner authorised fixes for the First French Empire, Japanese Empire, Dutch
Republic, East Germany and Yugoslavia. Three doctrine profiles were missing;
Marxism–Leninism and Titoism already existed. No country or existing ideology
answer archive was rewritten, and no score, axis weight or quiz question was tuned.

| State | Historical comparison | Similarity | Actual numerical nearest after additions |
| --- | --- | --- | --- |
| First French Empire | Bonapartism | 94.3% | Bonapartism |
| Japanese Empire | Japanese Imperial Ultranationalism | 93.8% | Nazism |
| Dutch Republic | Dutch Commercial Republicanism | 91.7% | Dutch Commercial Republicanism |
| East Germany | Marxism–Leninism | 84.4% | Maoism |
| Yugoslavia | Titoism | 83.3% | Cuban Socialism |

The three persistent numerical neighbours demonstrate the limit of treating a
15-axis distance as historical identity. The five visible country comparisons
therefore select a doctrine from sourced period evidence, bind both assessment
revisions, and calculate similarity with the unchanged equal-axis function.
Headers explicitly label this **Historical ideology**, explain evidence selection,
and do not claim it is necessarily the nearest score. Cards, filters and search
use the same reviewed doctrine. All other countries retain numerical comparisons.
Automatic quiz matching and `closestIdeology` continue to use the normal matching
rules; these historical references are not injected into that calculation.

Country-classification supplement revision 2 preserves all previous entries and
adds five references. Stale, incompatible, unavailable or ineligible references
fail generation and catalogue parsing. Tests cover period/revision binding,
missing doctrine, bank incompatibility, religious and defining-position eligibility,
computed similarity and preservation of numerical matching. Religion supplement
revision 7 adds the three new general political prerequisites. East Germany's
selection supplement adds inferred `matching-ownership` and `matching-party`
answers; later concurrent supplement revision 3 retains these entries.

## Assessments and evidence review

Bonapartism, Japanese Imperial Ultranationalism and Dutch Commercial Republicanism
each have revision 1, 240/240 numeric answers, 15 independent axis briefs,
counter-evidence and a distinct same-agent review. All 240 IDs per new profile
are marked `inferred`: each current-bank axis slug with suffixes `01`–`16`.
The exact 720 IDs appear in the three profile-specific `*-review.json` files.
None is presented as an actual historical answer to the modern quiz. Neutral
choices record specified competing commitments; neutral-density warnings were
reviewed and retained transparently. The new religious-identity prerequisite
answers and East Germany's two defining-position answers are also inferred.

The Bonapartism profile is explicitly its early Napoleonic foundation, not a
projection of Napoleon III's later programme. Sources include the French National
Assembly, Fondation Napoléon, Princeton's plebiscite analysis and Larousse's
doctrinal history. The named movement developed after 1815.

The Japanese profile concerns official 1937–1945 kokutai and mobilisation within
the country's wider 1931–1945 period. Columbia's primary-text translation,
JACAR's official-document exhibition and Grew's 1 November 1938 report establish
the distinction from German Nazism. Private ownership is distinguished from
economic control, and sacred ancestry from claims about every psychological
trait. It remains 95.96% similar to Fascism revision 6; the archived review
explains why both distinct traditions are retained without changing answers.

The Dutch profile concerns the commercial/regent strand of 1650–1672 within the
country's broader 1650–1702 period. De la Court's DBNL text, Secrétan's Stanford
scholarship and Klerk's Erasmus-hosted scholarly abstract supply three independent
publishers. Klerk qualifies categorical anti-monarchism; the critique is of
predatory princely warfare and military concentration. Provincial liberty is
not universal democratic suffrage, and colonial company practice does not
automatically express the anti-monopoly doctrine.

The GDR reference uses the bpb account of the SED's Marxist–Leninist doctrine.
The Yugoslav reference uses the 1963 Constitution's social ownership,
self-management and League of Communists provisions. Both existing doctrine
archives remain unchanged; constitutional doctrine is not equated with all
implemented practice. Full re-audits of these five country scores are not claimed.

## Verification

- Three additions validated, reviewed, archived and generated successfully.
- Catalogue generation/check and production build passed; the existing bundle-size
  advisory remains.
- All 570 unit tests passed across 16 files. The first system-Git run failed on
  the host's Xcode licence prompt; the bundled Git rerun passed.
- Question-bank check passed: 240 questions across 15 axes.
- Immutable history check passed against `43c449fd347ca0b38978e0710c1aff6e738d9564`.
- SHA-256 checks confirm the five original country answer files are unchanged;
  generated doctrine downloads exactly match their permanent archives.
- Existing focused browser suites: 4 passed and 2 intentionally skipped.
- Browser checks passed at 1440px and 390px for all five country headers/cards,
  the three new ideology pages, all comparison links, calculated similarity,
  15 axis graphics, period-flag decoding, 240-answer downloads, search and lack
  of horizontal overflow. French mobile and Japanese desktop headers were
  visually inspected.
- No full browser-suite rerun, deployment or PR was performed. Earlier unrelated
  full-suite failures are not claimed resolved.

`completion.json` records the permanent answer paths, revisions, counts,
assumption IDs, calculated matches and hashes. Historical analogies and response
intensity remain uncertain; structural checks do not empirically validate the quiz.
