import DOMPurify from "dompurify";
import { marked } from "marked";

export function renderSafeMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { async: false });
  return DOMPurify.sanitize(html);
}
