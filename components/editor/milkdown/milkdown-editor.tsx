"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
import dynamic from "next/dynamic";
import type { MilkdownEditorRef, MilkdownEditorProps } from "./milkdown-editor-internal";

// 动态导入 MilkdownEditorInternal 以避免 SSR 时的 document 错误
const MilkdownEditorInternal = dynamic(
  () =>
    import("./milkdown-editor-internal").then(
      (mod) => mod.MilkdownEditorInternal
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] border border-theme-border rounded-lg animate-pulse">
        <div className="text-theme-text-tertiary">加载编辑器...</div>
      </div>
    ),
  }
);

/**
 * Milkdown 编辑器组件
 *
 * 基于 Milkdown 的 WYSIWYG Markdown 编辑器。
 * 使用动态导入以避免服务端渲染问题。
 *
 * @example
 * ```tsx
 * <MilkdownEditor
 *   initialValue="# Hello World"
 *   onChange={(content) => console.log(content)}
 *   height="500px"
 *   theme="light"
 * />
 * ```
 */
export const MilkdownEditor = forwardRef<
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
    },
    ref
  ) => {
    const internalRef = useRef<MilkdownEditorRef | null>(null);

    // 将内部 ref 暴露给外部
    useImperativeHandle(
      ref,
      () => internalRef.current || ({} as MilkdownEditorRef)
    );

    return (
      <div className={className}>
        <MilkdownEditorInternal
          initialValue={initialValue}
          onChange={onChange}
          height={height}
          theme={theme}
          onRef={(editorRef) => {
            internalRef.current = editorRef;
          }}
        />
      </div>
    );
  }
);

MilkdownEditor.displayName = "MilkdownEditor";

// 导出类型
export type { MilkdownEditorRef };
export type { MilkdownEditorProps };
