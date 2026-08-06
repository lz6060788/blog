import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";
import { getLocale } from "next-intl/server";

import { localizedPath } from "@/lib/seo";
import { getPublishedPosts } from "@/server/db/queries/posts";

export interface MilkdownPreviewProps {
  content: string;
  className?: string;
}

const createHeadingId = (text: string, index: number) => {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\u3400-\u9fffA-Za-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || `section-${index + 1}`;
};

const getNodeText = (node: any): string => {
  if (node.type === "text") return node.value || "";
  if (!Array.isArray(node.children)) return "";
  return node.children.map(getNodeText).join("");
};

/** Add stable anchors for the article outline and make images discoverable by the lightbox. */
const rehypeArticleEnhancements = (
  internalPosts: Map<string, { title: string; excerpt: string; category: string; readTime: number }>,
  locale: string,
) => () => (tree: any) => {
  const usedHeadingIds = new Map<string, number>();
  let headingIndex = 0;

  const visit = (node: any) => {
    if (node.type === "element") {
      if (/^h[1-6]$/.test(node.tagName)) {
        const baseId = createHeadingId(getNodeText(node), headingIndex++);
        const occurrence = usedHeadingIds.get(baseId) || 0;
        usedHeadingIds.set(baseId, occurrence + 1);
        node.properties ||= {};
        node.properties.id = occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}`;
      }

      if (node.tagName === "img") {
        node.properties ||= {};
        node.properties.dataZoomable = "true";
        node.properties.tabIndex = 0;
        node.properties.role = "button";
        node.properties.ariaLabel = node.properties.alt
          ? `放大图片：${node.properties.alt}`
          : "放大图片";
      }

      if (node.tagName === "a" && typeof node.properties?.href === "string") {
        const match = node.properties.href.match(/^post:([0-9a-f-]{36})$/i);
        if (match) {
          const post = internalPosts.get(match[1]);
          node.properties ||= {};
          if (post) {
            node.properties.href = localizedPath(locale, `/post/${match[1]}`);
            node.properties.dataInternalPostId = match[1];
            node.properties.dataInternalPostTitle = post.title;
            node.properties.dataInternalPostExcerpt = post.excerpt;
            node.properties.dataInternalPostCategory = post.category;
            node.properties.dataInternalPostReadTime = post.readTime;
          } else {
            node.properties.href = undefined;
            node.properties.dataInternalPostMissing = "true";
            node.properties.title = "引用的文章不存在或尚未发布";
          }
        }
      }
    }

    if (Array.isArray(node.children)) {
      node.children = node.children.map((child: any) => {
        visit(child);
        if (child.type === "element" && child.tagName === "table") {
          return {
            type: "element",
            tagName: "div",
            properties: { className: ["article-table-scroll"] },
            children: [child],
          };
        }
        return child;
      });
    }
  };

  visit(tree);
};

const renderMarkdownToHtml = async (content: string) => {
  const ids = Array.from(content.matchAll(/\]\(post:([0-9a-f-]{36})\)/gi)).map((match) => match[1]);
  const [locale, publishedPosts] = await Promise.all([
    getLocale(),
    ids.length ? getPublishedPosts() : Promise.resolve([]),
  ]);
  const wanted = new Set(ids);
  const internalPosts = new Map(
    publishedPosts
      .filter((post) => wanted.has(post.id))
      .map((post) => [post.id, {
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        readTime: post.readTime,
      }]),
  );
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypePrism, { ignoreMissing: true })
    .use(rehypeArticleEnhancements(internalPosts, locale))
    .use(rehypeStringify)
    .process(content);

  return String(file);
};

export async function MilkdownPreview({
  content,
  className = "",
}: MilkdownPreviewProps) {
  const html = await renderMarkdownToHtml(content);

  return (
    <div className={`markdown-article-wrapper ${className}`}>
      <div
        className="markdown-article"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
