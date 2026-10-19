# HR PRO Automated QA — Handoff

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

## IMPORTANT — current coverage is incomplete
The workbook contains **59 scenario groups, 278 IDs (SET_001–SET_278)**. As of the 19 October 2026 audit, 9 groups have permanent scripts, 8 have inspection/reference mapping, and 42 lack identified implementation. **No pass/fail execution results were verified by the audit.**

- `tests/infrastructure/` includes exploratory probes; not all are ready as regression tests.
- Contribution tests currently check configuration persistence only; Excel also requests payroll arithmetic.
- LILO may require external/manual evidence.
- SET_001–003 is destructive reset: disposable sandbox only.
- The workbook has ambiguous copied steps around SET_198–205, SET_218–229 and a repeated header at SET_152.
- Full audit and beginner guide are provided in the handoff artifacts.

**Do not call a scenario automated/passed until its expected business result has been asserted and the test has actually passed.**
