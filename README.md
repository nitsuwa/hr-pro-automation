# HR PRO QA Automation

Automated browser tests for **HR PRO**, built with [Playwright](https://playwright.dev/).

**[HR PRO QA Guide](https://hr-pro-automation.netlify.app)** — the team's main step-by-step training website. No automation experience required.

## Quick start

Install **Git**, **Node.js**, and **VS Code**, then get access to this repository and an approved HR PRO test environment.

Open the VS Code terminal:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
npm ci
npx playwright install chromium
npm run test:ui:smoke
```

In Playwright UI Mode, run **SMOKE-018 (Settings)** first and inspect its actions. Follow the [hands-on test walkthrough](https://hr-pro-automation.netlify.app/#run). To run approved Setup checks, use `npm run test:ui:setup`.

**Before running:** check `playwright.config.ts` and `E2E_BASE_URL` for the correct environment. Some tests change records. Use only approved non-production data, never real employee information.

## Where things are

| Location | Purpose |
| --- | --- |
| [QA Guide](https://hr-pro-automation.netlify.app) | Main documentation website |
| [Setup tests](tests/regression/setup/) | Automated feature checks |
| [Smoke tests](tests/smoke/) | Basic navigation checks |
| [Fixtures & page objects](playwright/) | Shared login and reusable actions |
| [Playwright config](playwright.config.ts) | Environment, browser, and reports |
| [Execution log](docs/QA_EXECUTION_LOG.md) | Detailed QA run records |
| [User manual](docs/help/USER_MANUAL.md) | Written reference |

## Add a test

Use the [guided new-test tutorial](https://hr-pro-automation.netlify.app/#create) for **Excel scenarios or features not in Excel**. It includes a real HR PRO example, locator inspection, an AI prompt, and independent verification.

**Requirement → Inspect HR PRO → Write assertions → Run in UI Mode → Verify results → Pull request.**

Create a new branch from updated `main`, add or change a test, and submit a pull request for team review. Use existing fixtures and tests as examples. For new features, define expected behavior even if no Excel scenario exists.

**Maintaining the guide:** edit `docs/help/index.html` in a reviewed branch. After merging into `main`, Netlify publishes the updated documentation.
