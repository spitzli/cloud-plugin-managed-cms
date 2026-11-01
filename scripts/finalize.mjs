#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createManifest } from '../extensions/managed-cms/src/manifest.ts';
const sha = value => createHash('sha256').update(value).digest('hex');
function image(value) {
  if (!/^ghcr\.io\/spitzli\/cloud-plugin-managed-cms(?:-instance)?@sha256:[a-f0-9]{64}$/.test(value ?? '') || /([a-f0-9])\1{63}$/.test(value)) throw Error('Actual immutable CMS image required');
  return value;
}
export function finalize({ pluginImage, instanceImage, sourceSHA, tag }) {
  image(pluginImage); image(instanceImage);
  if (!pluginImage.startsWith('ghcr.io/spitzli/cloud-plugin-managed-cms@') || !instanceImage.startsWith('ghcr.io/spitzli/cloud-plugin-managed-cms-instance@') || !/^[a-f0-9]{40}$/.test(sourceSHA ?? '')) throw Error('Exact component/source identities required');
  const manifest = createManifest(pluginImage);
  if (tag !== 'v' + manifest.version) throw Error('Source release tag must match manifest version');
  const raw = JSON.stringify(manifest, null, 2) + '\n';
  if (Buffer.byteLength(raw) > 65536) throw Error('Registry manifest limit');
  const instance = JSON.stringify({ schemaVersion: 1, component: 'cms-instance', image: instanceImage, sourceRepository: 'https://github.com/spitzli/cloud-plugin-managed-cms', sourceSHA, plugin: manifest.name, version: manifest.version, activationPerformed: false }, null, 2) + '\n';
  const lock = JSON.stringify({ schemaVersion: 1, name: manifest.name, version: manifest.version, protocolVersion: 1, sourceSHA, pluginImage, instanceImage, manifestSha256: sha(raw), descriptorSha256: sha(raw), instanceBindingSha256: sha(instance), registryPublication: 'pending', activationPerformed: false }, null, 2) + '\n';
  const files = { 'tabularium.json': raw, 'managed-cms-universal.json': raw, 'cms-instance-image.json': instance, 'release-lock.json': lock };
  files.SHA256SUMS = Object.entries(files).map(([name, bytes]) => sha(bytes) + '  ' + name).join('\n') + '\n';
  return files;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const files = finalize({ pluginImage: process.env.PLUGIN_IMAGE, instanceImage: process.env.INSTANCE_IMAGE, sourceSHA: process.env.GITHUB_SHA, tag: process.env.GITHUB_REF_NAME });
  await mkdir('release', { recursive: true });
  for (const [name, bytes] of Object.entries(files)) await writeFile('release/' + name, bytes, { flag: 'wx' });
  console.log('Exact CMS component assets prepared; registry publication remains pending.');
}
