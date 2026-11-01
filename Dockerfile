# Root check target exercises both components; production component Dockerfiles are explicit.
FROM oven/bun:1.4.3-slim@sha256:14a223fa35747ec728bce300ef85888bc5f7958164d15bbba6a54b22b52a3288 AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 DO_NOT_TRACK=1
COPY . .
RUN bun install --frozen-lockfile --ignore-scripts
FROM build AS check
RUN bun run check && bun run test && bun run build
FROM build AS plugin-build
RUN bun run --filter @webdock/plugin-sdk build && bun extensions/managed-cms/build.ts
FROM oven/bun:1.4.3-slim@sha256:14a223fa35747ec728bce300ef85888bc5f7958164d15bbba6a54b22b52a3288
WORKDIR /app
COPY --from=plugin-build --chown=65532:65532 /app/extensions/managed-cms/dist ./
COPY --from=build /app/LICENSE /app/COMMERCIAL-LICENSING.md /app/NOTICE /usr/share/licenses/webdock/
ENV NODE_ENV=production
USER 65532:65532
EXPOSE 3443 3444
CMD ["bun","runtime.js"]
