# HR PRO QA Automation

**New to the project? Start here.** This repository contains automated browser tests for HR PRO. A test follows steps in the application and checks whether the expected result happened.

## Choose what you need

| I want to… | Go here |
| --- | --- |
| **Learn with pictures and short steps** | [HTML Help Center](docs/help/index.html) |
| **Read a simple guide on GitHub** | [User Manual](docs/help/USER_MANUAL.md) |
| **Print or share instructions** | `HR_PRO_QA_Automation_Manual.docx` in the handoff ZIP |
| **See test scripts** | [Setup tests](tests/regression/setup/) |
| **See test results or known problems** | [Execution log](docs/QA_EXECUTION_LOG.md) · [Issues](https://github.com/nitsuwa/hr-pro-automation/issues) |

**HTML access:** GitHub shows the HTML source instead of a normal website. After cloning the repo, open `docs/help/index.html` in Chrome or Edge. Keep the `assets` folder beside it. There is no confirmed live documentation website.

## First time? Do these 3 things

1. Install **Git, Node.js, and Visual Studio Code**. Get access to this **private repository** and an **approved HR PRO test environment**.
2. Follow the [step-by-step setup instructions](docs/help/USER_MANUAL.md#2-set-up-on-your-computer).
3. In VS Code, run `npm run test:ui:setup`, select **one** test, and click **▶ Run**.

**Before running tests:** Check the actual URL configured in `playwright.config.ts` or `E2E_BASE_URL`. Its default is the HR PRO prototype. Tests may change saved records; use only an approved test environment and fictional data.

## How QA work continues after handoff

**Requirement → Inspect HR PRO → Write or update test → Run it → Verify real result → Save evidence → Share changes for review.**

Use the [User Manual](docs/help/USER_MANUAL.md#5-create-your-first-test) for the beginner steps and [GitHub workflow](docs/help/USER_MANUAL.md#6-share-a-test-through-github) for adding future tests safely.

**Last reported full Setup run (19 Oct 2026): 50 checks, 47 passed, 3 failed.** Two failures are confirmed duplicate-validation defects; one Leave Type duplicate-label issue needs a requirements decision. This is **not** full acceptance of all 59 workbook groups. Technical details remain in the [coverage tracker](docs/SETUP_CURRENT_COVERAGE_TRACKER.md).

**Maintainers:** Update the HTML and GitHub manual when workflows change, then refresh the offline Word copy for the next handoff.
