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
