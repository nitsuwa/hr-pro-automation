# QA Execution Evidence Log

This file distinguishes scripts that exist from scripts that have been executed and verified.

## 2026-10-19 — First local Playwright UI Mode run

- **Operator**: OJT QA tester using VS Code / Windows PowerShell
- **Repository**: `nitsuwa/hr-pro-automation`
- **Target**: HR PRO browser app configured by local Playwright settings
- **Suite**: `tests/regression/setup/`, before adding the new `filing-approvals.spec.ts` candidate
- **Result**: **11 passed / 0 failed**, across **3 test files**
- **Evidence**: User-provided Playwright UI Mode screenshot in the project conversation
- **Smoke suite**: User separately reported all tests passed; counts and screenshot not independently reviewed
- **Meaning**: Existing tests' assertions passed at that run. **Not** evidence that all Excel expected outcomes or all 59 scenario groups are covered.

## Pending re-test

- `tests/regression/setup/filing-approvals.spec.ts` was added after this successful run.
- Status: **NOT RUN / NOT VERIFIED**; verify with UI Mode.
- Checks: policy setting persistence + leave approval request instead of direct DTR override.
- Overtime and timekeeping approval flow remain out of scope for this one file.

## Evidence rules

Record every full or focused run here with its date, scenario ID, pass/fail/blocked classification and short defect reproduction steps. Do not count an inspection script that prints console logs without business assertions as a passing regression case.

## 2026-10-19 — Filing & Approvals first run

- **SET-FILING-001**: PASS (checkbox configuration persists).
- **SET-FILING-002**: FAIL — automation fixture/date assumption; selector looked for `Sep 16 Wed`, while the Review screen displayed `Oct 16–31`. The test stopped before the leave submission, so this is **not evidence of an HR PRO functional defect**.
- Evidence: UI Mode screenshot and Playwright accessibility snapshot supplied by tester.
- Fix prepared on QA branch: select an actual editable absence row from the displayed DTR.
- **Retest needed**: run only `SET-FILING-002` after fetching QA branch updates. Examine any subsequent failure independently.

## 2026-10-19 — Filing & Approvals corrected re-run

- **SET-FILING-001**: PASS (3.3s, screenshot).
- **SET-FILING-002**: PASS (5.4s, screenshot) after changing the date locator to use an available editable attendance row.
- Scope note: 2/2 in this *focused run*; the original 11/11 Setup run was separate. End-to-end overtime and timekeeping approval workflows are still incomplete.
- Classification of original SET-FILING-002 failure: test automation hardcoded-date assumption; not a confirmed product defect.

## 2026-10-19 — Catalog and Company Profile focused run

- **SET-LOANS-001**: PASS (3.5s, screenshot).
- **SET-JOBPOS-001**: PASS (4.1s, screenshot).
- **SET-LOCATION-001**: PASS (3.6s, screenshot).
- **SET-COMPANY-001**: PASS (9.5s, screenshot; separate listed green result).
- UI screenshot shows 3/3 (catalog suite selected) and separately green Company profile test.
- Running totals *across separate focused runs*: initial 11 + filing approvals 2 + catalog/company 4 = **17 distinct tests observed passing**. This is **not** an assertion that all 17 passed simultaneously in one full run, nor that 17 complete Excel scenarios are covered.
- Remaining scope: loan duplicate/edit/remove; position/location duplicate/edit/remove; Company profile other required fields/logo; all other missing test groups.

## 2026-10-19 — Department and employee enrollment

- **SET-DEPT-001 (SET_177–181)**: PASS (Playwright UI Mode green check, screenshot provided).
- **SET-ENROLL-001 (SET_263–265)**: PASS (4.9s, UI Mode screenshot).
- **Running observed distinct-pass count: 19 across focused runs**, not one full suite execution.
- Follow-up: capture more detailed modal forms; `setup-dialog-inventory.json` was shared and validated by the user.

## 2026-10-19 — Holiday/Leave/Allowance and employee-user first runs

- **SET-LEAVE-001 / SET_222–226**: **PASS**, UI screenshot (4.8s).
- **SET-HOLIDAY-001 / SET_214–218**: **FAIL (automation)** — `getByLabel('Type')` could not find an existing `combobox "Type"` on the Add Holiday form. Corrected to `getByRole('combobox', { name: 'Type', exact: true })`.
- **SET-ALLOW-001 / SET_244–249**: **FAIL (automation)** — `getByLabel('Tax treatment')` could not find an existing `combobox "Tax treatment"`. Corrected to the appropriate role selector.
- **SET-USER-001 / SET_271–274**: **FAIL (automation)** — the script called `EmployeesPage.openEnrollment()` while still on Settings; the `+ Enroll Employee` button was not present. Corrected to navigate through `EmployeesPage.open()` first.
- **Retest needed** for all three corrected tests; these failures did not reach the business assertions, so none establishes a confirmed HR PRO product defect.
- Across focused runs, the observed distinct passing test count is now **20**, including the new leave creation PASS; the other three do not count yet.

## 2026-10-19 — Corrected Holiday/Allowance/User tests

- **SET-HOLIDAY-001**: PASS (3.8s, Playwright UI screenshot).
- **SET-ALLOW-001**: PASS (4.2s, Playwright UI screenshot).
- **SET-USER-001**: PASS (6.3s, Playwright UI screenshot).
- **SET-LEAVE-001**: Previously PASS; also green (3.5s) in the latest screenshot.
- **Cumulative distinct observed passing tests: 23 across multiple focused runs**. This is not a full-suite run or confirmation of all expected results for the 59 Setup workbook scenarios.
- Previous failed attempts were automation selector/navigation errors, since resolved; not confirmed application defects.

## 2026-10-19 — Duplicate catalog negative tests (first attempt)

- **SET-LOANS-002 / SET_169:** PASS (2.5s, UI Mode screenshot). Duplicate was not saved; visible error feedback is not yet asserted.
- **SET-DEPT-002 / SET_182:** AUTOMATION BLOCKED (46.1s). A *success* `alertdialog` reading `Added "QA Dup Dept ..."` covered the `+ Add Department` button. First record created, second attempt never happened. Fixed helper to dismiss that success dialog; **awaiting retest**.
- **SET-JOBPOS-002 / SET_195:** FAIL — LIKELY PRODUCT DEFECT. After second Add Position and re-opening Job Positions, exactly two rows with the same fresh QA title were present, while expected count was one. Follow-up GitHub issue [#2](https://github.com/nitsuwa/hr-pro-automation/issues/2). Confirm via fresh run; keep assertion failing if duplicate persists.
- **SET-LOCATION-002 / SET_211:** FAIL — LIKELY PRODUCT DEFECT. After second Add Location and re-opening Work Locations, exactly two rows with the same fresh QA name were present, while expected count was one. Follow-up GitHub issue [#3](https://github.com/nitsuwa/hr-pro-automation/issues/3). Confirm via fresh run; keep assertion failing if duplicate persists.
- Evidence: UI screenshots and Playwright text error reports supplied by QA operator.
- **Distinct previously verified passing tests total is now 24** (prior 23 + loan duplicate PASS). This does not mean all workbook scenarios are fully covered.

## 2026-10-19 — Confirmatory retest of duplicate catalogs

- `SET-LOANS-002 / SET_169`: PASS (3.1s), repeated.
- `SET-DEPT-002 / SET_182`: PASS (3.5s), first successful complete run after adding proper success-dialog dismissal.
- `SET-JOBPOS-002 / SET_195`: **FAIL — CONFIRMED PROTOTYPE DEFECT.** Fresh record name `QA Dup Position mvem9ehf` appeared in TWO job position rows after re-opening the Settings section. Same assertion failure in two independent runs. GitHub [#2](https://github.com/nitsuwa/hr-pro-automation/issues/2). Keep failure as QA evidence.
- `SET-LOCATION-002 / SET_211`: **FAIL — CONFIRMED PROTOTYPE DEFECT.** Fresh record name `QA Dup Location mvemihag` appeared in TWO work-location rows after re-opening the Settings section. Same assertion failure in two independent runs. GitHub [#3](https://github.com/nitsuwa/hr-pro-automation/issues/3). Keep failure as QA evidence.
- Evidence: screenshots and Playwright errors supplied by QA operator.
- Total **25 distinct passing tests across focused runs**; 2 confirmed failing checks. This is NOT a single full-suite result or proof of full coverage of 59 Excel scenarios.

## 2026-10-19 — Four catalog edit tests

UI Mode screenshot received: **4 passed** in `tests/regression/setup/catalog-edits.spec.ts`:

- `SET-LOANS-EDIT / SET_170`: PASS (7.5s); QA-created loan source renamed and verified after reopen.
- `SET-DEPT-EDIT / SET_183`: PASS (4.2s); QA-created Department renamed and verified after reopen.
- `SET-JOBPOS-EDIT / SET_196`: PASS (4.4s); QA-created Job Position renamed and verified after reopen.
- `SET-LOCATION-EDIT / SET_212`: PASS (4.2s); QA-created Work Location renamed and verified after reopen.

**Running distinct passing test count across separate UI runs: 29.** Two negative tests remain failing as confirmed prototype defects: SET_195 and SET_211. This total is not a single full suite run or completion of all 59 workbook groups.

## 2026-10-19 — Catalog removals (focused UI Mode run)

Screenshot shows **all four tests green** in `tests/regression/setup/catalog-removals.spec.ts`:
- `SET-LOANS-REMOVE / SET_171`: PASS (6.3s)
- `SET-DEPT-REMOVE / SET_184`: PASS (3.7s)
- `SET-JOBPOS-REMOVE / SET_197`: PASS (3.2s)
- `SET-LOCATION-REMOVE / SET_213`: PASS (green check; duration not visible in screenshot)

Each uses a fresh QA-only record and checks removal after reopening the Setup section.
**Cumulative observed distinct passing tests: 33** across separate focused runs. **Two confirmed prototype defects** remain in duplicate checks SET_195 / SET_211. Do not interpret this as a passing full-suite run or completion of all workbook groups.

## 2026-10-19 — Allowance maintenance and advanced inventory

- `SET-ALLOW-REMOVE / SET_253–255`: **PASS** (5.5s), visible green Playwright UI Mode result. Cancellation preserved the record, confirmed removal deleted it and remained absent after reopen.
- `SET-ALLOW-EDIT / SET_250–252`: **FAIL — automation locator issue** (18.1s). The edit overlay opens and exposes `heading "Edit Allowance"`, `textbox "Allowance name *"`, `button "Save Changes"` directly, but original test wrongly searched for inline row textbox. No product defect established. Corrected selector in QA branch; **RETEST REQUIRED**.
- `SET-IMPORT-TEMPLATE / SET_256–259`: **NOT CONFIRMED** in the screenshots provided; please run/check separately.
- Uploaded `setup-advanced-inventory.json`: Salary Structure blank form exposes `Structure name*`, search rules input and `Add Structure`; Department approvers shows `Save Changes`; employee edit still not captured because inspector remained on Employees list.
- Cumulative distinct passing checks: **34**, across separate focused runs, not a full-suite run. Confirmed negative product findings #2 and #3 remain unchanged.

## 2026-10-19 — Allowance Edit and Import Template retest

Verified from operator-provided Playwright UI Mode screenshot:
- `SET-ALLOW-EDIT / SET_250–252`: PASS (8.9s) after correcting Edit Allowance modal locators.
- `SET-ALLOW-REMOVE / SET_253–255`: PASS again (4.8s), was already counted.
- `SET-IMPORT-TEMPLATE / SET_256–259`: PASS (2.9s); validates downloadable, nonempty spreadsheet/template. This is **not** the actual import/upload validation required by SET_260–262.

**Cumulative distinct tests observed passing in focused UI Mode runs = 36.** Two confirmed failing duplicate-validation tests remain.


## 2026-10-19 — Salary Structure initial run and official import CSV

- `SET-STRUCT-CREATE / SET_230–237`: **FAIL — automation locator issue**. Salary Structure dialog visibly opened with available Basic Salary rule, but test searched for `Basic SalaryBASIC EARNING` without spaces. Corrected regex to match actual accessible name `Basic Salary BASIC EARNING ＋`. **Retest required**.
- `SET-STRUCT-EDIT / SET_238–240`: **FAIL — same automation locator issue** inside shared creation helper, before reaching edit flow. Corrected shared helper; **retest required**. Not an HR PRO defect.
- Official `employee-import-template.csv` uploaded by QA operator. It contains comment lines listing accepted values, **39 header columns** and **no employee records**. Required columns are `Name *`, `Rate *` and `Date of Hiring *`. It documents the approved values for Department/Job Position/Work Location, Salary Type, Pay Schedule and other fields.
- `tests/regression/setup/employee-import.spec.ts` newly added, **NOT RUN**: downloads current app CSV, fills one fictitious QA employee with official column order, uploads, attempts import and verifies the employee record persists. Distinct from `SET-IMPORT-TEMPLATE` (previously PASS).
- **Cumulative observed distinct passing count stays 36; two confirmed duplicate defects remain.**
## 2026-10-19 — Salary Structure retest and Employee CSV import first execution

- `SET-STRUCT-CREATE / SET_230–237`: **PASS (user-reported)** after fixing Basic Salary accessible button whitespace.
- `SET-STRUCT-EDIT / SET_238–240`: **PASS (user-reported)** after the same shared helper correction.
- `SET-IMPORT-001 / SET_260–262`: **FAIL — automation locator issue**. Official CSV upload succeeded: preview showed one QA employee row, status **Ready**, and `1 of 1 row(s) will import`. The UI submit action is `Import 1`, not the test's `Import employees`. Fixed to assert the preview row is Ready and click `Import 1`. **Retest required to confirm employee creation and persistence; no product defect established.**
- **Running distinct observed passing total = 38**, based on previous 36 plus the user's two Salary Structure pass reports; negative product defect issues #2 and #3 remain confirmed. These are separate focused runs, not one green full suite.

## 2026-10-19 — Import completion and salary structure removal (operator-confirmed)

- `SET-IMPORT-001 / SET_260–262`: **PASS (operator-reported)** after updating the wizard action to `Import 1`. The test checks the generated QA employee appears in Employees and remains visible after reloading.
- `SET-STRUCT-REMOVE / SET_241–243`: **PASS (operator-reported)**; deletes only the newly created QA structure and verifies it remains absent after reopening.
- **Cumulative distinct observed passing count = 40** across separate focused runs. Two confirmed product-defect checks `SET_195` and `SET_211` remain failing as designed.
- Evidence for these last two tests is user confirmation in project conversation; separate Playwright screenshot/report for this run was not supplied.
- This total is **not** the number of fully completed Excel scenarios. Workbook-wide mapping and full-suite run are still pending.


## 2026-10-19 — Employee Edit failure and V9 control inspection

- `SET-EMP-EDIT / SET_266–268`: **FAIL — automation locator issue.** Application successfully opened the new QA employee detail page. The accessible textbox is `Full Name *` (space), not `Full Name*`; the button is `Save changes`, not `Save`. Both selectors corrected on QA branch; **awaiting re-run**. No product defect identified.
- `setup-action-controls.json` uploaded by local QA tester: Approver editor renders a custom `listbox` with 12 `option` controls and a toggle `button[aria-haspopup="listbox"]`. Employee list reveals a Delete action after selecting a row. V9 Employee detail inspector also failed solely from the same whitespace locator.
- `SET-DEPT-APPROVER` and `SET-EMP-REMOVE` newly scripted as **NOT RUN**. Both use a fresh QA-only target. Do not count them as passes until confirmed by Playwright UI Mode. Edit/create-linked-user flow remains pending.
- Cumulative distinct passing count **remains 40** across earlier separate runs, plus 2 confirmed duplicate-validation product defects.

## 2026-10-19 — Employee edit/removal and Department Approvers

- `SET-EMP-EDIT / SET_266–268`: **PASS (operator-reported)** after fixing accessible field/button names.
- `SET-EMP-REMOVE / SET_269–270`: **PASS (operator-reported)** for a freshly created QA employee.
- `SET-DEPT-APPROVER / SET_185–189`: **FAIL — automation assertion issue**, not a demonstrated application defect. Clicking an option succeeded and the collapsed picker visibly showed the chosen name. Original test compared the entire expanded option string (name + job position + department) with the collapsed name-only string. Now only the approver name (first line) is asserted, both before saving and after reopening. **Retest needed** for Save/persistence; partial scenario coverage only.
- Observed cumulative distinct passing test count: **42** across separate runs, with 2 confirmed duplicate-validation prototype defects. All 59 Excel groups are not yet fully verified.


## 2026-10-19 — Department Approvers re-run after assertion fix

- `SET-DEPT-APPROVER / SET_185–189`: **PASS (operator-reported)** after changing the test to compare the selected approver name only, not the expanded option's job/department details. The test checks the first approver picker is saved and still populated when reopening the QA-only department.
- Coverage note: **partial** SET_185–189. Other approval categories/second-level approvers and downstream filing results are not yet fully asserted.
- Cumulative **43 distinct tests observed passing** across separate focused runs. Two previously confirmed product defects (`SET_195` and `SET_211`) remain genuine failing regression cases. A full-suite result is still outstanding.


## 2026-10-19 — QA Holiday Removal

- `SET-HOLIDAY-REMOVE / SET_218–221 (partial)`: **PASS (operator-reported)** in Playwright UI Mode. Test created a uniquely named QA holiday, removed only that exact row, and asserted absence after reopening the Holidays section.
- Source workbook caveat: SET_218–221 contains copied Work Location/Position terminology; treat this as verified **Holiday remove behavior** but **not** complete validation of every written workbook step.
- **44 distinct tests have now been observed passing across separate UI runs**, plus 2 confirmed duplicate-validation failures (`SET_195`, `SET_211`). There is no combined clean full-suite result.


## 2026-10-19 — FIRST COMPLETE SETUP SUITE BASELINE (Playwright UI Mode)

- **Command:** `npm run test:ui:setup`; Chromium project, `tests/regression/setup/` (46 tests).
- **Observed:** **46/46 completed: 44 PASS, 2 FAIL**, **0 skipped** shown; **95.7% passing** (44/46). This is the first combined full Setup execution, as distinct from earlier focused runs. Screenshots and full Playwright error/snapshot text supplied by QA operator.
- **PASS:** All other 44 Setup tests, including Company Profile, Contribution Settings, Employee Management, Catalog CRUD (aside from duplicate validation), Department Approvers, Salary Structure tests, and Holiday/Leave/Allowance cases.
- **FAIL — confirmed prototype defect `SET-JOBPOS-002 / SET_195`:** Adding the same freshly generated Job Position twice creates **two persisted table rows** with exact title `QA Dup Position mvetckbh`. After returning to Settings > Job Positions, `toHaveCount(1)` received 2. Issue: https://github.com/nitsuwa/hr-pro-automation/issues/2
- **FAIL — confirmed prototype defect `SET-LOCATION-002 / SET_211`:** Adding the same freshly generated Work Location twice creates **two persisted rows** with exact name `QA Dup Location mvetcwm8`. After returning to Settings > Work Locations, `toHaveCount(1)` received 2. Issue: https://github.com/nitsuwa/hr-pro-automation/issues/3
- **Classification:** These are application duplicate-validation failures, **not broken test locators**. **Keep the failing assertions** until HR PRO itself prevents duplicates and the same negative scenarios pass.
- **Coverage caveat:** 46 automated tests does **not** mean all 59 Excel scenario groups or every expected business result is covered. Workbook has unresolved copied/ambiguous steps and substantial overtime, LILO, contribution arithmetic, payroll segregation/approvals and edit-time user-account workflow gaps.
- **Test-data hygiene:** Each repeat of the two known failing cases creates two uniquely named QA records. Avoid running the entire suite repeatedly until a cleanup strategy is established; test-run browser isolation does not guarantee persistent application test data is removed.


## 2026-10-19 — Next Holiday and Leave validations prepared (NOT RUN)

- Two NEW negative tests in `tests/regression/setup/holiday-leave-duplicates.spec.ts`: `SET-HOLIDAY-DUP / SET_219` and `SET-LEAVE-DUP / SET_227`. Each creates its own uniquely named fictional QA entry and attempts to add it again; then reloads and asserts exactly one remains. **Both await UI Mode execution**; a red result from 2 persisted entries may be a product defect needing reproduction.
- Source workbook for SET_219 and SET_227 has contradictory/copy-pasted wording; QA/business interpretation of duplicate prevention needs owner acceptance. These scripts are candidate negative checks, **not proof of complete Excel acceptance**.
- Read-only UI inspection `tests/infrastructure/setup-holiday-leave-controls.spec.ts`, command `npm run test:ui:holiday-leave-inspect`, writes `qa-artifacts/setup-holiday-leave-controls.json` and will enable safe Holiday Edit / Leave Edit / Leave Remove scripts.
- **Baseline remains 46 executed, 44 PASS, 2 known product-defect FAIL**. New candidates not included in this result; live QA data may persist between runs.


## 2026-10-19 — Holiday / Leave duplicate first execution

- `SET-HOLIDAY-DUP / SET_219`: **PASS**, UI Mode screenshot (11.0s). Duplicate Holiday not persisted.
- `SET-LEAVE-DUP / SET_227`: **FAIL, candidate application defect**. After trying to add identical QA Leave Type twice and revisiting Leave settings, the accessible list showed two buttons/rows with the same label `QA Dup Leave mveuck8j` but different autogenerated codes `QDLM`, `QDL2`. Playwright expected 1, received 2. [GitHub issue #4](https://github.com/nitsuwa/hr-pro-automation/issues/4). Workbook text is copy-pasted/ambiguous; owner must confirm whether unique Leave labels are required. Retest once with a new name if approved; don't weaken assertion without requirements decision.
- `INVENTORY-V10` uploaded as `setup-holiday-leave-controls.json`: Holidays expose Remove but no observed Edit button; Leave Type list and expanded panel provided no plain Save/Edit/Remove action labels. Editor strategy still needs inspection.
- Previous **combined** baseline remains 46 tests (44 PASS, 2 confirmed product-defect FAIL). These two focused tests are additional, and the baseline has **not** been rerun with them.


## 2026-10-19 — Leave editor inspector V11 first attempt

- `INVENTORY-V11`: **FAIL (inspection data dependency, not HR PRO defect)**. In this run, Leave Types listed only seeded SIL, VL, SL, while V11 expected an earlier `QA Leave` entry to remain. The environment did not retain/show the old QA row, so the locator found no element.
- Updated inspector to **open seeded `VL Vacation Leave` read-only**, without filling, saving, or deleting anything, and to capture UI-control metadata. **Retest needed**. Do not assume QA rows persist across independent sessions/runs.
- Earlier `SET-LEAVE-DUP` candidate bug #4 remains based on two same-label entries observed together *within its own test after reload*. The separate later run showing only seeded rows neither resolves nor confirms its uniqueness requirement.


## 2026-10-19 — V11 Leave Type editor inspection received / next tests prepared

- Read-only `setup-leave-editor.json` inspection **SUCCEEDED** using seeded Vacation Leave without modification. Confirmed visible actions `Remove leave type`, `Cancel`, `Save changes`. Form exposed exactly one text input (no accessible label), one numeric input and three checkboxes; no role=dialog.
- Added **NOT RUN** `tests/regression/setup/leave-maintenance.spec.ts`:
  - `SET-LEAVE-EDIT / SET_228`: create unique QA-only Leave Type, rename via verified editor textbox, save and reopen.
  - `SET-LEAVE-REMOVE / SET_229`: create unique QA-only Leave Type, remove via verified action and assert absent after reopening.
- Both require a local Playwright UI Mode run before claiming coverage. The workbook contains copied/ambiguous step text for these IDs.
- Last combined suite baseline: **46 executed, 44 passed, 2 confirmed product-defect failures**. Separate Holiday DUP passed, Leave DUP failed as candidate issue #4; the combined baseline has not been rerun.


## 2026-10-19 — Leave Type Edit/Remove first execution

- `SET-LEAVE-REMOVE / SET_229`: **PASS (operator screenshot)**, 4.4 seconds. A newly created QA Leave Type was removed and stayed absent.
- `SET-LEAVE-EDIT / SET_228`: **FAIL — missed confirmation modal, not a product defect**. The first `Save changes` opened the application dialog `Update QA Edit Leave ...?` with a correct old-to-new label preview; script incorrectly asserted the changed table row *before clicking the dialog's own Save changes*. Updated Playwright to verify and confirm only the intended QA rename, await dialog dismissal, then assert persistence. **Retest pending**.
- Combined full-suite baseline remains **46 tests: 44 passed, 2 confirmed prototype defects**. This new Leave Remove pass occurred in a separate focused run. The Leave Duplicate issue #4 remains candidate/pending requirements confirmation.


## 2026-10-19 — Leave Edit confirmation retest

- `SET-LEAVE-EDIT / SET_228`: **PASS (operator-reported)** after handling the second `Update ...?` dialog. Test creates a uniquely named QA-only Leave Type, changes its label, explicitly confirms `Save changes` inside the dialog, then checks the renamed record is persisted after reopening.
- `SET-LEAVE-REMOVE / SET_229`: PASS previously from UI Mode screenshot (4.4s).
- **New focused runs after the original 46-test full-suite baseline**: `SET-HOLIDAY-DUP` PASS, `SET-LEAVE-DUP` FAIL (candidate duplicate-label defect requiring uniqueness decision), `SET-LEAVE-EDIT` PASS and `SET-LEAVE-REMOVE` PASS.
- **Cumulative distinct tests observed passing = 47**, including original 44. Two confirmed defects and one candidate Leave Type duplicate failure have been observed. **No updated 50-test combined baseline yet**: original combined execution still 46 total / 44 pass / 2 confirmed fail.

## 2026-10-19 — UPDATED FULL SETUP SUITE BASELINE (operator-reported)

- **Environment / mode:** authorized HR PRO prototype; Playwright Chromium UI Mode; `npm run test:ui:setup`.
- **Combined execution:** **50 tests, 47 PASS, 3 FAIL, 0 other outcomes reported**, matching the operator's latest complete-run confirmation. **47/50 = 94.0%** of implemented Setup checks passing. Evidence: operator's report in project conversation (no consolidated screenshot/report attached to this specific confirmation).
- The three failures are:
  1. `SET-JOBPOS-002 / SET_195` — duplicate Job Position persisted twice; **confirmed app defect** [#2](https://github.com/nitsuwa/hr-pro-automation/issues/2).
  2. `SET-LOCATION-002 / SET_211` — duplicate Work Location persisted twice; **confirmed app defect** [#3](https://github.com/nitsuwa/hr-pro-automation/issues/3).
  3. `SET-LEAVE-DUP / SET_227` — two Leave Types with the same label persisted; **candidate app defect**, uniqueness requirement not yet confirmed by product owner [#4](https://github.com/nitsuwa/hr-pro-automation/issues/4).
- No additional automation failures reported. The new Holiday duplicate, Leave edit, and Leave remove checks passed in this combined run.
- **Coverage warning:** 50 Playwright test cases are not the same as full acceptance of all **59 workbook scenario groups**. The coverage tracker is provisional: deeper statutory arithmetic, overtime/LILO, payroll segregation/approvals and edit-time user account creation are still incomplete or require owner clarification.
- **Testing freeze candidate for Wednesday handoff:** retain the three negative assertions unchanged, avoid repeated runs that generate QA records, and save a dated Playwright HTML report/screenshots where available. Re-run after product fixes or scenario additions.

## 2026-10-20 — Next planned test improvements (no new outcomes yet)

- Reviewed the source Setup workbook and historical coverage classifications; 50/47/3 remains the last complete **operator-reported** combined suite result.
- Added **NOT RUN** `tests/infrastructure/setup-duplicate-feedback-probe.spec.ts` and `npm run test:ui:duplicate-feedback`. It will inspect the actual duplicate-message UI for SET_169 (Loan Source) and SET_182 (Department), then save `qa-artifacts/setup-duplicate-feedback.json` locally. It is an exploratory probe, **not a passing regression or product-defect finding**.
- Requires authorized test environment, fictional QA data, and explicit `E2E_APPROVED_MUTATIONS=1` due to persisted record creation.
- See [59-group completion plan](SETUP_59_COMPLETION_PLAN.md) for the remaining quick wins and integration/payroll blockers. **No 59/59 acceptance sign-off is claimed**.


## 2026-10-20 — Focused acceptance improvements prepared (NOT YET RUN)

Uploaded `setup-duplicate-feedback.json` was reviewed: for `SET_169` (Loan Source) and `SET_182` (Department), a second duplicate did not persist (`persistedRows: 1` for both). The structural probe returned `feedback: []` for both. **This is not proof that no feedback exists**; the workbook also expects a visible duplication error, which remains unverified. No new defect has been confirmed.

New stronger regression assertions on QA branch, **awaiting operator UI Mode run**:
- `SET-EMP-EDIT / SET_266–268`: verify QA-created employee email alongside name after save and reload.
- `SET-STRUCT-CREATE / SET_230–237`: reopen created salary structure, assert Basic Salary remains selected.
- `SET-STRUCT-EDIT / SET_238–240`: reopen renamed structure, assert both Basic Salary and Rice Subsidy remain selected.
- `SET-STRUCT-REMOVE / SET_241–243`: cancel deletion, verify structure still exists after reopen, then confirm removal and check absence.

New **read-only, NOT-RUN** inventory: `tests/infrastructure/setup-remaining-fields-inventory.spec.ts` (`npm run test:ui:remaining-fields`). Captures control *structure only* for Company Profile and Holiday management into `qa-artifacts/setup-remaining-fields.json` to support further scenario design without guessing selectors. No stored values or employee data are captured.

The last complete operator-reported regression baseline remains **50 run, 47 PASS, 3 FAIL**. The improved tests cannot be counted as additionally passed or as completed workbook coverage until re-executed and reviewed.


## 2026-10-20 — Operator-reported focused rerun / inventory selector correction

- Operator reports **all four strengthened regression checks passed**: `employee-edit.spec.ts` (name/email persistence) and three tests in `salary-structures.spec.ts` (selected-rule persistence and cancel/confirm deletion). These are **operator-reported targeted results**; no full suite rerun is claimed.
- Read-only `INVENTORY-REMAINING-FIELDS` initially failed at `setup-remaining-fields-inventory.spec.ts:20` due to **two different Holidays buttons** (Organization Setup subtab and Settings jump navigation). This is a **locator ambiguity / test issue**, not an application defect.
- Fixed the inventory to target the unique `button.subtab` matching Company/Holidays by exact text. **Fix not yet rerun**.
- Pending: execute `npm run test:ui:remaining-fields` again, send `qa-artifacts/setup-remaining-fields.json`, and plan additional Company and Holiday regression cases from confirmed control structure.
- Previous full combined Setup baseline remains **50 run, 47 passed, 3 failed** until a new complete run is recorded. Targeted passes must not be added to that total.


## 2026-10-20 — Company / Holiday structural inspection received

Operator supplied `qa-artifacts/setup-remaining-fields.json` from `INVENTORY-REMAINING-FIELDS`. This is **read-only structural evidence**, not a workbook test PASS.

- **Company**: seven visible inputs without an explicit `type` attribute, one `type="file"` upload input, and a Save Changes action. The first inventory reported empty field labels/placeholders because it only checked `label[for=id]` and aria-label; the absence of detected labels **does not establish inaccessible form fields**. 
- **Holidays**: no visible inputs in the closed view; + Add Holiday and many Remove controls; no visible Edit action captured by the action-name filter. This **does not conclusively prove** an edit workflow is absent.
- Existing Company regression covers name/code/address only and restores original values; remaining employer identifiers and file/logo behavior need approved test plans.
- Updated the same *read-only* inspector to resolve native/wrapping labels and report aggregate Holiday row control counts. **New version has not been run**, and no additional scenario has been certified.
- The last combined baseline remains **50 checks run / 47 PASS / 3 FAIL** until a full suite rerun; targeted operator-reported improvements are logged separately.

Next action: rerun `npm run test:ui:remaining-fields`, inspect the new structural JSON (do not share input values or PII), then decide whether any Company fields or Holiday edit workflow can be given permanent acceptance tests.


## 2026-10-20 — Follow-up read-only inventory and new test candidate (NOT RUN)

Operator-supplied label-aware `setup-remaining-fields.json` includes:
- Company Profile: seven labeled text inputs (Company name, code, address, SSS Employer No., PhilHealth Employer No., Pag-IBIG (HDMF) Employer No., BIR TIN), one separate unlabeled file upload, `Save Changes`.
- Holidays: 21 table rows, zero links within rows, zero row Edit buttons, Add and Remove controls only. This **does not prove absence of every possible edit UI**; `SET_220` requires owner clarification before any regression claim.

Created `tests/regression/setup/company-employer-ids.spec.ts` as an **opt-in, NOT RUN** candidate for the four registration fields. It requires `E2E_APPROVED_COMPANY_EDIT=1` and four approved synthetic values, checks saved persistence, and attempts to restore/verify original field values in `finally`. Interrupted runs may still require an environment restore; run only in a disposable approved tenant. The candidate is not counted as PASS and does not change the previous **50 executed / 47 passed / 3 failed** combined suite baseline.


## 2026-10-20 — Browser Local Storage evidence / isolation check prepared

Operator showed Chrome DevTools **Application → Local Storage** for `https://hrproprototype.netlify.app`, including HR PRO-prefixed company, employee and setup data keys; **IndexedDB showed no database for the page**. Operator also observed that changes made in normal Chrome did not appear in an Incognito profile while seeded records did.

These observations strongly suggest important prototype state is browser-local, but **do not prove all writes are local-only or that no backend is shared**. Data from browser storage must not be exported or posted to AI because it can contain real profile/employee information.

Added **NOT RUN** `tests/infrastructure/browser-storage-isolation.spec.ts` and focused UI command `npm run test:ui:storage-isolation`. The test writes/removes only temporary `qa:isolation:*` markers and checks localStorage separation between two fresh Playwright browser contexts; it never edits HR PRO application keys or records. It **does not prove absence of shared backend**. Keep `SET-COMPANY-IDS` gated on a disposable authorized environment and approved test data.

No changes to operator-reported full Setup baseline: **50 executed, 47 passed, 3 failed**; 59-group completion remains separate.


## 2026-10-21 — Department two-level approver persistence passed

- **Operator screenshot:** Playwright Chromium UI Mode, **1/1 passed**, approximately **10.1 seconds**, no errors.
- **Test:** `tests/regression/setup/department-approver.spec.ts` — `SET-DEPT-APPROVER | SET_185–189`.
- **Verified assertions:** distinct first and second **Overtime** approver selections for a newly created QA department persisted after Save Changes and reopening the Approvers editor.
- **Scope boundary:** does **not** verify Timekeeping or Leave routing, payroll-level approvals, actual downstream filing or approval decisions; workbook group `SET_185–189` stays **PARTIAL**.
- **Suite accounting:** targeted rerun of an existing check, not an additional Excel group or an update to the previously operator-reported full-suite total (50 checks, 47 passed, 3 failed; protected Company IDs test skipped as appropriate).


## 2026-10-21 — Timekeeping/Leave two-level approver test passed

- **Operator screenshot:** Playwright Chromium UI Mode, **1/1 passed**, approximately **12.9 seconds**, no errors.
- **Test:** `SET-DEPT-OTHER-ROUTING | SET_185–189` in `tests/regression/setup/department-approver-other-routing.spec.ts`.
- **Verified:** New QA department had first/second **Timekeeping Adjustment** approvers and first/second **Leave** approvers selected; after saving and reopening all four selections persisted.
- **Scope:** Does not establish that timekeeping or leave filing decisions actually route/approve correctly. Workbook group `SET_185–189` stays **PARTIAL**. This is a targeted additional check, not a new complete scenario group.
- **New read-only probe, NOT RUN:** `tests/infrastructure/setup-overtime-review-controls.spec.ts` (`npm run test:ui:overtime-inspect`) records structural Review/Overtime controls only to assess native HR PRO overtime scenarios `SET_097–124`, with **no approvals, filing, edits or employee data captured**.
- **Accounting:** Previous operator-reported full Setup suite had the same three known failures; exact new combined totals not established. Preserve reported full-run baseline separately.


## 2026-10-21 — Native overtime empty Review inspection

- Operator uploaded `qa-artifacts/setup-overtime-review-controls.json` from `INVENTORY-OVERTIME`. Two snapshots showed `/time-attendance`, heading **Review**, **0 table rows**, **6 buttons**, **0 selects**, and no recognized Overtime tab/button/link. This was a *structural inspection*, not a failed HR PRO requirement or a verified overtime workflow.
- Likely missing prerequisite: an active/submitted Review batch in the fresh Playwright browser. This is a hypothesis, **not established** by the JSON.
- New **NOT RUN** opt-in inspection: `tests/infrastructure/setup-overtime-populated-review.spec.ts` and `npm run test:ui:overtime-populated`. It reuses known Timesheet → Review attendance → Submit to Review navigation, then records only generic labels and counts; asserts Review has rows.
- **Safety:** This new inspection **creates/submits a QA batch** (unlike the earlier read-only inspection) and is *skipped by default*. Needs disposable non-production environment and explicit `E2E_APPROVED_MUTATIONS=1`. Does **not** approve/reject overtime or release payroll. Do not run without permission.
- `SET_097–124` remain unverified. The infrastructure inventory does not count toward 59 groups or change the full-suite baseline.
