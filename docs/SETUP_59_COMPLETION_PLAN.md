# Plan to reach trustworthy 59/59 Setup scenario coverage

**Status:** Work plan, not an acceptance certificate. **Source:** actual `HR PRO + Set up (1).xlsx` (Set up tab, SET_001–278) and the current [coverage tracker](SETUP_CURRENT_COVERAGE_TRACKER.md).  
**Verified latest combined suite:** operator-reported 19 Oct 2026, **50 Playwright checks / 47 passed / 3 failed**. A passing check is not necessarily full acceptance of an Excel scenario group.

## What “59/59” will mean

**Every workbook group has its requirement reviewed, the right expected outcome checked, and dated evidence.** Complete QA coverage can include a genuine red application defect; it does **not** require making every test green.

For each of the 59 groups, the owner must record:

1. Approved expected behavior, including when the workbook has copied/contradictory steps.
2. Test preconditions, roles, safe data and environment.
3. A Playwright assertion of the **business outcome** (or approved manual/integration evidence where automation is infeasible).
4. Observed UI Mode result and saved evidence; **PASS / PRODUCT DEFECT / TEST ISSUE / BLOCKED / PARTIAL**.
5. Cleanup or isolation notes for data-changing cases.

A script's existence, a green check on a partial assertion, or a console-only inspection is not sufficient for completed acceptance.

## Baseline (before new testing)

| Historical classification | Workbook groups | Meaning |
| --- | ---: | --- |
| Core regression passed | 26 | At least one passing check; must still compare every workbook expected result before sign-off |
| Partial verification | 15 | Material expected results not yet asserted |
| No validated coverage | 15 | Needs real end-to-end check, or accepted alternative evidence |
| Confirmed application defects | 2 | `SET_195`, `SET_211` — retain red assertions |
| Candidate defect | 1 | `SET_227` — requirement decision for Leave Type names |
| **Total** | **59** | |

## Stage A — Quick, high-value acceptance improvements

Prioritize these without creating new duplicate features or overstating results:

| Group(s) | What to verify next | Gate |
| --- | --- | --- |
| `SET_169`, `SET_182` | Current scripts prove duplicate was not saved; also verify actual **visible duplication warning** required by workbook | Capture actual UI feedback first; avoid guessing role/message |
| `SET_219` | Current Holiday duplicate test prevents two saved rows; workbook expects a **confirmation prompt** for a duplicate attempt | Inspect actual prompt and clarify acceptance wording |
| `SET_228`, `SET_229` | Rename and remove already passed using unique QA records | Agree on corrected wording (old sheet copies another feature) and reconcile passed checks |
| `SET_172–176`, `SET_266–268` | Expand assertions for remaining company/employee fields without touching seeded/real records | Actual form inspection and safe reversible data |
| `SET_230–243` | Go beyond salary-structure CRUD: rule selection/order and applicable defaults | Approved rule behavior and UI evidence |
| `SET_185–189` | Expand first-approver persistence to required approval levels and downstream outcome | Multiple controlled roles and real expected routing |

**Prepared next action:** exploratory `tests/infrastructure/setup-duplicate-feedback-probe.spec.ts` captures the actual feedback for `SET_169` and `SET_182` without labeling it PASS. It creates two uniquely named QA records and requires `E2E_APPROVED_MUTATIONS=1` after confirming the environment. The local result is `qa-artifacts/setup-duplicate-feedback.json`. Once reviewed, extend the real regression tests with the verified feedback assertions.

## Stage B — Workflows needing controlled multi-step data

| Group(s) | Dependency |
| --- | --- |
| `SET_032–082` | Statutory contribution tests currently check saved settings, not payroll arithmetic; require approved expected salary/week/tax examples |
| `SET_083–087` | Expand currently partial filing checks to actual required approval outcomes |
| `SET_097–124` | Overtime filing/approval, changes in setting, preservation of earlier decisions and unpaid-unapproved overtime |
| `SET_125–162` | Payroll approval/release, segregation-of-duties and one/two approver workflows; require multiple authorized roles and safe payroll batches |

Do not treat configuration persistence alone as proof of correct payroll computation or authorization behavior.

## Stage C — Scenarios blocked by evidence, environment, or product decisions

| Group(s) | Need before honest completion |
| --- | --- |
| `SET_001–003` | Approved disposable test tenant + restore/reset procedure; shared-data reset is destructive |
| `SET_088–096` | Real or controlled LILO integration evidence |
| `SET_198–205` | Clarification of copied Job Position steps under Work Location scenarios (some may map to existing work-location tests) |
| `SET_220` | Actual Holiday Edit control and authoritative expected behavior; prior UI survey saw no Edit button |
| `SET_275–278` | Product decision for creating a user while editing an employee; current employee editor's Connected User Account field was disabled |
| `SET_195`, `SET_211`, `SET_227` | Fix confirmed defects; confirm Leave Type name uniqueness for candidate. Failed tests remain legitimate evidence |

## Execution method for each batch

1. Take **one** focused group or cohesive small batch.
2. Use the existing script or write a new regression only from **observed UI and approved requirements**.
3. Run only that test in **Playwright UI Mode** against authorized QA data; verify the final state manually when necessary.
4. Classify the outcome correctly; don't weaken expected values to make tests green.
5. Capture evidence and update the [execution log](QA_EXECUTION_LOG.md) and [coverage tracker](SETUP_CURRENT_COVERAGE_TRACKER.md).
6. Only after the batch stabilizes, run the full Setup suite and record new totals.

**Presentation-ready claim today:** The automation framework is working and extensible; 50 implemented checks were executed with 47 passing and 3 known failures. The path to 59 fully evaluated workbook groups is documented. A universal **59/59 PASS** statement is not yet supported.
