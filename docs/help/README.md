# HR PRO QA — Help Center

**This is the documentation home for the HR PRO Playwright automation system.**

The three formats have different purposes, but describe **the same workflow**:

| Resource | When to use it |
| --- | --- |
| **HTML Help Center** — [`index.html`](index.html) | Primary, browser-style guide: install → run → investigate → create |
| **Word User Manual** — `HR_PRO_QA_Automation_Manual.docx` | Offline/printable companion, distributed with the handoff ZIP |
| **GitHub repository** — [project home](../../README.md) | Actual tests, changes, issue reports and QA execution history |

**How to open the HTML:** GitHub displays HTML files as code by default. Click [index.html](index.html), choose **Download raw file**, then open it in Chrome or Edge. It runs locally and does not need a server. You can also use the downloadable HTML + Word ZIP provided at handoff. The files work best when kept together in the same folder.

**Publishing as a website:** A GitHub Pages address is not configured or verified yet. This is a private repository; do not assume a public link works. If your team later chooses to host the HTML, configure an approved private/internal or public documentation deployment.

## The four actions everyone should learn

1. **Install:** Git + Node.js + `npm ci` + Chromium.
2. **Run:** `npm run test:ui:setup`; select a named test.
3. **Investigate:** Inspect Expected/Received, action preview and trace.
4. **Create:** Extend a matching `tests/regression/setup/*.spec.ts`, use `loginAs` and assertions, then record evidence.

All steps and tested commands are in [the help center](index.html). No separate 59-row workbook table is needed to operate the system.

## Where ongoing project evidence lives

- [Execution Log](../QA_EXECUTION_LOG.md) — latest runs and evidence.
- [Coverage Tracker](../SETUP_CURRENT_COVERAGE_TRACKER.md) — scenario-level partial coverage and gaps.
- [GitHub Issues](https://github.com/nitsuwa/hr-pro-automation/issues) — confirmed bugs and open questions.

**Last verified combined Setup run: 50 tests executed, 47 passed, 3 failed (2 confirmed application defects + 1 candidate requiring requirement confirmation).** This is the automated check pass count, not 59-group workbook acceptance.

### Keeping the Word file in sync

The edited Word companion is delivered as `HR_PRO_QA_Automation_Manual.docx` in the downloadable handoff bundle. **It is not yet committed to this GitHub folder.** To make the repository copy complete, upload it into `docs/help/` using GitHub's **Add file → Upload files**, or copy the file to that folder on your local QA branch and commit/push it. Once present, the HTML and Word companions can be downloaded together directly from GitHub.

Keep the Word file's user steps aligned with the HTML. If commands or feature behavior change, update the help center, Word companion and recorded execution evidence together.
