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
