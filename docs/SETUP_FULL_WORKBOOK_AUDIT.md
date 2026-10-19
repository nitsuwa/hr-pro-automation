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

## 2026-10-19 — Allowance maintenance & employee import template candidates

- `tests/regression/setup/allowance-maintenance.spec.ts` — **NOT RUN**:
  - SET_250–252: Create QA-only allowance, edit it, assert changed name persisted.
  - SET_253–255: Create QA-only allowance, cancel deletion and verify unchanged, then confirm deletion and verify absent after reopening.
  - The edit/removal controls were **not** confirmed in the prior blank-form inventory; any failure requires inspecting its actual modal before changing assertions.
- `tests/regression/setup/employee-import-template.spec.ts` — **NOT RUN**:
  - SET_256–259: Open import wizard, download employee template, verify correct file extension and nonempty contents.
  - SET_260–262 (fill template, upload, confirm records) are still **not implemented**.
- `tests/infrastructure/setup-advanced-inventory.spec.ts` — read-only, UI Mode command `npm run test:ui:advanced`, captures control names for full SET_230–243 salary-structure workflow, SET_266–270 employee edit/delete and SET_185–189 departmental approver workflow. This is an inspection tool, not workbook coverage.
- Distinction: all 59 workbook groups are still **not complete**, despite 33 distinct observed passing test cases and two recorded prototype defects.

## 2026-10-19 — Salary Structures and import template follow-up

- `tests/regression/setup/salary-structures.spec.ts`: **UNVERIFIED**, two candidate tests:
  - `SET-STRUCT-CREATE` (SET_230–237): creates a unique QA Salary Structure, adds Basic Salary rule, saves, reopens and checks the structure exists.
  - `SET-STRUCT-EDIT` (SET_238–240): creates its own QA structure, renames it, adds a second rule and verifies persistence. Edit selectors have NOT yet been tested in UI Mode.
  - `SET_241–243` cancel/confirm salary-structure removal still pending.
  - Both cases deliberately avoid Set as Default.
- `tests/infrastructure/employee-template-capture.spec.ts`: read-only template download into `qa-artifacts/employee-import-template.csv` or `.xlsx` etc. UI command `npm run test:ui:template`; once provided to QA, use its actual columns to implement an end-to-end SET_260–262 upload/import test with unique fictitious employee data.
- The earlier `SET-IMPORT-TEMPLATE / SET_256–259` test **PASSED**, but importing a completed file is NOT yet validated.
- Current operator evidence: **36 distinct passing checks across focused runs, two confirmed negative defect failures**. Not the whole 59-group workbook.


## 2026-10-19 — Salary rule locator correction and real CSV import candidate

- Initial `salary-structures.spec.ts` test run: **both FAIL from a mistaken accessible name** `Basic SalaryBASIC EARNING` (missing spaces). Page snapshot confirms real accessible button `Basic Salary BASIC EARNING ＋`. Fixed to whitespace-tolerant regex. Both need retest; no HR PRO product defect identified.
- User-provided official `employee-import-template.csv` has **39 columns**, comments describing valid values, and **no employee row**. Required: `Name *`, `Rate *`, `Date of Hiring *`; other valid fields tested selectively.
- New **UNVERIFIED** `tests/regression/setup/employee-import.spec.ts` implements SET_260–262 as one employee import E2E candidate: dynamically download official template; preserve 39-column format; upload one fictitious QA record; confirm presence after reload.
- Import uses a disposable QA record and skips an environment explicitly marked `production`. Do not run against live employee/payroll data.

## 2026-10-19 — Import action and salary structure removal candidate

- `SET-IMPORT-001`: initial **FAIL due to wrong button locator**, while uploaded CSV preview contained one Ready employee. Corrected to `Import 1`, with an explicit Ready-row assertion. **Employee import still unverified** until completion and persistence assertions pass.
- `SET-STRUCT-CREATE` and `SET-STRUCT-EDIT`: **PASS as reported by local QA operator** after accessible-name whitespace correction.
- New `SET-STRUCT-REMOVE / SET_241–243`: **NOT RUN**, creates a unique QA structure and confirms its removal and persistence after reopening. Does not touch seeded/default structures. Dialog behavior pending UI confirmation.

## 2026-10-19 — Department Approvers and employee editing interface survey

- New **read-only, non-regression** file `tests/infrastructure/setup-people-controls.spec.ts` (run via `npm run test:ui:people`).
- The survey opens the real Department Approvers editor and inspects the first dropdown's option structure **without saving**, then follows an existing Employees table link to its details and opens its Edit screen **without submitting changes**.
- Output: `qa-artifacts/setup-people-controls.json`. Record only control metadata and anonymous option structure; no employee names, IDs, salaries, or emails.
- Purpose: write real SET_185–189 (approve policies), SET_266–270 (edit/remove employees), SET_275–278 (create user while editing employee) scripts without guessing inaccessible selectors.
- **No new workbook regression coverage** is claimed for an inventory script. Current cumulative report: 40 distinct previously passing tests, two confirmed failing checks, and significant workbook gaps including some payroll/approval workflows and contribution arithmetic.
