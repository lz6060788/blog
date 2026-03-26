"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import type { Ctx } from "@milkdown/ctx";
import { defaultValueCtx } from "@milkdown/core";
import { Crepe } from "@milkdown/crepe";
import {
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
  createCodeBlockCommand,
  insertImageCommand,
  toggleEmphasisCommand,
  toggleStrongCommand,
  turnIntoTextCommand,
} from "@milkdown/preset-commonmark";
import { toggleStrikethroughCommand } from "@milkdown/preset-gfm";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { history, redoCommand, undoCommand } from "@milkdown/plugin-history";
import { highlight, highlightPluginConfig } from "@milkdown/plugin-highlight";
import { createParser } from "@milkdown/plugin-highlight/shiki";
import { math } from "@milkdown/plugin-math";
import { dropIndicatorState } from "@milkdown/plugin-cursor";
import {
  upload as uploadPlugin,
  uploadConfig,
  type Uploader,
} from "@milkdown/plugin-upload";
import { callCommand } from "@milkdown/utils";
import { getSingletonHighlighter } from "shiki";
import { uploadFile as uploadAssetFile } from "@/lib/api/upload";
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Undo2,
} from "lucide-react";

const uploadImageToCos = async (file: File) => {
  const result = await uploadAssetFile({ file });
  return result.url;
};

const uploadDroppedImages: Uploader = async (files, schema) => {
  const imageNode = schema.nodes.image;

  if (!imageNode) {
    throw new Error("Milkdown image node is missing");
  }

  const images = Array.from(files)
    .filter((file): file is File => Boolean(file))
    .filter((file) => file.type.startsWith("image/"));

  const uploadedNodes = await Promise.all(
    images.map(async (file) => {
      const src = await uploadImageToCos(file);
      return imageNode.create({
        src,
        alt: file.name,
      });
    })
  );

  return uploadedNodes;
};

const getImageFiles = (files?: FileList | null) =>
  Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));

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

function ToolbarButton({
  label,
  onMouseDown,
  children,
}: {
  label: string;
  onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={onMouseDown}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-theme-border bg-theme-surface px-2 text-theme-text-secondary transition-colors hover:bg-theme-muted hover:text-theme-text-canvas"
    >
      {children}
    </button>
  );
}

export const MilkdownEditor = forwardRef<MilkdownEditorRef, MilkdownEditorProps>(
  (
    {
      initialValue = "",
      onChange,
      height = "500px",
      className = "",
      theme = "light",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Crepe | null>(null);
    const onChangeRef = useRef(onChange);
    const initialValueRef = useRef(initialValue);
    const [isReady, setIsReady] = useState(false);
    const [uploadingImageCount, setUploadingImageCount] = useState(0);
    const currentContentRef = useRef(initialValue);

    const runCommand = (
      command: { key: unknown },
      payload?: unknown,
      retryCount = 0
    ) => {
      if (!editorRef.current) return;

      try {
        editorRef.current.editor.action(
          callCommand(command.key as never, payload as never)
        );
      } catch (e) {
        if (
          retryCount < 5 &&
          e instanceof Error &&
          e.message.includes('Context "editorView" not found')
        ) {
          setTimeout(() => {
            runCommand(command, payload, retryCount + 1);
          }, 0);
          return;
        }
        console.error("执行命令失败:", e);
      }
    };

    const handleToolbarAction =
      (command: { key: unknown }, payload?: unknown) =>
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        runCommand(command, payload);
      };

    const insertUploadedImage = useCallback((src: string, alt: string) => {
      runCommand(insertImageCommand, { src, alt });
    }, []);

    const clearDropIndicator = useCallback(() => {
      if (!editorRef.current) return;

      try {
        editorRef.current.editor.action((ctx: Ctx) => {
          ctx.set(dropIndicatorState.key, null);
        });
      } catch (e) {
        if (e instanceof Error && e.message.includes('Context "editorView" not found')) {
          return;
        }
        console.error("清理拖拽指示器失败:", e);
      }
    }, []);

    const uploadFilesAndInsertImages = useCallback(
      async (files?: FileList | null) => {
        const imageFiles = getImageFiles(files);

        if (imageFiles.length === 0) return false;

        setUploadingImageCount((count) => count + imageFiles.length);

        try {
          const uploadedImages = await Promise.all(
            imageFiles.map(async (file) => ({
              alt: file.name,
              src: await uploadImageToCos(file),
            }))
          );

          uploadedImages.forEach(({ src, alt }) => {
            insertUploadedImage(src, alt);
          });

          return true;
        } finally {
          setUploadingImageCount((count) =>
            Math.max(0, count - imageFiles.length)
          );
        }
      },
      [insertUploadedImage]
    );

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      initialValueRef.current = initialValue;
    }, [initialValue]);

    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (editorRef.current) {
          try {
            return editorRef.current.getMarkdown();
          } catch (e) {
            console.error("获取内容失败:", e);
            return currentContentRef.current;
          }
        }
        return currentContentRef.current;
      },
      setContent: (content: string) => {
        try {
          currentContentRef.current = content;
          if (editorRef.current) {
            editorRef.current.editor.action((ctx) => {
              ctx.set(defaultValueCtx, content);
            });
          }
        } catch (e) {
          console.error("设置内容失败:", e);
        }
      },
      getHeight: () => {
        return containerRef.current?.offsetHeight || 0;
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let mounted = true;
      let nativePasteHandler: ((event: ClipboardEvent) => Promise<void>) | null =
        null;
      let nativeDragOverHandler: ((event: DragEvent) => void) | null = null;
      let nativeDropHandler: ((event: DragEvent) => Promise<void>) | null = null;

      (async () => {
        try {
          const highlighter = await getSingletonHighlighter({
            themes: ["github-light", "github-dark"],
            langs: [
              "javascript",
              "typescript",
              "jsx",
              "tsx",
              "python",
              "dockerfile",
              "bash",
              "sh",
              "shellscript",
              "json",
              "yaml",
              "toml",
              "ini",
              "html",
              "css",
            ],
          });

          const highlightParser = createParser(highlighter, {
            theme: theme === "dark" ? "github-dark" : "github-light",
          });

          const editor = new Crepe({
            root: container,
            defaultValue: initialValueRef.current,
            features: {
              [Crepe.Feature.Toolbar]: false,
              [Crepe.Feature.CodeMirror]: true,
              [Crepe.Feature.ListItem]: true,
              [Crepe.Feature.LinkTooltip]: true,
              [Crepe.Feature.ImageBlock]: true,
              [Crepe.Feature.BlockEdit]: false,
              [Crepe.Feature.Table]: true,
              [Crepe.Feature.Cursor]: true,
            },
          });

          editor.editor
            .config((ctx: Ctx) => {
              ctx.get(listenerCtx).markdownUpdated((_ctx: Ctx, markdown: string) => {
                currentContentRef.current = markdown;
                onChangeRef.current?.(markdown);
              });

              ctx.update(uploadConfig.key, (prev) => ({
                ...prev,
                uploader: uploadDroppedImages,
              }));

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

                  const alias: Record<string, string> = {
                    js: "javascript",
                    ts: "typescript",
                    yml: "yaml",
                    shell: "bash",
                    zsh: "bash",
                    docker: "dockerfile",
                  };

                  return alias[key] ?? key;
                },
              });
            })
            .use(listener)
            .use(history)
            .use(highlight)
            .use(math)
            .use(uploadPlugin);

          await editor.create();

          if (!mounted) {
            await editor.destroy();
            return;
          }

          editorRef.current = editor;
          setIsReady(true);

          nativePasteHandler = async (event: ClipboardEvent) => {
            const files = Array.from(event.clipboardData?.files ?? []);
            const images = files.filter((file) =>
              file.type.startsWith("image/")
            );

            if (images.length === 0) return;

            event.preventDefault();
            event.stopPropagation();

            const uploaded = await uploadFilesAndInsertImages(
              event.clipboardData?.files
            );

            if (uploaded) {
              clearDropIndicator();
            }
          };

          nativeDragOverHandler = (event: DragEvent) => {
            const imageFiles = getImageFiles(event.dataTransfer?.files);
            if (imageFiles.length === 0) return;
            event.preventDefault();
          };

          nativeDropHandler = async (event: DragEvent) => {
            if (getImageFiles(event.dataTransfer?.files).length === 0) return;

            event.preventDefault();
            event.stopPropagation();
            clearDropIndicator();
            await uploadFilesAndInsertImages(event.dataTransfer?.files);
          };

          container.addEventListener("paste", nativePasteHandler);
          container.addEventListener("dragover", nativeDragOverHandler);
          container.addEventListener("drop", nativeDropHandler);
        } catch (error) {
          console.error("Milkdown 初始化失败:", error);
        }
      })();

      return () => {
        mounted = false;

        if (nativePasteHandler) {
          container.removeEventListener("paste", nativePasteHandler);
        }
        if (nativeDragOverHandler) {
          container.removeEventListener("dragover", nativeDragOverHandler);
        }
        if (nativeDropHandler) {
          container.removeEventListener("drop", nativeDropHandler);
        }

        if (editorRef.current) {
          try {
            void editorRef.current.destroy();
            editorRef.current = null;
          } catch (e) {
            console.error("Milkdown 清理失败:", e);
          }
        }
      };
    }, [clearDropIndicator, uploadFilesAndInsertImages]);

    useEffect(() => {
      if (editorRef.current && isReady) {
        editorRef.current.editor.action((ctx) => {
          ctx.set(defaultValueCtx, initialValue);
        });
        currentContentRef.current = initialValue;
      }
    }, [initialValue, isReady]);

    return (
      <div className={className}>
        <div className={theme === "dark" ? "theme-dark" : "theme-light"}>
          <div className="flex flex-wrap gap-2 p-3 border border-theme-border rounded-t-lg bg-theme-surface">
            <ToolbarButton
              label="H1"
              onMouseDown={handleToolbarAction(wrapInHeadingCommand, 1)}
            >
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="H2"
              onMouseDown={handleToolbarAction(wrapInHeadingCommand, 2)}
            >
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="粗体"
              onMouseDown={handleToolbarAction(toggleStrongCommand)}
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="斜体"
              onMouseDown={handleToolbarAction(toggleEmphasisCommand)}
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="删除线"
              onMouseDown={handleToolbarAction(toggleStrikethroughCommand)}
            >
              <Strikethrough size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="引用"
              onMouseDown={handleToolbarAction(wrapInBlockquoteCommand)}
            >
              <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="无序列表"
              onMouseDown={handleToolbarAction(wrapInBulletListCommand)}
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="有序列表"
              onMouseDown={handleToolbarAction(wrapInOrderedListCommand)}
            >
              <ListOrdered size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="代码块"
              onMouseDown={handleToolbarAction(createCodeBlockCommand)}
            >
              <Code2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="清除格式"
              onMouseDown={handleToolbarAction(turnIntoTextCommand)}
            >
              <RemoveFormatting size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="撤销"
              onMouseDown={handleToolbarAction(undoCommand)}
            >
              <Undo2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="重做"
              onMouseDown={handleToolbarAction(redoCommand)}
            >
              <Redo2 size={16} />
            </ToolbarButton>
          </div>

          <div
            className="relative border-x border-b border-theme-border rounded-b-lg overflow-hidden bg-theme-surface"
            style={{ height }}
          >
            <div
              ref={containerRef}
              className="milkdown h-full overflow-auto"
              style={{
                visibility: isReady ? "visible" : "hidden",
              }}
            />

            {!isReady && (
              <div className="flex items-center justify-center h-full">
                <div className="text-theme-text-tertiary">加载编辑器...</div>
              </div>
            )}

            {uploadingImageCount > 0 && (
              <div className="absolute bottom-4 right-4 rounded-md border border-theme-border bg-theme-surface px-3 py-2 text-sm text-theme-text-secondary shadow-lg">
                正在上传图片...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

MilkdownEditor.displayName = "MilkdownEditor";
