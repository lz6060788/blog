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
import { CornerDownLeft, FileText, Search } from "lucide-react";
import type { Ctx } from "@milkdown/kit/ctx";
import { Crepe } from "@milkdown/crepe";
import { highlight, highlightPluginConfig } from "@milkdown/plugin-highlight";
import { createParser } from "@milkdown/plugin-highlight/shiki";
import { replaceAll } from "@milkdown/kit/utils";
import { editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { getSingletonHighlighter } from "shiki";
import { uploadFile as uploadAssetFile } from "@/lib/api/upload";
import { getInternalPostOptions } from "@/server/actions/posts";

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
  getHeight: () => number;
}

export interface MilkdownEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  height?: string;
  className?: string;
  theme?: "light" | "dark";
}

interface InternalPostOption {
  id: string;
  title: string;
  excerpt: string;
  category: string | null;
}

interface InternalPostTrigger {
  from: number;
  to: number;
  query: string;
  alias: string;
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
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Crepe | null>(null);
    const onChangeRef = useRef(onChange);
    const currentContentRef = useRef(initialValue);
    const [isReady, setIsReady] = useState(false);
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
    const internalPostTriggerRef = useRef<InternalPostTrigger | null>(null);
    const internalPostOptionsRef = useRef<InternalPostOption[]>([]);
    const internalPostActiveIndexRef = useRef(0);
    const dismissedInternalPostFromRef = useRef<number | null>(null);

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

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const closeInternalPostSuggestions = useCallback(() => {
      internalPostTriggerRef.current = null;
      setInternalPostTrigger(null);
      setInternalPostLoading(false);
    }, []);

    const setActiveInternalPostIndex = useCallback((index: number) => {
      internalPostActiveIndexRef.current = index;
      setInternalPostActiveIndex(index);
    }, []);

    const insertInternalPost = useCallback(
      (post: InternalPostOption) => {
        const trigger = internalPostTriggerRef.current;
        if (!trigger || !editorRef.current) return;

        const label = (trigger.alias || post.title)
          .replaceAll("[", "\\[")
          .replaceAll("]", "\\]");
        const markdown = `[${label}](post:${post.id})`;

        try {
          editorRef.current.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parsed = ctx.get(parserCtx)(markdown);
            const transaction = view.state.tr
              .replace(trigger.from, trigger.to, parsed.slice(0))
              .scrollIntoView();
            view.dispatch(transaction);
            requestAnimationFrame(() => view.focus());
          });
        } catch (error) {
          console.error("插入站内文章引用失败:", error);
        }

        dismissedInternalPostFromRef.current = null;
        closeInternalPostSuggestions();
      },
      [closeInternalPostSuggestions]
    );

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
            const transaction = view.state.tr
              .replaceSelection(parsed.slice(0))
              .scrollIntoView();
            view.dispatch(transaction);
            view.focus();
          });
        } catch (error) {
          console.error("插入 Markdown 失败:", error);
        }
      },
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
                languageExtractor: (node) => {
                  const language =
                    typeof node.attrs?.language === "string"
                      ? node.attrs.language
                      : undefined;
                  if (!language) return undefined;

                  const key = language.trim().toLowerCase();
                  if (!key) return undefined;

                  const aliases: Record<string, string> = {
                    js: "javascript",
                    ts: "typescript",
                    yml: "yaml",
                    shell: "bash",
                    zsh: "bash",
                    docker: "dockerfile",
                    cxx: "cpp",
                    "c++": "cpp",
                    cs: "csharp",
                    md: "markdown",
                    ps1: "powershell",
                  };

                  return aliases[key] ?? key;
                },
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
            });
          });

          editor.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);

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

            const scheduleDetection = () => {
              requestAnimationFrame(detectInternalPostTrigger);
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

            view.dom.addEventListener("input", scheduleDetection);
            view.dom.addEventListener("keyup", scheduleDetection);
            view.dom.addEventListener("click", scheduleDetection);
            view.dom.addEventListener("focus", scheduleDetection);
            view.dom.addEventListener("blur", handleBlur);
            view.dom.addEventListener("keydown", handleKeyDown, true);
            window.addEventListener("resize", closeInternalPostSuggestions);

            cleanupInternalPostListeners = () => {
              view.dom.removeEventListener("input", scheduleDetection);
              view.dom.removeEventListener("keyup", scheduleDetection);
              view.dom.removeEventListener("click", scheduleDetection);
              view.dom.removeEventListener("focus", scheduleDetection);
              view.dom.removeEventListener("blur", handleBlur);
              view.dom.removeEventListener("keydown", handleKeyDown, true);
              window.removeEventListener(
                "resize",
                closeInternalPostSuggestions
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
      handleImageUpload,
      insertInternalPost,
      setActiveInternalPostIndex,
      theme,
    ]);

    useEffect(() => {
      if (!editorRef.current || !isReady) return;
      if (initialValue === currentContentRef.current) return;

      currentContentRef.current = initialValue;
      editorRef.current.editor.action(replaceAll(initialValue));
    }, [initialValue, isReady]);

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
                    <p className="text-sm font-semibold">引用站内文章</p>
                    <p className="truncate font-mono text-[10px] text-theme-surface/55">
                      {internalPostTrigger.query
                        ? `搜索：${internalPostTrigger.query}`
                        : "输入标题继续筛选"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-md border border-theme-surface/20 px-2 py-1 font-mono text-[10px] text-theme-surface/55">
                  [[
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
                <span className="ml-auto">| 自定义文字</span>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }
);

MilkdownEditor.displayName = "MilkdownEditor";
