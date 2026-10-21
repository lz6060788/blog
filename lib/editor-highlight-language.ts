const LANGUAGE_ALIASES: Record<string, string> = {
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
  "html-preview": "html",
};

const PLAIN_TEXT_FENCES = new Set(["video", "audio", "embed", "html-url"]);

/** Resolve a Shiki language without treating custom embed fences as languages. */
export function getEditorHighlightLanguage(language: unknown): string | undefined {
  if (typeof language !== "string") return undefined;

  const key = language.trim().toLowerCase();
  if (!key) return undefined;
  if (PLAIN_TEXT_FENCES.has(key)) return "text";

  return LANGUAGE_ALIASES[key] ?? key;
}
