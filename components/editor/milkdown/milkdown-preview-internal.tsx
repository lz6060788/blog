"use client";

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from "react";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { history } from "@milkdown/plugin-history";
import { prism } from "@milkdown/plugin-prism";
import { math } from "@milkdown/plugin-math";
import { getMarkdown } from "@milkdown/utils";

export interface MilkdownPreviewRef {
  setContent: (content: string) => void;
  getContent: () => string;
}

export interface MilkdownPreviewProps {
  content?: string;
  theme?: "light" | "dark";
  className?: string;
  onRef?: (ref: MilkdownPreviewRef | null) => void;
}

export const MilkdownPreviewInternal = forwardRef<
  MilkdownPreviewRef,
  MilkdownPreviewProps
>(
  (
    {
      content = "",
      theme = "light",
      className = "",
      onRef,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Editor | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [currentContent, setCurrentContent] = useState(content);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      setContent: (markdown: string) => {
        setCurrentContent(markdown);
        if (editorRef.current) {
          const editor = editorRef.current;
          editor.action((ctx) => {
            ctx.set(defaultValueCtx, markdown);
          });
        }
      },
      getContent: () => {
        if (editorRef.current) {
          return editorRef.current.action((ctx) => {
            return getMarkdown()(ctx);
          }) || currentContent;
        }
        return currentContent;
      },
    }));

    // 初始化 Milkdown 编辑器
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let mounted = true;

      (async () => {
        try {
          const editor = await Editor.make()
            .config((ctx) => {
              ctx.set(rootCtx, container);
              ctx.set(defaultValueCtx, content);
              ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
                setCurrentContent(markdown);
              });
            })
            .use(commonmark)
            .use(gfm)
            .use(listener)
            .use(history)
            .use(prism)
            .use(math)
            .create();

          if (!mounted) {
            editor.destroy();
            return;
          }

          editorRef.current = editor;
          setIsMounted(true);

          // 调用 onRef 回调
          if (onRef) {
            onRef({
              setContent: (markdown: string) => {
                if (editorRef.current) {
                  editorRef.current.action((ctx) => {
                    ctx.set(defaultValueCtx, markdown);
                  });
                  setCurrentContent(markdown);
                }
              },
              getContent: () => {
                if (editorRef.current) {
                  return editorRef.current.action((ctx) => {
                    return getMarkdown()(ctx);
                  }) || content;
                }
                return content;
              },
            });
          }
        } catch (error) {
          console.error("Milkdown 初始化失败:", error);
        }
      })();

      return () => {
        mounted = false;
        if (editorRef.current) {
          try {
            editorRef.current.destroy();
            editorRef.current = null;
          } catch (e) {
            console.error("Milkdown 清理失败:", e);
          }
        }
      };
    }, []);

    // 更新内容
    useEffect(() => {
      if (editorRef.current && isMounted) {
        editorRef.current.action((ctx) => {
          ctx.set(defaultValueCtx, content);
        });
        setCurrentContent(content);
      }
    }, [content, isMounted]);

    return (
      <div className={`milkdown-preview-wrapper ${className}`}>
        {/* 主题类 */}
        <div className={theme === "dark" ? "theme-dark" : "theme-light"}>
          {/* Milkdown 容器 */}
          <div
            ref={containerRef}
            className="milkdown"
            style={{
              visibility: isMounted ? "visible" : "hidden",
              minHeight: isMounted ? "auto" : "100px",
            }}
          />
        </div>

        {/* 加载状态 */}
        {!isMounted && (
          <div className="flex items-center justify-center min-h-[100px]">
            <div className="text-theme-text-tertiary text-sm">加载预览...</div>
          </div>
        )}
      </div>
    );
  }
);

MilkdownPreviewInternal.displayName = "MilkdownPreviewInternal";
