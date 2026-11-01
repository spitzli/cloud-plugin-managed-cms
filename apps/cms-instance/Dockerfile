FROM oven/bun:1.4.3-slim@sha256:14a223fa35747ec728bce300ef85888bc5f7958164d15bbba6a54b22b52a3288 AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 DO_NOT_TRACK=1
COPY . .
RUN bun install --frozen-lockfile --ignore-scripts
RUN bun run --filter @webdock/cms-instance build
RUN rm -rf apps/cms-instance/.next/standalone/node_modules/drizzle-kit apps/cms-instance/.next/standalone/node_modules/esbuild apps/cms-instance/.next/standalone/node_modules/@esbuild apps/cms-instance/.next/standalone/node_modules/payload/node_modules/esbuild apps/cms-instance/.next/standalone/node_modules/payload/node_modules/@esbuild apps/cms-instance/.next/standalone/node_modules/payload/node_modules/tsx
FROM oven/bun:1.4.3-slim@sha256:14a223fa35747ec728bce300ef85888bc5f7958164d15bbba6a54b22b52a3288
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build --chown=65532:65532 /app/apps/cms-instance/.next/standalone ./
COPY --from=build --chown=65532:65532 /app/apps/cms-instance/.next/static ./apps/cms-instance/.next/static
COPY --from=build --chown=65532:65532 /app/apps/cms-instance/.next/migrate.mjs ./migrate.mjs
COPY --from=build /app/LICENSE /app/COMMERCIAL-LICENSING.md /app/NOTICE /usr/share/licenses/webdock/
RUN mkdir -p /data/media /data/transfers && chown -R 65532:65532 /data
USER 65532:65532
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD ["bun","-e","fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["bun","apps/cms-instance/server.js"]
