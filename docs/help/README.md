# HR PRO QA — Help Center

**This is the documentation home for the HR PRO Playwright automation system.**

The three formats have different purposes, but describe **the same workflow**:

| Resource | When to use it |
| --- | --- |
| **HTML Help Center** — [`index.html`](index.html) | Primary, browser-style guide: install → run → investigate → create |
| **[User Manual in GitHub](USER_MANUAL.md)** | Complete readable instructions tracked alongside the scripts. The Word `.docx` version is supplied in the handoff ZIP for offline and printing |
| **GitHub repository** — [project home](../../README.md) | Actual tests, changes, issue reports and QA execution history |

**How to open the HTML:** GitHub displays HTML files as code by default. Click [index.html](index.html), choose **Download raw file**, then open it in Chrome or Edge. It runs locally and does not need a server. You can also use the downloadable HTML + Word ZIP provided at handoff. The files work best when kept together in the same folder.

**Publishing as a website:** A GitHub Pages address is not configured or verified yet. This is a private repository; do not assume a public link works. If your team later chooses to host the HTML, configure an approved private/internal or public documentation deployment.

## The four actions everyone should learn

1. **Install:** Git + Node.js + `npm ci` + Chromium; confirm the *actual approved test URL*.
2. **Run:** `npm run test:ui:setup`; select a named test.
3. **Verify:** Compare approved requirements with assertions, inspect Expected/Received and persisted data, and classify PASS/defect/test issue/blocked.
4. **Create:** Extend a matching `tests/regression/setup/*.spec.ts`, use `loginAs` and assertions, then record evidence.
5. **Maintain:** Keep test files, logs and documentation aligned through GitHub review.

All steps and tested commands are in [the help center](index.html). No separate 59-row workbook table is needed to operate the system.

## Where ongoing project evidence lives

- [Execution Log](../QA_EXECUTION_LOG.md) — latest runs and evidence.
- [Coverage Tracker](../SETUP_CURRENT_COVERAGE_TRACKER.md) — scenario-level partial coverage and gaps.
- [GitHub Issues](https://github.com/nitsuwa/hr-pro-automation/issues) — confirmed bugs and open questions.

**Last verified combined Setup run: 50 tests executed, 47 passed, 3 failed (2 confirmed application defects + 1 candidate requiring requirement confirmation).** This is the automated check pass count, not 59-group workbook acceptance.

### Accessing each version

- **HTML:** clone/download the repository; open `docs/help/index.html` locally in Chrome/Edge. Keep the `docs/help/assets/` folder alongside it for the illustrations. GitHub's file viewer does **not** render the page as a live website.
- **Word (.docx):** use `HR_PRO_QA_Automation_Manual.docx` from the delivered ZIP (editable offline/print copy). The Word binary is **not currently tracked in the repository**. The [GitHub-readable user manual](USER_MANUAL.md) contains the complete operating procedures.
- **Repository:** this private repo is the source of truth for executable tests, run evidence and open issues. Team members need access.

When workflows change, update the HTML and Markdown manuals and regenerate the Word companion for the next handoff revision.
