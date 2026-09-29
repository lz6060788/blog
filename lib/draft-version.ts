/** Rebase a version only when the server has no unseen edits or visibility changes. */
export function canAdoptDraftVersion(
  baseline: Record<string, unknown>,
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
  previousPublished: boolean,
  remotePublished: boolean,
) {
  if (previousPublished !== remotePublished) return false
  return Object.entries(remote).every(([key, value]) => {
    const sameAsSaved = JSON.stringify(value) === JSON.stringify(baseline[key])
    const knownAI = ['excerpt', 'coverImageUrl', 'aiCoverStatus'].includes(key)
      && JSON.stringify(value) === JSON.stringify(local[key])
    return sameAsSaved || knownAI
  })
}
