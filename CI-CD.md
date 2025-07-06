# CI/CD Pipeline Documentation

This document describes the CI/CD workflows for the project, implemented using GitHub Actions.

---

## Overview


- **Main CI Pipeline:** `.github/workflows/ci.yml`
- **Secret Scanning:** `.github/workflows/secret-scan.yml`

---

## Main CI Pipeline (`ci.yml`)

### Triggers

- **On push** to `main` or `develop`
- **On pull request** to `main` or `develop`

### Jobs

#### 1. Backend Lint, Format, and Security

- **Tools:** Black (format), Ruff (lint), Bandit (SAST), mypy (type check)
- **Runs on:** `api/` directory
- **Purpose:** Enforces code style, catches security issues, and ensures type safety.

#### 2. Backend Tests

- **Tool:** Pytest
- **Runs on:** `api/tests/`
- **Purpose:** Runs all backend unit and integration tests.

#### 3. Frontend Lint & Format

- **Tools:** ESLint, Prettier
- **Runs on:** Frontend codebase
- **Purpose:** Enforces code style and linting rules.

#### 4. Frontend Type Check

- **Tool:** TypeScript (`tsc`)
- **Purpose:** Ensures type safety in the frontend codebase.

#### 5. Frontend Tests

- **Tool:** Jest (or similar, as configured)
- **Purpose:** Runs all frontend tests. (If not configured, this step is skipped.)

#### 6. Frontend Build

- **Tool:** Next.js build (`npm run build`)
- **Environment:** Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from GitHub secrets.
- **Purpose:** Ensures the frontend builds successfully before deployment.

---

## Secret Scanning (`secret-scan.yml`)

- **Tool:** Gitleaks
- **Runs on:** All pushes and pull requests to `main` and `develop`
- **Purpose:** Scans the entire codebase for accidentally committed secrets (API keys, credentials, etc.).
- **Fail Policy:** The build fails if any secrets are detected.

---

## Best Practices

- **Fail Fast:** The pipeline is designed to catch issues early and prevent bad code from reaching production.
- **Security:** Static analysis and secret scanning are enforced on every change.
- **Type Safety:** Both backend and frontend are type-checked.
- **Code Style:** Formatting and linting are required for both backend and frontend.

---

## Extending the Pipeline

- **Deployment:** Add deployment jobs (e.g., to Vercel, AWS, or Heroku) as needed.
- **Test Coverage:** Upload coverage reports as artifacts or to a dashboard.
- **Notifications:** Integrate with Slack, Teams, or email for build status notifications.

---

*For questions or improvements, see the workflow files or contact the project maintainer.* 