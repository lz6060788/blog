"use client";

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
  useId,
} from "react";
import * as echarts from "echarts";
import 'cherry-markdown/dist/cherry-markdown.css';

export interface CherryPreviewRef {
  setContent: (content: string) => void;
  getContent: () => string;
}

interface CherryPreviewProps {
  content?: string;
  theme?: "light" | "dark";
  className?: string;
}

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

export const CherryPreviewInternal = forwardRef<
  CherryPreviewRef,
  CherryPreviewProps
>(
  (
    {
      content = "",
      theme = "light",
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cherryRef = useRef<any>(null);
    const generatedId = useId();
    const previewId = `cherry-preview-${generatedId}`;
    const [isMounted, setIsMounted] = useState(false);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      setContent: (markdown: string) => {
        if (cherryRef.current) {
          cherryRef.current.setMarkdown(markdown);
        }
      },
      getContent: () => {
        return cherryRef.current?.getMarkdown() || content;
      },
    }));

    // 初始化 Cherry Markdown
    useEffect(() => {
      if (!isBrowser || cherryRef.current) return;

      const container = containerRef.current;
      if (!container) return;

      let mounted = true;

      (async () => {
        try {
          const CherryModule = await import("cherry-markdown");
          const Cherry = CherryModule.default;

          if (!mounted) return;

          const cherry = new Cherry({
            id: previewId,
            el: container,
            value: content,
            readonly: true,
            preview: true,
            toolbars: {
              toolbar: false,
            },
            externals: { echarts: echarts },
            editor: {
              defaultModel: 'previewOnly',
            },
            themeSettings: {
              themeList: [
                { className: 'default', label: '默认' },
                { className: 'dark', label: '深色' },
                { className: 'light', label: '浅色' },
              ],
              mainTheme: theme === 'dark' ? 'dark' : 'light',
              codeBlockTheme: theme === 'dark' ? 'dark' : 'default',
            },
            engine: {
              global: {
                urlProcessor: (url: string) => url,
              },
            },
          });

          if (!mounted) {
            cherry.destroy();
            return;
          }

          cherryRef.current = cherry;
          setIsMounted(true);
        } catch (error) {
          console.error("Cherry Markdown 初始化失败:", error);
        }
      })();

      return () => {
        mounted = false;
        if (cherryRef.current) {
          try {
            cherryRef.current.destroy();
            cherryRef.current = null;
          } catch (e) {
            console.error("Cherry Markdown 清理失败:", e);
          }
        }
      };
    }, [previewId]);

    // 更新内容
    useEffect(() => {
      if (cherryRef.current && isMounted) {
        cherryRef.current.setMarkdown(content);
      }
    }, [content, isMounted]);

    // 主题切换时重新初始化
    useEffect(() => {
      if (!cherryRef.current || !isMounted) return;

      const container = containerRef.current;
      if (!container) return;

      const mainTheme = theme === 'dark' ? 'dark' : 'light'
      const codeBlockTheme = theme === 'dark' ? 'dark' : 'default'

      try {
        cherryRef.current.setTheme(mainTheme)
        cherryRef.current.setCodeBlockTheme(codeBlockTheme)
      } catch (error) {
        console.error('Cherry Markdown 主题切换失败:', error)
      }
    }, [theme]);

    return (
      <div className="cherry-preview-wrapper">
        {/* 服务端渲染或客户端未初始化时显示原始内容 */}
        {!isMounted && (
          <div className={`cherry-preview-fallback ${className}`}>
            <div className="prose prose-zinc prose-lg max-w-none">
              <pre className="whitespace-pre-wrap break-words text-theme-text-secondary">
                {content}
              </pre>
            </div>
          </div>
        )}
        {/* Cherry Markdown 容器 - 使用 visibility 而非 display，确保能正确计算宽度 */}
        <div
          ref={containerRef}
          id={previewId}
          className={`cherry-preview-container ${className}`}
          style={{
            visibility: isMounted ? 'visible' : 'hidden',
            position: isMounted ? 'static' : 'absolute',
            pointerEvents: isMounted ? 'auto' : 'none',
          }}
        />
      </div>
    );
  }
);

CherryPreviewInternal.displayName = "CherryPreviewInternal";
