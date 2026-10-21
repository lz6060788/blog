"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  BookOpenText,
  CornerDownLeft,
  FileText,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import type { Ctx } from "@milkdown/kit/ctx";
import { Crepe } from "@milkdown/crepe";
import { highlight, highlightPluginConfig } from "@milkdown/plugin-highlight";
import { createParser } from "@milkdown/plugin-highlight/shiki";
import { replaceAll } from "@milkdown/kit/utils";
import { commandsCtx, editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { clearTextInCurrentBlockCommand, linkSchema } from "@milkdown/kit/preset/commonmark";
import { getSingletonHighlighter } from "shiki";
import { uploadFile as uploadAssetFile } from "@/lib/api/upload";
import { getInternalPostOptions } from "@/server/actions/posts";
import { getEditorHighlightLanguage } from "@/lib/editor-highlight-language";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const uploadImageToCos = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("仅支持图片文件");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("图片不能超过 10MB");
  }
  const result = await uploadAssetFile({ file });
  return result.url;
};

export interface MilkdownEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  insertMarkdown: (content: string) => void;
  replaceMarkdownRange: (range: { from: number; to: number }, content: string) => void;
  getHeight: () => number;
}

export type EmbedDialogKind = "video" | "audio" | "html" | "webpage";

export interface EmbedDialogRequest {
  kind: EmbedDialogKind;
  source?: string;
  range?: { from: number; to: number };
}

export interface MilkdownEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  height?: string;
  className?: string;
  theme?: "light" | "dark";
  onOpenEmbedDialog?: (request: EmbedDialogRequest) => void;
}

interface InternalPostOption {
  id: string;
  title: string;
  excerpt: string;
  category: string | null;
}

interface InternalPostTrigger {
  mode: "insert" | "replace";
  from: number;
  to: number;
  query: string;
  alias: string;
  left: number;
  top: number;
}

interface InternalPostLinkPreview {
  id: string;
  from: number;
  to: number;
  label: string;
  left: number;
  top: number;
}

export const MilkdownEditor = forwardRef<MilkdownEditorRef, MilkdownEditorProps>(
  (
    {
      initialValue = "",
      onChange,
      height,
      className = "",
      theme = "light",
      onOpenEmbedDialog,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Crepe | null>(null);
    const onChangeRef = useRef(onChange);
    const onOpenEmbedDialogRef = useRef(onOpenEmbedDialog);
    const currentContentRef = useRef(initialValue);
    const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [selectedEmbedBlock, setSelectedEmbedBlock] = useState<{
      kind: EmbedDialogKind;
      source: string;
      range: { from: number; to: number };
      left: number;
      top: number;
    } | null>(null);
    const [uploadingImageCount, setUploadingImageCount] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [internalPostTrigger, setInternalPostTrigger] =
      useState<InternalPostTrigger | null>(null);
    const [internalPostOptions, setInternalPostOptions] = useState<
      InternalPostOption[]
    >([]);
    const [internalPostCatalog, setInternalPostCatalog] = useState<
      InternalPostOption[] | null
    >(null);
    const [internalPostLoading, setInternalPostLoading] = useState(false);
    const [internalPostActiveIndex, setInternalPostActiveIndex] = useState(0);
    const [internalPostLinkPreview, setInternalPostLinkPreview] =
      useState<InternalPostLinkPreview | null>(null);
    const internalPostTriggerRef = useRef<InternalPostTrigger | null>(null);
    const internalPostOptionsRef = useRef<InternalPostOption[]>([]);
    const internalPostActiveIndexRef = useRef(0);
    const dismissedInternalPostFromRef = useRef<number | null>(null);
    const internalPostLinkPreviewRef =
      useRef<InternalPostLinkPreview | null>(null);
    const internalPostPreviewCloseTimerRef = useRef<number | null>(null);
    const internalPostPreviewHoverRef = useRef(false);
    const detectInternalPostTriggerRef = useRef<(() => void) | null>(null);

    const handleImageUpload = useCallback(async (file: File) => {
      setUploadError(null);
      setUploadingImageCount((count) => count + 1);

      try {
        return await uploadImageToCos(file);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "图片上传失败，请稍后重试";
        setUploadError(message);
        throw error;
      } finally {
        setUploadingImageCount((count) => Math.max(0, count - 1));
      }
    }, []);

    const replaceMarkdownRange = useCallback((range: { from: number; to: number }, content: string) => {
      try {
        editorRef.current?.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          const from = Math.max(0, Math.min(range.from, view.state.doc.content.size));
          const to = Math.max(from, Math.min(range.to, view.state.doc.content.size));
          if (content) {
            const parsed = ctx.get(parserCtx)(content);
            view.dispatch(view.state.tr.replace(from, to, parsed.slice(0)).scrollIntoView());
          } else {
            view.dispatch(view.state.tr.delete(from, to).scrollIntoView());
          }
          savedSelectionRef.current = null;
          requestAnimationFrame(() => view.focus());
        });
      } catch (error) {
        console.error("更新嵌入内容失败:", error);
      }
    }, []);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      onOpenEmbedDialogRef.current = onOpenEmbedDialog;
    }, [onOpenEmbedDialog]);

    const closeInternalPostSuggestions = useCallback(() => {
      internalPostTriggerRef.current = null;
      setInternalPostTrigger(null);
      setInternalPostLoading(false);
    }, []);

    const cancelInternalPostPreviewClose = useCallback(() => {
      if (internalPostPreviewCloseTimerRef.current === null) return;
      window.clearTimeout(internalPostPreviewCloseTimerRef.current);
      internalPostPreviewCloseTimerRef.current = null;
    }, []);

    const closeInternalPostLinkPreview = useCallback(() => {
      cancelInternalPostPreviewClose();
      internalPostPreviewHoverRef.current = false;
      internalPostLinkPreviewRef.current = null;
      setInternalPostLinkPreview(null);
    }, [cancelInternalPostPreviewClose]);

    const scheduleInternalPostPreviewClose = useCallback(() => {
      cancelInternalPostPreviewClose();
      internalPostPreviewCloseTimerRef.current = window.setTimeout(() => {
        internalPostPreviewCloseTimerRef.current = null;
        if (internalPostPreviewHoverRef.current) return;
        internalPostLinkPreviewRef.current = null;
        setInternalPostLinkPreview(null);
      }, 180);
    }, [cancelInternalPostPreviewClose]);

    const holdInternalPostLinkPreview = useCallback(() => {
      internalPostPreviewHoverRef.current = true;
      cancelInternalPostPreviewClose();
    }, [cancelInternalPostPreviewClose]);

    const releaseInternalPostLinkPreview = useCallback(() => {
      internalPostPreviewHoverRef.current = false;
      scheduleInternalPostPreviewClose();
    }, [scheduleInternalPostPreviewClose]);

    const setActiveInternalPostIndex = useCallback((index: number) => {
      internalPostActiveIndexRef.current = index;
      setInternalPostActiveIndex(index);
    }, []);

    const insertInternalPost = useCallback(
      (post: InternalPostOption) => {
        const trigger = internalPostTriggerRef.current;
        if (!trigger || !editorRef.current) return;

        const label = trigger.alias || post.title;

        try {
          editorRef.current.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const linkMark = linkSchema
              .type(ctx)
              .create({ href: `post:${post.id}` });
            const linkText = view.state.schema.text(label, [linkMark]);
            const replacement =
              trigger.mode === "insert"
                ? [linkText, view.state.schema.text(" ")]
                : linkText;
            const transaction = view.state.tr
              .replaceWith(trigger.from, trigger.to, replacement)
              .setStoredMarks([])
              .scrollIntoView();
            view.dispatch(transaction);
            requestAnimationFrame(() => view.focus());
          });
        } catch (error) {
          console.error("插入站内文章引用失败:", error);
        }

        dismissedInternalPostFromRef.current = null;
        closeInternalPostLinkPreview();
        closeInternalPostSuggestions();
      },
      [closeInternalPostLinkPreview, closeInternalPostSuggestions]
    );

    const replaceInternalPostLink = useCallback(() => {
      const preview = internalPostLinkPreviewRef.current;
      if (!preview) return;

      const currentPost = internalPostCatalog?.find(
        (post) => post.id === preview.id
      );
      const popupWidth = Math.min(368, window.innerWidth - 24);
      const nextTrigger: InternalPostTrigger = {
        mode: "replace",
        from: preview.from,
        to: preview.to,
        query: "",
        alias:
          currentPost && preview.label !== currentPost.title
            ? preview.label
            : "",
        left: Math.max(
          12,
          Math.min(preview.left, window.innerWidth - popupWidth - 12)
        ),
        top: preview.top,
      };

      closeInternalPostLinkPreview();
      internalPostTriggerRef.current = nextTrigger;
      setInternalPostTrigger(nextTrigger);
    }, [closeInternalPostLinkPreview, internalPostCatalog]);

    const removeInternalPostLink = useCallback(() => {
      const preview = internalPostLinkPreviewRef.current;
      if (!preview || !editorRef.current) return;

      try {
        editorRef.current.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          if (
            preview.from < 0 ||
            preview.to <= preview.from ||
            preview.to > view.state.doc.content.size
          ) {
            return;
          }

          view.dispatch(
            view.state.tr.delete(preview.from, preview.to).scrollIntoView()
          );
          requestAnimationFrame(() => view.focus());
        });
      } catch (error) {
        console.error("删除站内文章引用失败:", error);
      }

      closeInternalPostLinkPreview();
    }, [closeInternalPostLinkPreview]);

    useEffect(() => {
      let active = true;
      void getInternalPostOptions()
        .then((options) => {
          if (active) setInternalPostCatalog(options as InternalPostOption[]);
        })
        .catch((error) => {
          if (!active) return;
          console.error("加载站内文章失败:", error);
          setInternalPostCatalog([]);
        });

      return () => {
        active = false;
      };
    }, []);

    useEffect(() => {
      const query = internalPostTrigger?.query;
      if (query === undefined) {
        setInternalPostOptions([]);
        internalPostOptionsRef.current = [];
        return;
      }

      if (!internalPostCatalog) {
        setInternalPostLoading(true);
        return;
      }

      const terms = query
        .normalize("NFKC")
        .toLocaleLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      const options = internalPostCatalog
        .filter((post) => {
          if (!terms.length) return true;
          const searchable = [post.title, post.excerpt, post.category || ""]
            .join("\n")
            .normalize("NFKC")
            .toLocaleLowerCase();
          return terms.every((term) => searchable.includes(term));
        })
        .slice(0, 30);

      internalPostOptionsRef.current = options;
      setInternalPostOptions(options);
      setActiveInternalPostIndex(0);
      setInternalPostLoading(false);
    }, [
      internalPostCatalog,
      internalPostTrigger?.query,
      setActiveInternalPostIndex,
    ]);

    useEffect(() => {
      const activePost = internalPostOptions[internalPostActiveIndex];
      if (!internalPostTrigger || !activePost) return;
      document
        .getElementById(`internal-post-option-${activePost.id}`)
        ?.scrollIntoView({ block: "nearest" });
    }, [
      internalPostActiveIndex,
      internalPostOptions,
      internalPostTrigger,
    ]);

    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (!editorRef.current) return currentContentRef.current;

        try {
          return editorRef.current.getMarkdown();
        } catch (error) {
          console.error("获取内容失败:", error);
          return currentContentRef.current;
        }
      },
      setContent: (content: string) => {
        currentContentRef.current = content;

        try {
          editorRef.current?.editor.action(replaceAll(content));
        } catch (error) {
          console.error("设置内容失败:", error);
        }
      },
      insertMarkdown: (content: string) => {
        try {
          editorRef.current?.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parsed = ctx.get(parserCtx)(content);
            const savedSelection = savedSelectionRef.current;
            const range = savedSelection ?? {
              from: view.state.selection.from,
              to: view.state.selection.to,
            };
            const transaction = view.state.tr
              .replace(range.from, range.to, parsed.slice(0))
              .scrollIntoView();
            view.dispatch(transaction);
            view.focus();
            savedSelectionRef.current = null;
          });
        } catch (error) {
          console.error("插入 Markdown 失败:", error);
        }
      },
      replaceMarkdownRange,
      getHeight: () => containerRef.current?.offsetHeight ?? 0,
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let mounted = true;
      let editor: Crepe | null = null;
      let cleanupInternalPostListeners: (() => void) | null = null;
      setIsReady(false);

      const createEditor = async () => {
        try {
          const highlighter = await getSingletonHighlighter({
            themes: ["github-light", "github-dark"],
            langs: [
              "javascript",
              "typescript",
              "java",
              "jsx",
              "tsx",
              "python",
              "c",
              "cpp",
              "csharp",
              "go",
              "rust",
              "kotlin",
              "swift",
              "php",
              "ruby",
              "sql",
              "dockerfile",
              "bash",
              "powershell",
              "sh",
              "shellscript",
              "json",
              "yaml",
              "toml",
              "ini",
              "markdown",
              "graphql",
              "html",
              "xml",
              "css",
              "vue",
              "svelte",
            ],
          });

          const highlightParser = createParser(highlighter, {
            theme: theme === "dark" ? "github-dark" : "github-light",
          });

          editor = new Crepe({
            root: container,
            defaultValue: currentContentRef.current,
            features: {
              [Crepe.Feature.TopBar]: true,
            },
            featureConfigs: {
              [Crepe.Feature.TopBar]: {
                headingOptions: [
                  { label: "正文", level: null },
                  { label: "一级标题", level: 1 },
                  { label: "二级标题", level: 2 },
                  { label: "三级标题", level: 3 },
                  { label: "四级标题", level: 4 },
                  { label: "五级标题", level: 5 },
                  { label: "六级标题", level: 6 },
                ],
              },
              [Crepe.Feature.Placeholder]: {
                text: "输入正文；使用 / 插入内容，使用 [[ 引用站内文章…",
                mode: "block",
              },
              [Crepe.Feature.CodeMirror]: {
                ...(theme === "light" ? { theme: [] } : {}),
                searchPlaceholder: "搜索代码语言",
                noResultText: "没有匹配的语言",
                copyText: "复制",
                previewLabel: "预览",
              },
              [Crepe.Feature.ImageBlock]: {
                onUpload: handleImageUpload,
                inlineOnUpload: handleImageUpload,
                blockOnUpload: handleImageUpload,
                inlineConfirmButton: "确认",
                inlineUploadButton: "上传",
                inlineUploadPlaceholderText: "粘贴图片地址或上传图片",
                blockConfirmButton: "确认",
                blockUploadButton: "上传",
                blockCaptionPlaceholderText: "图片说明",
                blockUploadPlaceholderText: "粘贴图片地址或上传图片",
              },
              [Crepe.Feature.BlockEdit]: {
                buildMenu: (builder) => {
                  const group = builder.addGroup("article-embeds", "媒体与网页");
                  const items: Array<{ key: string; label: string; kind: EmbedDialogKind; icon: string }> = [
                    { key: "insert-video", label: "插入视频", kind: "video", icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"5\" width=\"13\" height=\"14\" rx=\"2\"/><path d=\"m16 10 5-3v10l-5-3z\"/></svg>" },
                    { key: "insert-audio", label: "插入音频", kind: "audio", icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/></svg>" },
                    { key: "insert-html", label: "插入 HTML", kind: "html", icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16\"/></svg>" },
                    { key: "embed-webpage", label: "嵌入网页", kind: "webpage", icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20\"/></svg>" },
                  ];
                  for (const item of items) {
                    group.addItem(item.key, {
                      label: item.label,
                      icon: item.icon,
                      onRun: (ctx) => {
                        ctx.get(commandsCtx).call(clearTextInCurrentBlockCommand.key);
                        const view = ctx.get(editorViewCtx);
                        savedSelectionRef.current = {
                          from: view.state.selection.from,
                          to: view.state.selection.to,
                        };
                        setSelectedEmbedBlock(null);
                        onOpenEmbedDialogRef.current?.({ kind: item.kind });
                      },
                    });
                  }
                },
                textGroup: {
                  label: "文本",
                  text: { label: "正文" },
                  h1: { label: "一级标题" },
                  h2: { label: "二级标题" },
                  h3: { label: "三级标题" },
                  h4: { label: "四级标题" },
                  h5: { label: "五级标题" },
                  h6: { label: "六级标题" },
                  quote: { label: "引用" },
                  divider: { label: "分隔线" },
                },
                listGroup: {
                  label: "列表",
                  bulletList: { label: "无序列表" },
                  orderedList: { label: "有序列表" },
                  taskList: { label: "任务列表" },
                },
                advancedGroup: {
                  label: "高级",
                  image: { label: "图片" },
                  codeBlock: { label: "代码块" },
                  table: { label: "表格" },
                  math: { label: "数学公式" },
                },
              },
            },
          });

          editor.editor
            .config((ctx: Ctx) => {
              ctx.set(highlightPluginConfig.key, {
                parser: highlightParser,
                languageExtractor: (node) =>
                  getEditorHighlightLanguage(node.attrs?.language),
              });
            })
            .use(highlight);

          await editor.create();

          if (!mounted) {
            await editor.destroy();
            return;
          }

          editor.on((listener) => {
            listener.markdownUpdated((_ctx, markdown) => {
              currentContentRef.current = markdown;
              onChangeRef.current?.(markdown);
              requestAnimationFrame(() => {
                detectInternalPostTriggerRef.current?.();
              });
            });
          });

          editor.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            let internalPostDetectionTimer: number | null = null;

            const getInternalPostLinkAtPointer = (event: MouseEvent) => {
              const target =
                event.target instanceof Element ? event.target : null;
              const anchor = target?.closest<HTMLAnchorElement>(
                'a[href^="post:"]'
              );
              if (!anchor || !view.dom.contains(anchor)) return null;

              const id = anchor.getAttribute("href")?.match(
                /^post:([0-9a-f-]{36})$/i
              )?.[1];
              const position = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              if (!id || !position) return null;

              const $position = view.state.doc.resolve(position.pos);
              if (!$position.parent.isTextblock) return null;

              const parentStart = $position.start();
              const segments: Array<{ from: number; to: number }> = [];
              $position.parent.forEach((node, offset) => {
                const hasInternalLink = node.marks.some(
                  (mark) => mark.attrs.href === `post:${id}`
                );
                if (!hasInternalLink) return;

                const from = parentStart + offset;
                const to = from + node.nodeSize;
                const previous = segments.at(-1);
                if (previous?.to === from) previous.to = to;
                else segments.push({ from, to });
              });

              const range = segments.find(
                ({ from, to }) =>
                  position.pos >= from && position.pos <= to
              );
              if (!range) return null;

              const rect = anchor.getBoundingClientRect();
              const popupWidth = Math.min(420, window.innerWidth - 24);
              const popupHeight = 210;
              return {
                id,
                from: range.from,
                to: range.to,
                label: view.state.doc.textBetween(range.from, range.to),
                left: Math.max(
                  12,
                  Math.min(rect.left, window.innerWidth - popupWidth - 12)
                ),
                top:
                  rect.bottom + popupHeight + 12 <= window.innerHeight
                    ? rect.bottom + 4
                    : Math.max(12, rect.top - popupHeight - 4),
              } satisfies InternalPostLinkPreview;
            };

            const showInternalPostLinkPreview = (event: MouseEvent) => {
              const preview = getInternalPostLinkAtPointer(event);
              if (!preview) return false;

              cancelInternalPostPreviewClose();
              internalPostPreviewHoverRef.current = false;
              closeInternalPostSuggestions();
              internalPostLinkPreviewRef.current = preview;
              setInternalPostLinkPreview((current) => {
                if (
                  current &&
                  current.id === preview.id &&
                  current.from === preview.from &&
                  current.to === preview.to &&
                  current.left === preview.left &&
                  current.top === preview.top
                ) {
                  return current;
                }
                return preview;
              });
              return true;
            };

            const detectInternalPostTrigger = () => {
              const { selection } = view.state;
              const { $from } = selection;
              const isCodeContext =
                Boolean($from.parent.type.spec.code) ||
                $from.marks().some((mark) => Boolean(mark.type.spec.code));

              if (
                !selection.empty ||
                !$from.parent.isTextblock ||
                isCodeContext
              ) {
                dismissedInternalPostFromRef.current = null;
                closeInternalPostSuggestions();
                return;
              }

              const textBefore = $from.parent.textBetween(
                0,
                $from.parentOffset,
                "\n",
                "\0"
              );
              const triggerIndex = textBefore.lastIndexOf("[[");
              const raw =
                triggerIndex >= 0 ? textBefore.slice(triggerIndex + 2) : "";

              if (
                triggerIndex < 0 ||
                raw.includes("]") ||
                raw.includes("\n") ||
                raw.length > 120
              ) {
                dismissedInternalPostFromRef.current = null;
                closeInternalPostSuggestions();
                return;
              }

              const from = $from.start() + triggerIndex;
              if (dismissedInternalPostFromRef.current === from) {
                closeInternalPostSuggestions();
                return;
              }

              const aliasSeparator = raw.indexOf("|");
              const query = (
                aliasSeparator >= 0 ? raw.slice(0, aliasSeparator) : raw
              ).trim();
              const alias =
                aliasSeparator >= 0 ? raw.slice(aliasSeparator + 1).trim() : "";
              const caret = view.coordsAtPos(selection.from);
              const popupWidth = Math.min(368, window.innerWidth - 24);
              const popupHeight = 340;
              const left = Math.max(
                12,
                Math.min(caret.left, window.innerWidth - popupWidth - 12)
              );
              const top =
                caret.bottom + popupHeight + 12 <= window.innerHeight
                  ? caret.bottom + 8
                  : Math.max(12, caret.top - popupHeight - 8);
              const nextTrigger = {
                mode: "insert" as const,
                from,
                to: selection.from,
                query,
                alias,
                left,
                top,
              };

              internalPostTriggerRef.current = nextTrigger;
              setInternalPostTrigger((current) => {
                if (
                  current &&
                  current.mode === nextTrigger.mode &&
                  current.from === nextTrigger.from &&
                  current.to === nextTrigger.to &&
                  current.query === nextTrigger.query &&
                  current.alias === nextTrigger.alias &&
                  current.left === nextTrigger.left &&
                  current.top === nextTrigger.top
                ) {
                  return current;
                }
                return nextTrigger;
              });
            };
            const detectSelectedEmbedBlock = () => {
              const { selection } = view.state;
              const $from = selection.$from;
              const block = $from.parent.type.name === "code_block"
                ? $from.parent
                : null;
              const language = typeof block?.attrs.language === "string"
                ? block.attrs.language.toLowerCase()
                : "";
              const kind: EmbedDialogKind | null =
                language === "video" ? "video"
                  : language === "audio" ? "audio"
                    : language === "embed" ? "webpage"
                      : language === "html-url" ? "html"
                      : language === "html-preview" ? "html"
                        : null;

              if (!block || !kind) {
                setSelectedEmbedBlock(null);
                return;
              }

              const from = $from.before();
              const dom = view.nodeDOM(from);
              if (!(dom instanceof HTMLElement)) {
                setSelectedEmbedBlock(null);
                return;
              }
              const rect = dom.getBoundingClientRect();
              const range = { from, to: from + block.nodeSize };
              setSelectedEmbedBlock({
                kind,
                source: block.textContent,
                range,
                left: Math.max(12, Math.min(rect.left, window.innerWidth - 220)),
                top: Math.max(8, rect.top - 42),
              });
            };

            const detectInternalPostAndEmbed = () => {
              detectInternalPostTrigger();
              detectSelectedEmbedBlock();
            };
            detectInternalPostTriggerRef.current = detectInternalPostAndEmbed;

            const scheduleDetection = () => {
              requestAnimationFrame(detectInternalPostAndEmbed);
              if (internalPostDetectionTimer !== null) {
                window.clearTimeout(internalPostDetectionTimer);
              }
              internalPostDetectionTimer = window.setTimeout(() => {
                internalPostDetectionTimer = null;
                detectInternalPostAndEmbed();
              }, 24);
            };

            const handleEditorInput = () => {
              closeInternalPostLinkPreview();
              scheduleDetection();
            };

            const handleInternalLinkMouseMove = (event: MouseEvent) => {
              if (!showInternalPostLinkPreview(event)) {
                scheduleInternalPostPreviewClose();
              }
            };

            const handleInternalLinkClick = (event: MouseEvent) => {
              if (!showInternalPostLinkPreview(event)) return;
              event.preventDefault();
            };

            const handleKeyDown = (event: KeyboardEvent) => {
              const trigger = internalPostTriggerRef.current;
              if (!trigger) return;

              const options = internalPostOptionsRef.current;
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                event.stopPropagation();
                if (!options.length) return;
                const direction = event.key === "ArrowDown" ? 1 : -1;
                const nextIndex =
                  (internalPostActiveIndexRef.current +
                    direction +
                    options.length) %
                  options.length;
                setActiveInternalPostIndex(nextIndex);
                return;
              }

              if (event.key === "Enter" || event.key === "Tab") {
                event.preventDefault();
                event.stopPropagation();
                if (!options.length) return;
                insertInternalPost(
                  options[
                    Math.min(
                      internalPostActiveIndexRef.current,
                      options.length - 1
                    )
                  ]
                );
                return;
              }

              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                dismissedInternalPostFromRef.current = trigger.from;
                closeInternalPostSuggestions();
              }
            };

            const handleBlur = () => {
              window.setTimeout(() => {
                if (!view.hasFocus()) closeInternalPostSuggestions();
              }, 0);
            };

            view.dom.addEventListener("input", handleEditorInput);
            view.dom.addEventListener("keyup", scheduleDetection);
            view.dom.addEventListener("mouseup", scheduleDetection);
            view.dom.addEventListener("click", scheduleDetection);
            view.dom.addEventListener("click", handleInternalLinkClick);
            view.dom.addEventListener("focus", scheduleDetection);
            view.dom.addEventListener("blur", handleBlur);
            view.dom.addEventListener(
              "mousemove",
              handleInternalLinkMouseMove
            );
            view.dom.addEventListener(
              "mouseleave",
              scheduleInternalPostPreviewClose
            );
            view.dom.addEventListener("keydown", handleKeyDown, true);
            window.addEventListener("resize", closeInternalPostSuggestions);
            window.addEventListener("resize", scheduleDetection);
            window.addEventListener("scroll", scheduleDetection, true);
            window.addEventListener("resize", closeInternalPostLinkPreview);
            window.addEventListener(
              "scroll",
              closeInternalPostLinkPreview,
              true
            );

            cleanupInternalPostListeners = () => {
              if (
                detectInternalPostTriggerRef.current ===
                detectInternalPostTrigger
              ) {
                detectInternalPostTriggerRef.current = null;
              }
              if (internalPostDetectionTimer !== null) {
                window.clearTimeout(internalPostDetectionTimer);
                internalPostDetectionTimer = null;
              }
              view.dom.removeEventListener("input", handleEditorInput);
              view.dom.removeEventListener("keyup", scheduleDetection);
              view.dom.removeEventListener("mouseup", scheduleDetection);
              view.dom.removeEventListener("click", scheduleDetection);
              view.dom.removeEventListener("click", handleInternalLinkClick);
              view.dom.removeEventListener("focus", scheduleDetection);
              view.dom.removeEventListener("blur", handleBlur);
              view.dom.removeEventListener(
                "mousemove",
                handleInternalLinkMouseMove
              );
              view.dom.removeEventListener(
                "mouseleave",
                scheduleInternalPostPreviewClose
              );
              view.dom.removeEventListener("keydown", handleKeyDown, true);
              window.removeEventListener(
                "resize",
                closeInternalPostSuggestions
              );
              window.removeEventListener("resize", scheduleDetection);
              window.removeEventListener("scroll", scheduleDetection, true);
              window.removeEventListener(
                "resize",
                closeInternalPostLinkPreview
              );
              window.removeEventListener(
                "scroll",
                closeInternalPostLinkPreview,
                true
              );
            };
          });

          editorRef.current = editor;
          setIsReady(true);
        } catch (error) {
          console.error("Milkdown 初始化失败:", error);
        }
      };

      void createEditor();

      return () => {
        mounted = false;
        setIsReady(false);
        cleanupInternalPostListeners?.();
        closeInternalPostLinkPreview();
        closeInternalPostSuggestions();

        const activeEditor = editorRef.current ?? editor;
        editorRef.current = null;
        if (activeEditor) {
          void activeEditor.destroy().catch((error) => {
            console.error("Milkdown 清理失败:", error);
          });
        }
      };
    }, [
      closeInternalPostSuggestions,
      closeInternalPostLinkPreview,
      cancelInternalPostPreviewClose,
      handleImageUpload,
      insertInternalPost,
      scheduleInternalPostPreviewClose,
      setActiveInternalPostIndex,
      theme,
    ]);

    useEffect(() => {
      if (!editorRef.current || !isReady) return;
      if (initialValue === currentContentRef.current) return;

      currentContentRef.current = initialValue;
      editorRef.current.editor.action(replaceAll(initialValue));
    }, [initialValue, isReady]);

    const previewPost = internalPostLinkPreview
      ? internalPostCatalog?.find(
          (post) => post.id === internalPostLinkPreview.id
        )
      : null;

    return (
      <>
        <div
          className={`milkdown-editor-shell overflow-visible rounded-xl border border-theme-border bg-theme-surface ${className}`}
          style={height ? { height } : undefined}
        >
          <div
            className={`${theme === "dark" ? "theme-dark" : "theme-light"} relative`}
          >
            <div
              ref={containerRef}
              className="milkdown milkdown-editor-root"
              style={{ visibility: isReady ? "visible" : "hidden" }}
            />

            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-theme-text-tertiary">
                加载编辑器...
              </div>
            )}

            {uploadingImageCount > 0 && (
              <div className="absolute bottom-4 right-4 z-20 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-sm text-theme-text-secondary shadow-lg">
                正在上传 {uploadingImageCount} 张图片...
              </div>
            )}

            {uploadError && (
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="absolute bottom-4 left-4 z-20 rounded-lg border border-theme-error-primary/30 bg-theme-error-bg px-3 py-2 text-left text-sm text-theme-error-text shadow-lg"
                title="点击关闭"
              >
                {uploadError}
              </button>
            )}
          </div>
        </div>

        {selectedEmbedBlock &&
          createPortal(
            <div
              className={`${theme === "dark" ? "theme-dark" : "theme-light"} fixed z-[2147483000] flex items-center gap-1 rounded-xl border border-theme-border bg-theme-surface p-1 shadow-xl`}
              style={{ left: selectedEmbedBlock.left, top: selectedEmbedBlock.top }}
              aria-label="嵌入内容操作"
              onMouseDown={(event) => event.preventDefault()}
            >
              <button
                type="button"
                onClick={() => {
                  savedSelectionRef.current = selectedEmbedBlock.range;
                  onOpenEmbedDialogRef.current?.({
                    kind: selectedEmbedBlock.kind,
                    source: selectedEmbedBlock.source,
                    range: selectedEmbedBlock.range,
                  });
                  setSelectedEmbedBlock(null);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-theme-text-secondary transition-colors hover:bg-theme-muted hover:text-theme-text-canvas"
              >
                <Pencil className="h-3.5 w-3.5" />
                编辑{selectedEmbedBlock.kind === "video" ? "视频" : selectedEmbedBlock.kind === "audio" ? "音频" : selectedEmbedBlock.kind === "html" ? " HTML" : "网页"}
              </button>
              <button
                type="button"
                onClick={() => {
                  replaceMarkdownRange(selectedEmbedBlock.range, "");
                  setSelectedEmbedBlock(null);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-theme-error-primary transition-colors hover:bg-theme-error-bg"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
            </div>,
            document.body
          )}

        {internalPostLinkPreview &&
          !internalPostTrigger &&
          createPortal(
            <div
              data-internal-post-link-preview
              role="dialog"
              aria-label="站内文章引用预览"
              className={`${theme === "dark" ? "theme-dark" : "theme-light"} fixed z-[2147483000] w-[min(26.25rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-theme-border bg-theme-surface shadow-2xl`}
              style={{
                left: internalPostLinkPreview.left,
                top: internalPostLinkPreview.top,
              }}
              onMouseDown={(event) => event.preventDefault()}
              onPointerEnter={holdInternalPostLinkPreview}
              onPointerLeave={releaseInternalPostLinkPreview}
            >
              <div className="flex items-center gap-2 border-b border-theme-border bg-theme-surface-alt px-4 py-2.5 text-xs font-medium text-theme-text-secondary">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-theme-accent-bg text-theme-accent-primary">
                  <BookOpenText className="h-4 w-4" />
                </span>
                <span>站内文章</span>
                {previewPost?.category && (
                  <span className="ml-auto max-w-40 truncate rounded-full border border-theme-border bg-theme-surface px-2.5 py-1 text-[10px] text-theme-text-tertiary">
                    {previewPost.category}
                  </span>
                )}
              </div>

              <div className="px-4 py-4">
                <p className="text-sm font-semibold leading-6 text-theme-text-canvas">
                  {previewPost?.title || internalPostLinkPreview.label}
                </p>
                <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-theme-text-secondary">
                  {previewPost
                    ? previewPost.excerpt || "这篇文章暂未填写摘要。"
                    : internalPostCatalog
                      ? "该文章已不存在，或当前账号无权读取文章信息。"
                      : "正在加载文章摘要…"}
                </p>
                {previewPost &&
                  internalPostLinkPreview.label !== previewPost.title && (
                    <p className="mt-2 truncate font-mono text-[10px] text-theme-text-tertiary">
                      显示文字：{internalPostLinkPreview.label}
                    </p>
                  )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-theme-border bg-theme-surface-alt px-3 py-2.5">
                <button
                  type="button"
                  onClick={replaceInternalPostLink}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-theme-text-secondary transition-colors hover:bg-theme-surface hover:text-theme-text-canvas"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  更换文章
                </button>
                <button
                  type="button"
                  onClick={removeInternalPostLink}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-theme-error-primary transition-colors hover:bg-theme-error-bg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除引用
                </button>
              </div>
            </div>,
            document.body
          )}

        {internalPostTrigger &&
          createPortal(
            <div
              data-internal-post-picker
              role="dialog"
              aria-label="选择站内文章"
              className={`${theme === "dark" ? "theme-dark" : "theme-light"} fixed z-[2147483000] w-[min(23rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-theme-border bg-theme-surface shadow-2xl`}
              style={{
                left: internalPostTrigger.left,
                top: internalPostTrigger.top,
              }}
              onMouseDown={(event) => event.preventDefault()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-theme-border bg-theme-text-canvas px-4 py-3 text-theme-surface">
                <div className="flex min-w-0 items-center gap-2">
                  <Search className="h-4 w-4 shrink-0 opacity-65" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {internalPostTrigger.mode === "replace"
                        ? "更换引用文章"
                        : "引用站内文章"}
                    </p>
                    <p className="truncate font-mono text-[10px] text-theme-surface/55">
                      {internalPostTrigger.query
                        ? `搜索：${internalPostTrigger.query}`
                        : "输入标题继续筛选"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-md border border-theme-surface/20 px-2 py-1 font-mono text-[10px] text-theme-surface/55">
                  {internalPostTrigger.mode === "replace" ? "更换" : "[["}
                </span>
              </div>

              {internalPostTrigger.alias && (
                <div className="border-b border-theme-border bg-theme-accent-bg px-4 py-2 text-xs text-theme-accent-primary">
                  显示文字：{internalPostTrigger.alias}
                </div>
              )}

              <div
                role="listbox"
                aria-label="已发布文章"
                className="max-h-64 overflow-y-auto p-2"
              >
                {internalPostLoading ? (
                  <div className="space-y-2 p-1">
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-16 animate-pulse rounded-xl bg-theme-muted"
                      />
                    ))}
                  </div>
                ) : internalPostOptions.length ? (
                  internalPostOptions.map((post, index) => {
                    const active = index === internalPostActiveIndex;
                    return (
                      <button
                        id={`internal-post-option-${post.id}`}
                        key={post.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveInternalPostIndex(index)}
                        onClick={() => insertInternalPost(post)}
                        className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                          active
                            ? "bg-theme-accent-bg"
                            : "hover:bg-theme-muted"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            active
                              ? "bg-theme-accent-primary text-white"
                              : "bg-theme-surface-alt text-theme-text-secondary"
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-theme-text-canvas">
                            {post.title}
                          </span>
                          <span className="mt-1 block truncate text-xs text-theme-text-tertiary">
                            {post.category || "未分类"}
                            {post.excerpt ? ` · ${post.excerpt}` : ""}
                          </span>
                        </span>
                        {active && (
                          <CornerDownLeft className="mt-2 h-4 w-4 shrink-0 text-theme-accent-primary" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-4 py-10 text-center text-sm text-theme-text-tertiary">
                    没有匹配的已发布文章
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-theme-border bg-theme-surface-alt px-4 py-2 font-mono text-[10px] text-theme-text-tertiary">
                <span>↑↓ 选择</span>
                <span>Enter 插入</span>
                <span>Esc 关闭</span>
                {internalPostTrigger.mode === "insert" && (
                  <span className="ml-auto">| 自定义文字</span>
                )}
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }
);

MilkdownEditor.displayName = "MilkdownEditor";
