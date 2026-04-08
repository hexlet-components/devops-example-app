# Plan: migration to Node 24, TypeScript, Playwright, modern lint

## Goals

- Upgrade runtime and infrastructure to Node.js 24 LTS.
- Move application code to TypeScript without changing external behavior.
- Add end-to-end tests with Playwright.
- Update linting to a modern, maintained ESLint setup.
- Keep backward compatibility for routes, startup flow, and environment variables.
- Standardize dependency update workflow with `npm-check-updates`.

## Scope and compatibility constraints

- Keep route contract unchanged: `/` and `/error` must behave identically.
- Keep env contract unchanged: `SERVER_MESSAGE`, `ROLLBAR_TOKEN`.
- Keep startup compatibility: `npm start`, `make start`, Docker run flow from README.
- Keep rendered content and core page assertions stable (existing tests + e2e).

## Step-by-step plan

### 1) Baseline and regression guardrails

- Freeze current behavior with existing unit tests (`jest`) and compatibility checklist.
- Add a compact compatibility matrix (routes, env, startup, docker smoke).
- Ensure current `test` and `lint` pass before migrations.

### 2) Node 24 LTS migration

- Update `package.json` engines to `24.x`.
- Add `.nvmrc` with `24`.
- Update `Dockerfile` base image to `node:24-slim`.
- Validate local + container execution (`make start`, `make compose-test-ci`, `make compose-lint-ci`).

### 3) TypeScript migration (incremental, non-breaking)

- Add `typescript`, `@types/node`, and `tsconfig.json` (ESM / NodeNext setup).
- Add scripts: `build`, `typecheck`.
- Migrate server files to TS first: `server/plugin.*`, `server/routes.*`.
- Preserve runtime behavior and public API/HTTP responses.

### 4) Linter modernization

- Move from legacy `.eslintrc.yml` to ESLint flat config (`eslint.config.js`).
- Update ESLint stack to current supported versions.
- Add TS-aware linting (`typescript-eslint`) + keep Jest/Node rules.
- Port critical existing rules to avoid noisy non-functional churn.

### 5) Add Playwright e2e

- Add `@playwright/test`, `playwright.config.ts`, `e2e/` tests.
- Cover critical flows:
  - main page without `SERVER_MESSAGE`
  - main page with `SERVER_MESSAGE`
  - `/error` page behavior
- Add `test:e2e` script.
- Add CI job for e2e with report artifact.

### 6) Add and formalize npm-check-updates usage

- Ensure `npm-check-updates` is present in dev dependencies (update to current).
- Add scripts in `package.json`:
  - `deps:check` (show outdated deps)
  - `deps:update` (update package.json ranges)
  - `deps:update:interactive` (optional targeted workflow)
- Add `.ncurc.json` policy:
  - default strategy for safe regular updates
  - optional reject list for risky majors (apply selectively)
- Document dependency update workflow in README.

### 7) Dependency upgrade wave and stabilization

- Upgrade dependencies in controlled batches (tooling and runtime separately).
- Treat Fastify ecosystem updates as high-risk and verify with full regression.
- After each batch run: `lint`, `typecheck`, unit tests, e2e tests, docker smoke.
- Update docs/CI configs to reflect final commands and toolchain.

## Recommended PR slicing

1. Node 24 + Docker/CI alignment.
2. TypeScript scaffold + `typecheck`.
3. Server TS migration.
4. ESLint modern config.
5. Playwright e2e + CI integration.
6. `npm-check-updates` scripts + `.ncurc.json` + docs.
7. Dependency major/minor upgrade batches + final regression.

## Definition of Done

- Node 24 is used in local dev, Docker, and CI.
- `lint`, `typecheck`, unit and e2e test suites are green.
- Route/env/startup contracts are unchanged and verified.
- Dependency maintenance workflow with `npm-check-updates` is documented and usable.
