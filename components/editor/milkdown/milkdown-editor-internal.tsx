"use client";

import { useCallback, useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
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
import { prism } from "@milkdown/plugin-prism";
import { math } from "@milkdown/plugin-math";
import { dropIndicatorState } from "@milkdown/plugin-cursor";
import { upload as uploadPlugin, uploadConfig, type Uploader } from "@milkdown/plugin-upload";
import { callCommand } from "@milkdown/utils";
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
  onRef?: (ref: MilkdownEditorRef | null) => void;
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

export const MilkdownEditorInternal = forwardRef<
  MilkdownEditorRef,
  MilkdownEditorProps
>(
  (
    {
      initialValue = "",
      onChange,
      height = "500px",
      className = "",
      theme = "light",
      onRef,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Crepe | null>(null);
    const onChangeRef = useRef(onChange);
    const onRefRef = useRef(onRef);
    const initialValueRef = useRef(initialValue);
    const [isReady, setIsReady] = useState(false);
    const [uploadingImageCount, setUploadingImageCount] = useState(0);
    const currentContentRef = useRef(initialValue);

    const runCommand = (command: { key: unknown }, payload?: unknown) => {
      if (!editorRef.current) return;

      editorRef.current.editor.action(
        callCommand(command.key as never, payload as never)
      );
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

      editorRef.current.editor.action((ctx) => {
        ctx.set(dropIndicatorState.key, null);
      });
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

    // 保持 onChange 引用最新
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      onRefRef.current = onRef;
    }, [onRef]);

    useEffect(() => {
      initialValueRef.current = initialValue;
    }, [initialValue]);

    // 暴露方法给父组件
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

    // 初始化 Milkdown 编辑器
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let mounted = true;
      let nativePasteHandler: ((event: ClipboardEvent) => Promise<void>) | null =
        null;
      let nativeDragOverHandler: ((event: DragEvent) => void) | null = null;
      let nativeDropHandler: ((event: DragEvent) => Promise<void>) | null =
        null;

      (async () => {
        try {
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
              [Crepe.Feature.Placeholder]: true,
              [Crepe.Feature.Latex]: true,
            },
            featureConfigs: {
              [Crepe.Feature.ImageBlock]: {
                onUpload: uploadImageToCos,
              },
            },
          });

          editor.editor
            .config((ctx) => {
              ctx.update(uploadConfig.key, (value) => ({
                ...value,
                uploader: uploadDroppedImages,
                enableHtmlFileUploader: true,
              }));

              ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
                currentContentRef.current = markdown;
                onChangeRef.current?.(markdown);
              });
            })
            .use(listener)
            .use(history)
            .use(prism)
            .use(math)
            .use(uploadPlugin);

          await editor.create();
          editor.setReadonly(false);

          if (!mounted) {
            editor.destroy();
            return;
          }

          nativePasteHandler = async (event: ClipboardEvent) => {
            if (getImageFiles(event.clipboardData?.files).length === 0) return;

            event.preventDefault();
            event.stopPropagation();

            await uploadFilesAndInsertImages(event.clipboardData?.files);
          };

          nativeDragOverHandler = (event: DragEvent) => {
            if (getImageFiles(event.dataTransfer?.files).length === 0) return;

            event.preventDefault();
          };

          nativeDropHandler = async (event: DragEvent) => {
            if (getImageFiles(event.dataTransfer?.files).length === 0) return;

            event.preventDefault();
            event.stopPropagation();
            clearDropIndicator();

            await uploadFilesAndInsertImages(event.dataTransfer?.files);
          };

          container.addEventListener("paste", nativePasteHandler, true);
          container.addEventListener("dragover", nativeDragOverHandler, true);
          container.addEventListener("drop", nativeDropHandler, true);

          editorRef.current = editor;
          setIsReady(true);

          // 调用 onRef 回调
          if (onRefRef.current) {
            onRefRef.current({
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
            });
          }
        } catch (error) {
          console.error("Milkdown 初始化失败:", error);
        }
      })();

      return () => {
        mounted = false;
        if (nativePasteHandler) {
          container.removeEventListener("paste", nativePasteHandler, true);
        }
        if (nativeDragOverHandler) {
          container.removeEventListener(
            "dragover",
            nativeDragOverHandler,
            true
          );
        }
        if (nativeDropHandler) {
          container.removeEventListener("drop", nativeDropHandler, true);
        }
        if (editorRef.current) {
          try {
            editorRef.current.destroy();
            editorRef.current = null;
          } catch (e) {
            console.error("Milkdown 清理失败:", e);
          }
        }
      };
    }, [clearDropIndicator, uploadFilesAndInsertImages]);

    // 更新初始值
    useEffect(() => {
      if (editorRef.current && isReady && initialValue !== currentContentRef.current) {
        editorRef.current.editor.action((ctx) => {
          ctx.set(defaultValueCtx, initialValue);
        });
        currentContentRef.current = initialValue;
      }
    }, [initialValue, isReady]);

    return (
      <div
        className={`milkdown-editor-wrapper w-full ${className}`}
        style={{
          minHeight: height,
          height: height,
        }}
      >
        <div
          className={`${theme === "dark" ? "theme-dark" : "theme-light"} flex h-full min-h-0 w-full flex-col`}
        >
          <div className="flex w-full flex-wrap items-center gap-2 border-b border-theme-border bg-theme-background-secondary/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-theme-background-secondary/60">
            <ToolbarButton label="撤销" onMouseDown={handleToolbarAction(undoCommand)}>
              <Undo2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="重做" onMouseDown={handleToolbarAction(redoCommand)}>
              <Redo2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="粗体" onMouseDown={handleToolbarAction(toggleStrongCommand)}>
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="斜体" onMouseDown={handleToolbarAction(toggleEmphasisCommand)}>
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="删除线"
              onMouseDown={handleToolbarAction(toggleStrikethroughCommand)}
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="一级标题" onMouseDown={handleToolbarAction(wrapInHeadingCommand, 1)}>
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="二级标题" onMouseDown={handleToolbarAction(wrapInHeadingCommand, 2)}>
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="引用" onMouseDown={handleToolbarAction(wrapInBlockquoteCommand)}>
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="无序列表" onMouseDown={handleToolbarAction(wrapInBulletListCommand)}>
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="有序列表" onMouseDown={handleToolbarAction(wrapInOrderedListCommand)}>
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="代码块" onMouseDown={handleToolbarAction(createCodeBlockCommand)}>
              <Code2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="清除格式" onMouseDown={handleToolbarAction(turnIntoTextCommand)}>
              <RemoveFormatting className="h-4 w-4" />
            </ToolbarButton>
          </div>
          <div
            className="relative min-h-0 w-full flex-1"
            style={{ visibility: isReady ? "visible" : "hidden" }}
          >
            <div
              ref={containerRef}
              className="crepe h-full w-full"
              style={{
                minHeight: height,
              }}
            />
            {uploadingImageCount > 0 && (
              <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-md border border-theme-border bg-theme-surface/95 px-3 py-2 text-sm text-theme-text-secondary shadow-sm backdrop-blur">
                正在上传图片...
              </div>
            )}
          </div>
        </div>

        {!isReady && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-theme-text-tertiary">加载编辑器...</div>
          </div>
        )}
      </div>
    );
  }
);

MilkdownEditorInternal.displayName = "MilkdownEditorInternal";
