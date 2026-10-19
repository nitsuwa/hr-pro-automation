# HR PRO Automated QA — Handoff

> **New to the QA project?** Start with the [simple 5-minute user guide](docs/START_HERE.md): install, run a test, read results, and add your own scripts. The full 59-group audit is tracked separately for maintainers.

This project uses Playwright and TypeScript to automate the HR PRO prototype (default URL: https://hrproprototype.netlify.app).

## Set up on a new computer
1. Install Git and Node.js.
2. Ask the repo owner to grant access to this private repository.
3. Run:

```bash
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
npm ci
npx playwright install chromium
```

## Run tests

```bash
npm run test:smoke                # login & navigation
npm run test:setup                # permanent Setup scenarios only
npm run test:full                 # stable smoke + regression only
npm run test:report               # view HTML report
npm run test:exploratory          # TEMP/inspection tests; NOT an acceptance suite
```

To run one scenario: `npx playwright test tests/regression/setup/general-settings.spec.ts -g "SET-CONFIG-001" --project=chromium`

The default URL and environment can be overridden using shell variables `E2E_BASE_URL` and `E2E_ENV`. The .env file is not automatically loaded by Playwright in the current configuration.

## How to add a test
1. Find an Excel group (not an individual step) in the Setup workbook's **Set up** tab, e.g. SET_004–009.
2. Write down **actual** expected results and required seeded test data.
3. Add an assertion-based test in `tests/regression/setup/`. Reuse `playwright/pages/` and `playwright/fixtures/hrpro.fixture.ts`.
4. Verify actual saved behavior (often refresh and re-open), not merely a successful button click.
5. Run the named test; capture the Playwright report and update the test map.
6. Ensure tests can be re-run without damaging other data.

## Team handoff and current results

**Start here:** [Team Handoff & Live Demo Guide](docs/TEAM_HANDOFF_DEMO_GUIDE.md) — setup, UI Mode, adding tests, defect triage, demonstration, and next-team maintenance.

**Latest full Setup suite (19 October 2026, operator-reported): 50 executed, 47 passed, 3 failed — 94.0% of implemented checks passed.** See [QA Execution Evidence Log](docs/QA_EXECUTION_LOG.md). Two confirmed application defects: [duplicate Job Positions](https://github.com/nitsuwa/hr-pro-automation/issues/2) and [duplicate Work Locations](https://github.com/nitsuwa/hr-pro-automation/issues/3). A third failure, [duplicate Leave Type labels](https://github.com/nitsuwa/hr-pro-automation/issues/4), is a **candidate** pending requirement confirmation. **The 47 passing tests do not establish full coverage of all 59 workbook groups.**

- `npm run test:ui:setup`: recommended for visual, per-test execution and presentation.
- `tests/infrastructure/`: exploratory probes; do not count these as accepted regression tests.
- Statutory contribution persistence is tested, but requested payroll arithmetic remains incomplete; LILO may require external/manual evidence.
- SET_001–003 is a destructive reset: use a disposable sandbox only.
- The workbook has ambiguous copied steps around SET_198–205 and SET_218–229, and a repeated header at SET_152.
- See [the 59-group coverage tracker](docs/SETUP_CURRENT_COVERAGE_TRACKER.md), [explanation of incomplete groups and live test-authoring demo](docs/WORKBOOK_GAPS_AND_TEST_AUTHORING_DEMO.md), and [the original workbook audit](docs/SETUP_FULL_WORKBOOK_AUDIT.md) for source ambiguities.

**Do not mark an Excel scenario as fully automated/passed until all its required business outcomes are asserted and execution evidence exists.**
