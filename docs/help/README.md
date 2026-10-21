# HR PRO QA Help Center

**Use one guide, in the format that suits you.**

| Format | Purpose | How to open |
| --- | --- | --- |
| **[Official HTML Help Center](https://gleaming-muffin-23e8b0.netlify.app)** | Main beginner-facing documentation website | Open online; an offline copy lives at `docs/help/index.html` with embedded illustrations |
| **[User Manual](USER_MANUAL.md)** | Short written steps with copyable commands | Open it directly on GitHub |
| **[Repository](../../README.md)** | Actual code and maintenance history | Use GitHub or VS Code with repository access |

The Help Center is hosted on Netlify at https://gleaming-muffin-23e8b0.netlify.app. The **GitHub repository remains private**, so team members need repository access to run or maintain tests. A public help website does not grant access to private source code.

## What to learn

**Set up → Run a test → Verify its result → Create or test a new feature → Share it for review.**

- Just running tests? Start with [Setup](USER_MANUAL.md#1-first-time-setup) and [Run](USER_MANUAL.md#2-run-one-test).
- Writing tests? Continue to [Verify](USER_MANUAL.md#3-verify-what-really-happened) and [Create](USER_MANUAL.md#4-add-a-new-test).
- Testing something not in Excel? See [New features](USER_MANUAL.md#5-test-a-feature-that-isnt-in-excel).
- Maintaining the project? Read [Share through GitHub](USER_MANUAL.md#6-share-a-test-through-github).

### Where to find the details

- [Test execution log](../QA_EXECUTION_LOG.md) — evidence and past runs
- [Issue tracker](https://github.com/nitsuwa/hr-pro-automation/issues) — bugs and questions
- [Workbook coverage](../SETUP_CURRENT_COVERAGE_TRACKER.md) — requirements still needing more checks

The HTML Help Center is the **official user guide**. The GitHub manual supplements it with copyable text; the repository provides the actual Playwright scripts. Maintain them together, not as separate systems.
