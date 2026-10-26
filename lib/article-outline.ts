export interface ArticleOutlineHeading {
  id: string
  text: string
  level: number
}

/** Read live nodes each time: streamed content and refreshes can replace the
 * heading elements without changing the article's title or content length. */
export function measureArticleOutline(article: ParentNode, activationTop = 128): {
  headings: ArticleOutlineHeading[]
  activeId: string
} {
  const elements = Array.from(article.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'))
    .filter((heading) => heading.isConnected && heading.getClientRects().length > 0)
  const headings = elements.map((heading) => ({
    id: heading.id,
    text: heading.dataset.outlineTitle?.trim() || heading.textContent?.trim() || heading.id,
    level: Number(heading.tagName.slice(1)),
  }))
  let activeId = headings[0]?.id || ''
  for (const heading of elements) {
    if (heading.getBoundingClientRect().top > activationTop) break
    activeId = heading.id
  }
  return { headings, activeId }
}
