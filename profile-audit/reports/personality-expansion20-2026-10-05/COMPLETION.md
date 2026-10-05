# Additional 20 personalities: completion and verification

All twenty requested additions are published locally with 240/240 numeric answers, immutable archives, separate evidence reviews, generated catalogue entries and authentic credited portraits. The personality catalogue now contains 80 profiles. All 240 IDs per profile are disclosed as inferred educated assumptions; complete ID lists are in completion.json and the separate reviews.

| Personality | Answers | Final revision | Permanent answers | Separate review |
|---|---:|---:|---|---|
| George Washington | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/george-washington/1.json) | [Review](george-washington-review.md) |
| Thomas Jefferson | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/thomas-jefferson/1.json) | [Review](thomas-jefferson-review.md) |
| Theodore Roosevelt | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/theodore-roosevelt/1.json) | [Review](theodore-roosevelt-review.md) |
| Lyndon B. Johnson | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/lyndon-b-johnson/1.json) | [Review](lyndon-b-johnson-review.md) |
| Jimmy Carter | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/jimmy-carter/1.json) | [Review](jimmy-carter-review.md) |
| George W. Bush | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/george-w-bush/1.json) | [Review](george-w-bush-review.md) |
| Hillary Clinton | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/hillary-clinton/1.json) | [Review](hillary-clinton-review.md) |
| Rishi Sunak | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/rishi-sunak/1.json) | [Review](rishi-sunak-review.md) |
| Keir Starmer | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/keir-starmer/1.json) | [Review](keir-starmer-review.md) |
| Jacinda Ardern | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/jacinda-ardern/1.json) | [Review](jacinda-ardern-review.md) |
| Justin Trudeau | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/justin-trudeau/1.json) | [Review](justin-trudeau-review.md) |
| Indira Gandhi | 240/240 | 2 | [JSON](../../../profile-audit/answers/personality/indira-gandhi/2.json) | [Review](indira-gandhi-review.md) |
| Mikhail Gorbachev | 240/240 | 2 | [JSON](../../../profile-audit/answers/personality/mikhail-gorbachev/2.json) | [Review](mikhail-gorbachev-review.md) |
| Ho Chi Minh | 240/240 | 2 | [JSON](../../../profile-audit/answers/personality/ho-chi-minh/2.json) | [Review](ho-chi-minh-review.md) |
| Salvador Allende | 240/240 | 2 | [JSON](../../../profile-audit/answers/personality/salvador-allende/2.json) | [Review](salvador-allende-review.md) |
| Augusto Pinochet | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/augusto-pinochet/1.json) | [Review](augusto-pinochet-review.md) |
| Jean-Jacques Rousseau | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/jean-jacques-rousseau/1.json) | [Review](jean-jacques-rousseau-review.md) |
| Mikhail Bakunin | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/mikhail-bakunin/1.json) | [Review](mikhail-bakunin-review.md) |
| Recep Tayyip Erdoğan | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/recep-tayyip-erdogan/1.json) | [Review](recep-tayyip-erdogan-review.md) |
| Ruhollah Khomeini | 240/240 | 1 | [JSON](../../../profile-audit/answers/personality/ruhollah-khomeini/1.json) | [Review](ruhollah-khomeini-review.md) |

Revision 1 was preserved when Indira Gandhi, Mikhail Gorbachev, Ho Chi Minh and Salvador Allende received revision 2 after neutral-density review. Four remaining neutral-density warnings were inspected as substantive mixed institutional positions and recorded in the separate reviews. No assumption is presented as a documented personal response.

Verification: npm ci, questions check, all twenty validators, catalogue generation/check, 85 unit tests, production build and whitespace check passed. The forty profile flows at desktop/mobile widths, twenty source/licence credits and a keyboard-triggered byte-identical JSON download passed. Desktop and mobile screenshots were visually inspected.

The final full Playwright run had 164 passed and 7 failed. Six failures are existing homepage leaning-label assertions; one is an ambiguous status locator in the save-retry test while comparison data loads. These checks are not claimed to have passed. The credit filename overflow introduced by this batch was corrected, and all three platform overflow checks passed in the final full run. See e2e-verified.log and verification.json.

All 365 pre-existing archives and profile images remained byte-identical to the starting snapshot. The HEAD history command still reports 24 pre-existing ideology-archive modifications; this batch did not change them. Existing revision-1 additions are retained alongside any revision-2 records. No PR, commit, merge or deployment was performed.
