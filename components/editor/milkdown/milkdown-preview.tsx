import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";

export interface MilkdownPreviewProps {
  content: string;
  className?: string;
}

const renderMarkdownToHtml = async (content: string) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypePrism, { ignoreMissing: true })
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
    <div className={`milkdown-preview-wrapper ${className}`}>
      <div className="milkdown">
        <div className="editor" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
