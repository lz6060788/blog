"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Ctx } from "@milkdown/kit/ctx";
import { Crepe } from "@milkdown/crepe";
import { highlight, highlightPluginConfig } from "@milkdown/plugin-highlight";
import { createParser } from "@milkdown/plugin-highlight/shiki";
import { replaceAll } from "@milkdown/kit/utils";
import { getSingletonHighlighter } from "shiki";
import { uploadFile as uploadAssetFile } from "@/lib/api/upload";

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
  getHeight: () => number;
}

export interface MilkdownEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  height?: string;
  className?: string;
  theme?: "light" | "dark";
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
      getHeight: () => containerRef.current?.offsetHeight ?? 0,
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let mounted = true;
      let editor: Crepe | null = null;
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
                text: "输入正文，或输入 / 插入内容…",
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

        const activeEditor = editorRef.current ?? editor;
        editorRef.current = null;
        if (activeEditor) {
          void activeEditor.destroy().catch((error) => {
            console.error("Milkdown 清理失败:", error);
          });
        }
      };
    }, [handleImageUpload, theme]);

    useEffect(() => {
      if (!editorRef.current || !isReady) return;
      if (initialValue === currentContentRef.current) return;

      currentContentRef.current = initialValue;
      editorRef.current.editor.action(replaceAll(initialValue));
    }, [initialValue, isReady]);

    return (
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
    );
  }
);

MilkdownEditor.displayName = "MilkdownEditor";
