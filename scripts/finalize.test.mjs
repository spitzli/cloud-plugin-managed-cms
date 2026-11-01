import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { finalize } from './finalize.mjs';
const options = { pluginImage: 'ghcr.io/spitzli/cloud-plugin-managed-cms@sha256:' + '1234567890abcdef'.repeat(4), instanceImage: 'ghcr.io/spitzli/cloud-plugin-managed-cms-instance@sha256:' + 'fedcba0987654321'.repeat(4), sourceSHA: 'b'.repeat(40), tag: 'v0.1.0-alpha.1' };
test('release bytes bind both actual images and preserve TS-v1 identity without inventing registry trust', () => {
  const files = finalize(options), manifest = JSON.parse(files['tabularium.json']), lock = JSON.parse(files['release-lock.json']);
  assert.equal(files['tabularium.json'], files['managed-cms-universal.json']);
  assert.equal(manifest.protocolVersion, 1);
  assert.equal(manifest.image, options.pluginImage);
  assert.equal(JSON.parse(files['cms-instance-image.json']).image, options.instanceImage);
  assert.equal(lock.manifestSha256, createHash('sha256').update(files['tabularium.json']).digest('hex'));
  assert.equal(lock.registryPublication, 'pending');
  assert.equal(lock.activationPerformed, false);
  assert.equal('jws' in lock, false);
});
test('mutable images, placeholders, swapped components and mismatched source tag fail closed', () => {
  for (const patch of [{ pluginImage: 'ghcr.io/spitzli/cloud-plugin-managed-cms:latest' }, { instanceImage: 'ghcr.io/spitzli/cloud-plugin-managed-cms-instance@sha256:' + '0'.repeat(64) }, { pluginImage: options.instanceImage }, { tag: 'v9.0.0' }, { sourceSHA: 'main' }])
    assert.throws(() => finalize({ ...options, ...patch }));
});
