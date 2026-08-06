// Shared by the block and inline layers.

// One grammar for an opening tag, so the two layers cannot drift.
const TAG_OPEN = "<([a-zA-Z][a-zA-Z0-9]*)(\\s[^>]*)?";
const PAIRED = TAG_OPEN + ">(.+?)<\\/\\1>";
const VOID = TAG_OPEN + "\\s*\\/?>";

export const HTML_PAIR = new RegExp(PAIRED);
export const HTML_VOID = new RegExp(VOID);
export const HTML_PAIR_LINE = new RegExp("^" + PAIRED + "$");
export const HTML_VOID_LINE = new RegExp("^" + VOID + "$");

const COMMENT_SRC = "<!--[\\s\\S]*?-->";
export const COMMENT = new RegExp(COMMENT_SRC);
// Global form for stripping; a sticky lastIndex would corrupt COMMENT.exec.
export const COMMENT_ALL = new RegExp(COMMENT_SRC, "g");

// Sentinels, not a literal "<br>", which code spans would capture verbatim.
// index.tsx strips control characters, so these cannot occur in input.
const BR_MARK = "\u0000";
const BR_SLASH = "\u0001";

const TRAILING_SPACES = / {2,}$/;
const TRAILING_SLASH = /\\$/;

export const HARD_BREAK = /<br\s*\/?>|[\0\u0001]/i;

export const markBreak = (line: string) =>
  TRAILING_SPACES.test(line)
    ? line.trimStart().replace(TRAILING_SPACES, BR_MARK)
    : TRAILING_SLASH.test(line)
      ? line.trimStart().replace(TRAILING_SLASH, BR_SLASH)
      : line.trim();

// A break ending a paragraph has nothing to break to; its backslash stays.
export const clearBreak = (text: string) =>
  text.replace(BR_MARK, "").replace(BR_SLASH, "\\");

export const breakToSpace = (text: string) =>
  text.replace(/\0/g, " ").replace(/\u0001/g, "\\ ");
