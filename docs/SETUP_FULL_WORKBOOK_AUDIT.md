# Complete Setup Workbook Audit — 19 October 2026

Source: `HR PRO + Set up (1).xlsx`, tab **Set up**, `SET_001`–`SET_278`.

- 59 scenario groups (278 numbered Excel rows; SET_152 is a duplicated header)
- 9 groups have permanent Playwright files (not execution-verified)
- 8 groups have inspection/reference mappings (not verified permanent)
- 42 groups with no identified implementation
- No green test-run claim: browser testing unavailable in the audit environment

## Permanent
- SET_004–009, SET_010–015: `tests/regression/setup/general-settings.spec.ts`
- SET_016–021, SET_022–026, SET_027–031: `tests/regression/setup/employee-setup.spec.ts`
- SET_032–042, SET_043–055, SET_056–069, SET_070–082: `tests/regression/setup/contribution-settings.spec.ts`

## Exploratory or inspection
- SET_083–087: filing approval check
- SET_088–096: LILO overtime inspection (may need manual/external evidence)
- SET_097–108: HR PRO overtime inspection
- SET_109–116: overtime setting retention
- SET_117–124: unpaid overtime approval
- SET_125–135: original payroll segregation-of-duties workflow
- SET_136–143: same-user payroll approval/release
- SET_144–151: referenced single-approver inspection file was NOT found in the current repo tree.

## No identified script
SET_001–003 and all SET_152–278 groups. Some groups, especially SET_152–162, overlap previously described payroll scenarios but must be checked independently against actual requirements.

## Requirements mismatches to resolve
- SET_152: duplicated table header in numbered step.
- SET_198–205: Work Locations descriptions paired with Job Positions steps; likely copy/paste.
- SET_211: Work Location duplicate check names Job Position.
- SET_218–221: Holiday steps/outputs mention Work Locations / Job Positions.
- SET_227–229: Leave steps/outputs refer to Holiday / Work Location.
- SET_032–082: current permanent tests verify policy persistence but NOT the required actual weekly payroll deductions and tax behavior.

## Completion rule
For each group: identify preconditions, write an executable test, assert business outcomes, restore/reset test data, run against approved staging, record result + evidence. Failed or blocked scenarios are NOT passing scenarios.

See companion Excel audit workbook for all 278 step-by-step rows and exact source locations.

## New tests awaiting UI execution — 19 October 2026

- `tests/regression/setup/company-profile.spec.ts`: **UNVERIFIED** SET_172–176, core company identity fields only; employer numbers and logo still require coverage.
- `tests/regression/setup/catalog-creation.spec.ts`: **UNVERIFIED** SET_163–168 loan source creation, SET_190–194 job position creation, and SET_206–210 work location creation.
- Catalog duplicate/edit/remove scenarios (SET_169–171, SET_195–197, SET_211–213), Department CRUD (SET_177–189), and other workbook areas are not yet automated.
- `tests/infrastructure/setup-form-inventory.spec.ts` is a read-only survey for missing forms. It is not a regression assertion of application business behavior.

**Important**: These new cases should NOT be included in any verified passing count until the QA operator runs them and shares results.

## 2026-10-19 — Follow-up after form inventory v2

Evidence uploaded: `setup-form-inventory.json` (UI labels, no form values).

- **Unverified**: `tests/regression/setup/department-creation.spec.ts` covers SET_177–181 using the workbook's Enter-to-save flow. Run in UI Mode; the exact save interaction is not yet proven.
- **Unverified**: `tests/regression/setup/employee-enrollment.spec.ts` covers SET_263–265: employee enrollment, search result, and persistence.
- **Inspection only**: `tests/infrastructure/setup-dialog-inventory.spec.ts` captures add forms for Holidays, Leave, Salary Rules, Allowances, Import Records and departmental approvers without saving. Generated output: `qa-artifacts/setup-dialog-inventory.json`.
- UI inventory confirmed the salary and allowance features live under **Smart Pay > Structures**, rather than Organization Setup.
- The latest inventory also confirms the setup navigation buttons for Holidays and Leave.
- **No pass/fail status** for the two new regression tests until the QA operator runs them.

## Further candidate tests — 2026-10-19

- **PASS observed** `tests/regression/setup/department-creation.spec.ts` (SET_177–181).
- **PASS observed** `tests/regression/setup/employee-enrollment.spec.ts` (SET_263–265).
- **NOT RUN** `tests/regression/setup/holiday-leave-allowance-creation.spec.ts` (SET_214–218, SET_222–226, SET_244–249). Three create-and-persistence cases; other steps/CRUD variations not covered.
- `setup-dialog-inventory.json` supports forms for Holidays, Leave Types, Salary Rules, Allowances, import wizard and Users & Access.
- Distinction: **Salary Rules** screen is not proof of full Excel **Salary Structures** workflow (SET_230–243); structure creation/edit/rule assignment/delete remain pending.

- **NOT RUN** `tests/regression/setup/employee-user-creation.spec.ts` (SET_271–274) now tests creation of employee plus corresponding user in Users & Access, using a unique example.com address. All tests are isolated browser contexts and the app says invitations are simulated. Separate SET_275–278 (create user when editing employee) remains pending.

## 2026-10-19 — Duplicate prevention candidate suite

New **NOT RUN** file: `tests/regression/setup/catalog-duplicates.spec.ts`.
- SET_169 duplicate loan source
- SET_182 duplicate department
- SET_195 duplicate job position
- SET_211 duplicate work location

All four tests create an isolated QA example, attempt the identical name, reload and assert only one row exists. They check the *duplicate not saved* outcome, **not yet the Excel requirement for a visible duplicate error prompt**. Confirm error text/validation separately before marking the full Excel scenario complete. If a duplicate does persist, verify reproduction to distinguish a product defect from test-data issues.

## 2026-10-19 — Duplicate validation follow-up

- **PASS** SET_169 Loan source duplicate prevention; **PASS** SET_182 Department duplicate prevention.
- **FAIL, reproduced twice** SET_195 Job Position duplicate prevention (issues #2) and SET_211 Work Location duplicate prevention (issues #3). Do NOT weaken their assertions.
- Workbook duplicate-error-message UX remains unverified for all four cases; a save-prevention assertion alone does not prove expected user-visible feedback.

## 2026-10-19 — Catalog edit tests prepared (UNVERIFIED)

Inventory source: local QA operator's `setup-edit-inventory.json`, showing in-row Save/Cancel and edit fields for Department, Job Position, Work Location and Loan Source.

New file: `tests/regression/setup/catalog-edits.spec.ts` with four independent cases:
- SET_170 Loan source rename
- SET_183 Department rename
- SET_196 Job Position rename
- SET_212 Work Location rename

Each case first creates its OWN unique QA record, never edits a seeded business entry, renames via the actual inline editor and checks persistence after reopening. All four are **NOT RUN** until QA operator provides execution evidence.

Remove tests SET_171, SET_184, SET_197, SET_213 require confirmation behavior inspection; defer until the edit flows are verified. Do not perform destructive tests on seeded records.

## 2026-10-19 — Catalog Remove cases added (NOT RUN)

`tests/regression/setup/catalog-edits.spec.ts`: four edit tests **PASS** in user's Playwright UI Mode screenshot (SET_170, SET_183, SET_196, SET_212). Total 29 distinct tests observed passing, two confirmed duplicate defects.

`tests/regression/setup/catalog-removals.spec.ts`: four new **UNVERIFIED** negative/destructive-path checks. All first create a unique QA-only record and remove only that exact row:
- SET_171 — Loan Source Remove
- SET_184 — Department Remove
- SET_197 — Job Position Remove
- SET_213 — Work Location Remove

These cases check deletion and persistence after reopening. Their real confirmation UI behavior is not yet confirmed; inspect any failing steps. These do not remove pre-existing company catalog entries and skip an environment explicitly marked production.
