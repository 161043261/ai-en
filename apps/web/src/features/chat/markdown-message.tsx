import { useMemo } from "react";
import { renderSafeMarkdown } from "../../shared/security";

export type MarkdownMessageProps = {
  readonly content: string;
};

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  const html = useMemo(() => renderSafeMarkdown(content), [content]);

  return (
    <div
      className="prose prose-sm text-base-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
