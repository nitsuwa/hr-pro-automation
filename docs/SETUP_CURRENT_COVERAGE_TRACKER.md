# Setup Workbook: Provisional Coverage Status (19 October 2026)

**Use for planning and handoff, not as a final sign-off.** The original `HR PRO + Set up (1).xlsx` contains **59 scenario groups across SET_001–SET_278**. This tracker reconciles the Excel group inventory with the local QA execution evidence and test files currently on branch `qa/setup-handoff-2026-10-19`.

## Verified test-run baseline

- **46 Setup Playwright checks executed together** in Chromium UI Mode on 19 October 2026: **44 passed, 2 failed, 0 skipped**.
- The failures are **confirmed HR PRO product behavior**: [duplicate Job Positions (#2)](https://github.com/nitsuwa/hr-pro-automation/issues/2) and [duplicate Work Locations (#3)](https://github.com/nitsuwa/hr-pro-automation/issues/3). **Keep their negative assertions.**
- The 46 Playwright checks **do not correspond one-to-one** with the 59 Excel groups; some groups have several checks and some scripts only validate part of the expected outcome.

## Scenario-level assessment (provisional)

| Classification | Scenario groups | Interpretation |
| --- | ---: | --- |
| Core check passed | 26 | A mapped regression check passed; not automatic certification of every Excel step |
| Partial verification | 12 | At least one relevant check passed, but material required outcomes still need assertions or owner confirmation |
| Defect confirmed | 2 | Negative assertions correctly catch behavior currently failing the workbook requirement |
| No validated coverage | 19 | No dedicated permanent, verified check of the scenario's intended business result |
| **Total** | **59** | |

**Work remaining:** 19 groups do not have dedicated validated coverage; four of those (`SET_198–205`) are contradictory/copy-pasted workbook entries that may be resolved by requirements clarification and mapping to existing Work Location tests. This leaves **up to 15 distinct unaddressed groups** before accounting for the 12 partial ones. **This is NOT a promise that 15 new scripts/files are sufficient**; an individual group may need multiple assertions or manual/external evidence.

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
| 43 | SET_219 | Duplicate holiday | No validated coverage | Clarify copied wording; add QA-only duplicate Holiday regression |
| 44 | SET_220 | Edit holiday | No validated coverage | Clarify copied wording; add QA-only edit Holiday regression |
| 45 | SET_221 | Remove holiday | Partial verification | Holiday removal test passed; worksheet contains contradictory copied wording |
| 46 | SET_222–226 | Create leave type | Core check passed | Existing regression check passed; validate full workbook step mapping before final sign-off |
| 47 | SET_227 | Duplicate leave type | No validated coverage | Clarify copied Holiday wording; add Leave duplicate validation |
| 48 | SET_228 | Edit leave type | No validated coverage | Clarify copied Work Location wording; add Leave edit persistence |
| 49 | SET_229 | Remove leave type | No validated coverage | Clarify copied wording; add Leave removal |
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

1. **Present what is already real:** 46-test UI Mode baseline; 44 green checks; two intentionally failing product defects; setup, execution, trace inspection, and authoring a new test.
2. **Mark exceptions clearly:** statutory calculations are not fully tested by persistence assertions; LILO/overtime/payroll SoD needs real workflow evidence; some workbook steps have copied text.
3. **Do not claim 59 of 59 complete.** Present a maintainable framework and a prioritized backlog for the next QA owner.
4. **Use only authorized prototype/sandbox data.** Some tests modify shared Setup state and create persistent QA records. Repeating duplicate tests creates duplicate catalog entries requiring controlled cleanup.

**Related documents:** [Team Handoff & Live Demo Guide](TEAM_HANDOFF_DEMO_GUIDE.md), [Execution Evidence Log](QA_EXECUTION_LOG.md), [Initial Workbook Audit](SETUP_FULL_WORKBOOK_AUDIT.md).
