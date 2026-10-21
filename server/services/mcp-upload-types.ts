export const FILE_EXTENSION_BY_MIME = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/gif', 'gif'],
  ['image/webp', 'webp'],
  ['audio/mpeg', 'mp3'],
  ['audio/ogg', 'ogg'],
  ['audio/wav', 'wav'],
  ['audio/x-wav', 'wav'],
  ['audio/flac', 'flac'],
  ['audio/mp4', 'm4a'],
  ['audio/aac', 'aac'],
  ['video/mp4', 'mp4'],
  ['video/quicktime', 'mov'],
  ['video/webm', 'webm'],
  ['application/pdf', 'pdf'],
  ['application/msword', 'doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
  ['text/plain', 'txt'],
  ['text/markdown', 'md'],
  ['text/html', 'html'],
])

export function mcpUploadExtensionForMimeType(mimeType: string): string | undefined {
  return FILE_EXTENSION_BY_MIME.get(mimeType.split(';', 1)[0]?.trim().toLowerCase() || '')
}
