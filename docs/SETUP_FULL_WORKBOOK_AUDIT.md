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
