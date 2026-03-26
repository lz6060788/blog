"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
import { MilkdownPreviewInternal } from "./milkdown-preview-internal";
import type { MilkdownPreviewRef, MilkdownPreviewProps } from "./milkdown-preview-internal";

/**
 * Milkdown 预览组件
 *
 * 支持服务端渲染的 Markdown 预览组件。
 * 使用 Milkdown 引擎进行 Markdown 到 HTML 的转换。
 *
 * @example
 * ```tsx
 * <MilkdownPreview
 *   content="# Hello World\n\n这是 Markdown 内容。"
 *   theme="light"
 * />
 * ```
 */
export const MilkdownPreview = forwardRef<
  MilkdownPreviewRef,
  MilkdownPreviewProps
>(({ content = "", theme = "light", className = "" }, ref) => {
  const internalRef = useRef<MilkdownPreviewRef | null>(null);

  // 将内部 ref 暴露给外部
  useImperativeHandle(ref, () => internalRef.current || ({} as MilkdownPreviewRef));

  return (
    <div className={className}>
      <MilkdownPreviewInternal
        content={content}
        theme={theme}
        onRef={(previewRef) => {
          internalRef.current = previewRef;
        }}
      />
    </div>
  );
});

MilkdownPreview.displayName = "MilkdownPreview";

// 导出类型
export type { MilkdownPreviewRef };
export type { MilkdownPreviewProps };
