# Why the 59-Group Setup Workbook Is Not Yet 100% Automated

**HR PRO QA — Scope explanation, remaining requirements, and demonstration plan**  
**Last verified run:** 19 October 2026  
**Repository branch:** `qa/setup-handoff-2026-10-19`

> **Bottom line:** The Playwright framework and its 50-test Setup regression suite are operational and have been executed together: **47 passed, 3 failed**. Two failures are confirmed application duplicate-validation defects and one is a candidate Leave Type uniqueness defect awaiting a requirements decision. **This is not a 59-of-59 workbook acceptance sign-off.** The repository includes a mapped backlog so subsequent QA staff can continue testing without starting over.

## 1. A clear, defensible explanation for the team lead

The 59 Setup workbook groups cover **different levels of testing**, not 59 identical button-click scripts. Some test ordinary Setup screens, while others require cross-module actions, payroll computations, multiple user roles, LILO-originated time records, or destructive company-data resets. Several Excel groups also contain repeated or copied instructions that conflict with their headings.

During the OJT automation work we **prioritized reproducible end-to-end checks**, stable page objects, real UI assertions, and evidence-backed defect reporting. Creating superficial scripts for every line would have overstated quality without confirming the payroll or approval outcomes that those scenarios actually require.

**What is delivered now:** an executable Playwright/TypeScript project, working UI Mode demonstrations, login fixtures/page objects, 50 implemented Setup test checks, GitHub defect reports, and documentation describing how to add the remaining tests. **What is not yet delivered:** complete acceptance coverage for all 59 groups, verified external LILO workflows, all payroll calculations and approval restrictions, and an HR GO regression suite.

The unfinished scenarios are **identified technical requirements and test dependencies**, not automatically application failures. Their status must remain visible until a valid test or other agreed evidence is available.

## 2. Why specific workbook scenarios remain incomplete

| Reason | Excel scenarios | What blocks full acceptance | What the next QA owner needs |
| --- | --- | --- | --- |
| **External source / integration** | **SET_088–096**, LILO overtime | The scenario involves an external LILO source or imported attendance events. A local HR PRO UI inspection cannot establish that a real originating overtime event was created, transferred and approved correctly. | Access to a controlled LILO/test integration or agreed manual upstream evidence, sample attendance data and an expected approval outcome |
| **Business calculations, not just settings** | **SET_032–082**, weekly statutory contributions | Current tests validate how contribution options are saved. They do **not** fully prove the resulting payroll deductions for weekly, four-/five-week or selected-week schedules. | Approved payroll examples, employee salary fixtures, cutoff dates, deduction/tax expectations and calculation evidence |
| **Multi-role approval and payroll state** | **SET_097–162**, overtime/approval/release workflows | End-to-end outcomes depend on different user roles, filings, approvals, payroll state and segregation-of-duties rules. Simply opening a settings page is not sufficient proof. Some rows have repeated headers. | Named test roles, approval matrix, seeded test payroll, permitted non-production release actions, expected permissions and boundary cases |
| **Ambiguous or copied workbook instructions** | **SET_198–205**; copied language in **SET_218–229**; repeated header at **SET_152** | Some step text refers to Job Positions or Work Locations even when a different heading is being tested. Guessing an expected result might validate the wrong behavior. | Team lead/product owner to confirm authoritative scenario wording, then map or write only the necessary additional checks |
| **Destructive or shared-state changes** | **SET_001–003** reset; portions of employee/account and payroll flows | A reset or payroll mutation can affect other shared test records; browser isolation does not undo persisted application data. | Disposable environment, permission to reset, backup/restore plan, approved cleanup and repeatable fixtures |
| **Feature/role UI still needs confirmation** | **SET_275–278**, creating user account while editing an employee | The inspected employee editor showed `Connected User Account` as disabled; the enrollment flow (`SET_271–274`) already supports account creation, but that is a different requirement. We have not verified an edit-time account-creation action. | Product-owner confirmation of intended edit-time behavior and where the corresponding control should appear |
| **Partial assertions on already automated screens** | **SET_169**, **SET_182**, **SET_185–189**, **SET_230–243**, **SET_266–268** | Examples: duplicate prevention checked by saved row count but user-visible error messages not yet asserted; one department approver persists but all levels and filing outcomes are not covered; some structure/employee fields lack full assertions. | Enhance existing passing tests with the missing business assertions rather than making unnecessary duplicate scripts |
| **Application behavior fails requirements** | **SET_195**, **SET_211**; potential **SET_227** | Identical Job Position and Work Location entries were allowed (confirmed defects). Leave Types allowed identical labels with different autogenerated codes; label uniqueness still needs owner approval. | Product fixes for confirmed defects, a decision on Leave Type label uniqueness, and re-execution of the unchanged negative tests |

**Status vocabulary to use in documentation:**
- **Passing automated check:** the implemented Playwright assertion passed in a verified run.
- **Partial workbook coverage:** at least one related check passed, but not all expected results were validated.
- **Confirmed defect:** reproducible application behavior violates an accepted requirement.
- **Candidate defect:** unexpected behavior observed; rule needs confirmation or more evidence.
- **Not yet automated / blocked / manual evidence:** no verified end-to-end assertion for the scenario. Do not call this “passed” or “failed.”

## 3. Why 50 tests does not equal 50 of the 59 workbook groups

One workbook group may contain several actions and outcomes, while a single Playwright test may exercise only some of them. For example, `SET_185–189` requires assigning approvers and validating approval routing. The implemented test verifies that a **first-level approver saved on a newly created QA department and persisted after reopening**. It does not prove every level of every approval type or a complete downstream filing.

Likewise, the contribution tests prove **configuration persistence**, but not the complete payroll arithmetic. These are useful passing tests that should remain, with their **partial** limits explicitly stated.

See [Setup Coverage Tracker](SETUP_CURRENT_COVERAGE_TRACKER.md) for each group and [QA Execution Log](QA_EXECUTION_LOG.md) for dated evidence.

## 4. Recommended live demo: extend an unfinished Excel scenario

**Chosen scenario: SET_169 — Duplicate Loan Source, user-visible feedback.**

Why this is the best training example:
- The existing `SET-LOANS-002` regression test **already passes** when it checks that the application does not persist a second Loan Source.
- The workbook's requirement for a **visible duplicate message** has **not** been explicitly asserted yet.
- It uses a uniquely generated `QA Dup Loan...` value, so no seeded company entry has to be changed.
- The demonstration teaches how to **extend** a valid test with a missing acceptance criterion rather than rebuild an entire new test file.

### Demo sequence (about 8–10 minutes)

1. **Open the Excel scenario:** Show `SET_169`. Identify the steps, expected outcome “duplicate entry prevented” and the additional visible error-message expectation. Separate the verified part from the missing part.
2. **Show the existing script:** Open `tests/regression/setup/catalog-duplicates.spec.ts`; find `SET-LOANS-002`. Point out the login fixture, a unique `QA Dup Loan` name, the second Add attempt and the `toHaveCount(1)` persistence assertion.
3. **Run it in UI Mode:** In a terminal run `npm run test:ui:setup`, filter `SET-LOANS-002`, run that one test only. Explain the action trace and the observed result.
4. **Inspect actual app feedback:** At the duplicate attempt, inspect the browser accessibility snapshot/trace or run the flow in a controlled QA session. Is there an `alert`, `status`, inline validation text, disabled Add button, or no visible feedback? Do not guess.
5. **Write the missing assertion ONLY when grounded in the observed UI:** For example, *if and only if* the app exposes an alert reading “Already exists”, an assertion might be `await expect(page.getByRole('alert')).toContainText(/already exists/i)`. This example is illustrative, **not a verified locator or actual error string**.
6. **Rerun and classify:** If it passes, record the expanded accepted behavior. If duplicate entry is prevented without a required visible message, report a new **candidate business-acceptance gap**. If the requirement is ambiguous, ask the owner rather than force a green test.
7. **Update evidence:** Document the test ID, script, intended expectation, UI Mode result, screenshot/trace, and remaining requirement in `docs/QA_EXECUTION_LOG.md` and this coverage tracker.

**Presenter note:** Do not promise the newly written assertion will pass in a live demo. Demonstrate the **method**, and keep the currently passing `SET-LOANS-002` as the reliable backup.

### The 6-step QA authoring method to teach

```text
Excel group & expected result
          ↓
Confirm requirements and prerequisites
          ↓
Inspect real application UI and test data
          ↓
Write/update Playwright test + reusable page object
          ↓
Run in UI Mode; inspect assertion and saved outcome
          ↓
Classify PASS / product defect / test issue / blocked, then update GitHub
```

### An alternative “blocked” example for a short Q&A

**SET_275–278 — Create an employee user account during editing**. Show the workbook expectation, compare it with the passing **enrollment account** script `employee-user-creation.spec.ts`, then show the employee editor's currently disabled `Connected User Account` field. Ask whether edit-time creation belongs in Users & Access, the employee editor, or is not supported. Until the intended workflow is confirmed, label this **unverified/blocked**—do not invent an interactive button or mark the feature broken.

### Show a genuinely failing test to explain QA value

Run or open the *existing recorded trace* for `SET-JOBPOS-002 / SET_195` (GitHub issue #2). Expected one Job Position, observed two. Emphasize that the test should **remain red** until the application prevents duplicates; never change `toHaveCount(1)` to `toHaveCount(2)` just to increase the pass rate. To avoid creating duplicate QA records again during a presentation, an existing trace/screenshot is safer than rerunning it.

## 5. Suggested presentation wording

> “We completed a reusable Playwright QA automation framework for HR PRO. In our latest combined Setup run, 50 implemented checks executed: 47 passed and three failed. Two failures revealed confirmed duplicate-validation defects, while the third is a potential Leave Type uniqueness issue that needs a requirement decision.
>
> The original workbook has 59 groups, but not all can be considered complete just because we have 50 automated checks. Some requirements need payroll calculations, additional approval roles, external LILO data, or clarified instructions. We kept those items visible in a coverage tracker rather than claiming tests we haven't validated.
>
> The repository and this guide let the next QA team reuse the current tests and extend missing cases. In today's demonstration, we'll take one partially covered Excel scenario, inspect its actual HR PRO behavior, add an assertion, run it in Playwright UI Mode, and record the result. The same process can be used when developing future HR GO tests.”

## 6. Handoff expectations and acceptance questions

| Audience question | Precise answer |
| --- | --- |
| “Why aren't all 59 scenarios finished?” | They are not equally automatable with today's available fixture data and confirmed requirements. We delivered and executed a stable core framework, preserved failures, and specified the remaining technical dependencies rather than fabricating success. |
| “Are the 50 tests all passing?” | **No.** Latest combined run: **47 pass, 3 fail**; two are confirmed application defects and one is a candidate pending a uniqueness rule decision. |
| “Is 47/50 the workbook completion percentage?” | **No.** It is the pass rate among implemented automated checks. The 59 Excel groups require separate acceptance mapping. |
| “Can the next QA staff write scripts without the OJT team?” | **Yes, using documented setup, existing fixtures/page objects, known working examples, UI Mode and a standard evidence workflow.** Some advanced cases still require product-owner input and test environment setup. |
| “Did you automate HR GO?” | **No.** HR GO is a proposed next workflow; the guide demonstrates how to add a separate HR GO test folder and scenarios. |
| “What is the most important next action?” | Confirm remaining acceptance criteria and test dependencies, then implement high-priority missing business outcomes, particularly payroll arithmetic and cross-role approvals. |

## 7. Before Wednesday's live presentation

- Confirm the branch and test URL, and that QA records may safely be created in the demonstration environment.
- Save screenshots or reports of the **50/47/3** combined run and the confirmed duplicate defect.
- Use one stable passing test for the live UI Mode run; use traces to show the known red test.
- Bring the workbook and coverage tracker to explain why passing checks are not equivalent to complete acceptance.
- Demonstrate **one extension** to `SET_169` only after inspecting the actual UI feedback; do not improvise an unverified locator.
- Leave the documented known gaps, requirements decisions, and GitHub issues for the next maintainer.

**Related material:** [Handoff Guide](TEAM_HANDOFF_DEMO_GUIDE.md), [Current Coverage Tracker](SETUP_CURRENT_COVERAGE_TRACKER.md), [Execution Log](QA_EXECUTION_LOG.md). The purpose is a maintainable, honest QA handoff—not a cosmetically green report.
