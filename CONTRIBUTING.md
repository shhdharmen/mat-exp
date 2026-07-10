# Contributing to mat-expressive

Thank you for contributing! This guide covers local development, testing, and running CI/CD workflows locally.

## Table of Contents

- [Development Setup](#development-setup)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Local CI/CD](#local-cicd)
- [Commit Convention](#commit-convention)

## Development Setup

**Prerequisites:** Node.js ≥ 20, npm ≥ 10, Docker Desktop (for local CI)

```bash
git clone https://github.com/Angular-Material-Dev/mat-expressive.git
cd mat-expressive
npm install
```

## Running the Project

The workspace contains two Angular projects: the library and the docs app.

```bash
# Build the library first (required before serving docs)
npm run build:lib

# Serve the docs app on http://localhost:4200
npm start

# Watch-build the library during development
npm run watch:lib
```

## Testing

```bash
# Docs app unit tests (Vitest)
npm test

# Library tests only
ng test --project @ngm-dev/mat-expressive

# Run a single test file
ng test --project mat-expressive-docs --testPathPattern="foo"

# End-to-end tests (Playwright — spins up a dev server automatically)
ng e2e

# Lint
ng lint
```

## Local CI/CD

You can run GitHub Actions workflows locally using [`act`](https://github.com/nektos/act), which executes workflows inside Docker containers.

### Prerequisites

- **Docker Desktop** — must be running before invoking `act`
- **`act`** CLI:
  ```bash
  brew install act
  ```

### Initial Setup

Copy the secrets template and fill in your tokens:

```bash
cp .secrets.example .secrets
```

Edit `.secrets`:

```
GH_TOKEN=<your GitHub personal access token>
NPM_TOKEN=<your npm publish token>
```

> `.secrets` is git-ignored — never commit it.

### Running `test-build-publish` Locally

This workflow runs on every `push` event. Locally it executes a **dry-run** of semantic-release (no publish, no git tags).

```bash
act push
```

Expected: the workflow installs dependencies, builds the library and docs, runs tests, then prints semantic-release analysis without making any changes.

### Running `version-snapshot` Locally

The `version-snapshot` workflow creates a maintenance branch (e.g. `2.x.x`) from a release tag and appends the version to `public/versions.json`. Use the wrapper script to simulate it locally.

**Dry-run (default — no git operations performed):**

```bash
scripts/local-version-snapshot.sh v2.0.0
```

This prints the operations that _would_ run and exits. Use this to verify the tag format and branch name before touching anything.

**Execute mode (performs real git pushes):**

```bash
scripts/local-version-snapshot.sh v2.0.0 --execute
```

You will be prompted to confirm before `act release` runs. This creates and pushes the `2.x.x` branch and updates `versions.json` on `main`.

Tag format must be `vN.0.0` (major-only). Example valid tags: `v2.0.0`, `v3.0.0`.

### Unsupported Workflows

The following workflows cannot be run locally with `act`:

| Workflow | Reason |
|---|---|
| `deploy.yaml` | Requires Vercel deployment infrastructure |
| `close_inactive_issues.yml` | Requires GitHub API scheduling context |

## Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitizen:

```bash
npm run commit
```

Use this instead of `git commit` to get an interactive prompt that formats your message correctly. semantic-release uses commit messages to determine version bumps and generate changelogs.
