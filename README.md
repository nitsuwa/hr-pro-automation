# HR PRO QA Automation

**Playwright + TypeScript** automation for the [HR PRO prototype](https://hrproprototype.netlify.app). The QA team can run existing checks, investigate failures and add new scenarios without rebuilding the project.

## Start here — one connected help center

**[Open the QA Documentation Home](docs/help/README.md)**

- **[HTML Help Center](docs/help/index.html)** — primary, browser-style instructions. Download the HTML and open it in Chrome/Edge; GitHub itself shows HTML source, not the rendered site.
- **[GitHub-readable User Manual](docs/help/USER_MANUAL.md)** — the complete text instructions available in the repository. An editable **Word copy**, `HR_PRO_QA_Automation_Manual.docx`, is included in the delivered handoff ZIP for offline use.
- **This repository** — the single home for test scripts, QA issues, execution history and future updates.

All guides teach the same sequence: **Install → Run → Verify actual results → Create → Maintain**. The emphasis is on human review of requirements, meaningful Playwright assertions, and evidence—not trusting AI-generated scripts blindly. Detailed workbook scenario mapping is kept separate from the everyday guide.

## Quick start

Requires Git, Node.js, VS Code and access to an approved HR PRO testing environment.

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
git fetch origin
git switch --track origin/qa/setup-handoff-2026-10-19
npm ci
npx playwright install chromium
npm run test:ui:setup
```

Use the green ▶ icon beside a single test in Playwright UI Mode. For already cloned repos, check `git status` and your current branch before fetching and merging.

**Safety:** Verify `playwright.config.ts` and the actual `E2E_BASE_URL` before running. The default is the HR PRO prototype; tests may create, edit, or delete persistent shared records. **Never run against unapproved production data.**

## Useful paths

| Path | Purpose |
| --- | --- |
| `tests/regression/setup/` | Permanent Setup regression checks |
| `tests/smoke/` | Basic application/navigation checks |
| `tests/infrastructure/` | Read-only and exploratory inspection scripts, **not** accepted regressions |
| `playwright/pages/` | Reusable page objects |
| `playwright/fixtures/` | Shared login fixture |
| `playwright.config.ts` | Browser and URL configuration |

## Current verification (19 October 2026)

Latest combined Setup UI Mode run: **50 executed, 47 passed, 3 failed**. Two failures are confirmed prototype duplicate-validation defects; a third concerns duplicate Leave Type labels and needs product-owner confirmation. Passing implemented tests **do not** establish full acceptance of the original 59 Setup workbook groups.

- [Execution log](docs/QA_EXECUTION_LOG.md) — dated evidence
- [Workbook coverage tracker](docs/SETUP_CURRENT_COVERAGE_TRACKER.md) — partial and missing requirements
- [Issue reports](https://github.com/nitsuwa/hr-pro-automation/issues) — bug triage

**Next team:** keep the HTML Help Center and [GitHub-readable manual](docs/help/USER_MANUAL.md) in sync when code/commands change; update the offline Word companion at handoff revisions. Keep accepted test evidence in the execution log. HR GO is a **future** workflow; it does not yet have a completed automated suite.
