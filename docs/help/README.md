# HR PRO QA Guide

**Visual guide:** https://hr-pro-automation-help.vercel.app/

This folder contains the visual HTML guide and a more detailed written manual for the HR PRO Playwright test repository.

| File | What it is |
| --- | --- |
| [index.html](index.html) | Interactive visual guide, published on Vercel and available as a local HTML file |
| [USER_MANUAL.md](USER_MANUAL.md) | Longer reference for GitHub readers |
| [assets/](assets/) | Standalone illustrations used by the repository README |

**For someone new:** Open the [first-run walkthrough](https://hr-pro-automation-help.vercel.app/#beginner-start) → [run one test](https://hr-pro-automation-help.vercel.app/#run) → [learn how to edit a test](https://hr-pro-automation-help.vercel.app/#edit-test-practice). The first test, `SMOKE-001`, checks the HR PRO sign-in screen and needs no credentials.

**For someone creating tests:** The guide shows how to find an existing test, create a new `.spec.ts` file, edit the test name, browser steps, and expected results, then run and inspect the new test. Use a designated practice website with fictional data for tests that change records.

**Offline access:** Save `index.html` and open it in a browser. Its main layout, illustrations drawn inside the HTML, code samples, and interaction controls are local. Some reference screenshots are loaded from external Playwright/GitHub websites, so they may not appear offline. Links to other websites and running Playwright tests still require network access.

**Contributing:** Make changes in a branch and request a review before merging into `main`. The documentation website updates when the repository's deployment publishes the changed HTML. Do not commit credentials or real employee data.
