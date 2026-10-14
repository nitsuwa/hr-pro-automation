# HR PRO Automation Test Map

This file is the handoff/cleanup tracker for the Playwright automation work.

## Current rule

- Keep temporary / inspection tests while Excel scenarios are still being proven.
- Do not delete a temporary test until a permanent regression equivalent exists and passes.
- Final regression tests must use business assertions, not only console inspection.
- Final handoff should allow the team lead to run the permanent suite with a simple command.

## Scenario map

| Excel range | Current automation | Current status | Final target |
|---|---|---|---|
| SET_004–009 | tests/regression/setup/general-settings.spec.ts | Proven | Keep/refine permanent |
| SET_010–015 | tests/regression/setup/general-settings.spec.ts | Proven | Keep/refine permanent |
| SET_016–021 | tests/regression/setup/employee-setup.spec.ts | Proven | Keep/refine permanent |
| SET_022–026 | tests/regression/setup/employee-setup.spec.ts | Proven | Keep/refine permanent |
| SET_027–031 | tests/regression/setup/employee-setup.spec.ts / general-settings.spec.ts | Proven | Keep/refine permanent |
| SET_032–042 | tests/regression/setup/contribution-settings.spec.ts | Proven; Issue 001 in business results | Keep/refine permanent |
| SET_043–055 | tests/regression/setup/contribution-settings.spec.ts | Proven; Issue 002 | Keep/refine permanent |
| SET_056–069 | tests/regression/setup/contribution-settings.spec.ts | Proven; Issue 003 | Keep/refine permanent |
| SET_070–082 | tests/regression/setup/contribution-settings.spec.ts | Proven; Issue 004 | Keep/refine permanent |
| SET_083–087 | tests/infrastructure/filings-approvals-direct-edit-check.spec.ts | Proven | Merge into filing-approvals regression |
| SET_088–096 | tests/infrastructure/lilo-overtime-inspection.spec.ts | Partly external/manual for real LILO | Merge into overtime workflow regression with clear blocked/manual notes |
| SET_097–108 | hrpro-overtime-pending-inspection.spec.ts + hrpro-overtime-payroll-inspection.spec.ts | Proven | Merge into overtime workflow regression |
| SET_109–116 | lilo-overtime-hr-officer-rejection.spec.ts + overtime-setting-retention-final-inspection.spec.ts | Proven | Merge into overtime workflow regression |
| SET_117–124 | tests/infrastructure/overtime-unpaid-until-approved.spec.ts | Proven | Merge into overtime workflow regression |
| SET_125–135 | tests/infrastructure/payroll-existing-run-sod-inspection.spec.ts | Proven; Issue 005 at SET_132 | Merge into payroll approval regression |
| SET_136–143 | tests/infrastructure/payroll-same-user-sod-inspection.spec.ts | Proven | Merge into payroll approval regression |
| SET_144–151 | tests/infrastructure/payroll-single-approver-inspection.spec.ts | NEXT / not yet classified | Merge into payroll approval regression |

## Planned permanent structure

tests/
- smoke/
- regression/
  - setup/
    - employee-setup.spec.ts
    - general-settings.spec.ts
    - contribution-settings.spec.ts
    - filing-approvals.spec.ts
    - overtime-approval-workflow.spec.ts
    - payroll-approval-workflow.spec.ts
- infrastructure/
  - auth-fixture.spec.ts
  - storage-isolation.spec.ts

## Final cleanup checklist

1. Finish proving the remaining Excel scenarios.
2. Create/merge permanent regression files by business area.
3. Replace inspection-only logging with assertions tied to Excel expected results.
4. Preserve manual/external LILO steps as explicitly blocked/manual where automation cannot prove the external system.
5. Run all permanent tests and confirm clean results.
6. Only then remove obsolete TEMP / inspection / control files.
7. Verify package.json scripts such as `test:full` run the permanent suite.
8. Update this map so the team lead can see which Excel scenarios are automated and where.
