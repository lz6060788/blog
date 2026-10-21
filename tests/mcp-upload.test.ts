import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mcpUploadExtensionForMimeType } from '../server/services/mcp-upload-types'

test('MCP uploads recognize HTML MIME parameters and retain an HTML extension', () => {
  assert.equal(mcpUploadExtensionForMimeType('text/html'), 'html')
  assert.equal(mcpUploadExtensionForMimeType('text/html; charset=utf-8'), 'html')
  assert.equal(mcpUploadExtensionForMimeType('application/x-html'), undefined)
})
