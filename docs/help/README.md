# HR PRO QA Guide

**Website:** https://hr-pro-automation-help.vercel.app

This folder contains the documentation for the HR PRO Playwright testing repository.

| File | Used for |
| --- | --- |
| [index.html](index.html) | Official visual website, hosted on Netlify |
| [USER_MANUAL.md](USER_MANUAL.md) | Written guide for GitHub readers |

**For new QA members:** follow [Project folders](https://hr-pro-automation-help.vercel.app/#structure) → [Install](https://hr-pro-automation-help.vercel.app/#install) → [Ways to run](https://hr-pro-automation-help.vercel.app/#run-options) → [Verify](https://hr-pro-automation-help.vercel.app/#verify) → [Create a test](https://hr-pro-automation-help.vercel.app/#create). Begin with the read-only `SMOKE-018` navigation check.

**For maintainers:** make changes on a branch, review them, and merge into `main`. Netlify redeploys the HTML from `docs/help`. The screenshots/illustrations in the page are embedded, so a separate assets folder is not required.

Repository access is still required to run and maintain the Playwright tests. Do not put credentials, tokens, or real employee data into the public documentation.
