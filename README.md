# Managed CMS

Independent source workspace for the existing managed-cms TypeScript protocol-v1
plugin and its separate per-project CMS application. This is not a Rust v2 release.

Run `bun install --ignore-scripts` once and commit the generated `bun.lock`.
Thereafter use `bun install --frozen-lockfile --ignore-scripts`, `bun run check`,
`bun run test`, and `bun run build`. No production credentials are needed to build.
Docker contexts are this repository root with the respective component Dockerfile.
Builds must run locally/in verified EU infrastructure, following owner policy.

The plugin and CMS instance are separate images. Generate a plugin manifest with
`bun extensions/managed-cms/manifest.ts <real-image@sha256:digest> <output.json>`.
Publication, registry signatures, image access and installer compatibility must
be verified separately; this export does not publish or activate anything.

Only the eight listed support packages are included. Core, provider credentials,
runtime state and environment files are excluded. The upstream plugin image-smoke
requires the Core installer, and the bridge PostgreSQL test requires the website
migration: those platform tests are deliberately withheld. Database/image/backup
acceptance remains explicit and uses disposable local fixtures only. Existing
per-project CMS database and retained media must never be reset during export.

See component READMEs for runtime contracts. They retain historical Core-relative
operator links; those paths are not part of this independent repository.

## Independent source and release

Source: https://github.com/spitzli/cloud-plugin-managed-cms. Maintainer pushes and
same-repository PRs use the verified persistent EU runner; fork PRs never run on
it. The root Dockerfile `check` target runs typechecking, unit tests and complete
production builds of both components. Tests needing a real database or deployed
image remain explicit opt-in acceptance checks; no tenant data is used by CI.

A signed `v<version>` source tag builds/pushes separate images:
`ghcr.io/spitzli/cloud-plugin-managed-cms` and
`ghcr.io/spitzli/cloud-plugin-managed-cms-instance`, each with the actual source
repository/revision label. Release assets include identical TS-v1 `tabularium.json`
and `managed-cms-universal.json`, SHA-256 checksums and a separate immutable CMS
instance image binding. The release does not call the registry API, invent a
registry signature or activate any customer instance. Registry admission stays
pending until the owner publishes and verifies its actual signed receipt.

`export-lock.json` preserves the initial export/standalone source snapshots; later
changes are recorded by verified signed Git commits and release image digests.
The two large durable-transfer integration fixtures have explicit 60-second
budgets for their real sequential fsync workload; their assertions, chunk sizes
and retained-receipt capacities remain unchanged.
