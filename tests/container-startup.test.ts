import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

const shell = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : '/bin/sh'
const entrypoint = resolve('docker/entrypoint.sh')
const skip = existsSync(shell) ? false : 'POSIX shell unavailable; install Git Bash on Windows'

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'blog-startup-test-'))
  mkdirSync(join(directory, 'bin'))
  writeFileSync(join(directory, 'bin/node'), `#!/bin/sh
case "$1" in
  *drizzle-kit*) echo migrate >> events; exit "\${MIGRATE_EXIT:-0}" ;;
  *next*) echo "start:\${NODE_OPTIONS:-}" >> events ;;
  *) exit 99 ;;
esac
`, { mode: 0o755 })
  writeFileSync(join(directory, 'bin/npm'), `#!/bin/sh
echo "build:\${NODE_OPTIONS:-}" >> events
mkdir -p .next
echo partial-or-complete-build > .next/BUILD_ID
exit "\${BUILD_EXIT:-0}"
`, { mode: 0o755 })
  return {
    directory,
    run(extra: Record<string, string> = {}) {
      return spawnSync(shell, ['-c', 'PATH="$PWD/bin:$PATH"; export PATH; exec sh "$1"', 'startup-test', entrypoint], {
        cwd: directory,
        env: { ...process.env, NODE_OPTIONS: '', BLOG_BUILD_HEAP_MB: '', ...extra },
        encoding: 'utf8',
      })
    },
    events() { return readFileSync(join(directory, 'events'), 'utf8').trim().split(/\r?\n/) },
    cleanup() {
      // Delete only this fixture's known, generated directory inside the temp root.
      assert.equal(dirname(resolve(directory)), resolve(tmpdir()))
      assert.ok(basename(directory).startsWith('blog-startup-test-'))
      rmSync(directory, { recursive: true, force: true })
    },
  }
}

test('first startup builds once; restart migrates but reuses only a completed build', { skip }, () => {
  const f = fixture()
  try {
    const first = f.run()
    assert.equal(first.status, 0, first.stderr)
    assert.deepEqual(f.events(), ['migrate', 'build: --max-old-space-size=1024', 'start:'])
    const second = f.run()
    assert.equal(second.status, 0, second.stderr)
    assert.equal(f.events().filter((event) => event.startsWith('build:')).length, 1)
    assert.equal(f.events().filter((event) => event === 'migrate').length, 2)
  } finally { f.cleanup() }
})

test('a killed build never starts the app or marks partial output as reusable', { skip }, () => {
  const f = fixture()
  try {
    assert.equal(f.run({ BUILD_EXIT: '137' }).status, 137)
    assert.equal(existsSync(join(f.directory, '.next/BUILD_ID')), true)
    assert.equal(existsSync(join(f.directory, '.next/.startup-build-complete')), false)
    assert.equal(f.events().some((event) => event.startsWith('start:')), false)
    assert.equal(f.run().status, 0)
    assert.equal(f.events().filter((event) => event.startsWith('build:')).length, 2)
  } finally { f.cleanup() }
})

test('migration failure blocks startup even with a completed build', { skip }, () => {
  const f = fixture()
  try {
    assert.equal(f.run().status, 0)
    assert.equal(f.run({ MIGRATE_EXIT: '23' }).status, 23)
    assert.equal(f.events().at(-1), 'migrate')
    assert.equal(f.events().filter((event) => event.startsWith('start:')).length, 1)
  } finally { f.cleanup() }
})

test('build heap override preserves existing node flags and does not constrain the server', { skip }, () => {
  const f = fixture()
  try {
    assert.equal(f.run({ BLOG_BUILD_HEAP_MB: '1280', NODE_OPTIONS: '--trace-warnings' }).status, 0)
    assert.deepEqual(f.events(), ['migrate', 'build:--trace-warnings --max-old-space-size=1280', 'start:--trace-warnings'])
  } finally { f.cleanup() }
})
