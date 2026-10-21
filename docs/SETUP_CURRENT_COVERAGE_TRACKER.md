# Setup Workbook: Provisional Coverage Status (19 October 2026)

**Use for planning and handoff, not as a final sign-off.** The original `HR PRO + Set up (1).xlsx` contains **59 scenario groups across SET_001–SET_278**. This tracker reconciles the Excel group inventory with the local QA execution evidence and test files currently on branch `qa/setup-handoff-2026-10-19`.

## Verified test-run baseline

- **Latest combined Setup run (19 October 2026, operator-reported): 50 executed, 47 passed, 3 failed (94.0% of automated checks passed).** No other failures reported.
- **Confirmed product defects:** [duplicate Job Positions (#2)](https://github.com/nitsuwa/hr-pro-automation/issues/2) and [duplicate Work Locations (#3)](https://github.com/nitsuwa/hr-pro-automation/issues/3).
- **Candidate product defect:** [duplicate Leave Type labels (#4)](https://github.com/nitsuwa/hr-pro-automation/issues/4), pending product-owner confirmation that names must be unique.
- The 50 Playwright checks **do not correspond one-to-one** with the 59 Excel groups; some groups have several checks and some scripts only validate part of the expected outcome. The historical 59-group classification below is provisional and requires complete acceptance review.

## Scenario-level assessment (provisional)

| Classification | Scenario groups | Interpretation |
| --- | ---: | --- |
| Core check passed | 26 | A mapped regression check passed; not automatic certification of every Excel step |
| Partial verification | 15 | At least one relevant check passed, but material required outcomes still need assertions or owner confirmation |
| Defect confirmed | 2 | Negative assertions correctly catch behavior currently failing the workbook requirement |
| Candidate defect | 1 | Two matching Leave labels were observed; uniqueness requirement awaits owner confirmation | 
| No validated coverage | 15 | No dedicated permanent, verified check of the scenario's intended business result |
| **Total** | **59** | |

**Work remaining:** 15 groups have no dedicated validated coverage and 15 are partially verified. Four of the 15 uncovered groups (`SET_198–205`) contain contradictory/copy-pasted instructions that may be resolved through owner clarification and mapping to existing Work Location tests. Thus, at most **11 distinct uncovered groups** remain if all four conflicts turn out to be duplications, **in addition to the 15 partial groups and one candidate defect**. These are scenario groups, **not a count of scripts or files required**.

## 59-group checklist

| # | Workbook group | Scenario | Current classification | Required next action / note |
| ---: | --- | --- | --- | --- |
| 1 | SET_001–003 | Reset test data | No validated coverage | Destructive; disposable reset environment and restore evidence required |
| 2 | SET_004–009 | Pooled grace period | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 3 | SET_010–015 | Per-day grace period | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 4 | SET_016–021 | Auto-generated employee ID | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 5 | SET_022–026 | Manual employee ID | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 6 | SET_027–031 | Default working schedule | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 7 | SET_032–042 | Every Pay Week contributions | Partial verification | Existing checks cover policy persistence, not payroll arithmetic |
| 8 | SET_043–055 | First four weeks contributions | Partial verification | Existing checks cover policy persistence, not 4/5-week arithmetic |
| 9 | SET_056–069 | Chosen pay weeks contributions | Partial verification | Existing checks cover policy persistence, not chosen-week deductions |
| 10 | SET_070–082 | Last pay week contributions | Partial verification | Existing checks cover policy persistence, not final-week deductions/tax |
| 11 | SET_083–087 | Filing & approvals | Partial verification | Settings and leave request checked; other full approval paths pending |
| 12 | SET_088–096 | LILO overtime approval | No validated coverage | Real LILO external dependency; manual or integration evidence |
| 13 | SET_097–108 | HR PRO overtime approval | No validated coverage | Replace HR PRO overtime inspection with outcome assertions |
| 14 | SET_109–116 | Changing overtime setting / previous decisions | No validated coverage | Verify prior decisions stay unchanged after settings change |
| 15 | SET_117–124 | Unapproved overtime remains unpaid | No validated coverage | Assert no overtime pay before HR PRO approval |
| 16 | SET_125–135 | Existing payroll approval workflow | No validated coverage | Permanent original approval/SoD workflow and release checks needed |
| 17 | SET_136–143 | Same-user approve/release segregation | No validated coverage | Same-user approve/release restrictions need regression |
| 18 | SET_144–151 | Single-approver workflow | No validated coverage | Referenced single-approver test missing; implement regression |
| 19 | SET_152–162 | Original payroll workflow (repeated workbook header) | No validated coverage | Repeated Excel header at SET_152; confirm exact workflow |
| 20 | SET_163–168 | Loan source creation | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 21 | SET_169 | Duplicate loan source | Partial verification | One remaining record verified; visible duplicate message not yet asserted |
| 22 | SET_170 | Edit loan source | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 23 | SET_171 | Remove loan source | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 24 | SET_172–176 | Company profile | Partial verification | Core name/code/address save; other fields/logo still pending |
| 25 | SET_177–181 | Create department | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 26 | SET_182 | Duplicate department | Partial verification | Duplicate prevented; visible error message unverified |
| 27 | SET_183 | Edit department | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 28 | SET_184 | Remove department | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 29 | SET_185–189 | Department approvers | Partial verification | One first-level approver persisted; other approval levels/actual filing behavior pending |
| 30 | SET_190–194 | Create job position | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 31 | SET_195 | Duplicate job position | Defect confirmed | CONFIRMED defect: two identical job positions persisted; issue #2 |
| 32 | SET_196 | Edit job position | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 33 | SET_197 | Remove job position | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 34 | SET_198–202 | Work Location creation (conflicting steps) | No validated coverage | Workbook states Work Locations but step text refers to Job Positions |
| 35 | SET_203 | Duplicate position/location (conflicting steps) | No validated coverage | Workbook duplicates Job Position wording; clarify before extra script |
| 36 | SET_204 | Edit position/location (conflicting steps) | No validated coverage | Workbook duplicates Job Position wording; clarify before extra script |
| 37 | SET_205 | Remove position/location (conflicting steps) | No validated coverage | Workbook duplicates Job Position wording; clarify before extra script |
| 38 | SET_206–210 | Create work location | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 39 | SET_211 | Duplicate work location | Defect confirmed | CONFIRMED defect: two identical work locations persisted; issue #3 |
| 40 | SET_212 | Edit work location | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 41 | SET_213 | Remove work location | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 42 | SET_214–218 | Create holiday | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 43 | SET_219 | Duplicate holiday | Partial verification | QA-only duplicate prevention test passed in updated 50-test run; copied workbook wording still needs owner confirmation |
| 44 | SET_220 | Edit holiday | No validated coverage | Clarify copied wording; add QA-only edit Holiday regression |
| 45 | SET_221 | Remove holiday | Partial verification | Holiday removal test passed; worksheet contains contradictory copied wording |
| 46 | SET_222–226 | Create leave type | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 47 | SET_227 | Duplicate leave type | Candidate defect | Identical Leave labels persisted under different codes; issue #4; require owner decision about label uniqueness |
| 48 | SET_228 | Edit leave type | Partial verification | QA-only Leave rename persisted after confirming Save Changes; copied workbook instructions need owner reconciliation |
| 49 | SET_229 | Remove leave type | Partial verification | QA-only Leave removal and persistence passed; copied workbook instructions need owner reconciliation |
| 50 | SET_230–243 | Salary structure create/edit/remove and rules | Partial verification | Create/edit/remove scripts passed; reconcile rule ordering/default settings to full expected steps |
| 51 | SET_244–249 | Create allowance | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 52 | SET_250–252 | Edit allowance | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 53 | SET_253–255 | Delete allowance | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 54 | SET_256–262 | Download and import employee template | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 55 | SET_263–265 | Add employee | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 56 | SET_266–268 | Edit employee | Partial verification | Name edit/persistence verified; expand to other required employee detail fields |
| 57 | SET_269–270 | Remove employee | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 58 | SET_271–274 | Create account during employee enrollment | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 59 | SET_275–278 | Create account while editing employee | No validated coverage | Determine supported edit-time user linking/creation behavior before coding |

## Priorities for the October 21 team presentation

1. **Present what is already real:** updated 50-test UI Mode baseline; 47 green checks; two confirmed product defects and one candidate; setup, execution, trace inspection, and authoring a new test.
2. **Mark exceptions clearly:** statutory calculations are not fully tested by persistence assertions; LILO/overtime/payroll SoD needs real workflow evidence; some workbook steps have copied text.
3. **Do not claim 59 of 59 complete.** Present a maintainable framework, the [reason for remaining coverage](WORKBOOK_GAPS_AND_TEST_AUTHORING_DEMO.md), and a prioritized backlog for the next QA owner.
4. **Use only authorized prototype/sandbox data.** Some tests modify shared Setup state and create persistent QA records. Repeating duplicate tests creates duplicate catalog entries requiring controlled cleanup.

**Related documents:** [Why Remaining Scenarios Are Incomplete + Live Demo](WORKBOOK_GAPS_AND_TEST_AUTHORING_DEMO.md), [Team Handoff & Live Demo Guide](TEAM_HANDOFF_DEMO_GUIDE.md), [Execution Evidence Log](QA_EXECUTION_LOG.md), [Initial Workbook Audit](SETUP_FULL_WORKBOOK_AUDIT.md).


## Scripts created after the full-suite baseline (unverified)

- `SET-HOLIDAY-DUP / SET_219` — new candidate negative regression; **not run**. Holiday duplicate definition inferred from the scenario heading due copied/conflicting steps.
- `SET-LEAVE-DUP / SET_227` — new candidate negative regression; **not run**. Leave Type duplicate definition inferred from scenario heading.
- `INVENTORY-V10` — **read-only** control discovery for Holiday Edit and Leave Type management, result `setup-holiday-leave-controls.json`; this is not workbook coverage.
- The 59-group classification table above is the last **verified baseline**; do not move a candidate from no coverage to passing without the test execution result and business requirement review.


## 2026-10-19 — New focused negative tests after the 46-test baseline

- `SET-HOLIDAY-DUP / SET_219`: **PASS observed**, but original workbook text still needs clarification. It is a new test added after the baseline.
- `SET-LEAVE-DUP / SET_227`: **FAIL observed** with two identical leave labels saved under different codes. Candidate bug [#4](https://github.com/nitsuwa/hr-pro-automation/issues/4); leave label uniqueness needs owner confirmation and follow-up reproduction.
- V10 inspection: Holiday list showed Remove only, no Edit control; Leave expanded panel did not reveal generic Edit/Remove/Save controls.
- **Do not revise the 46-test baseline counts** to include these later focused runs; a new combined suite run is required for updated total.


## 2026-10-19 — Leave Edit / Remove ready for first execution

Read-only V11 editor inventory confirmed a text field with no label, plus `Save changes` and `Remove leave type` actions. Two QA-only, independent candidate regression tests now exist in `tests/regression/setup/leave-maintenance.spec.ts`: **SET_228 edit**, **SET_229 remove**. Both are **NOT RUN**, and the scenario text still needs owner clarification. Historical classification table above is unchanged until execution.


## 2026-10-19 — Leave maintenance focused execution

- `SET_229` (Remove QA Leave Type): **PASS**, 4.4s focused UI Mode run.
- `SET_228` (Edit QA Leave Type): **first attempt failed due to missed confirmation dialog**; changed script to click the dialog-scoped `Save changes`, then assert the updated record after reopen. **Retest pending**.
- Do not add the corrected edit test to verified coverage until the new run passes. Previous full-suite baseline is still 46 executed, 44 passed and 2 confirmed application defect failures, while candidate Leave Duplicate issue #4 remains outside that baseline.


## 2026-10-19 — Leave Edit confirmed passing

- `SET_228` Leave Type edit: **PASS (operator-reported)** after completing the additional confirmation dialog. Test checks persistence across returning to Leave Settings.
- `SET_229` Leave Type remove: **PASS** on the prior focused run.
- Subsequent focused testing added four checks beyond the original 46-test run: Holiday Duplicate PASS, Leave Duplicate FAIL (candidate requirement-dependent issue #4), Leave Edit PASS and Leave Remove PASS. **47 distinct passing checks cumulatively**, but original **combined baseline stays 46 executed / 44 PASS / 2 confirmed defect FAIL** pending another combined run. Do not overstate a 50-test pass rate.

## 2026-10-19 — Latest combined 50-test verification

- Operator confirms updated full UI Mode run: **50 tests, 47 pass, 3 fail**; failures confined to the two confirmed duplicate catalog defects and the one Leave Type duplicate-label candidate.
- New confirmed passing checks since initial 46-test baseline: **Holiday duplicate**, **Leave edit**, **Leave removal**. New failing candidate check: **Leave duplicate**.
- **The historical 26 core / 12 partial / 2 confirmed defect / 19 unvalidated grouping above is not a refreshed acceptance sign-off.** These later focused tests improve coverage but source workbook contradictions and incomplete deeper assertions still require independent reconciliation.
- Release posture: handoff-ready as an extensible test framework with accurately documented defects and gaps, **not** a completed 59-of-59 workbook certification.

## 2026-10-20 — 59-group closure plan and next inspection

A focused [59-scenario completion plan](SETUP_59_COMPLETION_PLAN.md) now prioritizes truly missing business assertions, not just adding scripts. A new **exploratory, NOT-RUN** probe at `tests/infrastructure/setup-duplicate-feedback-probe.spec.ts` checks what visible duplicate feedback the current HR PRO interface actually produces for `SET_169` and `SET_182`; the results should inform permanent regression assertions. This is **not yet additional verified workbook coverage**. It requires authorized non-production persistent QA records and explicit `E2E_APPROVED_MUTATIONS=1`.


## 2026-10-20 — New assertions awaiting execution

- `SET_169` and `SET_182`: a focused duplicate-feedback structural probe observed **one persisted row** in each case but collected **no candidate visible warning text**. Duplicate blocking works in that run; **workbook-visible feedback is not verified**. Do not reclassify as fully accepted.
- `SET_266–268`: Employee Edit regression now checks email persistence as well as name. **NOT RUN** after modification.
- `SET_230–243`: Salary Structure regressions now verify saved selected rules and cancellation before confirmed deletion. **NOT RUN** after modification.
- `SET_172–176` (Company) and `SET_220` (Holiday editing): a new read-only control inventory is prepared to identify realistic additional coverage. **NOT RUN**.
- LILO, destructive reset, payroll arithmetic and multi-role/payroll authorization groups remain excluded from this *quick-win* batch pending approved prerequisites.

See [Execution Log](QA_EXECUTION_LOG.md). Historical 59-group provisional classifications above have **not been changed** and are not a 59/59 pass certificate.


## 2026-10-20 — Operator feedback and inventory fix

- Targeted re-execution reported **1 Employee Edit + 3 Salary Structure checks passed** after assertions were strengthened. This improves verified behavior within the existing workbook groups; it is not a +4-group addition or an updated full-suite tally.
- Read-only Company/Holiday inventory failed due to two identical-label Holidays buttons in separate Settings areas. Script locator fixed to scope to Setup `button.subtab`; **rerun pending**, so no inventory artifact or additional workbook acceptance yet.
- On a successful inventory rerun, use the structural JSON (no field values) to decide which parts of `SET_172–176` and `SET_220` are implementable.


## 2026-10-20 — Company and Holiday label-aware inventory result

- Latest operator-supplied **read-only** `setup-remaining-fields.json` identified seven labeled Company fields: **Company name**, **Company code**, **Address**, **SSS Employer No.**, **PhilHealth Employer No.**, **Pag-IBIG (HDMF) Employer No.**, and **BIR TIN**. It also found one `type=file` input without a label in the structural capture. Do **not** assume upload behavior or access rights from this alone.
- The Holidays table had **21 rows, 0 row links and 0 Edit buttons**. Only `+ Add Holiday` and `Remove` controls were identified. This suggests `SET_220` Holiday editing is **currently blocked / awaiting product-owner confirmation of the supported workflow**; the inspector alone cannot establish a product defect or prove editing is impossible through all routes.
- A new **opt-in, NOT RUN** `tests/regression/setup/company-employer-ids.spec.ts` is available to check whether the four employer registration fields save, reload and are restored. It requires an authorized **disposable QA tenant** and four approved synthetic, format-valid ID values from environment variables. The original Company identity check remains unchanged.
- **No change to the historical 59-group status counts.** Company full acceptance still needs the registration test's real result and logo behavior decision.

## 2026-10-20 — Department approver second-level regression prepared

- The operator reports the latest full Setup suite had the **same result** as the earlier 47-pass / 3-fail combined baseline; no new screenshot/count breakdown was provided in this turn. Do not count the protected company-ID skip as a pass.
- Strengthened the existing `SET-DEPT-APPROVER / SET_185–189` QA-only regression to select **distinct first and second Overtime approvers**, verify both in the edit form, save, reopen, and assert both persisted. **NOT RUN after the change.**
- This remains **partial** for the full workbook group: Timekeeping, Leave and Payroll routing and actual downstream filing/approval actions need separately approved test data and evidence.
- Keep confirmed duplicate Job Position / Work Location failures and the Leave Type uniqueness candidate recorded without changing expected assertions.


## 2026-10-21 — Two-level Overtime PASSED; Timekeeping and Leave candidate prepared

- **Operator screenshot:** `SET-DEPT-APPROVER | SET_185–189` passed (**1/1 Chromium**, ~10.1 seconds). The existing QA-only department test proved two different **Overtime** approvers persisted after reopening.
- **New candidate, NOT RUN:** `tests/regression/setup/department-approver-other-routing.spec.ts` creates a second unique QA department, assigns first/second **Timekeeping Adjustments** and **Leave** approvers, saves, reopens and checks all four persisted. The picker order comes from the previously inspected eight-picker editor UI; this assumption must be confirmed by the actual run.
- **Scope boundary:** neither test proves actual downstream approval/filing or every payroll approval rule. Keep `SET_185–189` marked **PARTIAL** until those outcomes are tested or formally deferred.
- **Accounting:** do not add the existing Overtime 1/1 pass to a previous 50-test combined total. The new candidate is not counted as passed; there has been no new full suite run since the previously reported result.


## 2026-10-21 — Timekeeping and Leave approver persistence confirmed

- **Operator screenshot 1/1 PASS (~12.9s Chromium):** `SET-DEPT-OTHER-ROUTING` selected distinct first/second Timekeeping Adjustment approvers and first/second Leave approvers for a new QA-only department and verified all persisted after saving/reopening. This complements the **1/1 PASS** of two-level Overtime approver persistence.
- `SET_185–189` remains **PARTIAL** because actual filing/approval outcomes and payroll approver routing are not yet validated; do not add one workbook group to an artificial completed tally.
- **Next possibility:** `SET_097–124` native HR PRO overtime approval, separate from external LILO integration. New **read-only, NOT RUN** inspection `tests/infrastructure/setup-overtime-review-controls.spec.ts` maps Review and Overtime UI without changing data. Must review its JSON before deciding if a business-outcome regression is feasible.
- No change to provisional 59-group counts or the last complete operator-reported pass/fail total.


## 2026-10-21 — Native overtime prerequisite identified

- Read-only `setup-overtime-review-controls.json`: `/time-attendance` showed **zero rows**, no visible Overtime navigation, and only generic Review actions. It therefore provides **no actual evidence** of the overtime approval workflow; `SET_097–124` remain uncovered.
- To distinguish “empty state” from “feature not supported,” an **optional, NOT RUN** `setup-overtime-populated-review.spec.ts` now exists. It uses a newly named QA batch based on the same seeded demonstration employee flow already exercised by `SET-FILING-002`, then inspects populated Review controls. This **mutates test state**, so it requires an approved disposable QA environment and an explicit safety flag. No workbook acceptance assertion yet.
- If batch creation is not authorized, **defer overtime** and focus on other permitted Setup scenarios. Do not count inspection runs as verified workbook coverage.


## 2026-10-21 — Populated Review inventory and next approval navigation

- The operator-supplied `setup-overtime-populated-review.json` showed **1 Review row** after submitting a QA batch and **18 rows / 12 selection controls** after opening its details; an **Approvals** UI control is visible. This changes the investigation direction from an empty Review to the native approvals interface.
- **No claim of verified overtime behavior:** `SET_097–124` still need actual overtime filing, approval/rejection, and business-state assertions. The JSON is structural inspection only.
- The existing **gated** populated Review inspector was extended (NOT RUN since update) to open the exact Approvals tab/button/link and list generic controls, without approving or rejecting anything. This additional inspection creates a fresh QA batch and therefore requires a disposable authorized environment.


## 2026-10-21 — Approvals Overtime control discovered

- Latest opt-in populated Review survey (operator-uploaded JSON) successfully navigated to **Approvals**, where a generic **Overtime navigation** control exists. Counts: Review 1 row; Review details 18 rows/12 selects; Approvals 0 rows/7 buttons.
- **This is structural evidence, not overtime functional acceptance.** `SET_097–124` remain unverified for submitted overtime requests, authorization and post-approval behavior.
- Existing **read-only** `setup-overtime-review-controls.spec.ts` has been enhanced to navigate **Approvals → Overtime** without generating another QA batch. It records generic control categories and counts only. **Not yet rerun.**


## 2026-10-21 — Overtime deferred after confirmed empty view

- Latest read-only `setup-overtime-review-controls.json` successfully navigated **Review → Approvals → Overtime**. No rows, selects, or textareas were visible in the new browser context. This confirms the navigation exists, **not** the actual overtime approval business flow.
- **Decision:** defer `SET_097–124` until a valid overtime request and authorized roles/expected behavior are available; do not run additional inventories just to inflate test count.
- **Quick-win candidate prepared, NOT RUN:** separate `SET-HOLIDAY-DUP-FEEDBACK | SET_219` assertion in `holiday-leave-duplicates.spec.ts` will test the workbook's **visible duplicate warning** requirement, using a unique QA Holiday. The old test that verifies a duplicate was not saved remains untouched. This is not yet full acceptance and requires direct UI Mode evidence.


## 2026-10-21 — SET_219 Holiday duplicate confirmation screenshot

- The failed `SET-HOLIDAY-DUP-FEEDBACK` run **did show** a real `role=dialog` warning ("There's already a declared holiday on this date"). It offered **Cancel** and **Add it anyway**. The old assertion ignored plain dialogs, so the red check was a **test locator issue**, not a missing warning.
- GitHub scripts updated (NOT RUN): both `SET-HOLIDAY-DUP` and `SET-HOLIDAY-DUP-FEEDBACK` now explicitly use **Cancel** and assert exactly one original QA Holiday persists. The latter also verifies the actual confirmation text and override choice.
- These checks will **not** prove that duplicates are universally forbidden: HR PRO currently allows an explicit override, and product-owner clarification of that behavior versus workbook `SET_219` is required. Keep the group **PARTIAL** until accepted criteria and rerun evidence are available. Do not artificially increase workbook or full-suite pass totals.
